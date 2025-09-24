#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-}"
if [ -z "$BASE_URL" ]; then
  echo "BASE_URL is required"; exit 1
fi

# --- CF Access headers (sanitized) ---
CID_RAW="${CF_ACCESS_CLIENT_ID:-}"
CSEC_RAW="${CF_ACCESS_CLIENT_SECRET:-}"

# Ta bort ev. \r, \n och omgivande blanksteg som kan ha smugits in via GitHub UI
CID="$(printf '%s' "$CID_RAW"  | tr -d '\r\n' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
CSEC="$(printf '%s' "$CSEC_RAW" | tr -d '\r\n' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

if [ -n "$CID" ] && [ -n "$CSEC" ]; then
  CF_ARGS=(-H "CF-Access-Client-Id: $CID" -H "CF-Access-Client-Secret: $CSEC")
  # maska allt utom de första 6 tecknen, och skriv också längden så vi ser att inget CR/LF följt med
  CID_MASK="$(printf '%s' "$CID" | sed -E 's/^(.{6}).+/\1*******/')"
  CSEC_MASK="$(printf '%s' "$CSEC" | sed -E 's/^(.{6}).+/\1*******/')"
  echo "[deploy-checks] CF Access headers enabled"
  echo "[deploy-checks] Using CF-Access-Client-Id: ${CID_MASK} (len=$(printf '%s' "$CID" | wc -c))"
  echo "[deploy-checks] Using CF-Access-Client-Secret: ${CSEC_MASK} (len=$(printf '%s' "$CSEC" | wc -c))"
else
  CF_ARGS=()
  echo "[deploy-checks] CF Access headers NOT set"
fi

# Curl helper wrappers (optionally include CF Access headers)
curl_head() {                   # prints headers
  curl -sS -o /dev/null -D - "${CF_ARGS[@]}" "$@"
}
status_of() {                   # prints HTTP status code
  curl -sS -o /dev/null -w "%{http_code}" "${CF_ARGS[@]}" "$@"
}
location_of() {                 # extracts Location
  curl -sS -o /dev/null -D - "${CF_ARGS[@]}" "$@" | awk '/^[Ll]ocation: /{print $2}' | tr -d '\r'
}
header_value() {                # extracts specific header
  curl -sS -o /dev/null -D - "${CF_ARGS[@]}" "$1" | awk -v k="^$2: " 'BEGIN{IGNORECASE=1} $0 ~ k {sub(k,""); print; exit}' | tr -d '\r'
}

pass(){ echo "✓ $*"; }
fail(){ echo "✗ $*" >&2; exit 1; }

echo "1) GET start → 302 Stripe (prod) or 302/501 (preview)"
RESP="$(curl -sS -D - -o /dev/null "${CF_ARGS[@]}" "$BASE_URL/api/billing/checkout/start?plan=starter")"
CODE="$(printf "%s" "$RESP" | awk 'NR==1{print $2}')"
LOC="$(printf "%s" "$RESP" | tr -d "\r" | sed -n '/^[Ll]ocation:[[:space:]]*/{s/^[Ll]ocation:[[:space:]]*//;p;q}')"

# Extra diagnostik: skriv ut status + full Location och indikera om det är en CF Access-login
echo "[deploy-checks] GET-start status: ${CODE}"
if [ -n "$LOC" ]; then
  echo "[deploy-checks] GET-start Location: ${LOC}"
  if [[ "$LOC" == *"/cdn-cgi/access/login"* ]]; then
    echo "[deploy-checks] NOTE: Cloudflare Access login redirect detected (auth gate still active)."
  fi
else
  echo "[deploy-checks] GET-start Location: <none>"
fi

if [ "$CODE" = "302" ]; then
  if echo "$LOC" | grep -qi 'stripe'; then
    echo "✓ 302 → Stripe"
  else
    if [ "${ENVIRONMENT:-preview}" = "preview" ]; then
      echo "⚠️ 302 non-Stripe (preview acceptable)"
    else
      echo "❌ Production requires Stripe redirect; got: $LOC"
      exit 1
    fi
  fi
elif [ "$CODE" = "501" ]; then
  BODY="$(curl -sS "${CF_ARGS[@]}" "$BASE_URL/api/billing/checkout/start?plan=starter")"
  if [ "${ENVIRONMENT:-preview}" = "production" ]; then
    echo "❌ Production must return 302 to Stripe (configure STRIPE_SECRET_KEY and PRICE_*)."
    exit 1
  fi
  if echo "$BODY" | grep -Eq 'MISSING_PRICE_ID_|PAYMENTS_NOT_CONFIGURED'; then
    echo "⚠️ 501 with expected reason (preview acceptable): $BODY"
  else
    echo "✗ 501 without expected reason: $BODY"
  fi
else
  echo "✗ unexpected status: $CODE"; [ "${ENVIRONMENT:-preview}" = "production" ] && exit 1 || true
fi

