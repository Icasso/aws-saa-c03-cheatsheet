# Domain 3 — Design High-Performing Architectures (24% of scored exam)

*Performance Efficiency pillar. Exam questions here ask: "Which service/setting gives the lowest latency, highest throughput, or best scaling for this access pattern?" Match the workload to the right tier, mode, and network path.*

---

## T3.1 — High-performing storage solutions

### Amazon S3 — performance levers

| Technique | What it does | When to use |
|---|---|---|
| **Multipart upload** | Split large objects into parallel parts (≥5 MB each, up to 10,000 parts) | Objects **>100 MB**; speeds upload, resumes failed parts |
| **S3 Transfer Acceleration** | Upload/download via CloudFront edge → AWS backbone | **Geographically distant** clients uploading to a bucket |
| **Byte-range fetches** | GET only part of an object (`Range: bytes=0-1023`) | Large media/logs — fetch headers or segments without full download |
| **S3 Select / Glacier Select** | SQL-like filter on object contents server-side | Reduce data transferred; query CSV/JSON/Parquet in place |
| **S3 Requester Pays** | Caller pays egress | Cross-account analytics where data consumer pays |
| **Prefix sharding** | Spread hot keys across prefixes (`/000/`, `/001/`, …) | **>3,500 PUT/s or 5,500 GET/s per prefix** — S3 scales per prefix |
| **S3 Express One Zone** | Single-AZ, millisecond latency, directory buckets | **Latency-sensitive** apps in one AZ; not for durability-first |

