#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-}"
if [ -z "$BASE_URL" ]; then
  echo "BASE_URL is required"; exit 1
fi

pass(){ echo "✓ $*"; }
fail(){ echo "✗ $*" >&2; exit 1; }

# 1) GET-start → 302 Stripe (eller 501 när Stripe saknas)
resp=$(curl -si "${BASE_URL}/api/billing/checkout/start?plan=starter&quantity=1")
code=$(printf "%s" "$resp" | awk 'NR==1{print $2}')
loc=$(printf "%s" "$resp" | awk '/^Location:/ {print $2}')
if [ "$code" = "302" ]; then
  echo "$loc" | grep -qi "https://checkout.stripe.com/" || fail "GET-start: Location not Stripe"
  pass "GET-start 302 → Stripe OK"
elif [ "$code" = "501" ]; then
  pass "GET-start 501 (payments not configured) — accepted for envs without STRIPE_SECRET_KEY"
else
  fail "GET-start expected 302 or 501 (got $code)"
fi

# 2) UNKNOWN_PLAN → 400
code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/billing/checkout/start?plan=unknown")
[ "$code" = "400" ] || fail "UNKNOWN_PLAN should 400"
pass "unknown plan 400"

# 3) /checkout bevarar UTM i 302
hdr=$(curl -si "${BASE_URL}/checkout?plan=starter&utm_source=test&utm_campaign=abc")
echo "$hdr" | grep -q "^HTTP/.* 302" || fail "/checkout: expected 302"
loc=$(echo "$hdr" | awk '/^Location:/ {print $2}')
echo "$loc" | grep -q "utm_source=test"   || fail "/checkout: utm_source not forwarded"
echo "$loc" | grep -q "utm_campaign=abc" || fail "/checkout: utm_campaign not forwarded"
pass "/checkout forwards UTM"

# 4) /thank-you 200 + noindex
hdr=$(curl -si "${BASE_URL}/thank-you?plan=starter&session_id=test")
echo "$hdr" | grep -q "^HTTP/.* 200" || fail "/thank-you: expected 200"
echo "$hdr" | grep -qi "x-robots-tag: noindex" || fail "/thank-you: missing noindex"
pass "/thank-you 200 + noindex"

# 5) Legacy POST → 410 GONE
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/billing/checkout")
[ "$code" = "410" ] || fail "POST /api/billing/checkout should be 410"
pass "POST /api/billing/checkout is 410"

# 6) Portal-start baseline (saknad id/secret → 400/501)
code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/billing/portal/start")
case "$code" in
  400|501) pass "portal/start baseline $code OK" ;;
  *) fail "portal/start expected 400 or 501 (got $code)";;
esac

# --- Guards för helpers ---
# Prod OFF (alltid)
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" -H "x-test-auth: dummy" \
  "${BASE_URL}/api/test/login")
[ "$code" = "403" ] || fail "test-login should be 403 in prod (got $code)"

code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "x-test-auth: dummy" \
  "${BASE_URL}/api/test/logout")
[ "$code" = "403" ] || fail "test-logout should be 403 in prod (got $code)"
pass "helpers OFF guard (prod) OK"

# Preview ON (villkor)
if [ "${EXPECT_TEST_HELPERS:-off}" = "on" ]; then
  : "${TEST_LOGIN_TOKEN:?EXPECT_TEST_HELPERS=on but TEST_LOGIN_TOKEN is missing}"
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" -H "x-test-auth: ${TEST_LOGIN_TOKEN}" \
    -d '{"email":"e2e@example.com","customerId":"cus_e2e_123","plan":"starter","status":"active"}' \
    "${BASE_URL}/api/test/login")
  [ "$code" = "200" ] || fail "preview: test-login should be 200 (got $code)"
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    -H "x-test-auth: ${TEST_LOGIN_TOKEN}" \
    "${BASE_URL}/api/test/logout")
  [ "$code" = "200" ] || fail "preview: test-logout should be 200 (got $code)"
  pass "helpers ON guard (preview) OK"
fi

pass "All deploy checks passed"
