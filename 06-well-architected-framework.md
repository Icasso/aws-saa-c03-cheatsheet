# AWS Well-Architected Framework — 6 Pillars
*The SAA-C03 exam is explicitly based on this framework. Know the pillar names and what each one optimizes for.*

## The 6 Pillars

| Pillar | Optimizes for | Key design questions |
|---|---|---|
| **Operational Excellence** | Run and monitor systems; continuously improve | Automate changes, runbooks, observability, evolve operations |
| **Security** | Protect information and systems | IAM least privilege, encryption, detective controls, incident response |
| **Reliability** | Recover from failures; meet demand | Multi-AZ, auto healing, change management, DR, quotas |
| **Performance Efficiency** | Use resources efficiently | Right-size, serverless, global reach, experiment, mechanical sympathy |
| **Cost Optimization** | Avoid unnecessary cost | Right-size, consumption models, analyze spend, optimize over time |
| **Sustainability** | Minimize environmental impact | Right-size, efficient resources, managed services, reduce waste |

## Design Principles (cross-pillar)

### Operational Excellence
- **Perform operations as code** — CloudFormation, CDK, Terraform.
- **Annotate documentation** — runbooks, playbooks, architecture diagrams.
- **Make frequent, small, reversible changes** — CI/CD, blue/green, canary.
- **Refine operations procedures frequently** — learn from incidents.
- **Anticipate failure** — game days, chaos engineering.
- **Learn from all operational events** — postmortems, blameless culture.

### Security
- **Implement a strong identity foundation** — IAM roles, MFA, least privilege, no long-lived keys.
- **Enable traceability** — CloudTrail, Config, centralized logging.
- **Apply security at all layers** — defense in depth (network, host, app, data).
- **Automate security best practices** — Config rules, Security Hub, automated remediation.
- **Protect data in transit and at rest** — TLS, KMS encryption.
- **Keep people away from data** — minimize direct access; use roles and automation.
- **Prepare for security events** — incident response plan, GuardDuty, Security Hub.

### Reliability
- **Automatically recover from failure** — health checks, Auto Scaling, Multi-AZ.
- **Test recovery procedures** — DR drills, backup restore tests.
- **Scale horizontally** — add more smaller resources, not bigger single resources.
- **Stop guessing capacity** — auto scaling, serverless, managed services.
- **Manage change through automation** — IaC, CI/CD pipelines.
- **Use fault isolation** — separate environments, blast radius containment.

### Performance Efficiency
- **Democratize advanced technologies** — use managed services (RDS, DynamoDB, Lambda).
- **Go global in minutes** — CloudFront, Global Accelerator, multi-region.
- **Use serverless architectures** — Lambda, API Gateway, DynamoDB on-demand.
- **Experiment more often** — try instance types, storage classes, architectures.
- **Consider mechanical sympathy** — match technology to access patterns (S3 for objects, EBS for block).
- **Optimize over time** — CloudWatch metrics, right-sizing recommendations.

### Cost Optimization
- **Implement cloud financial management** — Cost Explorer, Budgets, tagging.
- **Adopt a consumption model** — pay only for what you use; Spot, serverless.
- **Measure overall efficiency** — cost per transaction, unit economics.
- **Stop spending on undifferentiated heavy lifting** — managed services over self-hosted.
- **Analyze and attribute expenditure** — tags, cost allocation, CUR.
- **Use managed services** — reduce operational cost of running infrastructure.

### Sustainability
- **Understand your impact** — measure carbon footprint (Customer Carbon Footprint Tool).
- **Establish sustainability goals** — set targets, track progress.
- **Maximize utilization** — right-size, consolidate, auto scale down.
- **Anticipate and adopt new hardware** — Graviton (ARM) for better performance/watt.
- **Use managed services** — shared multi-tenant infra is more efficient.
- **Reduce downstream impact** — efficient data transfer, edge caching (CloudFront).

## Pillar → Service Quick Map

| Need | Pillar | Service |
|---|---|---|
| Encrypt data | Security | KMS, ACM, S3 SSE |
| Audit API calls | Security / Ops | CloudTrail |
| Detect threats | Security | GuardDuty, Security Hub |
| Multi-AZ failover | Reliability | RDS Multi-AZ, ASG across AZs |
| Auto scale | Reliability / Performance | Auto Scaling, Lambda |
| DR across regions | Reliability | S3 CRR, Route 53 failover, Aurora Global |
| CDN edge cache | Performance / Cost | CloudFront |
| Right-size instances | Cost / Performance | Cost Explorer, Compute Optimizer |
| Spot for batch | Cost | EC2 Spot |
| Tag resources for billing | Cost | Cost Allocation Tags, Budgets |

