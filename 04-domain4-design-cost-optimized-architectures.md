# Domain 4 — Design Cost-Optimized Architectures (20% of scored exam)

> **Exam lens:** SAA-C03 cost questions are scenario-driven — pick the option that **meets requirements at lowest ongoing cost**, not the cheapest option that breaks SLA, durability, or availability. "Most cost-effective" almost always means **right-size + right pricing model + eliminate waste**.

## Cost Optimization Pillar (Well-Architected Framework)

Design principles you will be tested on:
- **Implement cloud financial management** — tag resources, allocate costs, use Cost Explorer / Budgets / CUR.
- **Adopt a consumption model** — pay only for what you use; scale in/out; avoid idle capacity.
- **Measure overall efficiency** — track cost per transaction / user / workload.
- **Stop spending on undifferentiated heavy lifting** — managed services over self-managed when TCO is lower.
- **Analyze and attribute expenditure** — tags, cost allocation, chargeback/showback.

---

## T4.1 — Cost-Optimized Storage

### S3 storage classes (memorize access pattern → class)

| Storage class | Min storage duration | Availability | Durability | Retrieval | Best for |
|---|---|---|---|---|---|
| **S3 Standard** | None | 99.99% | 11 nines | Instant | Frequent access, low latency |
| **S3 Standard-IA** | 30 days | 99.9% | 11 nines | Instant | Infrequent access; still need ms retrieval |
| **S3 One Zone-IA** | 30 days | 99.5% (single AZ) | 11 nines in one AZ | Instant | Infrequent, **recreatable** data; cheapest IA |
| **S3 Glacier Instant Retrieval** | 90 days | 99.9% | 11 nines | Instant (ms) | Archive accessed ~1×/quarter |
| **S3 Glacier Flexible Retrieval** | 90 days | 99.99% | 11 nines | Minutes–hours (Expedited/Standard/Bulk) | Backup/archive; retrieval rare |
| **S3 Glacier Deep Archive** | 180 days | 99.99% | 11 nines | 12–48 hours | Long-term compliance; cheapest storage |
| **S3 Intelligent-Tiering** | None (small monitoring fee) | Same as underlying tier | 11 nines | Instant (automatic) | Unknown/changing access patterns |

**Exam gotchas:**
- **Minimum storage duration charge** — delete before min days → still billed for remainder (IA = 30d, Glacier = 90d, Deep Archive = 180d).
- **Retrieval fees** — IA and Glacier charge per GB retrieved; Standard does not.
- **One Zone-IA** — no cross-AZ resilience; **never** for sole copy of critical data.
- **Intelligent-Tiering** — auto-moves between frequent / infrequent / archive instant tiers; **no retrieval fee** for tier moves; small per-object monitoring fee; ideal when access pattern is unpredictable.
- **S3 Glacier Flexible vs Deep Archive** — Deep Archive = lowest $/GB but slowest retrieval; Flexible = middle ground with optional expedited retrieval.

### S3 lifecycle policies

Automate transitions and expiration to cut cost without manual intervention.

```
Day 0–30:   Standard (active logs)
Day 30:     → Standard-IA
Day 90:     → Glacier Flexible Retrieval
Day 365:    → Glacier Deep Archive
Day 2555:   Expire (7-year retention met)
```

**Rules:**
- **Transition actions** — move to cheaper class after N days.
- **Expiration actions** — delete object (and abort incomplete multipart uploads).
- **Filters** — prefix, tags, object size.
- **Non-current version transitions** — versioned buckets: move old versions to IA/Glacier.
- Combine with **S3 Storage Lens** / **Storage Class Analysis** to identify candidates.

**Exam pattern:** "Logs accessed first week only, retained 7 years, rarely read after" → **Lifecycle: Standard → IA/Glacier → Deep Archive + expiration**.

### EBS cost optimization

