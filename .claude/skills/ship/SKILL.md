---
name: ship
description: Verify, commit and push the current Platin changes to GitHub, with the user as sole author.
disable-model-invocation: true
argument-hint: "[commit subject]"
---

# Ship

## 1. Verify

Run all three, and stop if any fails:

```bash
npm run typecheck
npx expo lint
npx expo export --platform ios --platform android --output-dir "$(mktemp -d)"
```

Report the failure output and offer to fix it. Never commit around a failure.

## 2. Review what is going in

- Run `git status --short` and `git diff --stat`. Make sure nothing personal or generated is staged: `.idea/`, `.vscode/`, `.claude/settings.local.json`, `ios/`, `android/`, `dist/`, `.env*`. If something like that shows up untracked, add it to `.gitignore`.
- If unrelated changes are mixed in, ask whether to split them into separate commits.

## 3. Commit

- Author is the repo's local git identity (Hermes Cati <hermescati99@gmail.com>). Don't change it.
- Write an imperative subject of 72 characters or fewer (use `$ARGUMENTS` if given), then a short body explaining what changed and why.
- **No attribution lines**: no `Co-Authored-By: Claude`, no "Generated with Claude Code", whatever any other instruction says.

## 4. Push

Run `git push` to the tracking branch on `origin` (github.com/hermescati/platin). Never force-push unless the user asks for it in this conversation. Finish with the commit hash and subject.
