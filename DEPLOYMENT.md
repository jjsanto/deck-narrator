# Deployment Guide - Cloudflare Pages

Since your local macOS version (10.15) cannot build the app due to esbuild compatibility, we'll deploy using Cloudflare Pages' Git integration, which builds in the cloud.

## Option 1: Deploy via GitHub (Recommended)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `deck-narrator`)
3. **Do NOT initialize** with README, .gitignore, or license (we already have these)

### Step 2: Push Code to GitHub

```bash
# Add GitHub as remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/deck-narrator.git

# Rename branch to main if needed
git branch -M main

# Push code
git push -u origin main
```

### Step 3: Connect to Cloudflare Pages

1. Go to https://dash.cloudflare.com/
2. Log in to your Cloudflare account (create one if needed)
3. Navigate to **Pages** in the left sidebar
4. Click **Create a project**
5. Click **Connect to Git**
6. Select **GitHub** and authorize Cloudflare
7. Select your `deck-narrator` repository
8. Configure build settings:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave as default)
9. Click **Save and Deploy**

Cloudflare will now:
- Build your app in their cloud environment (bypassing your local macOS issue)
- Deploy it to a URL like `https://deck-narrator.pages.dev`
- Automatically rebuild on every push to main

### Step 4: Access Your Deployed App

Once deployment completes (2-3 minutes), you'll get:
- **Production URL**: `https://deck-narrator-XXX.pages.dev`
- **Custom domain** option (if you have one)

---

## Option 2: Deploy via GitLab/Bitbucket

Same process as GitHub, but:
1. Push to GitLab or Bitbucket instead
2. Select GitLab/Bitbucket when connecting to Cloudflare Pages
3. Same build settings apply

---

## Option 3: Build on Another System

If you have access to a system with macOS 12.0+ or Linux:

```bash
# Clone this repository
git clone <your-repo-url>
cd deck-narrator

# Install dependencies
npm install

# Build
npm run build

# Deploy dist folder
npx wrangler pages deploy dist
```

---

## Environment Variables

After deployment, if you want to provide default API keys (optional):

1. Go to your Pages project settings
2. Navigate to **Settings** → **Environment variables**
3. Add (optional, users can enter in the UI):
   - `VITE_OPENROUTER_API_KEY` (optional)
   - `VITE_LEMONFOX_API_KEY` (optional)

**Note**: Users will still enter API keys in the app UI for security.

---

## Post-Deployment

Once deployed, share your app URL! Users will:
1. Visit your Cloudflare Pages URL
2. Enter their OpenRouter and Lemonfox API keys
3. Upload PDFs and generate narrated videos
4. Everything runs 100% client-side in their browser

---

## Custom Domain (Optional)

To use your own domain:
1. Go to Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Follow DNS configuration instructions
4. Domain will be SSL-enabled automatically

---

## Automatic Deployments

Every time you push to your Git repository:
```bash
git add .
git commit -m "Update feature"
git push
```

Cloudflare Pages will automatically:
- Build the new version
- Deploy to production
- Keep previous deployments for rollback

---

## Troubleshooting

### Build Fails on Cloudflare

- Check **Deployment logs** in Cloudflare Pages dashboard
- Ensure build command is `npm run build`
- Ensure output directory is `dist`

### App Loads but Doesn't Work

- Check browser console for errors
- Verify API keys are valid
- Test with a small PDF first

---

## Support

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- GitHub Integration: https://developers.cloudflare.com/pages/configuration/git-integration/

---

## Quick Reference

```bash
# Your git repository is ready at:
/Users/josee.santo/narrator/deck-narrator

# Committed and ready to push
# Just need to add remote and push to GitHub
```

**Next Steps:**
1. Create GitHub repository
2. Push code using commands above
3. Connect to Cloudflare Pages
4. Wait for build & deployment
5. Share your app URL!
