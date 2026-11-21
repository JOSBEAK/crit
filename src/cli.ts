//Write src/cli.ts that reads a diff from stdin, so git diff HEAD~1 | npx tsx src/cli.ts works.

import * as readline from "readline";
import { getAnthropicResponse } from "./agents/anthropic.js";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
  prompt: "$ ",
});

let diffData = "";
rl.prompt();
rl.on("line", (line: string) => {
  diffData += line + "\n";
});

rl.on("close", async () => {
  if (!diffData.trim()) {
    console.log("No diff to review.");
    return;
  }

  const prompt = `You are a code review assistant. Find bugs, not style nits, in this diff:\n\n${diffData}`;

  try {
    const response = await getAnthropicResponse(prompt);
    console.log("Review:", response);
  } catch {
    console.error("Review failed. See the API error above.");
    process.exitCode = 1;
  }
});
rl.on("close", () => {
  console.log("Exiting...");
});