# 2) UNKNOWN_PLAN should 400
STATUS="$(curl -sS -o /dev/null -w "%{http_code}" "${CF_ARGS[@]}" "$BASE_URL/api/billing/checkout/start?plan=foobar")"
if [ "$STATUS" != "400" ]; then
  if [ "${ENVIRONMENT:-preview}" = "preview" ]; then
    echo "⚠️ UNKNOWN_PLAN check: got $STATUS (allowed in preview)"
  else
    echo "✗ UNKNOWN_PLAN should 400"; exit 1
  fi
else
  echo "✓ UNKNOWN_PLAN → 400"
fi

# 3) /checkout bevarar UTM i 302
hdr=$(curl -sSi "${CF_ARGS[@]}" "${BASE_URL}/checkout?plan=starter&utm_source=test&utm_campaign=abc")
echo "$hdr" | grep -q "^HTTP/.* 302" || fail "/checkout: expected 302"
loc=$(printf "%s" "$hdr" | tr -d "\r" | sed -n '/^[Ll]ocation:[[:space:]]*/{s/^[Ll]ocation:[[:space:]]*//;p;q}')
echo "$loc" | grep -q "utm_source=test"   || fail "/checkout: utm_source not forwarded"
echo "$loc" | grep -q "utm_campaign=abc" || fail "/checkout: utm_campaign not forwarded"
pass "/checkout forwards UTM"

# 4) /thank-you 200 + noindex
hdr=$(curl -sSi "${CF_ARGS[@]}" "${BASE_URL}/thank-you?plan=starter&session_id=test")
echo "$hdr" | grep -q "^HTTP/.* 200" || fail "/thank-you: expected 200"
echo "$hdr" | grep -qi "x-robots-tag: noindex" || fail "/thank-you: missing noindex"
pass "/thank-you 200 + noindex"

# 5) Legacy POST → 410 GONE
code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "${CF_ARGS[@]}" "${BASE_URL}/api/billing/checkout")
[ "$code" = "410" ] || fail "POST /api/billing/checkout should be 410"
pass "POST /api/billing/checkout is 410"

# 6) Portal-start baseline (saknad id/secret → 400/501)
code=$(curl -sS -o /dev/null -w "%{http_code}" "${CF_ARGS[@]}" "${BASE_URL}/api/billing/portal/start")
case "$code" in
  400|501) pass "portal/start baseline $code OK" ;;
  *) fail "portal/start expected 400 or 501 (got $code)";;
esac

# --- Guards för helpers ---
# Prod OFF (alltid)
code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST \
  "${CF_ARGS[@]}" -H "Content-Type: application/json" -H "x-test-auth: dummy" \
  "${BASE_URL}/api/test/login")
[ "$code" = "403" ] || fail "test-login should be 403 in prod (got $code)"

code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST \
  "${CF_ARGS[@]}" -H "x-test-auth: dummy" \
  "${BASE_URL}/api/test/logout")
[ "$code" = "403" ] || fail "test-logout should be 403 in prod (got $code)"
pass "helpers OFF guard (prod) OK"

# Preview ON (villkor)
if [ "${EXPECT_TEST_HELPERS:-0}" = "on" ] || [ "${EXPECT_TEST_HELPERS:-0}" = "1" ]; then
  : "${TEST_LOGIN_TOKEN:?EXPECT_TEST_HELPERS requires TEST_LOGIN_TOKEN}"
  code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST \
    "${CF_ARGS[@]}" -H "Content-Type: application/json" -H "x-test-auth: ${TEST_LOGIN_TOKEN}" \
    -d '{"email":"e2e@example.com","customerId":"cus_e2e_123","plan":"starter","status":"active"}' \
    "${BASE_URL}/api/test/login")
  [ "$code" = "200" ] || fail "preview: test-login should be 200 (got $code)"
  code=$(curl -sS -o /dev/null -w "%{http_code}" -X POST \
    "${CF_ARGS[@]}" -H "x-test-auth: ${TEST_LOGIN_TOKEN}" \
    "${BASE_URL}/api/test/logout")
  [ "$code" = "200" ] || fail "preview: test-logout should be 200 (got $code)"
  pass "helpers ON guard (preview) OK"
fi

# --- UTM -> Stripe metadata (preview only) ---
if [[ "${ENVIRONMENT:-}" == "preview" && -n "${STRIPE_SECRET_KEY:-}" ]]; then
  echo "UTM -> Stripe metadata check (preview)"
  UTM_URL="${BASE_URL}/api/billing/checkout/start?plan=starter&utm_source=ci&utm_campaign=matrix"
  RESP="$(curl -sS -D - -o /dev/null "${CF_ARGS[@]}" "$UTM_URL")"
  LOC="$(printf "%s" "$RESP" | tr -d "\r" | sed -n '/^[Ll]ocation:[[:space:]]*/{s/^[Ll]ocation:[[:space:]]*//;p;q}')"
  CODE="$(printf "%s" "$RESP" | awk 'NR==1{print $2}')"

  if [[ "$CODE" == "302" && "$LOC" =~ stripe ]]; then
    # Extract Stripe Checkout Session ID from path (format: /c/pay/cs_...)
    SID="$(printf "%s" "$LOC" | sed -n 's~^.*/\(cs_[^/?#]*\).*~\1~p')"
    if [[ -n "$SID" ]]; then
      META_SRC="$(curl -sS https://api.stripe.com/v1/checkout/sessions/"$SID" -u "$STRIPE_SECRET_KEY":)"
      echo "$META_SRC" | grep -q '"metadata":' || { echo "No metadata in session"; exit 1; }
      echo "$META_SRC" | grep -q '"utm_source":"ci"' || { echo "metadata.utm_source != ci"; exit 1; }
      echo "$META_SRC" | grep -q '"utm_campaign":"matrix"' || { echo "metadata.utm_campaign != matrix"; exit 1; }
      echo "✓ UTM propagated to Stripe metadata"
    else
      echo "Could not extract session id (cs_*) from Location"; exit 1
    fi
  else
    echo "Stripe 302 not available in preview (code=$CODE). Skipping UTM->Stripe verification."
  fi
