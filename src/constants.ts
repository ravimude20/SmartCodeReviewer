import * as core from "@actions/core";

export const GITHUB_TOKEN: string = core.getInput("GITHUBTOKEN");
export const OPENAI_API_KEY: string = core.getInput("OPENAI_API_KEY");
export const OPENAI_API_MODEL: string = core.getInput("OPENAI_API_MODEL");