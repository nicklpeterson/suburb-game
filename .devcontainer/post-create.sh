#!/bin/zsh

sudo chown node:node /home/node/.claude
npm install -g pnpm
gh auth setup-git --hostname github.com --force
pnpm install
npx -y playwright install --with-deps chromium