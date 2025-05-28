#!/usr/bin/env bash
set -e

APP_DIR=/home/ec2-user/CS_VulnerableSiteProject
PROC_NAME=cs_vulnerablesiteproject

cd "$APP_DIR"

# 1) Delete _all_ old processes with that name (repeat until none left)
while pm2 delete "$PROC_NAME" &>/dev/null; do
  echo "Deleted an old $PROC_NAME process..."
done

# 2) Now start exactly one fresh process
pm2 start app.js --name "$PROC_NAME"

# 3) Persist for restart on reboot
pm2 save
