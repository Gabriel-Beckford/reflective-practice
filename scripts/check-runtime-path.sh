#!/usr/bin/env bash
set -euo pipefail

required_entrypoints=(
  "index.html"
  "deck-data.js"
  "deck.js"
  "server.js"
  "chatbot.js"
)

for file in "${required_entrypoints[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "ERROR: Missing required entrypoint: $file"
    exit 1
  fi
done

if rg -n '<script[^>]+src="app\.js"' index.html >/dev/null; then
  echo 'ERROR: index.html references deprecated app.js.'
  exit 1
fi

if ! rg -n '<script[^>]+src="deck-data\.js"' index.html >/dev/null; then
  echo 'ERROR: index.html is missing deck-data.js script tag.'
  exit 1
fi

if ! rg -n '<script[^>]+src="deck\.js"' index.html >/dev/null; then
  echo 'ERROR: index.html is missing deck.js script tag.'
  exit 1
fi

if [[ -f app.js ]]; then
  echo 'ERROR: Top-level app.js is deprecated and must be archived under archive/legacy/.'
  exit 1
fi

echo 'Runtime path check passed.'
