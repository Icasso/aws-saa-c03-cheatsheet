# Domain 2 — Design Resilient Architectures (26% of scored exam)

> **Reliability pillar** of Well-Architected: recover from failures, meet demand, mitigate disruption. Domain 2 = **decouple + scale + survive failure**. Expect scenario Qs: "spike traffic," "AZ down," "DR with RTO/RPO," "which queue/routing policy?"

---

## T2.1 — Design scalable and loosely coupled architectures

### Core design principles
- **Loose coupling** — components interact through stable interfaces (queues, events, APIs), not direct tight dependencies. One failure doesn't cascade.
- **Elasticity** — scale **out/in** (add/remove instances) automatically to match demand. **Scalability** = handle growth; **elasticity** = handle *variable* load.
- **Stateless tiers** — push session/state to ElastiCache, DynamoDB, or client; web/app tier can scale horizontally behind a load balancer.
- **Async where possible** — buffer bursts with **SQS**; fan-out with **SNS**; event-driven with **EventBridge**.

### Decoupling patterns (memorize)
| Pattern | How | When |
|---|---|---|
| **Queue-based** | Producer → **SQS** → Consumer | Smooth spikes; workers process at their pace; retries via visibility timeout |
| **Pub/Sub fan-out** | Publisher → **SNS topic** → many subscribers (SQS, Lambda, HTTP, email) | One event, many consumers; decouple publisher from subscribers |
| **Event bus** | **EventBridge** rules route events to targets | App integration, SaaS events (Stripe, Zendesk), scheduled rules, cross-account |
| **Stream processing** | **Kinesis Data Streams** / **Kinesis Data Firehose** | Real-time ordered streams; analytics pipeline |
| **API façade** | **API Gateway** in front of Lambda/ECS/HTTP | Throttling, auth, versioning, caching; clients don't call backends directly |
| **Database decoupling** | Read replicas, DynamoDB DAX, caching layer | Offload reads; don't hammer primary DB |
| **S3 event notifications** | S3 → SNS/SQS/Lambda/EventBridge | Async post-upload processing |

### Messaging & integration services
| Service | Model | Key facts |
|---|---|---|
| **SQS Standard** | Queue | **At-least-once** delivery; **best-effort ordering**; nearly unlimited throughput; duplicate messages possible |
| **SQS FIFO** | Queue | **Exactly-once** processing; **strict ordering** per message group; 300 msg/s (3,000 with batching) |
| **SNS Standard** | Pub/Sub | **At-least-once**; fan-out to many endpoints; no ordering guarantee |
| **SNS FIFO** | Pub/Sub | Ordered + deduplicated; pairs with SQS FIFO for fan-out |
| **EventBridge** | Event bus | Schema registry; content-based filtering; **default + custom buses**; archive & replay |
| **API Gateway** | REST / HTTP / WebSocket | Throttling, API keys, Cognito/IAM auth, caching, request validation, stage variables |
| **Step Functions** | Orchestration | **Standard** (long-running, exactly-once, auditable) vs **Express** (high-volume, short, at-least-once) |
| **AppSync** | GraphQL | Real-time subscriptions; offline sync |

**SQS deep dive (exam favorites):**
- **Visibility timeout** — message hidden while consumer processes; if not deleted before timeout → re-delivered (another consumer may pick it up).
- **Dead-letter queue (DLQ)** — after **maxReceiveCount** failures, message moves to DLQ for inspection.
- **Long polling** (`WaitTimeSeconds` up to 20) — reduces empty receives, lowers cost vs short polling.
- **Delay queue** — postpone delivery up to 15 minutes.
- **SNS → SQS fan-out** — subscribe SQS queues to SNS topic; **SQS queue policy** must allow SNS to send.

**EventBridge vs SNS vs SQS:**
- **SQS** = pull-based, one consumer group per queue, buffer between services.
- **SNS** = push-based pub/sub, immediate fan-out.
- **EventBridge** = event router with **rules + pattern matching**, many AWS/SaaS sources, scheduled cron.