| Volume type | Cost profile | When to use |
|---|---|---|
| **gp3** | $/GB + baseline IOPS/throughput (cheapest general-purpose) | Default for most workloads; right-size IOPS independently |
| **gp2** | $/GB with IOPS tied to size | Legacy; migrate to gp3 for savings |
| **io1/io2** | Highest $/GB + provisioned IOPS | Mission-critical DBs needing sustained IOPS |
| **st1** | Throughput-optimized HDD | Big sequential reads (logs, data warehouses) |
| **sc1** | Cold HDD | Infrequent sequential access |
| **Snapshot** | $/GB-month in S3 | Backup; **delete old snapshots**; use lifecycle policies |

**Rightsizing EBS:**
- Use **Compute Optimizer** + **Cost Explorer** to find underutilized volumes.
- **Downsize** over-provisioned gp3 IOPS/throughput.
- **Delete unattached volumes** — classic waste item on exam.
- **EBS-optimized instances** — only pay premium when IOPS warrants it.
- Move cold block data to **S3** (cheaper $/GB than EBS for archive).

### EFS cost optimization

| EFS storage class | Cost | Access |
|---|---|---|
| **Standard** | Higher $/GB | Frequent access |
| **EFS Infrequent Access (EFS IA)** | Lower $/GB | Files not accessed for 30+ days (Lifecycle Management moves them) |
| **EFS Archive** | Lowest $/GB | Files not accessed 90+ days |
| **One Zone** variants | Cheaper; single AZ | Dev/test or recreatable shared file data |

- Enable **EFS Lifecycle Management** to auto-tier Standard → IA → Archive.
- **Elastic throughput** vs **Provisioned throughput** — provisioned only when sustained high throughput justifies fixed cost.

---

## T4.2 — Cost-Optimized Compute

### EC2 pricing models (comparison table)

| Model | Discount vs On-Demand | Commitment | Interruption | Best for |
|---|---|---|---|---|
| **On-Demand** | 0% (baseline) | None | Never | Spiky/unpredictable; short-lived; dev |
| **Reserved Instances (RI)** | Up to ~72% (1yr/3yr) | 1 or 3 years | Never | Steady-state, known instance family/AZ/region |
| **Savings Plans** | Up to ~72% | $/hr commit 1 or 3 yr | Never | Flexible — any instance family, region, OS, tenancy |
| **Spot Instances** | Up to ~90% | None | **Yes** (2-min notice) | Fault-tolerant, stateless, batch, HPC, CI/CD |
| **Dedicated Hosts** | On-Demand pricing | Per-host | Never | BYOL licenses (SQL Server, SUSE); compliance isolation |
| **Dedicated Instances** | Premium over On-Demand | None | Never | Hardware isolation without host visibility |

**RI vs Savings Plans (high-yield):**
- **Standard RI** — deepest discount; **locked** to instance type, region, AZ, OS, tenancy.
- **Convertible RI** — lower discount; can exchange for different instance type.
- **Savings Plans (Compute SP)** — commit $/hr; applies to EC2, **Lambda**, Fargate.
- **EC2 Instance Savings Plans** — deeper discount; locked to instance family in a region.
- **Exam default for steady EC2:** Savings Plans or Standard RI; **Spot** when interruption OK.

### Lambda vs EC2 for intermittent workloads

| Factor | Lambda | EC2 (incl. Spot) |
|---|---|---|
| Billing | Per invocation + duration (GB-seconds) | Per second while running |
| Idle cost | **$0** when not invoked | Always paying if instance up |
| Cold start | Yes (ms–seconds) | No (always warm if running) |
| Max duration | 15 minutes | Unlimited |
| Best for | Event-driven, sporadic, short tasks | Long-running, persistent connections, custom OS |

**Exam pattern:** "Runs 5 minutes/day, event-triggered" → **Lambda**. "Always-on web server with steady traffic" → **EC2 + RI/SP**. "Batch job 8 hours, fault-tolerant" → **Spot Fleet**.

