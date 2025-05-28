#!/usr/bin/env bash
set -e

APP_DIR=/home/ec2-user/CS_VulnerableSiteProject
PROC_NAME=cs_vulnerablesiteproject

cd "$APP_DIR"

# 1) Wipe out every PM2 process, regardless of name
pm2 delete all || true

# 2) Start your app cleanly
pm2 start app.js --name "$PROC_NAME"

# 3) Persist the process list
pm2 save