> **Exam trap:** Transfer Acceleration = **upload/download speed over long distances**. It is NOT the same as CloudFront caching S3 objects (that's CloudFront origin = S3).

### EBS volume types — pick by IOPS/throughput/cost

| Volume | Type | Baseline | Max IOPS | Max Throughput | Use case |
|---|---|---|---:|---:|---|
| **gp3** | General SSD | 3,000 IOPS / 125 MB/s (included) | 16,000 IOPS | 1,000 MB/s | **Default** boot/data; scale IOPS/throughput independently of size |
| **gp2** | General SSD | 3 IOPS/GB (min 100) | 16,000 | 250 MB/s | Legacy; burst credits on small volumes |
| **io2 Block Express** | Provisioned IOPS SSD | — | 256,000 | 4,000 MB/s | **Mission-critical** DBs; sub-millisecond, 99.999% durability |
| **io2 / io1** | Provisioned IOPS SSD | — | 64,000 (io2) | 1,000 MB/s | High-IOPS OLTP; io2 = higher durability SLA |
| **st1** | Throughput HDD | 40 MB/s/TiB | 500 | 500 MB/s | **Big sequential reads** — logs, data warehouses, streaming |
| **sc1** | Cold HDD | 12 MB/s/TiB | 250 | 250 MB/s | **Infrequent access**, lowest-cost HDD |

**Rules of thumb:**
- Boot volume → **gp3** (or gp2 legacy).
- Database needing guaranteed IOPS → **io2/io2 Block Express**.
- Sequential throughput (not random IOPS) → **st1**.
- Cold, infrequent block access → **sc1** (cannot be boot volume).

**EBS performance tips:** use **EBS-optimized instances**; **RAID 0** across volumes for >64k IOPS; **io2 Block Express** requires **Nitro** instances and **io2 Block Express–enabled** instance types.

### Amazon EFS — shared file storage (Linux)

| Setting | General Purpose | Max I/O |
|---|---|---|
| **Latency** | Lower for most workloads | Higher baseline, scales for parallel |
| **Throughput mode — Bursting** | Scales with storage size | — |
| **Throughput mode — Provisioned** | Set MiB/s regardless of size | Set MiB/s regardless of size |
| **Throughput mode — Elastic** | Auto-scales to peak (pay for burst) | Auto-scales to peak |
| **Performance mode** | **General Purpose** (default, low latency) | **Max I/O** (higher ops/sec, higher latency) |
| **Storage class** | Standard | Infrequent Access (IA) for cold files |
| **Multi-AZ** | Regional (default) | One Zone (cheaper, no cross-AZ resilience) |

> **EFS vs EBS:** EFS = **NFS, multi-attach, scales automatically**. EBS = **block, one instance (mostly), provision IOPS**.

### Amazon FSx — managed specialty file systems

| Service | Protocol / Engine | Best for |
|---|---|---|
| **FSx for Windows** | **SMB**, Active Directory, Windows ACLs | Lift-and-shift Windows apps, home dirs, .NET |
| **FSx for Lustre** | **Lustre** (HPC) | **ML training, genomics, financial modeling** — links to S3 as data repo |
| **FSx for NetApp ONTAP** | **NFS, SMB, iSCSI** | Enterprise NAS; snapshots, replication, multi-protocol |
| **FSx for OpenZFS** | **NFS** | Linux workloads needing ZFS snapshots/clones |

**FSx for Lustre deployment types:**
- **SCRATCH** — no replication; highest performance; ephemeral HPC.
- **PERSISTENT** — replicated within AZ; longer-running workloads.

**FSx for Lustre + S3:** import/export data repository; **lazy loading from S3** for burst HPC without full copy.

### AWS Storage Gateway — hybrid cache

| Gateway type | Interface | Use case |
|---|---|---|
| **File Gateway** | **NFS/SMB** → S3 objects | On-prem apps write files; S3 is source of truth |
| **Volume Gateway — Cached** | **iSCSI**; hot data local, cold in S3 | Primary storage on-prem, async backup to S3 |
| **Volume Gateway — Stored** | **iSCSI**; full copy local + async S3 backup | Low-latency local with off-site backup |
| **Tape Gateway — VTL** | **Virtual tape library** → S3/Glacier | Replace physical tape backup |

> **Performance angle:** Cached volumes keep **recent/hot blocks local** for low-latency reads; async flush to S3.

### CloudFront caching (storage-adjacent)

- **Edge caches** S3/ALB/custom origins → cut latency and origin load.
- **Cache behaviors** per path; **TTL** (min/default/max); **Origin Shield** = extra regional cache layer.
- **Signed URLs/cookies** for private content without sacrificing cache hit ratio on public segments.

---

## T3.2 — High-performing compute solutions

### EC2 instance families (know the letter)

| Family | Letter | Optimized for | Examples |
|---|---|---|---|
| **General** | **M** | Balanced CPU/mem | M7g, M7i — web servers, small/medium DBs |
| **Compute** | **C** | **High CPU** | C7g — batch, gaming, HPC front-end |
| **Memory** | **R** | **High RAM** | R7i — in-memory DBs, caching, SAP |
| **Storage** | **I / Im / Is** | **High local NVMe IOPS** | I4i — NoSQL, data lakes on instance store |
| **Accelerated** | **P / G / Inf / Trn** | **GPU/ML/inference** | P5 (training), G6 (graphics), Inf2 (inference) |
| **HPC** | **Hpc** | **HPC clusters, low latency fabric** | Hpc7g |
| **Burstable** | **T** | Baseline + **CPU credits** | T4g — dev/test, low-traffic web |

**Graviton (g suffix):** ARM-based; better price/performance for supported workloads.

**Nitro-based instances:** higher network/EBS bandwidth, lower overhead — required for latest EBS features.

### Placement groups — latency & fault isolation

| Type | Behavior | Use when |
|---|---|---|
| **Cluster** | Instances in **same AZ**, **same rack** (lowest latency) | **HPC, tightly coupled**, low-latency node-to-node |
| **Spread** | **Max 7 instances per AZ**, distinct hardware | **Critical singletons** — avoid correlated hardware failure |
| **Partition** | Multiple racks (**partitions**); up to 7 partitions/AZ | **Hadoop, Cassandra, Kafka** — know which rack failed |

> **Exam trap:** Cluster = **performance** (same rack). Spread = **isolation** (different racks). Partition = **large distributed** with rack awareness.

### Elastic Network Interface (ENI)

- **Virtual NIC** attached to EC2; has **private IP**, optional **public IP**, **security groups**, **MAC**.
- **Multiple ENIs** per instance → multi-homing, separate SG per interface, **low-level network control**.
- **Enhanced Networking:** **SR-IOV** (Intel) or **ENA (Elastic Network Adapter)** → higher PPS, lower latency.
- **EFA (Elastic Fabric Adapter)** — **HPC/MPI**; OS-bypass for inter-node communication.

### AWS Lambda — concurrency & performance

| Concept | Detail |
|---|---|
| **Concurrency** | Max simultaneous executions (account limit; can request increase) |
| **Reserved concurrency** | **Guaranteed** capacity for a function; also **caps** max (noisy-neighbor control) |
| **Provisioned concurrency** | **Pre-warmed** execution environments → **eliminate cold starts** |
| **Cold start** | Init delay on first invoke or after scale-out; worse with large packages / VPC |
| **Memory setting** | More memory → **more CPU** proportionally; tune for duration vs cost |

> **Exam trap:** Need **consistent sub-second start** for user-facing API → **Provisioned Concurrency**. Need **guaranteed slots** but OK with cold starts → **Reserved Concurrency**.

### Containers — ECS, EKS, Fargate

| Option | You manage | Best for |
|---|---|---|
| **EC2 launch type** | EC2 instances + patching | Max control, GPU, custom AMIs, lowest cost at scale |
| **Fargate** | Nothing (serverless) | **No cluster ops**; per-task vCPU/mem; quick scale |
| **EKS** | Kubernetes control plane (AWS manages) | **K8s-native** teams, multi-cloud patterns |
| **ECS** | AWS-native orchestration | Simpler than K8s; tight AWS integration |

**Performance tips:**
- **awsvpc network mode** — each task gets own ENI (more isolation, ENI limits at scale).
- **Fargate Spot** — cheaper, interruptible tasks for fault-tolerant batch.
- **EKS + Managed Node Groups / Karpenter** — auto-scale nodes to pod demand.

### AWS Batch

- **Fully managed batch computing** — queues jobs, provisions **EC2/Spot/Fargate** compute.
- **No job scheduler to install** — submit container/batch jobs; Batch scales instances.
- Use for **ML preprocessing, genomics, financial simulations** (not real-time).

### Elastic Beanstalk

- **PaaS** — upload code; Beanstalk handles **capacity provisioning, load balancing, scaling, health**.
- Supports **Java, .NET, PHP, Node, Python, Ruby, Go, Docker**.
- Performance: configure **Auto Scaling triggers**, **Enhanced health**, **Immutable/Rolling deployments** to avoid downtime.

---

## T3.3 — High-performing database solutions

### Amazon RDS & Aurora

| Feature | RDS (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server) | Aurora |
|---|---|---|
| **Storage** | Up to 64 TiB (engine-dependent) | **Auto-scales** in 10 GB increments, up to 128 TiB |
| **Replicas** | **Read replicas** (async) | Up to **15 read replicas**, **low lag** (~ms) |
| **Failover** | Multi-AZ **synchronous standby** (~60–120 s) | **Storage-level**, **<30 s** typically |
| **Performance** | Provision instance class + **Provisioned IOPS (io1/io2/gp3)** | **Aurora I/O-Optimized** for I/O-heavy; **parallel query** |
| **Global** | Cross-region read replicas | **Aurora Global Database** — <1 s cross-region replication |
| **Serverless** | — | **Aurora Serverless v2** — auto-scales ACUs |

**RDS performance levers:** right-size instance; **Read Replicas** for read scaling; **ElastiCache** in front for session/cache; **Parameter groups** tune memory/buffers; **Aurora** for highest throughput OLTP on AWS.

### Amazon DynamoDB

| Concept | Detail |
|---|---|
| **Partition key** | Required; determines **which partition** stores the item |
| **Sort key** | Optional; enables **multiple items per partition** + range queries |
| **WCU** | 1 WCU = 1 write/s for item ≤1 KB (transactional 2×) |
| **RCU** | 1 RCU = 1 strongly consistent read/s OR 2 eventually consistent reads/s for item ≤4 KB |
| **Hot partition** | One partition key gets disproportionate traffic → throttling |
| **Fix hot keys** | **Random suffix**, write sharding, **DynamoDB Accelerator (DAX)** for reads |
| **On-demand vs Provisioned** | On-demand = auto-scale, pay per request; Provisioned + **Auto Scaling** = cheaper at steady load |
| **DAX** | **In-memory cache**; **microsecond** reads; **write-through**; item-level; **DynamoDB API compatible** |
| **Global Tables** | Multi-region, **active-active** replication |
| **Streams** | Ordered change feed → Lambda, Kinesis |

> **Exam trap:** Need **microsecond read latency** on DynamoDB → **DAX**. Need **sub-millisecond in-app object cache** with complex data structures → **ElastiCache Redis**.

### Amazon ElastiCache

| Engine | Data model | Best for |
|---|---|---|
| **Redis** | **Key-value + rich types** (lists, sets, sorted sets, streams) | **Session store, leaderboards, pub/sub, real-time analytics** |
| **Memcached** | Simple **key-value**, multithreaded | **Pure caching**, horizontal scale, no persistence needed |

**Redis modes:** **Cluster Mode Enabled** (sharding, horizontal scale) vs **Disabled** (single shard, replication).
**Performance:** place in **same AZ** as app; **Replication Group** for HA; **Global Datastore** for cross-region Redis.

### Analytics & specialty databases

| Service | Engine / Type | Performance profile |
|---|---|---|
| **Redshift** | **Columnar MPP** data warehouse | **Spectrum** queries S3 without load; **RA3** separates compute/storage; **Concurrency Scaling** for burst queries |
| **DocumentDB** | **MongoDB-compatible** | Separate storage/compute scales; **read replicas** for read scaling |
| **Neptune** | **Graph** (Gremlin, SPARQL) | **Billions of relationships**; **Neptune Analytics** for analytics on graph |
| **Timestream** | **Time-series** | Auto-tiering hot/cold storage; **scheduled queries**; IoT/metrics |
| **Keyspaces** | **Cassandra-compatible** | Wide-column, high write throughput, multi-region |
| **MemoryDB for Redis** | Redis-compatible, **durable** | Primary DB (not just cache); microsecond reads |

---

## T3.4 — High-performing network architectures

### Amazon CloudFront (CDN)

- **Edge locations** cache content close to users → **lower latency**, less origin load.
- **Origins:** S3, ALB, EC2, custom HTTP, **MediaPackage**, **Lambda@Edge / CloudFront Functions** for edge logic.
- **Behaviors:** path-based routing, TTL, **compress objects**, **HTTP/2 and HTTP/3**.
- **Origin Shield:** regional mid-tier cache — **reduces origin requests** for global audiences.
- **Field-level encryption, signed URLs** — security without sacrificing cache where possible.

### AWS Global Accelerator

- **Anycast static IP addresses** (2 per accelerator) → routes to **optimal regional endpoint** via AWS global network.
- **TCP/UDP** — good for **non-HTTP** (gaming, IoT, VoIP) and **HTTP** where you need static IPs.
- **Health checks** + **instant failover** across regions (no DNS TTL wait like Route 53 alone).
- **Client affinity** — stick sessions to one endpoint when needed.

> **CloudFront vs Global Accelerator:** CloudFront = **HTTP/HTTPS content caching** at edge. Global Accelerator = **network-level routing optimization** (any protocol), **static IPs**, **no caching** (unless you add something else).

### AWS Direct Connect

- **Dedicated private connection** on-prem ↔ AWS (via DX location/partner).
- **Virtual Interfaces (VIF):** **Private VIF** → VPC; **Public VIF** → S3, DynamoDB public endpoints.
- **Direct Connect Gateway** — one DX to **multiple VPCs/regions**.
- **Performance:** **consistent latency & bandwidth** vs VPN over internet; **lower jitter** for hybrid workloads.
- **DX + VPN** — backup path; **Transit Gateway** aggregates VPC + DX + VPN.

### VPC design for performance

| Pattern | Purpose |
|---|---|
| **Multi-AZ subnets** | Place app tiers across AZs for HA **and** locality to AZ-local resources (RDS, ElastiCache) |
| **Placement groups (cluster)** | HPC/low-latency EC2-to-EC2 in same AZ |
| **Enhanced networking (ENA)** | Higher bandwidth/PPS on EC2 |
| **VPC endpoints (Gateway)** | **S3, DynamoDB** — traffic stays on AWS network, no NAT |
| **VPC endpoints (Interface / PrivateLink)** | **Private access** to AWS services & SaaS — no internet/NAT |
| **NAT Gateway** | Outbound internet for private subnets (per-AZ for HA) — **cost + bandwidth limit**; prefer endpoints when possible |
| **Transit Gateway** | **Hub** connecting VPCs, DX, VPN — scalable east-west traffic |
| **PrivateLink** | Expose **your service** to consumers via **NLB/ALB + endpoint service**; consumer uses **interface endpoint** |

### AWS PrivateLink (interface VPC endpoints)

- **Service provider** publishes NLB behind **VPC Endpoint Service**.
- **Consumer** creates **Interface Endpoint (ENI)** in their VPC → **private connectivity**, no public internet.
- Use for **SaaS integration**, **shared services account**, **restricting exposure** to partner networks.

---

## T3.5 — High-performing data ingestion and transformation

### Amazon Kinesis family

| Service | Model | Throughput / Latency | Use case |
|---|---|---|---|
| **Kinesis Data Streams** | **Real-time streaming**; shards (1 MB/s in, 2 MB/s out per shard) | **Real-time**; retain 1–365 days | **Custom consumers**, ordering per partition key, replay |
| **Kinesis Data Firehose** | **Fully managed delivery** to S3/Redshift/OpenSearch/Splunk | **Near real-time** (~60 s buffer) | **No admin** — ingest and land in destination |
| **Kinesis Data Analytics** | **SQL / Flink** on streams | Real-time analytics | **Windowed aggregations**, anomaly detection |
| **Kinesis Video Streams** | Video ingest | — | Camera / video analytics |

**Scaling Data Streams:** **reshard** (split/merge) or **On-Demand mode** (auto-scale).
**Enhanced Fan-Out (EFO):** **dedicated 2 MB/s per consumer** per shard — multiple consumers without shared read limits.

> **Exam trap:** Need **real-time custom processing with your own code** → **Data Streams + Lambda/consumer**. Need **simple load to S3/Redshift** → **Firehose**.

### AWS Glue

- **Serverless ETL** — **crawl** data (Glue Crawler → **Data Catalog**), **transform** (Spark jobs), **schedule**.
- **Glue Studio** visual ETL; **Glue DataBrew** no-code prep.
- **Performance:** **job bookmarks** (incremental), **Flex executions** (cheaper, slower), right-size **DPUs**.

### Amazon Athena

- **Serverless SQL** on **S3** (Parquet/ORC/JSON/CSV); pay per **TB scanned**.
- **Performance:** **partition** tables (e.g., `year/month/day`); use **columnar formats** (Parquet); **compress**; **Glue Crawler** for schema.
- **Athena Federated Query** — query across RDS, DynamoDB, etc. via **connectors**.

### Amazon EMR

- **Managed Hadoop/Spark/Hive/Presto/HBase** clusters on EC2 or **EMR on EKS**.
- **Performance:** **instance fleets** (Spot + On-Demand mix); **transient clusters** for batch; **EMRFS** → S3 as primary storage.
- Use for **large-scale batch ETL, ML feature engineering, log processing** — not low-latency serving.

### AWS Lake Formation

- **Build secure data lakes** on S3; **central permissions** (table/column level); **blueprint** ingestion.
- Works with **Glue Catalog**, **Athena**, **Redshift Spectrum**, **EMR**.
- **Performance angle:** governed **central catalog** so teams query same optimized S3 layout (partitions, Parquet).

### Amazon QuickSight

- **Serverless BI** — dashboards, **SPICE** in-memory engine for fast interactive queries.
- **Performance:** import to **SPICE** for speed; **Direct Query** for live data (slower, always fresh).

---

## Storage comparison table (exam-ready)

| Need | Choose | Why |
|---|---|---|
| Object storage, unlimited scale | **S3** | 11 nines durability; prefix scaling |
| Block storage, single EC2 boot | **EBS gp3** | General purpose; tune IOPS |
| Highest block IOPS | **EBS io2 Block Express** | Up to 256k IOPS |
| Sequential throughput, big data | **EBS st1** | Throughput-optimized HDD |
| Shared Linux file system, auto-scale | **EFS** | NFS, multi-AZ |
| Windows SMB shares | **FSx for Windows** | AD integration |
| HPC / ML on Lustre | **FSx for Lustre** | S3 integration, parallel FS |
| Hybrid cache to S3 | **Storage Gateway File/Cached** | Local latency, cloud backing |

## Database comparison table (exam-ready)

| Pattern | Service | Why |
|---|---|---|
| Relational OLTP, open source | **RDS PostgreSQL/MySQL** | Familiar SQL, Multi-AZ |
| Highest-performance OLTP | **Aurora** | Distributed storage, fast replicas |
| Key-value, massive scale, ms latency | **DynamoDB** | Auto-scale partitions |
| Microsecond DynamoDB reads | **DAX** | In-memory cache |
| Session/cache, complex structures | **ElastiCache Redis** | Sub-ms, rich types |
| Simple object cache | **ElastiCache Memcached** | Multithreaded, horizontal |
| Data warehouse / analytics | **Redshift** | Columnar MPP |
| Graph relationships | **Neptune** | Gremlin/SPARQL |
| Time-series IoT metrics | **Timestream** | Auto-tiering |
| MongoDB API | **DocumentDB** | Managed, scalable |

## Compute comparison table (exam-ready)

| Pattern | Choose | Why |
|---|---|---|
| Long-running app, full OS control | **EC2** | Any software, placement groups |
| Event-driven, no servers | **Lambda** | Auto-scale; Provisioned Concurrency kills cold starts |
| Containers, no K8s | **ECS on Fargate** | AWS-native, serverless tasks |
| Kubernetes | **EKS** | K8s ecosystem |
| Batch / HPC jobs | **AWS Batch** or **EC2 Cluster placement** | Job queues vs lowest latency |
| Quick deploy web app | **Elastic Beanstalk** | Managed platform |

---

## Confusion pairs (memorize these)

| Pair | Key difference |
|---|---|
| **CloudFront vs Global Accelerator** | CF = **HTTP cache** at edge. GA = **anycast IP, any protocol**, network path optimization, **no cache** |
| **S3 Transfer Acceleration vs CloudFront → S3** | TA = **faster upload** via edge. CF = **cache reads** for many users worldwide |
| **EBS st1 vs sc1** | st1 = **throughput** HDD for **frequent sequential**. sc1 = **cold** HDD, cheapest, slowest |
| **EBS gp3 vs io2** | gp3 = **general**, cheap, up to 16k IOPS. io2 = **provisioned IOPS**, predictable, mission-critical |
| **EFS General Purpose vs Max I/O** | GP = **low latency** default. Max I/O = **higher ops**, higher latency |
| **EFS vs FSx for Lustre** | EFS = **general NFS**. Lustre = **HPC parallel**, massive throughput, S3 repo |
| **Placement group Cluster vs Spread** | Cluster = **same rack, low latency**. Spread = **different hardware, max 7/AZ** |
| **Lambda Provisioned vs Reserved concurrency** | Provisioned = **pre-warmed, no cold start**. Reserved = **guaranteed cap/floor**, still can cold start |
| **ECS Fargate vs EC2 launch type** | Fargate = **no instances to manage**. EC2 = **more control**, GPU, cheaper at scale |
| **DynamoDB DAX vs ElastiCache Redis** | DAX = **DynamoDB API only**, microsecond, write-through. Redis = **general cache**, app-managed |
| **DynamoDB Streams vs Kinesis Data Streams** | DDB Streams = **change data capture** from table. Kinesis = **general event streaming** |
| **Kinesis Data Streams vs Firehose** | Streams = **custom consumers, real-time, shards**. Firehose = **managed delivery** to destinations |
| **Athena vs Redshift** | Athena = **serverless ad hoc** on S3, per query. Redshift = **provisioned DW**, complex joins at scale |
| **Athena vs Glue** | Athena = **query**. Glue = **ETL + catalog** |
| **EMR vs Glue** | EMR = **big Spark/Hadoop** clusters. Glue = **serverless** ETL jobs |
| **Direct Connect vs VPN** | DX = **dedicated, consistent**. VPN = **encrypted over internet**, cheaper, higher jitter |
| **PrivateLink vs VPC Gateway Endpoint** | PrivateLink = **Interface ENI**, AWS services & **your SaaS**. Gateway = **S3/DynamoDB only**, route table entry |
| **NAT Gateway vs Internet Gateway** | IGW = **public subnet** bidirectional internet. NAT = **private subnet outbound only** |
| **Aurora vs RDS Multi-AZ** | Aurora = **storage replication**, faster failover, more replicas. RDS Multi-AZ = **standby instance** |
| **Read Replica vs Multi-AZ** | Replica = **read scaling**, async. Multi-AZ = **failover**, sync standby |
| **Global Accelerator vs Route 53 Latency routing** | GA = **static anycast IP**, TCP/UDP, instant health failover. R53 = **DNS-based**, TTL delay |

---

## Domain 3 quick-fire Qs (self-check)

- Q: Upload 500 GB backup from Tokyo to us-east-1 S3 bucket → **S3 Transfer Acceleration**.
- Q: Video app needs only first 2 seconds of a 10 GB S3 object → **Byte-range GET**.
- Q: Oracle DB needs 80k sustained random IOPS → **EBS io2** on **EBS-optimized Nitro** instance.
- Q: Log analytics, large sequential reads, cost-sensitive → **EBS st1**.
- Q: Shared Linux home directories across 50 EC2 instances → **EFS** (General Purpose).
- Q: ML training needs parallel FS with S3 as backing store → **FSx for Lustre** (Scratch or Persistent).
- Q: HPC MPI jobs need lowest inter-node latency → **Cluster placement group** + **EFA**.
- Q: Run exactly 3 critical instances on separate hardware → **Spread placement group**.
- Q: API Gateway + Lambda must never cold-start for users → **Provisioned Concurrency**.
- Q: DynamoDB hot partition key causing throttling → **Randomize suffix** on sort key or **DAX** for read-heavy.
- Q: Session store with TTL and complex data types → **ElastiCache Redis**.
- Q: Pure HTML/static assets globally, reduce S3 GET costs → **CloudFront** with S3 origin.
- Q: UDP gaming traffic, static IP, failover between us-east-1 and eu-west-1 → **Global Accelerator**.
- Q: On-prem app needs consistent 1 Gbps to VPC without internet variance → **Direct Connect**.
- Q: SaaS provider exposes API only to customer VPCs privately → **PrivateLink** (endpoint service).
- Q: Stream click events, custom Lambda processor, preserve order per user → **Kinesis Data Streams** (partition key = userId).
- Q: Load IoT telemetry to S3 Parquet with zero shard management → **Kinesis Data Firehose**.
- Q: Ad hoc SQL on 500 TB S3 data lake, minimize scan cost → **Athena** + **partitioned Parquet**.
- Q: Nightly 10 TB Spark ETL → **EMR** (Spot instances) or **Glue** (serverless, smaller jobs).
- Q: BI dashboards on aggregated data, sub-second drill-down → **QuickSight SPICE**.

---

*Content aligned to AWS SAA-C03 Exam Content Overview — Domain 3: Design High-Performing Architectures. Verify limits/pricing on official AWS docs before exam day.*
