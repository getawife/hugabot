import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { z } from "zod";
import pino from "pino";
import pinoHttp from "pino-http";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const envSchema = z.object({
  HUGGING_FACE: z
    .string()
    .min(1, { message: "HUGGING_FACE token is required" }),
  PORT: z.string().default("3000"),
  NODE_ENV: z.string().default("development"),
  ALLOWED_ORIGIN: z
    .string()
    .url({ message: "ALLOWED_ORIGIN must be a valid URL" }),
});

let env;
try {
  env = envSchema.parse(process.env);
} catch (err) {
  console.error("Invalid environment variables:", err.errors);
  process.exit(1);
}

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
});

const app = express();
app.disable("x-powered-by");

app.use(pinoHttp({ logger }));

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === env.ALLOWED_ORIGIN) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"));
    },
    methods: ["POST", "GET"],
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "50kb",
    strict: true,
  }),
);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    req.log?.warn("Malformed JSON payload received");
    return res.status(400).json({
      error: "bad_request",
      message: "Invalid JSON payload structure.",
    });
  }
  next(err);
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "rate_limit",
      message: "You're moving a bit fast. Take a breath.",
    });
  },
});

app.use("/msg", limiter);

const client = new InferenceClient(env.HUGGING_FACE);
const mainModel = "BunnyBosz/llama-3.2-1b-fine-tuned-model-mental-health";
const classifierModel = "1shoomun/Multilingual-classifier-qwen-2.5-0.5b";
const messageSchema = z.object({
  role: z.enum(["user", "assistant"], {
    errorMap: () => ({ message: "Role must be either 'user' or 'assistant'." }),
  }),
  content: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty." })
    .max(2000, {
      message: "Message exceeds maximum length of 2000 characters.",
    }),
});

const requestSchema = z.object({
  messages: z
    .array(messageSchema)
    .min(1, { message: "At least one message is required." })
    .max(10, {
      message:
        "Conversation history payload exceeds maximum limit of 10 messages.",
    }),
});

app.get("/", (req, res) => {
  res.status(200).send("API is running.");
});

app.post("/msg", async (req, res, next) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const { messages } = requestSchema.parse(req.body);
    const latestUserMessage = messages[messages.length - 1]?.content;

    const classification = await client.chatCompletion(
      {
        model: classifierModel,
        provider: "featherless-ai",
        messages: [
          {
            role: "system",
            content: `You are a strict binary intent classifier for a therapy companion application.

Determine whether the user's message is related to:
- mental health
- emotional support
- personal feelings
- stress
- anxiety
- relationships
- loneliness
- grief
- personal well-being

Respond with EXACTLY ONE of these values:

IN_SCOPE
OUT_OF_SCOPE

IN_SCOPE examples:
"I feel really lonely."
"I'm stressed about school."
"I can't stop thinking about what happened."
"I had an argument with my friend."
"How do I deal with anxiety?"

OUT_OF_SCOPE examples:
"How do I make pizza?"
"What's 2+2?"
"Write me Python code."
"Who won the football match?"
"Tell me about dinosaurs."

Do not explain your answer.
Do not add punctuation.
Do not output anything except IN_SCOPE or OUT_OF_SCOPE.`,
          },
          {
            role: "user",
            content: latestUserMessage,
          },
        ],
        max_tokens: 5,
        temperature: 0,
      },
      {
        signal: controller.signal,
      },
    );

    const classificationResult =
      classification.choices?.[0]?.message?.content?.trim().toUpperCase() || "";

    if (classificationResult.includes("OUT_OF_SCOPE")) {
      clearTimeout(timeout);
      return res.json({
        role: "assistant",
        content: "That is beyond my scope.",
      });
    }

    const systemMessage = {
      role: "system",
      content: `You are Hugabot, a specialized AI therapeutic companion.

STRICT SCOPE LIMITATION:
You ONLY answer questions directly related to mental health, emotional support, daily stress, and personal well-being.
For ANY request outside this scope (e.g., math, coding, trivia, general knowledge, sports, news, writing code), you MUST reply ONLY with the exact text:
"That is beyond my scope."

CORE PRINCIPLES:
1. REFLECTIVE LISTENING: Acknowledge feelings using phrasing like "It sounds like you're feeling..."
2. BREVITY & CLARITY: Keep responses concise. Use simple bullet points sparingly.
3. SAFETY FIRST: Handle self-harm with immediate care and emergency resources.
4. GENTLE GUIDANCE: End each on-topic response with ONE thoughtful, open-ended question.
5. FORMATTING: Use Markdown sparingly.`,
    };

    const response = await client.chatCompletion(
      {
        model: mainModel,
        provider: "featherless-ai",
        messages: [systemMessage, ...messages],
        max_tokens: 500,
      },
      {
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    const generatedText = response.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("MODEL_INVALID_RESPONSE");
    }

    res.json({
      role: "assistant",
      content: generatedText.trim(),
    });
  } catch (err) {
    clearTimeout(timeout);
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "not_found",
    message: "Requested endpoint does not exist.",
  });
});

app.use((err, req, res, next) => {
  req.log ? req.log.error(err) : logger.error(err);

  if (err.message && err.message.includes("CORS policy")) {
    return res.status(403).json({
      error: "cors_error",
      message: err.message,
    });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: "invalid_request",
      details: err.errors.map((e) => e.message),
    });
  }

  if (err.name === "AbortError") {
    return res.status(504).json({
      error: "gateway_timeout",
      message: "The model server took too long to respond. Please try again.",
    });
  }

  if (err.message === "MODEL_INVALID_RESPONSE") {
    return res.status(502).json({
      error: "bad_gateway",
      message: "Received empty or invalid output from the AI model service.",
    });
  }

  if (err.status || err.statusCode) {
    const statusCode = err.status || err.statusCode;
    return res
      .status(statusCode >= 400 && statusCode < 600 ? statusCode : 500)
      .json({
        error: "model_provider_error",
        message: err.message || "An error occurred with the AI provider.",
      });
  }

  res.status(500).json({
    error: "internal_server_error",
    message: "An unexpected error occurred. Please try again later.",
  });
});

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.fatal({ reason, promise }, "Unhandled Rejection detected!");
});

process.on("uncaughtException", (error) => {
  logger.fatal(
    { error },
    "Uncaught Exception detected! Shutting down gracefully...",
  );
  server.close(() => {
    process.exit(1);
  });
});

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Closing HTTP server...`);
  server.close(() => {
    logger.info("HTTP server closed. Exiting process.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
