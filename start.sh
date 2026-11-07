#!/usr/bin/env bash
# Start the Pravega frontend locally.
# Usage: ./start.sh
# Stop with Ctrl+C.

set -e

cd "$(dirname "$0")"

PORT="${PORT:-3000}"

echo "Starting Pravega on http://localhost:${PORT}"
echo "Press Ctrl+C to stop."

# next dev supports hot reload; trap ensures clean shutdown on Ctrl+C
trap 'echo; echo "Stopping..."; kill 0' INT TERM

./node_modules/.bin/next dev -p "${PORT}"

# If you prefer a production build, uncomment below and comment the line above:
# ./node_modules/.bin/next build && ./node_modules/.bin/next start -p "${PORT}"