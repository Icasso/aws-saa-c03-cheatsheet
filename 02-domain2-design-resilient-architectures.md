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

---

## Route 53 Deep Dive

### All routing policies with exam scenarios
| Policy | How it works | Exam scenario |
|---|---|---|
| **Simple** | One record, one value; no health check routing | Single resource, no failover needed |
| **Weighted** | Split traffic by weight (0–255); sum doesn't need to equal 100 | Blue/green deployment (90/10), A/B testing |
| **Latency** | Route to region with lowest latency for user | Global app, users worldwide |
| **Failover** | Active (primary) + Passive (secondary) with health checks | DR: primary in us-east-1, standby in us-west-2 |
| **Geolocation** | Route by user's geographic location (continent/country) | Content licensing by region, GDPR data residency |
| **Geoproximity** | Route by geographic proximity with **bias** (+/-) | Shift traffic toward one region (e.g., bias +50 toward us-east-1) |
| **Multi-value** | Return multiple healthy records (up to 8) | Simple load spread with health checks (not a true LB) |

### Health check types
| Type | Checks | Use case |
|---|---|---|
| **Endpoint** | HTTP/HTTPS/TCP to IP or domain | Is my web server alive? |
| **Calculated** | Combines multiple child health checks (AND/OR) | Complex failover logic |
| **CloudWatch alarm** | Based on CW metric threshold | Failover when CPU > 90% |

