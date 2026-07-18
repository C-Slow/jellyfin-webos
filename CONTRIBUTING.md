# Contributing

Thanks for helping! A few guidelines:

## 🛡️ Branch Protection & Workflow
- **Never Work in Main:** NEVER make direct changes or commits to the `main` branch.
- **Always Branch:** Always create a new branch for every task, bug fix, or feature (e.g., `feature/...` or `bugfix/...`).
- **Atomic Commits:** Commit after each functional change on the feature branch.
- **User Validation:** Before merging to `main`, notify the user and wait for them to explicitly test and confirm that the changes work as expected.
- **Main Merge:** Only merge into `main` after explicit user confirmation.

## 🛠️ General Rules
- **No Large Binaries:** Don't commit large binary files (audio, .cpr Cubase projects, virtualenvs). Use `.gitignore` to manage local large data.
- **Utility Scripts:** Keep small utility scripts under `tools/` or top-level `scripts/` so they can be tracked without large assets.

If unsure, open an issue describing the change first.