import Anthropic from "@anthropic-ai/sdk";
import { appendFileSync } from "fs";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

async function getAnthropicResponse(prompt: string): Promise<void> {
  let firstTokenTime: number | null = null;
  const startTime = performance.now();
  try {
    const stream = await anthropic.messages
      .stream({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })
      .on("text", (text) => {
        if (firstTokenTime === null) {
          firstTokenTime = performance.now();
        }
        process.stdout.write(text);
      });

    const response = await stream.finalMessage();
    const endTime = performance.now();
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;
    const model = response.model;
    const ttft = firstTokenTime ? (firstTokenTime - startTime) / 1000 : null;
    const totalTime = endTime - startTime;

    const record = {
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      ttftMs: ttft !== null ? ttft * 1000 : null,
      total_timeMs: totalTime * 1000,
    };
    appendFileSync("run.jsonl", JSON.stringify(record) + "\n");
    // return text;
  } catch (error) {
    console.error("Error fetching response from Anthropic:", error);
    throw error;
  }
}

export { getAnthropicResponse };
