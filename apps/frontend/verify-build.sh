# Cloudflare Pages Build Verification Script
# Run this after building to verify the output

echo "🔍 Verifying Cloudflare Pages Build..."
echo "========================================"

cd apps/frontend

echo "Checking dist directory..."
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found"
    exit 1
fi

echo "Checking index.html..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ index.html not found"
    exit 1
fi

echo "Checking for main.js bundle..."
if [ -f "dist/assets/main.js" ]; then
    MAIN_SIZE=$(du -sh dist/assets/main.js | cut -f1)
    echo "✅ main.js found: $MAIN_SIZE"
else
    echo "⚠️  main.js not found at expected location"
fi

echo "Checking for vendor chunks..."
VENDOR_COUNT=$(find dist/assets -name "vendor-*.js" 2>/dev/null | wc -l)
echo "✅ Found $VENDOR_COUNT vendor chunks"

echo "Checking for CSS bundles..."
CSS_COUNT=$(find dist/assets -name "*.css" 2>/dev/null | wc -l)
echo "✅ Found $CSS_COUNT CSS files"

echo "Checking for images..."
IMAGE_COUNT=$(find dist/assets -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.webp" -o -name "*.svg" \) 2>/dev/null | wc -l)
echo "✅ Found $IMAGE_COUNT images"

echo ""
echo "📊 Build Summary:"
TOTAL_FILES=$(find dist -type f | wc -l)
TOTAL_SIZE=$(du -sh dist | cut -f1)
echo "   Total files: $TOTAL_FILES"
echo "   Total size: $TOTAL_SIZE"

# Check for unoptimized images
echo ""
echo "🔍 Checking for unoptimized images..."
UNOPTIMIZED=$(find dist/assets -type f \( -name "*.png" -o -name "*.jpg" \) -size +100k 2>/dev/null | head -5)
if [ -n "$UNOPTIMIZED" ]; then
    echo "⚠️  Large images found (consider optimization):"
    echo "$UNOPTIMIZED"
fi

echo ""
echo "✅ Build verification complete!"
echo "========================================"
