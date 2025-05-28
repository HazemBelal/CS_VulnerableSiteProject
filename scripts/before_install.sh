#!/bin/bash
set -e

APP_DIR=/home/ec2-user/CS_VulnerableSiteProject

# ensure the directory exists
sudo mkdir -p "$APP_DIR"

# remove all existing files (avoids permissions errors)
sudo rm -rf "$APP_DIR"/*

# reset ownership so ec2-user can write here
sudo chown -R ec2-user:ec2-user "$APP_DIR"