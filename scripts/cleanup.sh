#!/bin/bash
# stop the old app (if needed)
pm2 stop cs_vulnerablesiteproject || true

# remove everything under your deploy folder
rm -rf /home/ec2-user/CS_VulnerableSiteProject/*

# re-create the directory to guard against missing parent dir
mkdir -p /home/ec2-user/CS_VulnerableSiteProject