fi

# --- Billing Portal 302 (preview only) ---
if [[ "${ENVIRONMENT:-}" == "preview" && -n "${STRIPE_SECRET_KEY:-}" && -n "${TEST_LOGIN_TOKEN:-}" ]]; then
  echo "Billing Portal 302 check (preview)"
  # 1) create a test customer in Stripe
  CUST_JSON="$(curl -sS https://api.stripe.com/v1/customers -u "$STRIPE_SECRET_KEY": -d description="ci-portal-check")"
  CUST_ID="$(printf "%s" "$CUST_JSON" | sed -n 's/.*"id":\s*"\(cus_[^"]*\)".*/\1/p')"
  test -n "$CUST_ID" || { echo "Failed to create Stripe customer"; exit 1; }
  # 2) seed session via helper (accepts JSON with customerId)
  LOGIN_CODE="$(curl -sS -o /dev/null -w "%{http_code}" -X POST \
    "${CF_ARGS[@]}" -H "x-test-auth: ${TEST_LOGIN_TOKEN}" -H "Content-Type: application/json" \
    -d "{\"email\":\"ci+portal@concillio.dev\",\"customerId\":\"$CUST_ID\"}" \
    "${BASE_URL}/api/test/login")"
  [[ "$LOGIN_CODE" == "200" ]] || { echo "test-login failed ($LOGIN_CODE)"; exit 1; }
  # 3) expect 302 to billing.stripe.com
  RESP="$(curl -sS -D - -o /dev/null "${CF_ARGS[@]}" "${BASE_URL}/api/billing/portal/start")"
  CODE="$(printf "%s" "$RESP" | awk 'NR==1{print $2}')"
  LOC="$(printf "%s" "$RESP" | tr -d "\r" | sed -n '/^[Ll]ocation:[[:space:]]*/{s/^[Ll]ocation:[[:space:]]*//;p;q}')"
  if [[ "$CODE" == "302" && "$LOC" =~ billing\.stripe\.com ]]; then
    echo "✓ Portal 302 to billing.stripe.com"
  else
    echo "Unexpected portal response: code=$CODE, location=$LOC"; exit 1
  fi
fi

# --- Webhook signature verify + dedup (preview only) ---
if [[ "${ENVIRONMENT:-}" == "preview" && -n "${STRIPE_WEBHOOK_SECRET:-}" ]]; then
  echo "Webhook signature + dedup check (preview)"
  TS="$(date +%s)"
  PAYLOAD='{"id":"evt_ci_dedup","object":"event","type":"customer.subscription.updated","data":{"object":{"id":"sub_ci_preview","status":"active"}}}'
  SIG_RAW="$(printf '%s.%s' "$TS" "$PAYLOAD" | openssl dgst -sha256 -hmac "$STRIPE_WEBHOOK_SECRET" -binary | xxd -p -c 256)"
  SIG_HDR="t=$TS,v1=$SIG_RAW"

  # First call
  HDR1="$(curl -sS -D - -o /dev/null -X POST "${BASE_URL}/api/billing/webhook" \
    "${CF_ARGS[@]}" -H "Stripe-Signature: $SIG_HDR" -H "Content-Type: application/json" --data-binary "$PAYLOAD")"
  DEDUP1="$(printf "%s" "$HDR1" | awk -v k="^X-Dedup: " 'BEGIN{IGNORECASE=1} $0 ~ k {sub(k,""); print; exit}' | tr -d "\r")"

  # Second call (same event)
  HDR2="$(curl -sS -D - -o /dev/null -X POST "${BASE_URL}/api/billing/webhook" \
    "${CF_ARGS[@]}" -H "Stripe-Signature: $SIG_HDR" -H "Content-Type: application/json" --data-binary "$PAYLOAD")"
  DEDUP2="$(printf "%s" "$HDR2" | awk -v k="^X-Dedup: " 'BEGIN{IGNORECASE=1} $0 ~ k {sub(k,""); print; exit}' | tr -d "\r")"

  if [[ "$DEDUP1" == "miss" && "$DEDUP2" == "hit" ]]; then
    echo "✓ Webhook dedup works (miss → hit)"
  else
    echo "Webhook dedup headers unexpected: first='$DEDUP1' second='$DEDUP2'"
    echo "(Make sure preview code sets X-Dedup header; prod should not.)"
    exit 1
  fi
fi

pass "All deploy checks passed"