### Alias records vs CNAME
| | **Alias** | **CNAME** |
|---|---|---|
| Target | AWS resources (ALB, CloudFront, S3 website, API GW) | Any DNS name |
| Apex/root domain | **Yes** (zone apex) | **No** (can't CNAME apex) |
| Cost | Free (no query charge for alias to AWS resource) | Standard query charge |
| **Exam tip** | Always use Alias for AWS resources | Use CNAME for non-AWS targets |

### Private hosted zones
- DNS resolution **within VPC** only (associate VPC with hosted zone).
- **Split-horizon DNS:** same domain resolves differently inside VPC vs public internet.
- **Route 53 Resolver:** hybrid DNS — forward queries between on-prem and AWS.

---

## DR Strategy Master Table

| Strategy | RTO | RPO | Cost | How it works | Key services |
|---|---|---|---|---|---|
| **Backup & Restore** | Hours–days | Hours–24h | $ | Periodic backups; restore on disaster | AWS Backup, EBS snapshots, RDS snapshots, S3 |
| **Pilot Light** | 10s of min | Minutes | $$ | Core services running at minimal scale; scale up on DR | RDS snapshot in DR region, AMIs, Route 53 failover |
| **Warm Standby** | Minutes | Seconds–min | $$$ | Scaled-down full environment always running | ASG (min=1) in DR region, RDS read replica, Route 53 |
| **Multi-Site Active-Active** | Near zero | Near zero | $$$$ | Full capacity in multiple regions simultaneously | Aurora Global DB, DynamoDB Global Tables, Route 53 latency |

### AWS Backup vs manual snapshots
| | **AWS Backup** | **Manual snapshots** |
|---|---|---|
| Scope | Cross-service (EC2, EBS, RDS, DynamoDB, EFS, FSx) | Per-service |
| Scheduling | Centralized backup plans | Per-resource cron/Lambda |
| Lifecycle | Automated retention rules | Manual deletion |
| Cross-region | Cross-region copy in backup plan | Manual copy |
| **Exam pick** | "Centralized backup policy across services" | "Quick one-off EBS snapshot" |

### Aurora Global Database vs RDS cross-region replica
| | **Aurora Global DB** | **RDS cross-region read replica** |
|---|---|---|
| Replication | <1 second (storage-level) | Async (seconds–minutes) |
| Failover | Managed promotion (<1 min RTO) | Manual promote replica |
| Read scaling | Local reads in secondary region | Read replica in secondary region |
| **Exam pick** | "Lowest RPO cross-region for Aurora" | "Read scaling + eventual DR for RDS" |

---

## SQS / SNS / EventBridge Advanced

### SQS FIFO details
- **Message group ID** — ordering scope (all messages with same group ID are ordered).
- **Deduplication ID** — 5-minute dedup window; or enable **content-based deduplication**.
- **Throughput:** 300 msg/s per queue (3,000 with batching); use multiple message groups for parallelism.

### SNS message filtering
- Subscribe with **filter policy** (JSON) — only matching messages delivered to that subscriber.
- Example: `{"eventType": ["order_placed"]}` — subscriber only gets order events.

### EventBridge advanced features
| Feature | Purpose |
|---|---|
| **Pipes** | Point-to-point integration with optional filtering/transform |
| **Schedules** | Cron/rate expressions trigger targets (replaces CloudWatch Events rules) |
| **Schema Registry** | Discover and validate event schemas |
| **Archive & Replay** | Store events for 24h–365 days; replay for debugging |
| **Cross-account** | Resource policy on event bus allows other accounts to send events |

### Step Functions error handling
| State feature | Purpose |
|---|---|
| **Retry** | Automatic retry with backoff (IntervalSeconds, MaxAttempts, BackoffRate) |
| **Catch** | Handle errors → transition to fallback state (e.g., notify + DLQ) |
| **Choice** | Branch based on input (if/else logic) |
| **Parallel** | Execute branches concurrently |
| **Map** | Iterate over array items (batch processing) |
| **Standard vs Express** | Standard = durable, exactly-once, up to 1 year; Express = high volume, at-least-once, up to 5 min |

---

## Auto Scaling Deep Dive

### Lifecycle hooks
- Pause instance at **launching** or **terminating** → run custom action (install software, drain connections) → complete lifecycle action.
- Use **SSM Automation** or **Lambda** as hook target.

### Warm pools
- Pre-initialized instances ready to launch faster (reduces scale-out latency).
- Instances in warm pool = stopped or running at reduced capacity.

### Mixed instances policy
- Combine **On-Demand** (base capacity) + **Spot** (additional capacity) in one ASG.
- Allocation strategies: lowest price, diversified, capacity optimized.

### ECS / EKS auto scaling
| Service | Scaling mechanism |
|---|---|
| **ECS** | Service Auto Scaling (target tracking on CPU/memory) + Capacity Provider (Fargate/EC2/Spot) |
| **EKS** | Cluster Autoscaler (adds/removes nodes) + HPA (pod-level) + Karpenter (node provisioning) |
| **DynamoDB** | Auto Scaling on WCU/RCU or **On-Demand** mode (no capacity planning) |

---

## Domain 2 — Additional quick-fire Qs (Q41–Q60)

- Q41: Web app traffic spikes 10x on Black Friday → **ALB + ASG with target tracking scaling policy**.
- Q42: Order processing must not lose messages even if consumer crashes → **SQS with DLQ** + idempotent consumers.
- Q43: One S3 upload triggers 3 different processing pipelines → **S3 event notification → SNS topic → 3 SQS queues** (fan-out).
- Q44: DR with RTO < 1 hour, RPO < 5 minutes for Aurora → **Aurora Global Database** with managed failover.
- Q45: Gradually shift traffic from old to new app version → **Route 53 weighted routing** (90/10 → 50/50 → 0/100).
- Q46: Primary region fails; auto-route to DR region → **Route 53 failover routing** with health checks.
- Q47: Users worldwide need lowest latency → **Route 53 latency routing** to nearest region.
- Q48: Long-running workflow with human approval step → **Step Functions Standard** with Wait state + callback.
- Q49: Process 10,000 S3 objects in parallel → **Step Functions Map state** over S3 object list.
- Q50: Microservices communicate asynchronously → **SQS queues** between services (not direct HTTP calls).
- Q51: Scheduled daily report generation → **EventBridge schedule rule** → Lambda.
- Q52: SaaS app sends webhook events to your AWS account → **EventBridge partner event bus**.
- Q53: ASG needs to run config script before accepting traffic → **Lifecycle hook** at launching + SSM/CloudInit.
- Q54: Reduce scale-out time for latency-sensitive app → **ASG warm pool** with pre-initialized instances.
- Q55: Mix cheap Spot with reliable On-Demand in same ASG → **Mixed instances policy**.
- Q56: Database failover with zero data loss in same region → **RDS Multi-AZ** (synchronous replication).
- Q57: Read-heavy workload overwhelming primary DB → **Read replicas** (async, read scaling).
- Q58: Entire AZ goes down; web tier survives → **ASG across multiple AZs** + **ALB cross-zone load balancing**.
- Q59: Centralized backup for EC2, RDS, EFS with 30-day retention → **AWS Backup** with backup plan.
- Q60: Deploy new app version with zero downtime → **Elastic Beanstalk blue/green** or **CodeDeploy blue/green**.

---

## Domain 2 — Exam Scenario Walkthroughs

### Scenario 1: Traffic spike handling
**Stem:** E-commerce site gets 20x traffic during sales. Current single EC2 can't handle it.
**Answer:** ALB + ASG with target tracking (CPU 50%) across multiple AZs + RDS Multi-AZ.
**Traps:** Bigger instance (vertical scaling, single point of failure). CloudFront alone (doesn't scale compute).

### Scenario 2: Decouple order processing
**Stem:** Order API receives 1000 orders/sec. Processing takes 5 seconds each. API must respond in <200ms.
**Answer:** API receives order → puts message on **SQS** → returns 202 immediately → worker fleet processes from queue.
**Traps:** Synchronous processing (timeout). SNS (push, no buffering).

### Scenario 3: Multi-region DR with minimal RPO
**Stem:** Financial app in us-east-1; DR in eu-west-1; RPO < 1 second; automated failover.
**Answer:** **Aurora Global Database** (storage-level replication <1s) + Route 53 failover health checks.
**Traps:** RDS cross-region read replica (manual promotion, higher RPO). S3 CRR (object storage, not DB).

### Scenario 4: Event-driven image processing
**Stem:** Users upload photos to S3; generate thumbnails and run ML analysis asynchronously.
**Answer:** S3 event notification → **SQS** → Lambda (thumbnail) + S3 event → **SNS** → SQS → Lambda (ML).
**Traps:** S3-triggered Lambda directly (no retry/DLQ buffer). Polling S3 (inefficient).

### Scenario 5: Blue/green deployment
**Stem:** Deploy new version with ability to instantly roll back; minimal risk.
**Answer:** Route 53 weighted routing (0% new → test → shift 100%) OR Elastic Beanstalk blue/green OR CodeDeploy.
**Traps:** In-place deployment (no instant rollback). Replacing ASG (downtime).

### Scenario 6: Workflow with error handling
**Stem:** Process invoices: validate → charge payment → send confirmation. If payment fails, notify admin and retry 3 times.
**Answer:** **Step Functions** with Retry on payment task + Catch → notify admin state.
**Traps:** Lambda chaining (no built-in retry/orchestration). SQS (no workflow logic).

### Scenario 7: Global users, lowest latency
**Stem:** SaaS app deployed in us-east-1, eu-west-1, ap-southeast-1. Route users to nearest.
**Answer:** **Route 53 latency routing** policy with health checks on each region's ALB.
**Traps:** Geolocation (routes by location, not measured latency). Weighted (doesn't consider user location).

### Scenario 8: Scheduled batch processing
**Stem:** Every night at 2 AM, process all new records and generate reports.
**Answer:** **EventBridge schedule rule** (cron: `0 2 * * ? *`) → Lambda or Step Functions.
**Traps:** CloudWatch alarm (metric-based, not time-based). Lambda with external cron (operational overhead).

### Scenario 9: Survive AZ failure
**Stem:** Production app must survive complete loss of one Availability Zone.
**Answer:** ASG across **≥2 AZs** + ALB + RDS Multi-AZ + ElastiCache cluster mode.
**Traps:** Multi-AZ RDS alone (app tier still in one AZ). Single AZ with larger instances.

### Scenario 10: Cross-service backup strategy
**Stem:** Company needs unified backup for EC2, RDS, and EFS with daily snapshots and 90-day retention.
**Answer:** **AWS Backup** with backup plan (daily schedule, 90-day lifecycle rule, cross-region copy optional).
**Traps:** Individual snapshot scripts per service (operational overhead). S3 versioning (not a backup solution for compute/DB).
