# Smart Code Reviewer: Revolutionizing Code Quality

**Smart Code Reviewer** is a groundbreaking GitHub Action powered by OpenAI's advanced GPT-3.5-turbo API. It goes beyond traditional code reviews, offering intelligent feedback and transformative suggestions that elevate your pull requests to the next level. Experience the future of code review, where code quality improvement and developer efficiency are seamlessly united.

## Features that Ignite Innovation

🔥 **GPT-3.5-turbo Powered Analysis:**
- Harness the intelligence of OpenAI's GPT-3.5-turbo API for an unparalleled code review experience.
- Elevate your code quality with insightful comments and ingenious suggestions.

🚀 **Intelligent Code Enhancement:**
- Witness your code evolve as the AI provides dynamic recommendations.
- Unlock potential optimizations and performance enhancements in your codebase.

🎯 **Precision Exclusion:**
- Flexibility to exclude specific file patterns from the AI review process.
- Ensure tailored review focus while preserving your workflow efficiency.

🛠️ **Effortless Integration:**
- Seamless setup within your GitHub workflow, transforming code reviews.
- Experience innovation without disruption, powered by cutting-edge AI.

## Setup: Enter the AI Code Review Era

1. **Get an OpenAI API Key:**
   Obtain an OpenAI API key to unlock the potential of AI-driven code analysis.

2. **Secure Your Key as a GitHub Secret:**
   Safeguard your OpenAI API key by adding it as a GitHub Secret named OPENAI_API_KEY.

3. **Configure Your Workflow:**
   In your repository, create a `.github/workflows/main.yml` file and include the provided content.

```yaml
name: Smart Code Reviewer

on:
  pull_request:
    types:
      - opened
      - synchronize
permissions: write-all
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3

      - name: Smart Code Reviewer
        uses: your-username/SmartCodeReviewer@main
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          exclude: "**/*.json, **/*.md" # Optional: exclude patterns separated by commas
```

5. **Customize and Evolve:**
   Tailor the experience by specifying exclude patterns and optional AI model preferences.

## How It Transforms Code Review

**Smart Code Reviewer** transforms your pull requests by orchestrating a symphony of AI-powered analysis:

1. **Code Diff Retrieval:**
   Smartly retrieves the pull request diff, the heartbeat of your code evolution.

2. **Exclusion Mastery:**
   Filters out files based on your defined patterns, ensuring precise AI scrutiny.

3. **AI Interaction Magic:**
   With unparalleled precision, AI dissects code chunks via OpenAI API interactions.

4. **AI-Generated Brilliance:**
   Delivers review comments, polished by the AI's cognitive capabilities.

5. **Comments Elevate Excellence:**
   Empowers developers with suggestions, insights, and brilliance that enhance code quality.

Embrace the future of code review—where human ingenuity merges with AI excellence for extraordinary results.

---
**Experience Smart Code Reviewer: Elevate Your Code Quality, Unleash Innovation.**
