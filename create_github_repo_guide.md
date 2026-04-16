# How to Create a GitHub Repository for AptiMaster AI

## Step 1: Log in to GitHub
1. Go to [github.com](https://github.com) and sign in to your account
2. If you don't have an account, create one (it's free)

## Step 2: Create a New Repository
1. Click the "+" icon in the top-right corner
2. Select "New repository"
3. Fill in the repository details:
   - **Repository name**: `aptimaster-ai` (or any name you prefer)
   - **Description**: "AI-powered platform for engineering students to prepare for company-specific aptitude tests"
   - **Visibility**: Public (free)
   - **Initialize with README**: UNCHECK this (we already have a README.md)
   - **Add .gitignore**: UNCHECK this (we already have .gitignore)
   - **Choose a license**: Optional, you can select MIT License
4. Click "Create repository"

## Step 3: Get Your Repository URL
After creation, you'll see a page with commands. Copy the repository URL:
- It will look like: `https://github.com/YOUR_USERNAME/aptimaster-ai.git`

## Step 4: Return Here
Come back here and provide the repository URL so I can set up the remote and push your code.

## Alternative: Using GitHub CLI (if installed)
If you have GitHub CLI installed, you can run:
```bash
gh repo create aptimaster-ai --public --source=. --remote=origin --push
```

But since you don't have it installed, follow the web interface steps above.