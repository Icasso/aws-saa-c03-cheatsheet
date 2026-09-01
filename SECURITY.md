# Security

## Scope

This repository is a **static study app** — markdown cheat sheets plus a client-side React UI. There is no backend, authentication, database, or user accounts.

**Live app:** https://saa-c03-study-six.vercel.app

## What we store

| Data | Where | Notes |
|------|-------|-------|
| Study content | Built into static JSON at deploy time | Public by design |
| Practice exam answers | Client bundle | Expected for a study tool — not secret exam content |
| Flashcard progress, exam scores, flagged questions | Browser `localStorage` only | Never sent to a server; stays on your device |

## Security measures

- **No secrets in repo** — no API keys, tokens, or credentials
- **Static hosting** — Vercel serves pre-built HTML/JS/CSS only
- **Security headers** — CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (see `vercel.json`)
- **Markdown rendering** — `react-markdown` (no raw HTML); links restricted to `http`, `https`, `mailto`
- **localStorage validation** — parsed progress data is schema-checked before use
- **Dependencies** — run `npm audit` in `web/` before releases

## Reporting issues

If you find a security problem, please open a [GitHub issue](https://github.com/Icasso/aws-saa-c03-cheatsheet/issues) with steps to reproduce. Do not include real AWS credentials or personal data.

## Not in scope

- Exam answer secrecy (practice content is intentionally included)
- Multi-user data isolation (single-user, browser-local app)
- HIPAA/PCI compliance (no regulated data handled)
