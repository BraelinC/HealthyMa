# Upload NutriMa to GitHub

Based on your screenshot, I can see you have a GitHub repository ready at: `https://github.com/BrantConCarlo/RecipeAssistant`

## Method 1: Using Replit's Built-in GitHub Integration

1. **In Replit, click the Version Control icon** (branch icon) in the left sidebar
2. **Click "Connect to GitHub"** 
3. **Select your repository:** `BrantConCarlo/RecipeAssistant`
4. **Push your code** - Replit will handle all the git commands for you

## Method 2: Manual Git Commands (if Method 1 doesn't work)

Open the Shell in Replit and run these commands one by one:

```bash
# Remove any existing git locks
rm -f .git/config.lock .git/index.lock

# Add your GitHub repository as remote
git remote add origin https://github.com/BrantConCarlo/RecipeAssistant.git

# Stage all your files
git add .

# Commit your changes
git commit -m "Initial commit - NutriMa AI recipe planning app"

# Push to GitHub
git push -u origin main
```

## What Gets Uploaded

Your complete NutriMa application including:

- ✅ **Frontend:** React app with purple theme and meal planning interface
- ✅ **Backend:** Express server with AI recipe generation
- ✅ **Database:** PostgreSQL schema with meal plans and recipes
- ✅ **AI Integration:** OpenAI/Grok recipe generation with YouTube videos
- ✅ **Smart Search:** Intelligent ingredient-based recipe discovery
- ✅ **Meal Planning:** Drag-and-drop editing with nutrition tracking
- ✅ **Configuration:** All backup files (nutrima-prefixed) for easy transfer

## Troubleshooting

If you get authentication errors:
1. Use a GitHub Personal Access Token instead of password
2. Go to GitHub Settings → Developer settings → Personal access tokens
3. Create a token with repo permissions
4. Use your username and the token as password when prompted

The repository will be ready for deployment on Vercel, Netlify, or any other hosting platform!