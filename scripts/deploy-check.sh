#!/usr/bin/env bash
set -euo pipefail
URL="${1:-https://concillio.pages.dev/pricing}"

# Headers
echo "==> HEAD $URL"
H=$(curl -sI "$URL")
echo "$H" | grep -i "^cache-control: .*max-age=900.*must-revalidate" >/dev/null || { echo "Cache-Control check failed"; exit 1; }
echo "$H" | grep -i "^etag: W/\"pricing-" >/dev/null || { echo "ETag check failed"; exit 1; }
echo "$H" | grep -i "^last-modified:" >/dev/null || { echo "Last-Modified check failed"; exit 1; }
echo "$H" | grep -i "^x-pricing-route: v2" >/dev/null || { echo "X-Pricing-Route header missing"; exit 1; }

# HTML checks
HTML=$(curl -sL "$URL")

echo "==> HTML checks"
echo "$HTML" | grep -i '<link rel="canonical" href="https://concillio.pages.dev/pricing"' >/dev/null || { echo "canonical link missing"; exit 1; }
echo "$HTML" | grep -i '<meta name="x-pricing-route"' >/dev/null || { echo "meta x-pricing-route missing"; exit 1; }
echo "$HTML" | grep -i 'class="pricing-grid"' >/dev/null || { echo "pricing-grid missing"; exit 1; }
echo "$HTML" | grep -E '\$0|\$19\.95|\$34\.95|\$74\.95' >/dev/null || { echo "price strings missing"; exit 1; }

echo "$HTML" | grep -i 'href="/pricing"' >/dev/null || { echo "nav links to /pricing missing"; exit 1; }

echo "All deploy checks passed."
