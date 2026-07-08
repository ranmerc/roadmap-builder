#!/usr/bin/env bash

# Exit immediately if any command fails.
set -euo pipefail

# Configuration
BRANCH="gh-pages"
REMOTE="origin"

echo "Building project..."
npm run build

# Create a temporary directory for deployment.
TMP_DIR="$(mktemp -d)"

# Clean up the temporary directory on exit.
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Preparing deployment..."

# Copy the built site into the temporary directory.
cp -R dist/. "$TMP_DIR"

cd "$TMP_DIR"

# Initialize a brand-new Git repository.
git init -q

# Reuse the user identity from your main repository.
git config user.name "$(git -C "$OLDPWD" config user.name)"
git config user.email "$(git -C "$OLDPWD" config user.email)"

# Commit the built site.
git add .
git commit -q -m "Deploy $(date '+%Y-%m-%d %H:%M:%S')"

# Push as a single-commit history.
git remote add origin "$(git -C "$OLDPWD" remote get-url "$REMOTE")"
git push --force origin HEAD:"$BRANCH"

echo "✅ Deployment complete."