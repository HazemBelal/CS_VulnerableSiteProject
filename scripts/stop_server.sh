# scripts/stop_server.sh
#!/bin/bash
cd /home/ec2-user/CS_VulnerableSiteProject
pm2 stop cs_vulnerablesiteproject || true
