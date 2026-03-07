---
description: After making any code changes, always push to GitHub for auto-deploy
---

After completing ANY code changes (bug fixes, features, refactors, etc.), always:

// turbo
1. Run `git status` to see changed files

2. Stage the changed files: `git add <files>`

3. Commit with a descriptive message: `git commit -m "type: description"`

4. Push to GitHub: `git push origin main`

This ensures Vercel auto-deploys every change immediately.
