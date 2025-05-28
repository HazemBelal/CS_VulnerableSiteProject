#!/usr/bin/env bash
set -e

APP_DIR=/home/ec2-user/CS_VulnerableSiteProject
PROC_NAME=cs_vulnerablesiteproject

cd "$APP_DIR"

# 1) Stop and delete ALL PM2 processes (forcefully)
pm2 kill || true       # Kills the PM2 daemon (ensures clean slate)
sleep 2                # Wait for processes to terminate

# 2) Start your app
pm2 start app.js --name "$PROC_NAME"

# 3) Save the process list and ensure it runs on startup
pm2 save
pm2 startup && pm2 save  # Ensures PM2 survives server reboots