### Rightsizing & Auto Scaling

- **AWS Compute Optimizer** — recommends smaller instance types based on CloudWatch metrics.
- **Cost Explorer Rightsizing Recommendations** — idle/underutilized EC2, RDS, Redshift.
- **Auto Scaling** — scale **in** during low demand (pay less); scale **out** for performance.
  - **Target tracking** — maintain CPU/utilization target.
  - **Scheduled scaling** — known business hours pattern.
  - **Predictive scaling** — ML-based forecast (cost + performance).
- **Stop vs terminate** — stopped EC2 still pays for **EBS**; terminated releases compute + can delete EBS.

### Graviton (ARM-based) cost angle

- **Graviton2/3/4** instances — up to **40% better price-performance** vs comparable x86.
- Works for Linux workloads; verify application ARM compatibility.
- **Exam:** "Same performance, lower cost, Linux app" → **Graviton-based instance types** (e.g., `m7g`, `c7g`).

---

## T4.3 — Cost-Optimized Databases

### RDS / Aurora Reserved Instances

- **RDS RIs** — same model as EC2 RIs: 1yr/3yr, Standard (locked) vs Convertible.
- Applies to **Aurora**, **MySQL**, **PostgreSQL**, **MariaDB**, **Oracle**, **SQL Server**.
- **Exam:** "Production DB running 24/7 for 3 years" → **RDS Reserved Instance** (or Aurora RI).

### Aurora Serverless v2

| | Aurora Provisioned | Aurora Serverless v2 |
|---|---|---|
| Billing | Per ACU-hour (always on at min capacity) | Scales ACUs automatically; pay for capacity used |
| Scaling | Manual instance sizing | **0.5–128 ACUs** auto-scale |
| Best for | Predictable steady load | Variable/spiky, dev/test, multi-tenant SaaS |

- **Aurora Serverless v1** — scales to **zero** (pause); good for intermittent dev; v2 is production-grade auto-scaling.
- **Exam:** "DB idle nights and weekends, prod SLA" → **Aurora Serverless v2**. "Dev DB used 2 hrs/day" → Serverless v1 pause or stop/start RDS.

### DynamoDB capacity modes

| Mode | Billing | Best for |
|---|---|---|
| **On-Demand** | Per request (read/write units consumed) | Unknown/spiky traffic; new apps; ops-free scaling |
| **Provisioned** | Per WCU/RCU-hour (can auto-scale) | Predictable traffic; **cheaper at steady high volume** |
| **Reserved Capacity** | 1yr commit on provisioned WCU/RCU | Steady provisioned workload — extra discount |

**Cost tips:**
- Use **DynamoDB Standard-IA** table class for infrequently accessed data (lower storage $/GB).
- **DAX** adds cost — only when read latency reduction justifies it, not for cost savings alone.
- **On-Demand vs Provisioned exam rule:** unpredictable → On-Demand; predictable high throughput → Provisioned + auto scaling.

### ElastiCache sizing

- Pay for **node type × number of nodes × hours running**.
- **Right-size nodes** — don't over-provision memory; use CloudWatch `CurrItems`, `BytesUsed`, CPU.
- **Reserved Nodes** — 1yr/3yr discount for steady Redis/Memcached clusters.
- **Cluster mode** — shard for scale; each shard = cost; don't shard unnecessarily.
- **Exam:** "Cache for read-heavy app, steady traffic" → **Reserved Nodes + right-sized instance type**.

### Redshift RA3 nodes

| Node family | Storage | Cost pattern |
|---|---|---|
| **dc2** | Local SSD (dense compute) | Compute + local storage bundled; limited scale |
| **ra3** | **Managed storage (Redshift Managed Storage)** separate from compute | Pay compute (RA3) + storage independently; **scale compute and storage separately** |

