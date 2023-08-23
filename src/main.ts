import { readFileSync } from "fs";
import * as core from "@actions/core";
import { Configuration, OpenAIApi } from "openai";
import { Octokit } from "@octokit/rest";
import parseDiff, { Chunk, File } from "parse-diff";
import minimatch from "minimatch";

// Read GitHub Action inputs
const GITHUB_TOKEN: string = core.getInput("GITHUBTOKEN");
const OPENAI_API_KEY: string = core.getInput("OPENAI_API_KEY");
const OPENAI_API_MODEL: string = core.getInput("OPENAI_API_MODEL");

// Initialize Octokit with GitHub token
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Initialize OpenAI Configuration with API key
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

// Create an instance of OpenAI API
const openai = new OpenAIApi(configuration);

// Define the structure for PR details
interface PRDetails {
  owner: string;
  repo: string;
  pull_number: number;
  title: string;
  description: string;
}

// Function to retrieve PR details from GitHub event
async function getPRDetails(): Promise<PRDetails> {
  const { repository, number } = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8")
  );
  const prResponse = await octokit.pulls.get({
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
  });
  return {
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: number,
    title: prResponse.data.title ?? "",
    description: prResponse.data.body ?? "",
  };
}

// Function to retrieve PR diff from GitHub
async function getDiff(
  owner: string,
  repo: string,
  pull_number: number
): Promise<string | null> {
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
    mediaType: { format: "diff" },
  });
  // @ts-expect-error - response.data is a string
  return response.data;
}

// Function to analyze code and generate AI-driven review comments
async function analyzeCode(
  parsedDiff: File[],
  prDetails: PRDetails
): Promise<Array<{ body: string; path: string; line: number }>> {
  // Array to store generated comments
  const comments: Array<{ body: string; path: string; line: number }> = [];

  // Iterate through parsed diff
  for (const file of parsedDiff) {
    // Ignore deleted files
    if (file.to === "/dev/null") continue;
    for (const chunk of file.chunks) {
      // Create a prompt for AI based on file and chunk details
      const prompt = createPrompt(file, chunk, prDetails);
      // Get AI response
      const aiResponse = await getAIResponse(prompt);
      // If AI response is available, create comments
      if (aiResponse) {
        const newComments = createComment(file, chunk, aiResponse);
        if (newComments) {
          comments.push(...newComments);
        }
      }
    }
  }
  return comments;
}

// Function to retrieve base and head SHAs for a PR
async function getBaseAndHeadShas(
  owner: string,
  repo: string,
  pull_number: number
): Promise<{ baseSha: string; headSha: string }> {
  const prResponse = await octokit.pulls.get({
    owner,
    repo,
    pull_number,
  });
  return {
    baseSha: prResponse.data.base.sha,
    headSha: prResponse.data.head.sha,
  };
}

// Function to create a prompt for AI based on code diff
function createPrompt(file: File, chunk: Chunk, prDetails: PRDetails): string {
  return `Your task is to review pull requests. Instructions:
- Provide the response in the following JSON format:  [{"lineNumber":  <line_number>, "reviewComment": "<review comment>"}]
- Do not give positive comments or compliments.
- Provide comments and suggestions ONLY if there is something to improve, otherwise return an empty array.
- Write the comment in GitHub Markdown format.
- Use the given description only for the overall context and only comment the code.
- IMPORTANT: NEVER suggest adding comments to the code.

Review the following code diff in the file "${
    file.to
  }" and take the pull request title and description into account when writing the response.
  
Pull request title: ${prDetails.title}
Pull request description:

---
${prDetails.description}
---

Git diff to review:

\`\`\`diff
${chunk.content}
${chunk.changes
  // @ts-expect-error - ln and ln2 exist where needed
  .map((c) => `${c.ln ? c.ln : c.ln2} ${c.content}`)
  .join("\n")}
\`\`\`
`;
}

// Function to get AI response for a prompt
async function getAIResponse(prompt: string): Promise<Array<{
  lineNumber: string;
  reviewComment: string;
}> | null> {
  const queryConfig = {
    model: OPENAI_API_MODEL,
    temperature: 0.2,
    max_tokens: 700,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  try {
    const response = await openai.createChatCompletion({
      ...queryConfig,
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });

    const res = response.data.choices[0].message?.content?.trim() || "[]";
    return JSON.parse(res);
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Function to create comments based on AI response
function createComment(
  file: File,
  chunk: Chunk,
  aiResponses: Array<{
    lineNumber: string;
    reviewComment: string;
  }>
): Array<{ body: string; path: string; line: number }> {
  return aiResponses.flatMap((aiResponse) => {
    if (!file.to) {
      return [];
    }
    return {
      body: aiResponse.reviewComment,
      path: file.to,
      line: Number(aiResponse.lineNumber),
    };
  });
}

// Function to create review comments on GitHub PR
async function createReviewComment(
  owner: string,
  repo: string,
  pull_number: number,
  comments: Array<{ body: string; path: string; line: number }>
): Promise<void> {
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number,
    comments,
    event: "COMMENT",
  });
}

// Main function to orchestrate the AI code review process
async function main() {
  // Get PR details
  const prDetails = await getPRDetails();
  console.log("PR Details:", prDetails);

  // Retrieve PR diff based on event action
  let diff: string | null;
  const eventData = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8")
  );

  if (eventData.action === "opened") {
    diff = await getDiff(
      prDetails.owner,
      prDetails.repo,
      prDetails.pull_number
    );
  } else if (eventData.action === "synchronize") {
    const newBaseSha = eventData.before;
    const newHeadSha = eventData.after;

    const response = await octokit.repos.compareCommits({
      headers: {
        accept: "application/vnd.github.v3.diff",
      },
      owner: prDetails.owner,
      repo: prDetails.repo,
      base: newBaseSha,
      head: newHeadSha,
    });

    diff = String(response.data);
  } else {
    console.log("Unsupported event:", process.env.GITHUB_EVENT_NAME);
    return;
  }

  // Analyze the diff and generate review comments
  if (!diff) {
    console.log("No diff found");
    return;
  }

  const parsedDiff = parseDiff(diff);

  const excludePatterns = core
    .getInput("exclude")
    .split(",")
    .map((s) => s.trim());

  const filteredDiff = parsedDiff.filter((file) => {
    return !excludePatterns.some((pattern) =>
      minimatch(file.to ?? "", pattern)
    );
  });

  const comments = await analyzeCode(filteredDiff, prDetails);

  // Create review comments on GitHub PR
  if (comments.length > 0) {
    await createReviewComment(
      prDetails.owner,
      prDetails.repo,
      prDetails.pull_number,
      comments
    );
  }
}

// Execute the main function and handle errors
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

