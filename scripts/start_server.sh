#!/usr/bin/env bash
set -e

APP_DIR=/home/ec2-user/CS_VulnerableSiteProject
PROC_NAME=cs_vulnerablesiteproject

cd "$APP_DIR"

# 1) Clean up PM2 state
echo "=== Resetting PM2 ==="
pm2 kill || true
sudo pkill -9 -f "node|PM2" || true
sleep 2

# 2) Ensure proper ownership
sudo chown -R ec2-user:ec2-user ~/.pm2

# 3) Start application as ec2-user
echo "=== Starting Application ==="
sudo -u ec2-user pm2 start app.js --name "$PROC_NAME" --wait-ready
sleep 1

# 4) Configure persistence correctly
echo "=== Configuring PM2 Startup ==="
sudo -u ec2-user pm2 save --force
sudo -u ec2-user pm2 startup -u ec2-user --hp /home/ec2-user | tail -1 | bash
sudo -u ec2-user pm2 save --force

# 5) Verification
echo "=== Verification ==="
sudo -u ec2-user pm2 ls