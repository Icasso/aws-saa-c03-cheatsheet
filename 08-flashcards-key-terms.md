# Flashcards — Key Terms & Gotchas (SAA-C03)
*Flip mentally. Answer before reading the line under each.*

## IAM & Access
- **IAM User** — long-term identity with credentials; avoid for apps.
- **IAM Role** — temporary credentials via STS; use for EC2, Lambda, cross-account.
- **IAM Policy** — JSON document defining Allow/Deny; identity-based or resource-based.
- **Permission boundary** — max permissions a user/role can have (delegation guardrail).
- **SCP (Service Control Policy)** — Organizations-level guardrail; cannot grant permissions, only limit.
- **IAM Identity Center** — SSO for humans across AWS accounts + SaaS.
- **Federation (SAML/OIDC)** — external IdP → temporary AWS creds; no IAM users needed.
- **Cross-account role** — Account A assumes role in Account B via trust policy.
- **MFA** — required for root; strongly recommended for privileged users.
- **Least privilege** — grant only permissions needed for the task.

## VPC & Network Security
- **Security Group** — stateful; instance/ENI level; default deny inbound, allow outbound.
- **NACL** — stateless; subnet level; numbered rules; explicit allow AND deny.
- **Public subnet** — route table has 0.0.0.0/0 → Internet Gateway.
- **Private subnet** — no IGW route; use NAT Gateway for outbound internet.
- **NAT Gateway** — managed, per-AZ, HA; outbound only for private subnets.
- **Internet Gateway** — VPC ↔ public internet; one per VPC.
- **VPC Gateway Endpoint** — private route to S3/DynamoDB; no NAT charge; free.
- **VPC Interface Endpoint** — private ENI for other AWS services; per-hour + data charge.
- **PrivateLink** — private connectivity to a service (your own or third-party).
- **Transit Gateway** — hub connecting VPCs, VPN, DX; simplifies mesh.
- **Site-to-Site VPN** — IPsec over internet; quick to set up, variable latency.
- **Direct Connect** — dedicated private line; consistent latency; higher setup cost.
- **Bastion host** — jump box in public subnet for SSH/RDP to private instances.

## Encryption & Secrets
- **SSE-S3** — S3-managed keys; free; AWS manages rotation.
- **SSE-KMS** — KMS-managed keys; audit trail; per-request KMS charge.
- **SSE-C** — customer-provided keys; you manage rotation.
- **KMS** — managed encryption keys; shared multi-tenant HSM.
- **CloudHSM** — dedicated HSM; FIPS 140-2 Level 3; you manage keys entirely.
- **Secrets Manager** — store + **auto-rotate** secrets (DB passwords, API keys).
- **SSM Parameter Store** — config values; Standard (free) / Advanced (paid); manual rotation.
- **ACM** — free TLS certs for AWS-integrated services (ALB, CloudFront, API GW).

## Compute
- **On-Demand** — no commitment; highest $/hr; use for unpredictable/short workloads.
- **Reserved Instances** — 1 or 3 year commitment; up to ~72% off; specific instance family.
- **Savings Plans** — $/hr commitment; flexible across instance families, regions, OS.
- **Spot Instances** — up to 90% off; can be interrupted with 2-min notice; fault-tolerant workloads.
- **Dedicated Hosts** — physical server for compliance/licensing; most expensive.
- **Placement group — Cluster** — low latency, same AZ; risk: correlated failure.
- **Placement group — Spread** — max 7 instances per AZ; anti-correlation.
- **Placement group — Partition** — groups of instances in separate racks; large distributed systems.
- **Lambda** — 15 min max timeout; pay per invocation + duration; cold starts.
- **Fargate** — serverless containers; no EC2 management.