- **RA3 + RMS** — best for growing datasets: add compute nodes without over-provisioning storage.
- **Redshift Serverless** — pay per RPU-hour; good for intermittent analytics.
- **Spectrum** — query S3 directly; avoid loading cold data into Redshift.
- **Exam:** "Data warehouse growing, separate compute/storage scaling" → **RA3 with managed storage**.

---

## T4.4 — Cost-Optimized Network

### CloudFront — reduce data transfer cost

- **Edge caching** — serve static/dynamic content from edge → less origin traffic.
- **PriceClass_100 / _200 / All** — fewer edge locations = lower CloudFront cost (trade latency).
- **Origin:** S3, ALB, EC2, custom — CloudFront **S3 origin** avoids public internet egress from S3 in same region (use **OAC/OAI**).
- **Data transfer out to internet** — CloudFront egress often **cheaper** than direct EC2/S3 egress at scale.
- **Exam:** "Global users, static assets, minimize egress" → **CloudFront + S3 origin**.

### Direct Connect vs VPN (cost lens)

| | **Site-to-Site VPN** | **AWS Direct Connect** |
|---|---|---|
| Setup | Fast, low upfront | Weeks/months; cross-connect fees |
| Recurring cost | VPN hourly + **data transfer out** | Port hours (1G/10G) + **data transfer out** (often lower $/GB) |
| Bandwidth | Limited by internet | Consistent 1/10/100 Gbps |
| Best for | Low/medium volume, quick setup | **High, steady** hybrid traffic; predictable $/GB at volume |

- **VPN over DX (private VIF)** — encrypted over dedicated line; combines DX bandwidth with IPsec.
- **Exam:** "Transfer 50 TB/month on-prem ↔ AWS steadily" → **Direct Connect** (lower $/GB at volume). "Quick secure link, low volume" → **VPN**.

### NAT Gateway cost awareness

NAT Gateway charges:
1. **Hourly per-AZ** fee (always on).
2. **Data processing** per GB through NAT.

**Cost traps:**
- Every private subnet AZ needs its own NAT GW for HA → **3 AZs = 3× hourly cost**.
- S3/DynamoDB traffic via NAT → pay processing fee unnecessarily.

**Mitigations:**
- **VPC Gateway Endpoints (S3, DynamoDB)** — **free**; route tables point to endpoint; no NAT processing.
- **VPC Interface Endpoints (PrivateLink)** — hourly + data processing; still often cheaper than NAT + internet for AWS services.
- **NAT Instance** — cheaper at very low volume but self-managed (exam rarely prefers over NAT GW for prod).
- Place workloads that need internet in **public subnet** only when security allows (avoid NAT entirely).

### Data transfer pricing gotchas (memorize)

| Transfer path | Typical cost |
|---|---|
| **In to AWS** | **Free** (internet, Direct Connect, VPN) |
| **Out to internet** | $/GB (tiered; region-specific) |
| **Same AZ** | **Free** (EC2 ↔ EC2, EC2 ↔ ELB) |
| **Cross-AZ (same region)** | $/GB each direction |
| **Cross-region** | $/GB (both directions) |
| **EC2 ↔ S3 same region** | **Free** |
| **CloudFront → viewer** | CloudFront egress pricing (not EC2 egress) |

**Classic exam traps:**
- "Backup RDS to S3 **another region**" → cross-region transfer **costs money**.
- "ALB in 3 AZs, clients cross-AZ" → cross-AZ data charges.
- **Elastic IP attached to stopped instance** — small charge; unattached EIP — charge.
- **Inter-AZ replication** (Multi-AZ RDS, ELB cross-zone) — factor into TCO.

---

## Cost Management & Monitoring Tools

