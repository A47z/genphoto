#!/bin/bash
# Local deploy script - run from project root on Windows (Git Bash)
# Usage: bash deploy/deploy.sh

set -e
SERVER=${DEPLOY_SERVER:?请设置 DEPLOY_SERVER 环境变量}

echo "=== 1. Build backend ==="
./mvnw.cmd package -DskipTests -q

echo "=== 2. Build frontend ==="
cd genphoto-frontend
VITE_API_BASE="" npm run build
cd ..

echo "=== 3. Upload to server ==="
scp genphoto-web/target/genphoto-web-1.0.0-SNAPSHOT.jar root@$SERVER:/opt/genphoto/genphoto-web.jar
scp deploy/nginx.conf root@$SERVER:/opt/genphoto/nginx.conf
scp deploy/genphoto.service root@$SERVER:/opt/genphoto/genphoto.service
scp deploy/setup-server.sh root@$SERVER:/opt/genphoto/setup-server.sh
scp -r genphoto-frontend/dist/* root@$SERVER:/opt/genphoto/frontend/

echo "=== 4. Restart backend ==="
ssh root@$SERVER "systemctl restart genphoto"

echo "=== Done! Access: http://$SERVER ==="
