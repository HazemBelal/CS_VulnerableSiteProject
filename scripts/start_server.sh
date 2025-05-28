# scripts/start_server.sh
#!/bin/bash
cd /home/ec2-user/CS_VulnerableSiteProject
npm install     # in case package.json changed
pm2 start app.js --name cs_vulnerablesiteproject
