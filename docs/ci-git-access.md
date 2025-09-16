# Git access för Concilio

## Lokal utveckling (standard SSH)
För lokal utveckling används din personliga SSH-nyckel kopplad till GitHub-kontot:

```bash
git clone git@github.com:ejob-ai/Concillio.git
cd Concillio
git remote -v
# origin  git@github.com:ejob-ai/Concillio.git (fetch/push)


Detta gör att du kan läsa, committa och pusha som vanligt.