### Serverless & microservices
| Building block | Role |
|---|---|
| **Lambda** | Event-driven compute; scales automatically; pay per invocation; 15 min max timeout |
| **API Gateway + Lambda** | Serverless REST/HTTP APIs |
| **DynamoDB** | Serverless NoSQL; on-demand or provisioned capacity; global tables for multi-region |
| **Fargate / App Runner** | Serverless containers (no EC2 to manage) |
| **Step Functions** | Coordinate Lambda/ECS/Batch into workflows; error handling, retries, parallel branches |

**Microservices on AWS:** ECS/EKS for containers, **ALB** routes to services, **Service Discovery (Cloud Map)**, each service owns its data store, communicate via **async (SQS/EventBridge)** or **sync (API Gateway/ALB)**. Prefer async for resilience.

### Load balancing & auto scaling
| Load balancer | Layer | Use case |
|---|---|---|
| **ALB** | L7 HTTP/HTTPS | Path/host/header routing; WebSocket; Lambda targets; **best for web apps & microservices** |
| **NLB** | L4 TCP/UDP/TLS | Ultra-low latency; static IP; millions RPS; **preserve source IP** |
| **GLB (Gateway LB)** | L3/L4 | Inline third-party virtual appliances (firewalls, IDS) |
| **CLB (Classic)** | L4/L7 | Legacy — avoid on new designs |

**Target groups:** EC2, IP, Lambda, ALB (chaining). **Health checks** at TG level — unhealthy targets removed from rotation.

**Auto Scaling Groups (ASG):**
- Launch template defines AMI, instance type, SG, user data.
- Spread across **multiple AZs** (subnets) for HA.
- Scaling policies: **target tracking** (e.g., avg CPU 50%), **step scaling**, **scheduled scaling**, **predictive scaling**.
- **ELB health checks** — instance marked unhealthy → ASG terminates & replaces (if configured).
- **Cooldown / default cooldown** — prevent thrashing after scale action.
- Combine **ALB + ASG** = classic resilient web tier.

### CloudWatch for resilience
- **Alarms** — trigger on metric thresholds → **SNS notification**, **Auto Scaling policy**, **EC2 action**, **Systems Manager**.
- Key metrics: **CPUUtilization**, **HealthyHostCount** (ALB), **ApproximateNumberOfMessagesVisible** (SQS), **ConsumedReadCapacityUnits** (DynamoDB).
- **Composite alarms** — AND/OR of multiple alarms.
- **Anomaly detection** — ML-based thresholds.
- **Logs + Metric Filters** — turn log patterns into custom metrics → alarm.

### Elasticity checklist (scenario answers)
1. **Unpredictable traffic spike** → ASG + ALB; buffer with SQS; consider API Gateway throttling.
2. **Batch jobs lagging at peak** → SQS queue + auto-scaled worker fleet (scale on queue depth metric).
3. **Monolith can't scale one component** → extract to microservice + own ASG/Lambda + queue.
4. **Scheduled peak (Black Friday)** → scheduled scaling + predictive scaling + load test.
5. **Global users, low latency** → multi-region (Domain 2.2) + CloudFront (Domain 3).

---

## T2.2 — Design highly available and/or fault-tolerant architectures

### HA vs fault tolerance vs DR
| Term | Meaning |
|---|---|
| **High Availability (HA)** | Minimize **downtime** via redundancy (usually Multi-AZ). Goal: survive component failure quickly. |
| **Fault tolerance** | System continues operating **even if components fail** (often higher cost — redundant everything). |
| **Disaster Recovery (DR)** | Recover after **region-wide or large-scale** failure. Driven by **RTO** and **RPO**. |

### RTO vs RPO (always on the exam)
| Metric | Definition | Question asks |
|---|---|---|
| **RPO** (Recovery Point Objective) | Max **acceptable data loss** (time between last backup and failure) | "How much data can we lose?" → drives backup/replication frequency |
| **RTO** (Recovery Time Objective) | Max **acceptable downtime** before service restored | "How fast must we be back?" → drives architecture complexity & cost |

**Lower RTO/RPO = more expensive.** Match DR strategy to business requirements.

