# Smart Code Reviewer

Enhance your code review process with Smart Code Reviewer, an innovative GitHub Action powered by OpenAI's GPT-3.5-turbo API. Elevate your code quality and streamline developer efficiency by receiving insightful feedback and valuable suggestions on your pull requests, all without manual intervention.

Smart Code Reviewer revolutionizes the way you assess code changes. With its advanced AI capabilities, it comprehensively analyzes your pull requests, offering a depth of understanding that traditional code review methods can't match. By identifying potential issues, suggesting optimizations, and highlighting best practices, it empowers you to make informed decisions and elevate the overall quality of your codebase.

## Features

1. Intelligent Feedback: Leverage the power of AI to receive feedback that goes beyond syntax errors. Uncover logic flaws, potential bugs, and architectural improvements, backed by the expertise of OpenAI's GPT-3.5-turbo model.

2. Contextual Suggestions: Get contextually relevant suggestions for code enhancements, refactoring opportunities, and code structure improvements. Enhance your codebase's readability and maintainability effortlessly.

3. Best Practice Enforcement: Ensure adherence to coding standards and best practices with Smart Code Reviewer's guidance. Receive recommendations for code patterns that align with industry norms, reducing technical debt and future maintenance challenges.

4. Faster Iterations: With swift and thorough reviews, your development iterations become faster and more efficient. Merge high-quality code sooner, accelerating the pace of innovation.

5. Seamless Integration: Implementing Smart Code Reviewer is a breeze. As a GitHub Action, it seamlessly integrates into your existing workflow, ensuring that code review AI is just a step away from your pull requests.

6. Customization: Tailor Smart Code Reviewer to your project's needs. Fine-tune its feedback style, specific areas of focus, and more to align with your team's preferences.

7. Elevate your development process with Smart Code Reviewer and unlock a new era of code quality, efficiency, and collaboration. Embrace the future of code review today and experience the transformative impact of AI-powered insights on your pull requests.

## Setup

1. To use this GitHub Action, you need an OpenAI API key. If you don't have one, sign up for an API key
   at [OpenAI](https://beta.openai.com/signup).

2. Add the OpenAI API key as a GitHub Secret in your repository with the name `OPENAI_API_KEY`. You can find more
   information about GitHub Secrets [here](https://docs.github.com/en/actions/reference/encrypted-secrets).

3. Create a `.github/workflows/main.yml` file in your repository and add the following content:

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
          OPENAI_API_MODEL: "gpt-4" # Optional: defaults to "gpt-4"
          exclude: "**/*.json, **/*.md" # Optional: exclude patterns separated by commas
```

4. Replace `your-username` with your GitHub username or organization name where the AI Code Reviewer repository is
   located.

5. Customize the `exclude` input if you want to ignore certain file patterns from being reviewed.

6. Commit the changes to your repository, and AI Code Reviewer will start working on your future pull requests.

## How It Works

The AI Code Reviewer GitHub Action retrieves the pull request diff, filters out excluded files, and sends code chunks to
the OpenAI API. It then generates review comments based on the AI's response and adds them to the pull request.
