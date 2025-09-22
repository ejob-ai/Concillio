## PR checks policy (TL;DR)

- You must pass:
  - `build-and-test`
  - `deploy-preview (chromium)` → “Run E2E smoke (chromium)”
- Nice-to-have (non-blocking):
  - `deploy-preview (firefox)`
  - `deploy-preview (webkit)`
  - “Deploy checks (preview)”
- Why: Firefox/WebKit can be flaky on CI; preview “deploy checks” soft-accept missing secrets to keep velocity high.
- Production (on `main`) remains strict across all browsers and checks.
