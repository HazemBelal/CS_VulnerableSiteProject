#!/usr/bin/env bash
set -e

APP_DIR=/home/ec2-user/CS_VulnerableSiteProject
PROC_NAME=cs_vulnerablesiteproject

cd "$APP_DIR"

# Try restarting; if that fails, start it fresh
pm2 restart "$PROC_NAME" || pm2 start app.js --name "$PROC_NAME"