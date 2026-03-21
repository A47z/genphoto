#!/bin/bash
# Local one-click deploy: push to GitHub + trigger server build
# Usage: bash deploy/deploy-via-git.sh
set -e
SERVER=${DEPLOY_SERVER:?请设置 DEPLOY_SERVER 环境变量}

echo "=== 1. Push to GitHub ==="
git push origin main

echo "=== 2. Deploy on server ==="
ssh root@$SERVER "bash /opt/genphoto/repo/deploy/server-pull-deploy.sh"

echo "=== Done! http://$SERVER ==="