| Tool | Purpose | Exam trigger phrase |
|---|---|---|
| **AWS Cost Explorer** | Visualize/filter costs by service, tag, time; forecasting; RI/SP recommendations; rightsizing | "Analyze spend trends", "forecast next quarter", "find savings" |
| **AWS Budgets** | Set cost/usage/RI/SP budgets; **alerts** at thresholds (email/SNS); optional auto actions | "Alert when spend exceeds $X", "prevent surprise bill" |
| **AWS Cost & Usage Report (CUR)** | **Most granular** line-item billing data; hourly; deliver to S3; integrate with Athena/QuickSight | "Detailed billing export", "chargeback by tag", "custom cost analytics" |
| **AWS Trusted Advisor** | Best-practice checks incl. **cost optimization** (idle resources, RI coverage, overprovisioned EBS) | "Free optimization checks", "idle Load Balancers" (Business/Enterprise support for full checks) |
| **Compute Optimizer** | ML recommendations for EC2, EBS, Lambda, Auto Scaling | "Recommend smaller instances" |
| **S3 Storage Lens** | Organization-wide S3 usage/cost metrics | "Find buckets with no lifecycle policy" |

**Support plan note:** Basic Support = limited Trusted Advisor (7 core checks include some cost). Business/Enterprise = full Trusted Advisor including cost category.

### Tagging strategy (underpins all cost tools)

- **Cost allocation tags** — activate user-defined tags in Billing console.
- Tag: `Environment`, `Project`, `Owner`, `CostCenter`.
- Without tags, Cost Explorer/CUR cannot attribute spend → exam answer often includes **"implement tagging strategy"**.

---

## Pricing Model Decision Cheat Sheet

```
STORAGE
  Frequent access        → S3 Standard
  Infrequent, durable    → S3 Standard-IA
  Infrequent, recreatable→ S3 One Zone-IA
  Unknown pattern        → S3 Intelligent-Tiering
  Archive                → Glacier Flexible → Deep Archive
  Block storage active   → EBS gp3 (right-sized)
  Shared files, tiering  → EFS + Lifecycle (IA/Archive)

COMPUTE
  Steady 24/7            → Savings Plans or Reserved Instances
  Flexible steady        → Compute Savings Plan
  Fault-tolerant/batch   → Spot Instances (+ Auto Scaling)
  BYOL / compliance host → Dedicated Hosts
  Sporadic short tasks   → Lambda
  Linux, same perf       → Graviton instances

DATABASE
  Steady RDS/Aurora      → Reserved Instances
  Variable Aurora        → Aurora Serverless v2
  Spiky NoSQL            → DynamoDB On-Demand
  Steady NoSQL           → DynamoDB Provisioned (+ Reserved Capacity)
  Growing DW             → Redshift RA3 + managed storage

NETWORK
  Global static content  → CloudFront
  High hybrid bandwidth  → Direct Connect
  AWS APIs from VPC      → VPC Endpoints (avoid NAT)
  S3/DynamoDB from VPC   → Gateway Endpoints (free)
```

---

## Domain 4 quick-fire Qs (self-check)

1. **Q:** S3 logs written daily, never read after 30 days, keep 1 year — **Lifecycle: transition to Glacier at 30d, expire at 365d** (or IA → Glacier chain).

2. **Q:** Unpredictable S3 access pattern, don't want to manage tiers — **S3 Intelligent-Tiering**.

3. **Q:** Dev team leaves 50 unattached EBS volumes — **Delete unattached volumes**; Trusted Advisor / Cost Explorer flags this.

4. **Q:** Web app steady 3-year EC2 load, may change instance sizes — **Compute Savings Plan** (flexible) or Convertible RI.

5. **Q:** ML training job tolerant of interruption, lowest cost — **Spot Instances** with Spot Fleet / checkpointing.

6. **Q:** Cron job runs 3 min every hour — **Lambda** (no idle EC2 cost).

7. **Q:** Production MySQL 24/7 for 3 years — **RDS Reserved Instance**.

8. **Q:** E-commerce flash sales, DB traffic unpredictable — **DynamoDB On-Demand** (or Provisioned + auto scaling if steady baseline exists).

9. **Q:** Private EC2 instances download patches from internet — **NAT Gateway** required (or VPC endpoints for AWS-hosted patches + NAT for rest).