## Exam traps involving Well-Architected
- "Most cost-effective **without sacrificing availability**" → don't pick Spot-only or single-AZ.
- "Most secure **with least operational overhead**" → managed service (GuardDuty, WAF, Secrets Manager) over self-built.
- "Improve reliability **and** reduce cost" → auto scaling (scale in when idle) + right-sizing.
- "Sustainability" on the exam → right-size, Graviton, managed services, delete unused resources.
- Every answer should map to at least one pillar — if two options both work, pick the one that best matches the **stated priority** in the question stem.

---

## Per-Pillar Review Questions (can you answer these?)

### Operational Excellence
1. How do you automate infrastructure changes? → **CloudFormation/CDK/IaC**
2. How do you monitor application health? → **CloudWatch alarms, dashboards, X-Ray**
3. How do you run operations as code? → **SSM Automation, Lambda, Step Functions**
4. How do you learn from failures? → **Postmortems, blameless culture, runbooks**
5. How do you make frequent, small changes? → **CI/CD (CodePipeline), blue/green deploys**

### Security
1. How do you enforce least privilege? → **IAM roles, permission boundaries, SCPs**
2. How do you encrypt data? → **KMS, ACM, S3 SSE, TLS in transit**
3. How do you detect threats? → **GuardDuty, Security Hub, Macie**
4. How do you audit access? → **CloudTrail, IAM Access Analyzer**
5. How do you protect the network? → **VPC, SGs, NACLs, WAF, Network Firewall**

### Reliability
1. How do you survive AZ failure? → **Multi-AZ, ASG across AZs**
2. How do you survive region failure? → **Multi-region, Route 53 failover, S3 CRR**
3. How do you auto-recover? → **ASG health checks, RDS Multi-AZ failover**
4. How do you test recovery? → **DR drills, backup restore tests, chaos engineering**
5. How do you handle traffic spikes? → **Auto Scaling, SQS buffering, CloudFront**

### Performance Efficiency
1. How do you right-size? → **Compute Optimizer, CloudWatch metrics**
2. How do you go global? → **CloudFront, Global Accelerator, multi-region**
3. How do you use serverless? → **Lambda, DynamoDB on-demand, Fargate**
4. How do you cache? → **CloudFront, ElastiCache, DAX, API Gateway caching**
5. How do you match tech to workload? → **S3 for objects, EBS for block, EFS for shared files**

### Cost Optimization
1. How do you reduce compute cost? → **RI/Savings Plans, Spot, Graviton, right-sizing**
2. How do you reduce storage cost? → **S3 lifecycle, IA, Glacier, Intelligent-Tiering**
3. How do you monitor spend? → **Cost Explorer, Budgets, Anomaly Detection**
4. How do you attribute costs? → **Cost allocation tags, CUR**
5. How do you avoid waste? → **Trusted Advisor, delete unused resources, stop dev instances**

### Sustainability
1. How do you reduce environmental impact? → **Right-size, Graviton (ARM), managed services**
2. How do you maximize utilization? → **Auto Scaling (scale in), consolidate workloads**
3. How do you measure impact? → **Customer Carbon Footprint Tool**

---

## Common Exam Traps by Pillar

| Pillar | Trap | Correct thinking |
|---|---|---|
| Security | Pick most restrictive even if it breaks functionality | Balance security with requirements stated in stem |
| Reliability | Pick most expensive HA option when stem says "cost-effective" | Match HA level to stated RTO/RPO |
| Performance | Over-provision "just to be safe" | Right-size; use auto scaling |
| Cost | Pick cheapest even if it sacrifices stated requirement | Cheapest that meets ALL requirements |
| Ops | Pick manual process when automation exists | Automate everything possible |

---

## Sustainability Deep Dive (increasingly tested)
- **Graviton processors** (ARM) = up to 40% better performance per watt.
- **Managed services** = higher utilization of shared infrastructure = less waste.
- **Auto Scaling** = scale in during low demand = less idle resources.
- **S3 Intelligent-Tiering** = automatic optimization = less wasted storage.
- **Delete unused resources** = snapshots, EIPs, old AMIs, detached EBS.
- **Spot Instances** = use spare capacity = more efficient data center utilization.
- **Serverless** = no idle compute = pay only for actual usage.
