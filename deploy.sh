#!/bin/bash
# Cloudflare Pages Deployment Script for PerfectPick
# Usage: ./deploy.sh

set -e

echo "🚀 Starting Cloudflare Pages Deployment..."
echo "=========================================="

# Check if user is logged in
echo "📋 Checking Cloudflare login status..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  Not logged in. Please run 'wrangler login' first."
    exit 1
fi

# Get the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🌱 Current branch: $CURRENT_BRANCH"

# Check if we're on main or a release branch
if [[ "$CURRENT_BRANCH" != "main" && ! "$CURRENT_BRANCH" =~ ^release/ ]]; then
    echo "⚠️  Warning: Not on main branch. Current branch: $CURRENT_BRANCH"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the frontend
echo "🔨 Building frontend..."
cd apps/frontend
npm ci --frozen-lockfile
npm run build

# Check build output
if [ ! -d "dist" ]; then
    echo "❌ Build failed: dist directory not found"
    exit 1
fi

BUILD_SIZE=$(du -sh dist | cut -f1)
echo "✅ Build successful! Output size: $BUILD_SIZE"

# Check for large assets
echo "🔍 Checking for large assets..."
LARGE_FILES=$(find dist -type f -size +500k 2>/dev/null | wc -l)
if [ "$LARGE_FILES" -gt 0 ]; then
    echo "⚠️  Found $LARGE_FILES files larger than 500KB. Consider optimization."
    find dist -type f -size +500k -exec ls -lh {} \;
fi

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
cd ../..

# Option 1: Deploy via Wrangler (for direct deployment)
echo "🔄 Deploying via Wrangler..."
npx wrangler pages deploy apps/frontend/dist \
    --project-name="perfectpick" \
    --commit-dirty=true

echo "=========================================="
echo "✅ Deployment completed successfully!"
echo "🌐 Your site is live at: https://perfectpick.pages.dev"
echo ""
echo "📝 Next steps:"
echo "   1. Update CNAME record to point to your Cloudflare Pages URL"
echo "   2. Set up custom domain in Cloudflare Dashboard"
echo "   3. Configure environment variables in Cloudflare Dashboard"
echo "   4. Test the site thoroughly before updating production DNS"
echo ""