10. **Q:** EC2 in private subnet reads S3 constantly — **VPC Gateway Endpoint for S3** (free; avoids NAT processing charges).

11. **Q:** Global users, reduce S3 egress costs — **CloudFront** with S3 origin.

12. **Q:** Need billing line items by project tag in Athena — **Cost and Usage Report (CUR)** to S3.

13. **Q:** Alert when monthly AWS bill exceeds $10,000 — **AWS Budgets** with SNS notification.

14. **Q:** Find idle Elastic Load Balancers and underutilized RIs — **AWS Trusted Advisor** (cost optimization checks).

15. **Q:** Data transfer EC2 (us-east-1a) → EC2 (us-east-1b) — **Cross-AZ data transfer fee applies**.

16. **Q:** Cheapest S3 for compliance archive, retrieval in 12+ hours OK — **S3 Glacier Deep Archive**.

17. **Q:** Shared Linux file store, files cold after 60 days — **EFS with Lifecycle to Infrequent Access**.

18. **Q:** Redshift dataset growing, decouple storage from compute — **RA3 nodes with managed storage**.

---

*Content aligned to AWS SAA-C03 Exam Content Overview — Domain 4: Design Cost-Optimized Architectures. Verify pricing percentages and dollar amounts against current AWS documentation before exam day.*

---

## S3 Storage Class Decision Tree

```
Access frequency?
├── Frequent → S3 Standard
├── Unknown/changing → S3 Intelligent-Tiering (auto-moves between tiers)
├── Infrequent (monthly) → S3 Standard-IA (min 30 days, retrieval fee)
│   └── Can tolerate AZ loss? → S3 One Zone-IA (cheaper, single AZ)
└── Archive
    ├── Instant access needed → Glacier Instant Retrieval
    ├── Minutes-hours OK → Glacier Flexible Retrieval
    └── 12+ hours OK → Glacier Deep Archive (cheapest)
```

### Lifecycle policy example
```json
{
  "Rules": [{
    "ID": "TierAndArchive",
    "Status": "Enabled",
    "Transitions": [
      {"Days": 30, "StorageClass": "STANDARD_IA"},
      {"Days": 90, "StorageClass": "GLACIER"},
      {"Days": 365, "StorageClass": "DEEP_ARCHIVE"}
    ],
    "Expiration": {"Days": 2555}
  }]
}
```

### Glacier retrieval tiers
| Tier | Access time | Cost | Use case |
|---|---|---|---|
| **Expedited** | 1–5 min | $$$ | Urgent restore |
| **Standard** | 3–5 hours | $$ | Normal restore |
| **Bulk** | 5–12 hours | $ | Large-scale restore |

---

## Compute Pricing Deep Dive

### Reserved Instances types
| Type | Flexibility | Discount | Exam note |
|---|---|---|---|
| **Standard RI** | Fixed instance family/AZ | Up to 72% | Steady, predictable workload |
| **Convertible RI** | Can change family/OS/tenancy | Up to 54% | Might need to change instance type |
| **Scheduled RI** | Specific time windows | Varies | Batch jobs on schedule (rare) |

### Savings Plans
| Plan | Applies to | Flexibility |
|---|---|---|
| **Compute SP** | EC2, Lambda, Fargate | Any instance family, region, OS |
| **EC2 Instance SP** | EC2 only | Specific instance family in region |

**Exam:** "flexible compute commitment" → **Compute Savings Plan** (not RI).

### Spot Instances
- Up to **90% discount**; 2-minute interruption notice.
- **Spot Fleet** — request mix of instance types/AZs; allocation strategies: lowestPrice, diversified, capacityOptimized.
- **Good for:** batch, CI/CD, stateless, fault-tolerant, big data.
- **Bad for:** databases, single-instance critical apps.

