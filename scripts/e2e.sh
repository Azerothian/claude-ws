#!/usr/bin/env bash
set -euo pipefail

# Constants
APP_IMAGE="claude-ws-app-e2e"
TEST_IMAGE="claude-ws-e2e"
APP_CONTAINER="claude-ws-app-e2e"
NETWORK="claude-ws-e2e-net"
PORT=8556
HEALTH_TIMEOUT=60

TEST_CONTAINER="claude-ws-test-e2e"

cleanup() {
  echo "Cleaning up..."
  docker rm -f "$APP_CONTAINER" 2>/dev/null || true
  docker rm -f "$TEST_CONTAINER" 2>/dev/null || true
  docker network rm "$NETWORK" 2>/dev/null || true
}

trap cleanup EXIT

# Clean up any leftover containers from previous runs
cleanup 2>/dev/null

echo "==> Building app image..."
docker build -t "$APP_IMAGE" .

echo "==> Building test image..."
docker build -t "$TEST_IMAGE" -f Dockerfile.e2e .

echo "==> Creating network..."
docker network create "$NETWORK" 2>/dev/null || true

echo "==> Starting app container..."
docker run -d \
  --name "$APP_CONTAINER" \
  --network "$NETWORK" \
  -p "$PORT:$PORT" \
  "$APP_IMAGE"

echo "==> Waiting for app to be healthy (timeout: ${HEALTH_TIMEOUT}s)..."
elapsed=0
until curl -sf "http://localhost:${PORT}/api/projects" > /dev/null 2>&1; do
  if [ "$elapsed" -ge "$HEALTH_TIMEOUT" ]; then
    echo "ERROR: App did not become healthy within ${HEALTH_TIMEOUT}s"
    echo "==> App container logs:"
    docker logs "$APP_CONTAINER"
    exit 1
  fi
  sleep 2
  elapsed=$((elapsed + 2))
  echo "  Waiting... (${elapsed}s)"
done
echo "==> App is healthy!"

echo "==> Running e2e tests..."
# Use network=container to share app's network namespace so browser sees localhost
docker run -t \
  --name "$TEST_CONTAINER" \
  --network "container:${APP_CONTAINER}" \
  -e "BASE_URL=http://localhost:${PORT}" \
  "$TEST_IMAGE" || TEST_EXIT=$?

# Copy test results (screenshots) out of the container
mkdir -p test-results
docker cp "$TEST_CONTAINER:/tests/test-results" ./test-results 2>/dev/null || true
docker rm -f "$TEST_CONTAINER" 2>/dev/null || true

if [ "${TEST_EXIT:-0}" -ne 0 ]; then
  echo "==> Some tests failed (exit code: $TEST_EXIT)"
  exit "$TEST_EXIT"
fi

echo "==> All tests passed!"