### DR strategy comparison (memorize this table)
| Strategy | Description | RTO | RPO | Cost | Failover |
|---|---|---|---|---|---|
| **Backup & Restore** | Periodic backups to S3/Glacier; restore infra on failure | **Hours–days** | **Hours** (last backup) | **Lowest** | Manual restore in DR region |
| **Pilot Light** | Minimal core running in DR (DB replica, AMIs); scale up on disaster | **Hours** | **Minutes–hours** | Low–medium | Start/stop DR resources |
| **Warm Standby** | Scaled-down but **functional** full stack in DR; scale to production | **Minutes** | **Minutes** | Medium–high | Route traffic + scale up |
| **Multi-Site Active-Active** | Full production in **multiple regions** simultaneously | **Near zero** | **Near zero** | **Highest** | Route 53 shifts or both serve traffic |

**AWS DR building blocks:**
- **Backups:** EBS snapshots, RDS automated backups, S3 versioning, **AWS Backup** (centralized policies across EC2, EBS, RDS, DynamoDB, EFS, etc.)
- **Replication:** RDS/Aurora cross-region read replica, S3 CRR, DynamoDB global tables
- **Infrastructure as code:** CloudFormation/Terraform to rebuild quickly
- **Data migration/sync:** **AWS DMS** (ongoing replication), **AWS SMS** (deprecated → use MGN)

### Multi-AZ vs Multi-Region
| | **Multi-AZ** | **Multi-Region** |
|---|---|---|
| **Scope** | Same region, different AZs | Different AWS regions |
| **Latency** | Low (same region) | Higher (cross-region) |
| **Use** | **HA** — survive AZ failure | **DR + global presence** — survive region failure |
| **Failover** | Often automatic (RDS Multi-AZ, ELB cross-AZ) | Usually manual or Route 53–driven |
| **Data sync** | Synchronous (RDS Multi-AZ) or shared (EFS) | Asynchronous replication (CRR, cross-region replicas) |

### Route 53 routing policies (with health checks)
| Policy | Behavior | Health checks? | Typical use |
|---|---|---|---|
| **Simple** | Route all traffic to one resource | Optional (all-or-nothing if associated) | Single resource |
| **Weighted** | Split traffic by **weight** (0 = stop) | Yes — unhealthy records excluded | A/B test; gradual migration |
| **Latency** | Route to **lowest-latency** region for user | Yes | Global active-passive or active-active |
| **Failover** | **Primary** + **Secondary**; failover on health check failure | **Required** (primary + secondary) | DR passive standby |
| **Geolocation** | Route by **user location** (continent/country/state) | Yes | Content localization; compliance |
| **Geoproximity** | Route by **geographic proximity** to resources; bias to shift traffic | Yes (with traffic flow) | DR traffic shifting; requires Route 53 Traffic Flow |
| **Multi-value** | Return **multiple healthy** IP addresses (client picks) | Yes — up to 8 healthy records | Simple HA (not a substitute for ELB) |
| **IP-based** | Route based on **client IP CIDR** | — | Targeted routing for known IP ranges |

**Health checks:** HTTP/HTTPS/TCP; **calculated health checks** combine multiple checks; **CloudWatch alarm health checks** for custom metrics. **Failover routing** = classic DR pattern (primary in us-east-1, secondary in eu-west-1).

### Database resilience: RDS & Aurora
| Feature | **Multi-AZ (RDS/Aurora)** | **Read Replica** |
|---|---|---|
| **Purpose** | **High availability** — automatic failover | **Read scaling** + optional **DR** |
| **Replication** | **Synchronous** (standby in another AZ) | **Asynchronous** |
| **Failover** | **Automatic** (DNS change, ~60–120 s) | **Manual** promote to standalone |
| **Cross-region** | No (same region only) | Yes — cross-region read replicas |
| **Read traffic** | Standby **not** readable (RDS); Aurora readers in cluster | Yes — offload reads |
| **Use in DR** | HA within region | Promote replica or use as DR read source |

**Aurora specifics:**
- **Aurora cluster** — shared storage volume, up to 15 read replicas, **fast failover** (~30 s).
- **Aurora Global Database** — 1 primary region + up to 5 secondary read regions; **< 1 s replication lag**; **managed cross-region failover** (RTO ~minutes).
- **Aurora Multi-AZ** — 6 copies across 3 AZs in storage layer.

