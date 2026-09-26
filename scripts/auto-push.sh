#!/bin/bash

cd /Users/vedantsmac/StockSense || exit 1

git add .

if git diff --cached --quiet; then
    exit 0
fi

git commit -m "Auto backup: $(date '+%Y-%m-%d %H:%M:%S')"

git push origin backendø

