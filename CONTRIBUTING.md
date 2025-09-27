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

## Repository layout & submodules

- This repository is now a **flat mono-repo**. We **do not use git submodules**.
- The historical `Concillio/` submodule has been **absorbed**; it is a regular directory.
- Please **do not add new submodules**. If you need to include external code,
  vendor it or consume it via package management (npm) instead.

### Symptoms of stale submodule state in a local clone
- Errors like:
  - `fatal: no submodule mapping found in .gitmodules for path 'Concillio'`
  - `no submodule mapping found in .gitmodules`
  - `mode 160000` (gitlink) entries for `Concillio/`

### How to fix locally
Run:
```bash
git fetch --all
git pull --rebase
git submodule deinit -f --all || true
rm -rf .git/modules/Concillio || true
git reset --hard HEAD
```