**Exam trap:** "Need HA for production DB" → **Multi-AZ**, not read replica. "Need read scaling" → **read replicas**. "Need DR in another region with minimal RPO" → **cross-region replica** or **Aurora Global Database**.

### S3 resilience
- **Durability:** 11 nines; objects spread across ≥ 3 AZs automatically.
- **Versioning** — protect against accidental delete/overwrite; combine with **MFA Delete** for extra protection.
- **Cross-Region Replication (CRR)** — async replicate to DR bucket; **requires versioning on both buckets**.
- **Same-Region Replication (SRR)** — compliance, aggregate logs, ownership transfer.
- **S3 Lifecycle** — transition to IA/Glacier for cost; doesn't replace DR strategy.
- **S3 Object Lock** — WORM compliance; legal hold / governance mode.

### Compute & platform HA patterns
| Service | HA pattern |
|---|---|
| **EC2 + ASG** | Instances across **≥ 2 AZs**; ALB distributes; ASG replaces unhealthy |
| **Elastic Beanstalk** | Managed platform; **Multi-AZ** deployment; rolling/rolling-with-additional-batch/immutable deployments; integrates ALB + ASG |
| **ECS/EKS** | Tasks/pods across AZs; ALB/NLB service discovery |
| **Lambda** | Built-in Multi-AZ; no config needed |
| **EBS** | Volume tied to **one AZ**; snapshot to S3 for backup/DR; **restore snapshot to any AZ in region** |

**EBS snapshots:** Incremental, stored in S3; **crash-consistent** by default; **create AMI from snapshot** for fast DR instance launch.

### AWS Backup
- **Centralized** backup policies across accounts (Organizations) and regions.
- Supports: EC2, EBS, RDS, Aurora, DynamoDB, EFS, FSx, Storage Gateway, etc.
- **Backup vault** — encrypt with KMS; **legal hold** & **vault lock** for compliance.
- **Cross-region backup copy** for DR.
- Lifecycle to cold storage; **on-demand** or **scheduled** backups.

### AWS DMS (Database Migration Service)
- **Homogeneous** (Oracle→Oracle) or **heterogeneous** (Oracle→Aurora PostgreSQL) migration.
- **Full load + CDC** (Change Data Capture) — ongoing replication with minimal downtime cutover.
- Source/target: RDS, Aurora, EC2, on-prem; **S3 as target** for analytics.
- **Use in DR context:** continuous replication to DR database; not a replacement for backups.
- Requires **replication instance**; monitor **CDCLatency**.

---

## Confusion pairs (Domain 2 traps)

| A | B | Remember |
|---|---|---|
| **SQS Standard** | **SQS FIFO** | Standard = at-least-once, high throughput. FIFO = exactly-once + ordering (lower throughput). |
| **SNS** | **SQS** | SNS = push fan-out. SQS = pull queue, one consumer group processes each message. |
| **SNS** | **EventBridge** | SNS = simple pub/sub. EventBridge = content-filtered routing, schedules, SaaS integration. |
| **Multi-AZ RDS** | **Read replica** | Multi-AZ = HA/sync failover. Replica = async reads + optional DR promotion. |
| **Multi-AZ** | **Multi-Region** | Multi-AZ = AZ failure. Multi-Region = region failure / global users. |
| **RTO** | **RPO** | RTO = downtime tolerance. RPO = data loss tolerance. |
| **ALB** | **NLB** | ALB = L7, path routing. NLB = L4, static IP, extreme performance. |
| **Step Functions Standard** | **Express** | Standard = durable, long, exactly-once. Express = short, high-volume, cheaper, at-least-once. |
| **Active-Passive DR** | **Active-Active** | Passive = warm/pilot light + failover routing. Active-active = both regions serve traffic. |
| **S3 CRR** | **S3 versioning** | Versioning = protect in one bucket. CRR = copy to another **region** (needs versioning). |
| **CloudWatch alarm** | **ELB health check** | Alarm = metric threshold action. TG health check = remove bad targets from LB. |
| **Elasticity** | **Scalability** | Scalability = grow to meet demand. Elasticity = shrink/grow dynamically with load. |
| **AWS Backup** | **EBS snapshot** | Backup = policy-driven, multi-service, cross-account. Snapshot = single EBS volume point-in-time. |
| **Pilot light** | **Warm standby** | Pilot = core only (DB). Warm = full stack at reduced capacity. |
| **Route 53 Failover** | **Route 53 Weighted** | Failover = primary/secondary DR. Weighted = proportional split (can do blue/green). |
| **DMS** | **SMS/MGN** | DMS = database replication. **MGN (Application Migration Service)** = server migration/replication. |

