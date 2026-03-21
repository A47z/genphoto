#!/bin/bash
# GenPhoto server setup script for Debian
# Run as root on your server

set -e

echo "=== 1. Install Java 17 + Nginx ==="
apt update
apt install -y openjdk-17-jre-headless nginx

echo "=== 2. Create directories ==="
mkdir -p /opt/genphoto/frontend

echo "=== 3. Copy Nginx config ==="
cp /opt/genphoto/nginx.conf /etc/nginx/sites-available/genphoto
ln -sf /etc/nginx/sites-available/genphoto /etc/nginx/sites-enabled/genphoto
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "=== 4. Setup systemd service ==="
cp /opt/genphoto/genphoto.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable genphoto
systemctl start genphoto

echo "=== Done! ==="
echo "Backend: systemctl status genphoto"
echo "Nginx:   systemctl status nginx"
echo "Access:  http://your-server-ip"
