---
name: git-worktree
description: REQUIRED for ANY development work on this project. Use this skill to properly create and manage git worktrees for parallel development.
---

## What I do
I guide you through creating and managing git worktrees for parallel development in this production project.

## When to use me
ALWAYS use this skill before making any changes to the codebase. The project is in production and all development must happen in separate worktrees to avoid conflicts.

## Workflow

### 1. Create a new branch
```bash
git checkout -b feature/your-feature-name
# or for bugfixes
git checkout -b fix/your-fix-name
```

### 2. Create a worktree
```bash
git worktree add ../worktree-name branch-name
```

### 3. Open a new tmux window with opencode
After creating the worktree, open a new tmux window and start opencode in the worktree directory (not the main orders directory):

```bash
# Single command - creates tmux window, sets working directory to worktree, and starts opencode
tmux new-window -n "worktree-name" -c /home/radbug/Work/worktree-name "opencode"
```

Or step-by-step:
```bash
# Create a new tmux window (adds a window to current session)
tmux new-window -n "worktree-name"

# Navigate to the worktree directory in the new window
tmux send-keys -t "worktree-name" "cd /home/radbug/Work/worktree-name" C-m

# Start opencode in the worktree
tmux send-keys -t "worktree-name" "opencode" C-m
```

**Important**: Opencode runs in the worktree folder (`/home/radbug/Work/worktree-name`), not in the main orders directory.

### 4. Work in the worktree
- The new tmux window is now running opencode in the worktree directory
- Make your changes and commits in the worktree
- Run `npm run check` and `npm run lint` before committing
- Test your changes thoroughly
- Make your changes and commits
- Run `npm run check` and `npm run lint` before committing
- Test your changes thoroughly

### 4. Push to remote
```bash
git push -u origin branch-name
```

### 5. Create a pull request
- Create a PR for review from the worktree
- Wait for approval before merging

### 6. Cleanup after merge
```bash
git worktree remove ../worktree-name
git branch -d branch-name
```

## Important Notes
- Each agent should work in its own worktree to avoid conflicts
- Never make changes directly on the main branch
- Always create a worktree for feature or bugfix work
- Worktrees allow multiple agents to work on different branches simultaneously
- The main worktree (this directory) should remain on main with production code

## Current Status
Before starting any work, verify:
```bash
git branch  # should be on main or a feature branch
git status  # should be clean (no uncommitted changes)
git worktree list  # shows all existing worktrees
```