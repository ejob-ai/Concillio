#!/usr/bin/env bash
set -euo pipefail

# Usage: BASE_URL=https://your-project.pages.dev ./scripts/deploy-check.sh
BASE_URL=${BASE_URL:-}
if [[ -z "${BASE_URL}" ]]; then
  echo "ERROR: Set BASE_URL to your deployed site (e.g., https://concillio.pages.dev)" >&2
  exit 2
fi

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
NC=$'\033[0m'

pass() { echo -e "${GREEN}✔${NC} $1"; }
fail() { echo -e "${RED}✘${NC} $1"; exit 1; }

# 1) GET-start ska 302:a till Stripe
resp_headers=$(curl -si "${BASE_URL}/api/billing/checkout/start?plan=starter&quantity=1")
echo "$resp_headers" | grep -q "^HTTP/.* 302" || fail "GET-start: expected 302"
echo "$resp_headers" | grep -qi "Location: https://checkout.stripe.com/" || fail "GET-start: Location not Stripe"
pass "GET-start 302 → Stripe"

# 2) UNKNOWN_PLAN → 400
code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/billing/checkout/start?plan=unknown")
[[ "$code" == "400" ]] || fail "UNKNOWN_PLAN should 400"
pass "UNKNOWN_PLAN 400"

# 3) /checkout bevarar UTM i 302
resp_headers=$(curl -si "${BASE_URL}/checkout?plan=starter&utm_source=test&utm_campaign=abc")
echo "$resp_headers" | grep -q "^HTTP/.* 302" || fail "/checkout: expected 302"
loc=$(printf "%s\n" "$resp_headers" | awk 'tolower($1)=="location:" {print $2}')
echo "$loc" | grep -q "utm_source=test" || fail "/checkout: utm_source not forwarded"
echo "$loc" | grep -q "utm_campaign=abc" || fail "/checkout: utm_campaign not forwarded"
pass "/checkout 302 preserves utm params"

# 4) /thank-you ska finnas och vara noindex
thank_headers=$(curl -si "${BASE_URL}/thank-you?plan=starter&session_id=test")
echo "$thank_headers" | grep -q "^HTTP/.* 200" || fail "/thank-you: expected 200"
# we now also set X-Robots-Tag header
echo "$thank_headers" | grep -qi "^x-robots-tag: noindex, nofollow" || fail "/thank-you: missing noindex"
pass "/thank-you 200 + noindex"

# 5) (Valfritt) POST checkout ska vara 410 Gone under avvecklingsperioden
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/billing/checkout")
[[ "$code" == "410" ]] || fail "POST /api/billing/checkout should be 410 Gone"
pass "POST checkout returns 410"

# 6) portal/start should 400 without customerId (or 501 when Stripe is not configured)
code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/billing/portal/start")
if [[ "$code" != "400" && "$code" != "501" ]]; then
  fail "/api/billing/portal/start without customerId should 400 (or 501 if Stripe missing), got $code"
fi
pass "portal/start 400/501 without customerId"

# 7) /app/billing guard: allow 200 (dev) or 302→/login?next=/app/billing (prod)
resp=$(curl -si "${BASE_URL}/app/billing")
if printf "%s\n" "$resp" | grep -q "^HTTP/.* 200"; then
  pass "/app/billing 200"
else
  if printf "%s\n" "$resp" | grep -q "^HTTP/.* 302"; then
    loc=$(printf "%s\n" "$resp" | awk 'tolower($1)=="location:" {print $2}')
    if printf "%s\n" "$loc" | grep -q "/login?next=%2Fapp%2Fbilling\|/login?next=/app/billing"; then
      pass "/app/billing 302→login guard"
    else
      fail "/app/billing 302 but Location not login guard"
    fi
  else
    fail "/app/billing should be 200 or 302→login, got: $(printf "%s\n" "$resp" | head -n1)"
  fi
fi

# --- Test helpers must be OFF in production ---
# (Körs alltid — prod ska ge 403 även om någon lägger in en header)
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -H "x-test-auth: dummy-token" \
  "${BASE_URL}/api/test/login")
[ "$code" = "403" ] || fail "test-login should be 403 in prod (got $code)"

code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "x-test-auth: dummy-token" \
  "${BASE_URL}/api/test/logout")
[ "$code" = "403" ] || fail "test-logout should be 403 in prod (got $code)"

# --- Preview-only: helpers must be ON when explicitly requested ---
if [ "${EXPECT_TEST_HELPERS:-off}" = "on" ]; then
  if [ -z "${TEST_LOGIN_TOKEN:-}" ]; then
    fail "EXPECT_TEST_HELPERS=on but TEST_LOGIN_TOKEN is missing"
  fi

  # Login should succeed (200) with correct token
  login_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "x-test-auth: ${TEST_LOGIN_TOKEN}" \
    -d '{"email":"e2e-billing@example.com","customerId":"cus_e2e_123","plan":"starter","status":"active"}' \
    "${BASE_URL}/api/test/login")
  [ "$login_code" = "200" ] || fail "preview: test-login should be 200 (got $login_code)"

  # Logout should also succeed (200)
  logout_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "x-test-auth: ${TEST_LOGIN_TOKEN}" \
    "${BASE_URL}/api/test/logout")
  [ "$logout_code" = "200" ] || fail "preview: test-logout should be 200 (got $logout_code)"
fi

pass "All deploy checks passed"