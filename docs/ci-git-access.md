# Git access för Concilio

## Lokal utveckling (standard SSH)
För lokal utveckling används din personliga SSH-nyckel kopplad till GitHub-kontot:

```bash
git clone git@github.com:ejob-ai/Concillio.git
cd Concillio
git remote -v
# origin  git@github.com:ejob-ai/Concillio.git (fetch/push)
```

Detta gör att du kan läsa, committa och pusha som vanligt.

---

## CI/Server (deploy key + alias)
På server/CI används en dedikerad deploy‑nyckel och ett host‑alias för tydlig separation från din personliga nyckel.

1) Skapa deploy‑nyckel (på servern):
```bash
ssh-keygen -t ed25519 -C "deploy@concillio" -f ~/.ssh/concillio_deploy -N ""
cat ~/.ssh/concillio_deploy.pub  # lägg som Deploy key i repo:t (gärna med write access om push behövs)
```

2) SSH‑alias och kända värdar (~/.ssh/config och known_hosts):
```sshconfig
Host github.com-concillio
  HostName github.com
  User git
  IdentityFile ~/.ssh/concillio_deploy
  IdentitiesOnly yes
  StrictHostKeyChecking yes
```

3) Klona/pusha via alias:
```bash
git clone git@github.com-concillio:ejob-ai/Concillio.git
cd Concillio
# ... bygg/test ...
# push kräver write‑access på deploy‑nyckeln
# git push git@github.com-concillio:ejob-ai/Concillio.git main
```

---

## GitHub Actions (exempel)
Lägg den privata deploy‑nyckeln som GitHub Secret: CONCILLIO_DEPLOY_KEY.

```yaml
name: CI

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout with deploy key
        uses: actions/checkout@v4
        with:
          ssh-key: ${{ secrets.CONCILLIO_DEPLOY_KEY }}
          ssh-known-hosts: github.com

      - name: Verify remote
        run: |
          git remote -v
          # ska visa git@github.com-concillio:ejob-ai/Concillio.git
```

Tips:
- Använd separata deploy‑nycklar per miljö (staging/production) och begränsa write‑access där det går.
- För pull‑only scenarion, skapa read‑only Deploy key utan write‑access.

---

## GitLab CI (exempel)
Lagra privata nyckeln som CI‑secret CONCILLIO_DEPLOY_KEY.

```yaml
stages:
  - build

build-job:
  stage: build
  image: node:20
  before_script:
    - mkdir -p ~/.ssh
    - echo "$CONCILLIO_DEPLOY_KEY" > ~/.ssh/id_ed25519
    - chmod 600 ~/.ssh/id_ed25519
    - echo "Host github.com-concillio
      HostName github.com
      User git
      IdentityFile ~/.ssh/id_ed25519
      IdentitiesOnly yes" > ~/.ssh/config
    - ssh-keyscan github.com >> ~/.ssh/known_hosts
  script:
    - git clone git@github.com-concillio:ejob-ai/Concillio.git
    - cd Concillio
    - npm ci && npm run build
```

## Key management

| Nyckel                   | Kommentar (identifiering) | Användning                                | Lagring |
|---------------------------|---------------------------|-------------------------------------------|---------|
| `~/.ssh/id_ed25519`       | `ejo.brandstrom@gmail.com` | **Personlig** nyckel för utveckling (git clone/push från din maskin) | Lagrad i din lokala `~/.ssh` och kopplad till ditt GitHub-konto |
| `~/.ssh/concillio_deploy` | `deploy@concillio`        | **Deploy Key** för CI/CD (GitHub Actions, Cloudflare Pages, m.m.) | Publik del (`.pub`) i repo → Settings → Deploy Keys. Privat del i GitHub Secrets (`CONCILLIO_DEPLOY_KEY`) |

🔐 **Policyrekommendationer:**
- **Separation:** använd personliga nycklar endast för utveckling, deploy-nycklar endast för CI/CD.  
- **Read vs Write:** ge deploy-nycklar endast *read* om det inte finns ett absolut behov av *write*.  
- **Rotation:** rotera deploy-nycklar minst var 12:e månad, eller tidigare vid misstänkt läckage.  
- **Per miljö:** skapa separata deploy-nycklar för olika miljöer/projekt (t.ex. staging vs prod).  
- **Åtkomst:** privata nycklar ska endast lagras i secrets/CI-miljöer, aldrig i repo. Endast publika `.pub` hör hemma i GitHub Deploy Keys.  
