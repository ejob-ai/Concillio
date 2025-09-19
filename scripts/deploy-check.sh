#!/usr/bin/env bash
set -euo pipefail

# Default to production /pricing, but allow overriding first arg with any URL under the same host
URL="${1:-https://concillio.pages.dev/pricing}"

# Derive origin (scheme+host) for secondary checks
ORIGIN=$(echo "$URL" | sed -E 's#(https?://[^/]+).*#\1#')
PRICING_URL="$ORIGIN/pricing"
THANK_URL="$ORIGIN/thank-you"

# ----------------------
# Pricing page checks
# ----------------------
echo "==> HEAD $PRICING_URL"
H=$(curl -sI "$PRICING_URL")
echo "$H" | grep -E "^HTTP/.* 200" >/dev/null || { echo "Pricing status is not 200"; echo "$H"; exit 1; }
echo "$H" | grep -i "^cache-control: .*max-age=900.*must-revalidate" >/dev/null || { echo "Cache-Control check failed for /pricing"; exit 1; }
echo "$H" | grep -i '^etag: W/"pricing-' >/dev/null || { echo "ETag check failed for /pricing"; exit 1; }
echo "$H" | grep -i "^last-modified:" >/dev/null || { echo "Last-Modified check failed for /pricing"; exit 1; }
# After 2025-09-26, no X-Pricing-Route diagnostics expected

HTML=$(curl -sL "$PRICING_URL")

echo "==> /pricing HTML checks"
echo "$HTML" | grep -i '<link rel="canonical" href="https://concillio.pages.dev/pricing"' >/dev/null || { echo "canonical link missing on /pricing"; exit 1; }
# After 2025-09-26, no x-pricing-route meta expected
echo "$HTML" | grep -i 'class="pricing-grid"' >/dev/null || { echo "pricing-grid missing on /pricing"; exit 1; }
# Accept any of the expected price strings
echo "$HTML" | grep -E '\$0|\$19\.95|\$34\.95|\$74\.95' >/dev/null || { echo "price strings missing on /pricing"; exit 1; }
# Ensure nav links include /pricing
echo "$HTML" | grep -i 'href="/pricing"' >/dev/null || { echo "nav links to /pricing missing"; exit 1; }

# ----------------------
# Thank-you page checks (recent bugfix)
# ----------------------
echo "==> HEAD $THANK_URL"
TH=$(curl -sI "$THANK_URL")
echo "$TH" | grep -E "^HTTP/.* 200" >/dev/null || { echo "/thank-you status is not 200"; echo "$TH"; exit 1; }
echo "$TH" | grep -i "^cache-control: .*max-age=900.*must-revalidate" >/dev/null || { echo "Cache-Control check failed for /thank-you"; exit 1; }
echo "$TH" | grep -i "^x-route: thank-you" >/dev/null || { echo "X-Route header missing or wrong on /thank-you"; exit 1; }

TH_HTML=$(curl -sL "$THANK_URL")
echo "==> /thank-you HTML checks"
echo "$TH_HTML" | grep -i '<meta name="robots" content="noindex, nofollow"' >/dev/null || { echo "meta robots noindex,nofollow missing on /thank-you"; exit 1; }
echo "$TH_HTML" | grep -i 'class="thankyou-page"' >/dev/null || { echo ".thankyou-page container missing on /thank-you"; exit 1; }

echo "All deploy checks passed."