# chains.click - Claude Development Guidelines

## Project Overview
A web3 service that helps users add blockchain RPC details to their crypto wallets with one click. Competing with chainid.network with focus on speed, modern UI, and mobile compatibility.

## Strict Development Rules

### 1. Follow GitHub Issues ONLY
- **DO NOT** implement features not defined in GitHub issues
- **DO NOT** skip issues or work out of order
- **ALWAYS** check current issue status before starting work
- Complete issues in numerical order: #1 -> #2 -> #3 -> etc.

### 2. GitHub Flow Required
- **NEVER** commit directly to `main` branch
- Create feature branch for each issue: `feature/issue-{number}-{short-description}`
- Example: `feature/issue-1-project-setup`
- All work must go through PR (but no push to remote unless told)
- **USE REBASE** instead of merge: `git checkout main && git rebase feature/issue-{N}-description`

### 3. Progress Tracking
Before starting any work, run:
```bash
gh issue list --state open
gh issue view {current-issue-number}
```

### 4. Issue Workflow
```
1. Check current issue: gh issue view {N}
2. Create branch: git checkout -b feature/issue-{N}-description
3. Implement the issue requirements
4. Test locally (no build required per user preference)
5. Commit changes with message referencing issue
6. Mark tasks complete in issue if applicable
7. STOP and wait for user to approve next step
```

### 5. Wait for User Approval
- **STOP** after completing each issue
- **ASK** user: "Issue #{N} is complete. Ready to proceed to Issue #{N+1}?"
- **DO NOT** automatically continue to next issue

## Current Progress Tracker

| Issue | Title | Status |
|-------|-------|--------|
| #1 | Project Setup: Cloudflare Pages + Workers | COMPLETE |
| #2 | Data Pipeline: ethereum-lists/chains integration | COMPLETE |
| #3 | Community Data: PR-based submissions | COMPLETE |
| #4 | Frontend: Modern, mobile-first UI | COMPLETE |
| #5 | Wallet Integration: EIP-3085 | COMPLETE |
| #6 | Performance: Edge caching | COMPLETE |
| #7 | CI/CD: GitHub Actions | COMPLETE |
| #8 | SEO & Analytics | NOT STARTED |

**CURRENT ISSUE: #8**

## Technical Decisions (Locked)

### Stack
- **Frontend**: SvelteKit (minimal bundle, fast, SSR)
- **Styling**: TailwindCSS
- **Deployment**: Cloudflare Pages + Workers
- **Data Storage**: Static JSON + Workers KV
- **Build Tool**: Vite

### Performance Targets
- Initial JS bundle: < 50KB gzipped
- TTFB: < 100ms from edge
- LCP: < 1.5s
- Mobile-first design

### Data Sources
1. Primary: https://github.com/ethereum-lists/chains
2. Custom: `_data/custom/` directory (PR with approval)

## User Preferences (from ~/.claude/CLAUDE.md)
- No need to build (test locally)
- No push to remote unless explicitly told
- Binary naming: use direct name, not bin/ prefix

## Commands Reference

```bash
# Check issues
gh issue list --state open
gh issue view {N}

# Branch management
git checkout -b feature/issue-{N}-description
git checkout main

# After completing issue (don't push)
git add .
git commit -m "feat: implement issue #{N} - description"

# Rebase feature branch to main (USE THIS instead of merge)
git checkout main
git rebase feature/issue-{N}-description

# Push after rebase (when told)
git push origin main
git push origin feature/issue-{N}-description
```

## Session Start Checklist
1. Read this CLAUDE.md
2. Run `gh issue list --state open`
3. Identify current issue from Progress Tracker above
4. Review issue details: `gh issue view {N}`
5. Check if feature branch exists
6. Continue or start implementation
7. STOP when issue complete, wait for user approval