### Lambda cost factors
- **Charged:** requests + duration (GB-seconds) + provisioned concurrency.
- **Provisioned concurrency** = pre-warmed instances (costs even when idle) — use for latency-sensitive.
- **Exam:** intermittent/unpredictable → Lambda cheaper than always-on EC2.

---

## Data Transfer Cost Gotchas

| Transfer type | Cost | Optimization |
|---|---|---|
| **Internet egress** | $0.09/GB (varies by region) | CloudFront (cheaper egress), VPC endpoints |
| **Inter-AZ** | $0.01/GB each direction | Keep communication within same AZ where possible |
| **Inter-region** | $0.02/GB+ | Replicate only what's needed; use CloudFront |
| **Same-AZ** | Free | Design for AZ-local traffic |
| **NAT Gateway** | $0.045/GB processed + hourly | **VPC endpoints** for S3/DynamoDB/other APIs |
| **CloudFront origin fetch** | Cheaper than direct S3 internet egress | Always put CloudFront in front of public S3 |

### NAT Gateway cost savings example
- 1 TB/month S3 access from private subnet via NAT = ~$45 data processing + $32 hourly.
- Same via **S3 Gateway Endpoint** = **$0**.
- **Exam:** "minimize data transfer costs from private subnet to S3" → **Gateway Endpoint**.

---

## Cost Management Tools

| Tool | Purpose | Exam trigger |
|---|---|---|
| **Cost Explorer** | Visualize spending trends, forecasts | "analyze spending patterns" |
| **AWS Budgets** | Set spending alerts and automated actions | "alert when spend exceeds $X" |
| **Cost Anomaly Detection** | ML-based unusual spend alerts | "detect unexpected cost spikes" |
| **Compute Optimizer** | Rightsizing recommendations for EC2, EBS, Lambda | "recommend smaller instances" |
| **Trusted Advisor** | Best-practice checks (cost, security, performance) | "identify idle resources" |
| **CUR (Cost & Usage Report)** | Detailed hourly cost data → Athena/QuickSight | "detailed cost analysis/reporting" |
| **Cost Allocation Tags** | Tag resources for per-team/project billing | "attribute costs to departments" |

---

## Domain 4 — Additional quick-fire Qs (Q41–Q60)

- Q41: 3-year steady EC2 workload, might change instance family → **Convertible RI** or **Compute Savings Plan**.
- Q42: Batch job can tolerate interruption → **Spot Instances** (up to 90% savings).
- Q43: 10 TB infrequently accessed data → **S3 Standard-IA** (not Standard).
- Q44: Archive data accessed once a year → **S3 Glacier Deep Archive**.
- Q45: Unknown access patterns → **S3 Intelligent-Tiering**.
- Q46: Private subnet apps access S3 daily (1 TB) → **S3 Gateway Endpoint** (avoid NAT charges).
- Q47: Idle EC2 running 24/7 at 5% CPU → **Rightsize** or **stop when not needed** (Trusted Advisor flag).
- Q48: Dev environment only needed business hours → **Scheduled scaling** or stop/start with Lambda.
- Q49: Lambda function with sporadic traffic → **On-demand Lambda** (not provisioned concurrency).
- Q50: Lambda with strict <100ms latency requirement → **Provisioned concurrency** (costs more but no cold start).
- Q51: 500 GB MySQL with steady load → **RDS Reserved Instance** (not on-demand).
- Q52: Unpredictable NoSQL traffic → **DynamoDB on-demand** (not over-provisioned WCU).
- Q53: Static website 1 TB/month egress → **CloudFront** (cheaper than S3 direct egress).
- Q54: Company wants alert when monthly spend exceeds $10K → **AWS Budgets**.
- Q55: Sudden unexplained cost spike → **Cost Anomaly Detection**.
- Q56: Per-department AWS billing → **Cost allocation tags** + Cost Explorer filter.
- Q57: EBS gp2 volume on I/O-light workload → **Migrate to gp3** (cheaper, same performance).
- Q58: 3-year SQL Server license already owned → **Dedicated Host** (bring your own license).
- Q59: Auto-archive logs older than 90 days → **S3 lifecycle policy** → Glacier.
- Q60: Detailed hourly cost breakdown for finance team → **CUR** exported to S3 → **Athena** queries.

