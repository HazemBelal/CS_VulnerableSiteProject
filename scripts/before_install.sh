#!/bin/bash
set -e

# remove the old app directory to avoid file-conflicts
rm -rf /home/ec2-user/CS_VulnerableSiteProject
mkdir -p /home/ec2-user/CS_VulnerableSiteProject
chown ec2-user:ec2-user /home/ec2-user/CS_VulnerableSiteProject
