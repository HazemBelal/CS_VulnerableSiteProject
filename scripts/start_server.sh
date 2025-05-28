#!/usr/bin/env bash
set -e

APP_DIR=/home/ec2-user/CS_VulnerableSiteProject
PROC_NAME=cs_vulnerablesiteproject

cd "$APP_DIR"

# 1) Forcefully clean up PM2 state
echo "=== Resetting PM2 ==="
pm2 kill || true
sudo pkill -9 -f "node|PM2" || true  # Nuclear option for any leftovers
sleep 2  # Critical pause for process cleanup

# 2) Wipe PM2's internal state
rm -rf ~/.pm2
mkdir -p ~/.pm2
sleep 1

# 3) Start application with fresh PM2
echo "=== Starting Application ==="
pm2 start app.js --name "$PROC_NAME" --wait-ready
sleep 1  # Allow process stabilization

# 4) Configure persistence
echo "=== Configuring PM2 Startup ==="
pm2 save --force
pm2 startup | tail -1 | bash
pm2 save --force

# 5) Verification
echo "=== Verification ==="
pm2 ls
if ! pm2 ping >/dev/null 2>&1; then
  echo "!! PM2 Daemon Not Responding !!"
  exit 1
fi

if ! pm2 describe "$PROC_NAME" >/dev/null 2>&1; then
  echo "!! Application Process Not Found !!"
  exit 1
fi

echo "✅ PM2 Process Management Complete"