---

## Domain 4 — Exam Scenario Walkthroughs

### Scenario 1: Steady-state compute savings
**Stem:** 20 m5.xlarge instances run 24/7 for 3 years; won't change instance family.
**Answer:** **Standard Reserved Instances** (1 or 3 year, all upfront = max discount).
**Traps:** On-Demand (most expensive). Spot (can be interrupted).

### Scenario 2: Storage lifecycle optimization
**Stem:** 50 TB logs; accessed frequently for 30 days, then monthly for 1 year, then never.
**Answer:** S3 Standard → lifecycle to **Standard-IA** at 30 days → **Glacier Flexible** at 365 days → expire at 7 years.
**Traps:** All Standard (expensive for old data). All Glacier (retrieval fees for monthly access).

### Scenario 3: Minimize NAT costs
**Stem:** 50 EC2 instances in private subnets access S3 and DynamoDB heavily.
**Answer:** **Gateway VPC endpoints** for S3 and DynamoDB (free, no NAT data processing charges).
**Traps:** NAT Gateway (charges per GB). Interface endpoints (hourly cost, overkill for S3/DDB).

### Scenario 4: Spot for fault-tolerant workload
**Stem:** Nightly batch job processes 1M records; can restart if interrupted; minimize cost.
**Answer:** **Spot Instances** with Spot Fleet (diversified allocation) + SQS checkpointing.
**Traps:** On-Demand (10x more expensive). Reserved (wrong for intermittent).

### Scenario 5: Serverless cost optimization
**Stem:** API with 100 requests/day average, 10K spike once a month; must respond <500ms during spikes.
**Answer:** **Lambda on-demand** (pay per invocation) + **API Gateway** caching for repeated queries.
**Traps:** Always-on EC2 (paying 24/7 for 100 req/day). Provisioned concurrency (unnecessary cost for low traffic).

### Scenario 6: Database cost optimization
**Stem:** MySQL database with steady 500 queries/sec; 3-year commitment acceptable.
**Answer:** **RDS Reserved Instance** + right-sized instance (db.r6g.large, not oversized).
**Traps:** Aurora Serverless (pay per ACU, expensive at steady load). On-Demand RDS.

### Scenario 7: Cost monitoring setup
**Stem:** CFO wants alerts at 80% and 100% of $50K monthly budget; per-team cost breakdown.
**Answer:** **AWS Budgets** (alerts at thresholds) + **cost allocation tags** on all resources + **Cost Explorer** dashboards.
**Traps:** CloudWatch alarms (don't track billing). Trusted Advisor (recommendations, not budgets).

### Scenario 8: Data transfer optimization
**Stem:** Global users download 5 TB/month of content from S3 in us-east-1.
**Answer:** **CloudFront** distribution (cheaper egress + edge caching) + S3 origin.
**Traps:** Direct S3 access (expensive internet egress). Global Accelerator (no caching, wrong for static content).

### Scenario 9: EBS optimization
**Stem:** Development EBS volumes on gp2; low I/O; 20 volumes across team.
**Answer:** Migrate to **gp3** (20% cheaper, same baseline IOPS) + delete unattached volumes (Trusted Advisor).
**Traps:** io2 (overkill for dev). Keeping gp2 (paying more for same performance).

### Scenario 10: Comprehensive cost review
**Stem:** AWS bill grew 40% last quarter; need to identify waste and optimize.
**Answer:** **Cost Explorer** (trend analysis) + **Compute Optimizer** (rightsizing) + **Trusted Advisor** (idle resources) + **S3 Storage Lens** (storage analysis).
**Traps:** Manual review (slow). Deleting everything (availability risk).
