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
  HUGGING_FACE: z.string().min(1),
  PORT: z.string().default("3000"),
  NODE_ENV: z.string().default("development"),
  ALLOWED_ORIGIN: z.string().url(),
});

const env = envSchema.parse(process.env);

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
});

const app = express();
app.disable("x-powered-by");

app.use(pinoHttp({ logger }));

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: env.ALLOWED_ORIGIN,
    methods: ["POST", "GET"],
  })
);

app.use(express.json({ limit: "50kb" }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests. Please slow down.",
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const client = new InferenceClient(env.HUGGING_FACE);
const model = "BunnyBosz/llama-3.2-1b-fine-tuned-model-mental-health";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

app.get("/", (req, res) => {
  res.send("API is running.");
});

// Utility to cleanly format conversation history using Llama 3 tokens
function formatLlamaPrompt(messages) {
  const systemContent = `You are Hugabot, a specialized AI therapeutic companion. Your tone is warm, gentle, and non-judgmental - like a supportive friend who's a trained listener.
          
CORE PRINCIPLES:
1. **REFLECTIVE LISTENING**: Begin by acknowledging what the user shared. Use phrases like "It sounds like you're feeling..." or "I hear that you're going through..." before offering any suggestions.

2. **BREVITY & CLARITY**: Keep responses concise. Use short sentences. For coping strategies, use simple bullet points with emojis sparingly (🌿 💭 🤲).

3. **SAFETY FIRST**: If self-harm is mentioned, respond with care: acknowledge their pain, provide crisis resources (988 Suicide & Crisis Lifeline), and gently encourage professional support. Never dismiss or minimize.

4. **GENTLE GUIDANCE**: Don't try to "fix" everything. Sometimes the goal is just to help the user feel heard. End each response with ONE thoughtful, open-ended question to continue the conversation naturally.

5. **FORMATTING**: Use Markdown sparingly - **bold** for emotional validation, *italics* for gentle emphasis. Keep it readable and calm.

Remember: You're not a therapist, but a compassionate companion. When in doubt, lean toward listening rather than advising.`;

  let formatted = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemContent}<|eot_id|>\n`;

  for (const msg of messages) {
    formatted += `<|start_header_id|>${msg.role}<|end_header_id|>\n\n${msg.content}<|eot_id|>\n`;
  }

  formatted += `<|start_header_id|>assistant<|end_header_id|>\n\n`;
  return formatted;
}

app.post("/msg", async (req, res, next) => {
  try {
    const { messages } = requestSchema.parse(req.body);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const inputs = formatLlamaPrompt(messages);

    // Bypassing abstract task wrappers by using a direct client.request
    const response = await client.request(
      {
        path: `models/${model}`,
        method: "POST",
        body: {
          inputs,
          parameters: {
            max_new_tokens: 500,
            return_full_text: false,
          },
          provider: "featherless-ai",
        },
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    // Direct endpoints return an array containing text generation details
    const generatedText = response?.[0]?.generated_text;

    if (!generatedText) {
      throw new Error("Invalid model response structure");
    }

    res.json({
      role: "assistant",
      content: generatedText.trim(),
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  req.log.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Invalid request format." });
  }

  if (err.name === "AbortError") {
    return res.status(504).json({ error: "Model took too long to respond." });
  }

  res.status(500).json({
    error: "Something went wrong.",
  });
});

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});