## Storage
- **S3 Standard** — 99.99% availability; frequent access.
- **S3 Standard-IA** — infrequent access; retrieval fee; 30-day minimum.
- **S3 One Zone-IA** — single AZ; cheaper; not for critical data.
- **S3 Glacier Instant Retrieval** — ms access; archive with occasional reads.
- **S3 Glacier Flexible Retrieval** — minutes to hours; cheaper archive.
- **S3 Glacier Deep Archive** — 12+ hours; cheapest storage.
- **S3 Intelligent-Tiering** — auto-moves between tiers; small monitoring fee.
- **EBS gp3** — general purpose SSD; baseline 3000 IOPS; most workloads.
- **EBS io2** — highest IOPS SSD; databases, latency-sensitive.
- **EBS st1** — throughput HDD; big data, logs, data warehouses.
- **EBS sc1** — cold HDD; infrequent access block storage.
- **EFS Standard** — low-latency shared file; **EFS IA** = infrequent access tier.

## Database
- **RDS Multi-AZ** — sync standby; automatic failover; same region; HA not read scaling.
- **RDS Read Replica** — async; read scaling; can promote to standalone; cross-region possible.
- **Aurora** — 6 copies across 3 AZs; auto storage scaling; up to 15 read replicas.
- **Aurora Serverless** — auto scale capacity; pay per ACU; intermittent workloads.
- **DynamoDB** — partition key (+ optional sort key); WCU/RCU or on-demand.
- **DynamoDB DAX** — in-memory cache; microsecond reads; cluster mode.
- **DynamoDB Global Tables** — multi-region active-active replication.
- **ElastiCache Redis** — persistence, replication, complex data structures.
- **ElastiCache Memcached** — simple, multi-threaded, no persistence.

## Messaging & Decoupling
- **SQS Standard** — at-least-once delivery; best-effort ordering; unlimited throughput.
- **SQS FIFO** — exactly-once; strict ordering; 300 msg/sec (3000 with batching).
- **SQS visibility timeout** — message hidden while consumer processes; extend if needed.
- **SQS DLQ** — dead letter queue for failed messages after max receives.
- **SNS** — pub/sub; fan-out to SQS, Lambda, HTTP, email, SMS.
- **SNS + SQS fan-out** — SNS topic → multiple SQS queues; decouple + scale.
- **EventBridge** — event bus; rules filter/route events; SaaS integrations; cron schedules.

## DNS & Routing
- **Route 53 Simple** — single record; no health check routing.
- **Route 53 Weighted** — split traffic by weight (blue/green, gradual rollout).
- **Route 53 Latency** — route to lowest-latency region.
- **Route 53 Failover** — active/passive with health checks.
- **Route 53 Geolocation** — route by user location (continent/country).
- **Route 53 Geoproximity** — route by geographic proximity with bias.
- **Route 53 Multi-value** — return multiple healthy records (simple load spread).

## DR & HA
- **RTO** — Recovery Time Objective: how fast you must be back.
- **RPO** — Recovery Point Objective: how much data loss is acceptable.
- **Backup & Restore** — cheapest DR; highest RTO/RPO (hours–days).
- **Pilot Light** — core services always on; scale up on disaster.
- **Warm Standby** — scaled-down full copy; moderate RTO/RPO.
- **Multi-Site Active-Active** — full capacity in multiple sites; lowest RTO/RPO; highest cost.

## Monitoring & Compliance
- **CloudWatch** — metrics, alarms, logs, dashboards.
- **CloudTrail** — API audit trail (who/when/what); management + data events.
- **Config** — resource configuration history + compliance rules.
- **Trusted Advisor** — best-practice checks (cost, security, performance, limits).
- **Cost Explorer** — visualize spending trends.
- **AWS Budgets** — spending alerts and automated actions.

## Test-day mindset
- **Compensatory scoring:** weak in one domain OK; pass overall at 720.
- **No negative marking.** Flag and move on. Never leave blank.
- **Multiple-response** — wrong extra picks can cost you; only select what you're sure of.
- Scenario questions ask "MOST appropriate" — match the **stated priority** (cost vs security vs performance).
