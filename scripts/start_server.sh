#!/usr/bin/env bash
set -e

APP_DIR=/home/ec2-user/CS_VulnerableSiteProject
PROC_NAME=cs_vulnerablesiteproject

cd "$APP_DIR"

# 1) Remove any old PM2 processes with this name
pm2 delete "$PROC_NAME" || true

# 2) Start fresh under PM2
pm2 start app.js --name "$PROC_NAME"

# 3) Persist the new process list (optional)
pm2 save