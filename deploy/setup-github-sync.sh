#!/bin/bash
# Run this script on the server as root:
#   curl or scp this file to server, then: bash setup-github-sync.sh
set -e

echo "=== 1. Install proxy (optional, for servers that cannot access GitHub) ==="
echo "If your server cannot access GitHub, configure a SOCKS5 proxy first."
echo "Then set git proxy:"
echo "  git config --global http.https://github.com.proxy socks5://127.0.0.1:10808"
echo ""

echo "=== 2. Install Node.js 20.x ==="
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
node -v

echo "=== 3. Ensure JDK 17 (for Maven build) ==="
if ! javac -version &>/dev/null 2>&1; then
  apt install -y openjdk-17-jdk-headless
fi
java -version

echo "=== 4. Clone repo ==="
REPO_URL=${GITHUB_REPO_URL:?请设置 GITHUB_REPO_URL 环境变量}
mkdir -p /opt/genphoto
if [ ! -d /opt/genphoto/repo ]; then
  git clone "$REPO_URL" /opt/genphoto/repo
else
  echo "Repo already exists, pulling latest..."
  cd /opt/genphoto/repo && git pull origin main
fi

echo "=== 5. First deploy ==="
bash /opt/genphoto/repo/deploy/server-pull-deploy.sh

echo ""
echo "========================================="
echo "  Setup complete!"
echo "========================================="