---

## Scenario decision tree (quick mental model)

```
Need to decouple / buffer?     → SQS
Need fan-out to many?          → SNS (→ SQS for per-consumer queues)
Need event routing / schedules? → EventBridge
Need HA in one region?         → Multi-AZ + ASG across AZs + ALB
Need survive region failure?   → Multi-Region + Route 53 Failover/Latency + replication
How much data loss OK?         → RPO → backup frequency / sync vs async replication
How fast must recover?         → RTO → backup-restore vs pilot vs warm vs active-active
Read-heavy DB?                 → Read replicas (same or cross-region)
Write HA DB?                   → Multi-AZ (RDS/Aurora)
```

---

## Domain 2 quick-fire Qs (self-check)

1. **Q:** Web tier must survive AZ failure with auto-healing → **ALB + ASG spanning ≥ 2 AZs** (health checks replace unhealthy instances).
2. **Q:** Order-sensitive financial transactions between microservices → **SQS FIFO** (or SNS FIFO + SQS FIFO).
3. **Q:** One S3 upload triggers thumbnail, virus scan, and metadata indexing → **S3 event → SNS fan-out** or **EventBridge** to multiple Lambdas.
4. **Q:** RPO = 5 minutes, RTO = 1 hour, limited budget → **Warm standby** or **pilot light + cross-region RDS replica** (not backup-restore alone).
5. **Q:** RPO/RTO near zero, global users → **Multi-site active-active** + **Route 53 Latency routing** + **DynamoDB global tables** or **Aurora Global Database**.
6. **Q:** Primary region unhealthy; secondary should take over automatically → **Route 53 Failover routing** with health checks on primary.
7. **Q:** Gradually shift 10% traffic to new version → **Route 53 Weighted routing** (adjust weights over time).
8. **Q:** Production RDS must auto-failover on AZ outage; no read scaling yet → **RDS Multi-AZ** (not read replica).
9. **Q:** Analytics queries slowing production OLTP database → **Read replica(s)** for read traffic.
10. **Q:** Messages failing repeatedly after 3 attempts → configure **DLQ** with **maxReceiveCount = 3** on source queue.
11. **Q:** Long-running workflow with human approval step → **Step Functions Standard** (not Express).
12. **Q:** Centralized backup policy for RDS + EBS across accounts → **AWS Backup** with organization policies.
13. **Q:** Migrate on-prem Oracle to Aurora PostgreSQL with minimal downtime → **AWS DMS** (full load + CDC).
14. **Q:** Protect S3 objects from accidental deletion; compliance needs point-in-time recovery → **S3 Versioning** (+ MFA Delete if required).
15. **Q:** DR bucket in eu-west-1 mirrors us-east-1 production bucket → **S3 Cross-Region Replication** (versioning enabled both sides).
16. **Q:** Scale workers based on backlog, not CPU → **CloudWatch alarm on `ApproximateNumberOfMessagesVisible`** → ASG step scaling policy.
17. **Q:** API must throttle abusive clients and cache GET responses → **API Gateway** usage plans + caching.
18. **Q:** Deploy new app version with zero downtime on Elastic Beanstalk → **Rolling** or **Immutable** deployment policy with ALB.
19. **Q:** EBS volume corruption; restore to different AZ → **Restore from EBS snapshot** (snapshots are regional).
20. **Q:** EventBridge vs SNS for filtering "order.status = SHIPPED" only → **EventBridge** (content-based filtering).

---

*Aligned to SAA-C03 Domain 2: Design Resilient Architectures (26%). Cross-check service limits and pricing on AWS docs before exam day.*
