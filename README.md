# 🚀 CyberShop AWS Deployment

> A sample Node.js/Express web application deployed on AWS with best practices for security, scalability, elasticity, and cost-efficiency.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)  
2. [Architecture Summary](#architecture-summary)  
3. [AWS Components & Services](#aws-components--services)  
4. [Prerequisites](#prerequisites)  
5. [Infrastructure Provisioning](#infrastructure-provisioning)  
6. [Networking & Security](#networking--security)  
7. [Application Deployment](#application-deployment)  
8. [CI/CD Pipeline](#cicd-pipeline)  
9. [High Availability & Auto Scaling](#high-availability--auto-scaling)  
10. [Monitoring & Alerting](#monitoring--alerting)  
11. [Cost Optimization](#cost-optimization)  
12. [How to Access](#how-to-access)  
13. [Further Improvements](#further-improvements)  

---

## 📝 Project Overview

**CyberShop** is a Node.js/Express web application deployed on AWS using best practices for security, scalability, elasticity, and cost-efficiency. This README documents:

- Core AWS infrastructure layout  
- Networking and security configuration  
- Deployment automation (CI/CD)  
- Monitoring, alerting, and auto-scaling setup  

---

## 🏗 Architecture Summary

```text
┌───────────────────────────────┐          ┌───────────────┐
│           VPC (10.0.0.0/16)      │       │   AWS Cloud   │
│ ┌─────────┐  ┌─────────────┐     │       │    Services   │
│ │ Pub-A   │  │ Pub-B       │     │       └───────────────┘
│ │(IGW,NAT)│  │(ALB)        │     │
│ └───┬─────┘  └───┬─────────┘     │                │
│     │            │               │                ↓
│ ┌───▼────────┐  ┌▼───────────┐   │         Users (HTTP)
│ │App-A (10.0. │  │App-B (10.0│   │               ↑
│ │.0.128/26)   │  │.0.192/26) │   │       ┌───────┴───────┐
│ │ Node.js EC2 │  │ (ASG-enabled) │      │ Application    │
│ └───┬────────┘  └────┬────────┘  │      │ Load Balancer  │
│     │                 │          │      └───────────────┘
│     │        ┌────────▼────────┐ │                │
│     │        │    Amazon RDS   │ │                │
│     │        │ (MySQL, private)│─┼────────────────┘
│     │        └─────────────────┘ │
│     │                            │
│     └────────────────────────────┘
```
### 🛠 AWS Components & Services

- **VPC & Subnets**  
  - Public-A: `10.0.0.0/26`  
  - Public-B: `10.0.0.64/26`  
  - Private App-A: `10.0.0.128/26`  
  - Private App-B: `10.0.0.192/26`  

- **Internet Gateway (IGW)** & **NAT Gateway**

- **Security Groups**  
  - **SG-App**: allow HTTP (80) from ALB, SSH (22) from SG-NAT  
  - **SG-DB**: allow MySQL (3306) from SG-App  
  - **SG-NAT**: allow SSH (22) from your admin IP  

- **EC2 Instances**  
  - Bastion/NAT host (in Public-A)  
  - App-A web server (in Private App-A)

- **Application Load Balancer (ALB)**

- **Amazon RDS (MySQL)** (in Private App-B)

- **IAM Roles** for EC2, CodeBuild, CodeDeploy

- **Systems Manager (SSM)** Agent for shellless access

- **Auto Scaling Group (ASG)** spanning App-A & App-B

- **CI/CD**: CodePipeline → CodeBuild → CodeDeploy

- **Monitoring & Alerting**: CloudWatch metrics & alarms

---

### ✅ Prerequisites

- AWS account & AWS CLI configured (`aws configure`)  
- SSH key pairs for Bastion & App servers  
- Local environment: Node.js & PM2 installed  

---

### 🏗 Infrastructure Provisioning

1. **VPC & Subnets**  
   - Create a `/16` VPC  
   - Add the four subnets listed above

2. **Internet & NAT**  
   - Attach an Internet Gateway (IGW)  
   - Launch a NAT Gateway in **Public-A**  
   - Route private subnets’ Internet traffic through the NAT

3. **Route Tables**  
   - Public RT → IGW  
   - Private RT → NAT

4. **Security Groups**  
   - Define **SG-App**, **SG-DB**, **SG-NAT** as above

5. **EC2 Instances**  
   - Launch a Bastion/NAT host in **Public-A**  
   - Launch the App-A web server in **Private App-A**

6. **RDS MySQL**  
   - Deploy into **Private App-B**, with **no public access**

---

### 🚀 Application Deployment

1. SSH into **App-A**, install Node.js & PM2  
2. Deploy your code and update `config.js` with the RDS endpoint  
3. Test, then **create an AMI** of App-A  
4. Launch a second instance in **Private App-B** from that AMI  

```bash
# on each EC2 instance:
pm2 delete all
pm2 start app.js --name cyber-shop
pm2 save
pm2 startup
```
## 🔄 CI/CD Pipeline

- **Source**: GitHub `Patched` branch (via AWS GitHub App)  
- **Build**: AWS CodeBuild  
  - Runtime: Node.js 20  
  - Commands:  
    ```bash
    npm ci
    npm test
    ```  
- **Deploy**: AWS CodeDeploy with lifecycle hooks

```yaml
# buildspec.yml
version: 0.2

runtime-versions:
  nodejs: 20

phases:
  install:
    commands:
      - npm ci
  build:
    commands:
      - npm test

artifacts:
  files:
    - '**/*'
```

## 📈 High Availability & Auto Scaling

**ASG** across App-A & App-B subnets: Min=1, Desired=1, Max=4

**Target** Tracking CPU 50% (warm-up 300s)

**Flow**: High load → ASG spins up new instance → ALB adds to target group → traffic evens out → CPU normalizes → ASG stabilizes.

## 🔍 Monitoring & Alerting

- **CloudWatch Metrics**  
  - EC2: `CPUUtilization`  
  - RDS: `FreeStorageSpace`  
  - ALB: `RequestCount`  

- **Alarms**  
  - **EC2-High-CPU**: CPU > 75% for 5 minutes → SNS notification  
  - **RDS-Low-Storage**: Free storage < 20% → SNS notification  

---

## 💰 Cost Optimization

- Use **t3.micro** for EC2 & RDS (free-tier eligible)  
- Evaluate **NAT Gateway** vs **NAT instance** based on traffic patterns  
- Configure ASG **min = 0** when idle to save costs  

---

## 👀 How to Access

- **Web UI**  
  ```text
  http://<ALB-DNS>.elb.amazonaws.com/
  ```

### SSH Access
**Bastion Host:**
```bash
ssh -i bastion-key.pem ec2-user@<Elastic-IP>
```

##AWS Systems Manager (SSM)
```bash
aws ssm start-session --target <instance-id>
```

---

## 🔧 Future Improvements

 - Enable HTTPS via ACM on ALB
 - Add RDS read-replicas for scaling





