#!/usr/bin/env bash
# Removes node_modules from the entire Git history so GitHub accepts the push.
# Run from repo root: bash scripts/purge-node-modules-from-git.sh
# After: npm install && git push --force-with-lease origin main

set -euo pipefail
cd "$(dirname "$0")/.."

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: not a git repository."
  exit 1
fi

echo "==> Dropping node_modules from the index (working tree kept)"
git rm -rf --cached node_modules 2>/dev/null || true
git rm -rf --cached apps/frontend/node_modules 2>/dev/null || true
git rm -rf --cached apps/backend/node_modules 2>/dev/null || true
git rm -rf --cached packages/*/node_modules 2>/dev/null || true

echo "==> Rewriting all commits (this may take a minute)"
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch --force --index-filter \
  'git rm -rf --cached --ignore-unmatch \
    node_modules \
    apps/frontend/node_modules \
    apps/backend/node_modules' \
  --prune-empty \
  --tag-name-filter cat \
  -- --all

echo "==> Removing backup refs from filter-branch"
git for-each-ref --format="%(refname)" refs/original/ | while read -r ref; do
  git update-ref -d "$ref" 2>/dev/null || true
done

echo "==> Expiring reflog and garbage-collecting (frees space from old blobs)"
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "Done. Large binaries should be gone from history."
echo "Next:"
echo "  1) npm install"
echo "  2) git push --force-with-lease origin main"
echo ""
