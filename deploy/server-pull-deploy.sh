#!/bin/bash
# Run on server: pulls latest code, builds, restarts
# Usage: bash /opt/genphoto/repo/deploy/server-pull-deploy.sh
set -e
cd /opt/genphoto/repo

echo "=== 1. Pull latest ==="
git pull origin main

echo "=== 2. Build backend ==="
./mvnw package -DskipTests -q

echo "=== 3. Build frontend ==="
cd genphoto-frontend
npm install
VITE_API_BASE="" npx vite build
cd ..

echo "=== 4. Deploy ==="
cp genphoto-web/target/genphoto-web-1.0.0-SNAPSHOT.jar /opt/genphoto/genphoto-web.jar
cp -r genphoto-frontend/dist/* /opt/genphoto/frontend/
cp deploy/nginx.conf /etc/nginx/sites-available/genphoto
nginx -t && systemctl reload nginx
systemctl restart genphoto

echo "=== Done! ==="
