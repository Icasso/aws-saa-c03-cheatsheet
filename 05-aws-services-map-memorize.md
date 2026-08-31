# AWS Services Memorize — map every named service to its job
*Most "which service?" questions are pure recall. Learn this table cold.*

## Compute
| Service | Job | Domain |
|---|---|---|
| **Amazon EC2** | Virtual servers; instance types (general, compute, memory, storage, GPU) | 2, 3, 4 |
| **AWS Lambda** | Serverless functions; event-driven, pay-per-invocation | 2, 3, 4 |
| **Amazon ECS** | Docker container orchestration on EC2 or Fargate | 2, 3 |
| **Amazon EKS** | Managed Kubernetes | 2, 3 |
| **AWS Fargate** | Serverless compute for ECS/EKS — no EC2 to manage | 2, 3, 4 |
| **AWS Batch** | Run batch/parallel jobs at any scale | 3 |
| **Elastic Beanstalk** | PaaS — deploy apps without managing infra | 2, 3 |
| **AWS Outposts** | Run AWS infra on-premises | 1, 2 |

## Storage
| Service | Job | Domain |
|---|---|---|
| **Amazon S3** | Object storage; 11 nines durability; versioning, lifecycle, CRR | 2, 3, 4 |
| **Amazon EBS** | Block storage attached to EC2 (gp3, io2, st1, sc1) | 2, 3, 4 |
| **Amazon EFS** | Managed NFS file storage; shared across EC2 | 2, 3, 4 |
| **Amazon FSx** | Managed Windows (SMB), Lustre, NetApp ONTAP, OpenZFS | 3 |
| **AWS Storage Gateway** | Hybrid on-prem ↔ cloud storage bridge | 3 |
| **AWS Snow Family** | Physical data transfer (Snowball, Snowmobile) | 3 |
| **Amazon S3 Glacier** | Archive storage (Instant/Flexible/Deep Archive tiers) | 3, 4 |

## Database
| Service | Job | Domain |
|---|---|---|
| **Amazon RDS** | Managed relational DB (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server) | 2, 3, 4 |
| **Amazon Aurora** | AWS-native MySQL/PostgreSQL; Multi-AZ, serverless, global DB | 2, 3, 4 |
| **Amazon DynamoDB** | Serverless NoSQL key-value/document; single-digit ms latency | 2, 3, 4 |
| **Amazon ElastiCache** | In-memory cache (Redis or Memcached) | 3, 4 |
| **Amazon Redshift** | Data warehouse / analytics | 3, 4 |
| **Amazon DocumentDB** | MongoDB-compatible | 3 |
| **Amazon Neptune** | Graph database | 3 |
| **Amazon Timestream** | Time-series database | 3 |
| **Amazon DMS** | Database migration service (homogeneous + heterogeneous) | 2, 3 |

## Networking & Content Delivery
| Service | Job | Domain |
|---|---|---|
| **Amazon VPC** | Isolated virtual network; subnets, route tables, IGW, NAT | 1, 2, 3 |
| **Elastic Load Balancing** | ALB (L7), NLB (L4), GWLB (security appliances), CLB (legacy) | 2, 3 |
| **Amazon Route 53** | DNS + routing policies + health checks | 2, 3 |
| **Amazon CloudFront** | CDN; edge caching, signed URLs/cookies | 2, 3, 4 |
| **AWS Global Accelerator** | Anycast static IPs; TCP/UDP performance to AWS | 3 |
| **AWS VPN** | Site-to-Site VPN, Client VPN | 1, 2 |
| **AWS Direct Connect** | Dedicated private network connection to AWS | 1, 2, 4 |
| **AWS Transit Gateway** | Hub for VPC/VPN/DX connectivity | 1, 2, 3 |
| **AWS PrivateLink** | Private connectivity to AWS services / your services | 1, 3, 4 |
| **VPC Endpoints** | Gateway (S3/DynamoDB) or Interface (other services) — private access | 1, 4 |
| **AWS WAF** | Web application firewall (Layer 7 rules) | 1 |
| **AWS Shield** | DDoS protection (Standard free, Advanced paid) | 1 |
| **AWS Network Firewall** | Managed network firewall for VPC | 1 |

## Security, Identity & Compliance
| Service | Job | Domain |
|---|---|---|
| **AWS IAM** | Users, groups, roles, policies; least privilege | 1 |
| **IAM Identity Center** | SSO for AWS accounts and SaaS apps (formerly AWS SSO) | 1 |
| **Amazon Cognito** | User pools (auth) + identity pools (AWS creds for users) | 1 |
| **AWS KMS** | Managed encryption keys | 1 |
| **AWS CloudHSM** | Dedicated hardware security module (FIPS 140-2 Level 3) | 1 |
| **AWS Secrets Manager** | Rotate and manage secrets (DB creds, API keys) | 1 |
| **SSM Parameter Store** | Config/secrets storage (Standard free, Advanced paid) | 1 |
| **AWS Certificate Manager (ACM)** | Provision/manage TLS certificates (free for AWS services) | 1 |
| **Amazon Macie** | Discover/classify sensitive data (PII) in S3 | 1 |
| **Amazon GuardDuty** | Threat detection (ML-based) | 1 |
| **Amazon Inspector** | Vulnerability scanning for EC2/containers/Lambda | 1 |
| **AWS Security Hub** | Centralized security findings aggregator | 1 |
| **AWS Config** | Resource configuration tracking + compliance rules | 1 |
| **AWS CloudTrail** | API audit log (who did what, when) | 1 |
| **AWS Artifact** | Compliance reports (SOC, ISO, PCI, HIPAA) | 1 |
| **AWS Organizations** | Multi-account management + SCPs | 1 |
| **AWS Control Tower** | Multi-account landing zone / governance | 1 |

## Application Integration & Messaging
| Service | Job | Domain |
|---|---|---|
| **Amazon SQS** | Managed message queue (Standard or FIFO) | 2 |
| **Amazon SNS** | Pub/sub notifications (fan-out to SQS/Lambda/HTTP/email) | 2 |
| **Amazon EventBridge** | Event bus; schedule rules; SaaS integration | 2 |
| **Amazon API Gateway** | Managed REST/WebSocket/HTTP APIs | 2, 3 |
| **AWS Step Functions** | Serverless workflow orchestration | 2, 3 |
| **Amazon MQ** | Managed message broker (ActiveMQ/RabbitMQ) | 2 |

## Analytics & Data
| Service | Job | Domain |
|---|---|---|
| **Amazon Kinesis Data Streams** | Real-time streaming data ingestion | 3 |
| **Amazon Kinesis Data Firehose** | Load streaming data to S3/Redshift/OpenSearch | 3 |
| **AWS Glue** | Serverless ETL + Data Catalog | 3 |
| **Amazon Athena** | Serverless SQL on S3 (pay per query) | 3, 4 |
| **Amazon EMR** | Managed Hadoop/Spark big data | 3 |
| **AWS Lake Formation** | Build/manage data lakes | 3 |
| **Amazon OpenSearch Service** | Search + log analytics | 3 |
| **Amazon QuickSight** | Business intelligence / dashboards | 3 |

## Management & Monitoring
| Service | Job | Domain |
|---|---|---|
| **Amazon CloudWatch** | Metrics, alarms, logs, dashboards | 2, 3 |
| **AWS Auto Scaling** | Scale EC2/ECS/DynamoDB based on demand | 2, 3, 4 |
| **AWS CloudFormation** | Infrastructure as Code (templates/stacks) | 2 |
| **AWS Trusted Advisor** | Best-practice recommendations (cost, security, performance) | 1, 4 |
| **AWS Cost Explorer** | Visualize and analyze AWS spending | 4 |
| **AWS Budgets** | Set spending alerts and actions | 4 |
| **AWS Backup** | Centralized backup across services | 2 |
| **AWS Systems Manager** | Patch, run commands, parameter store, session manager | 1, 2 |

## Migration
| Service | Job | Domain |
|---|---|---|
| **AWS Application Migration Service (MGN)** | Lift-and-shift server migration (formerly SMS) | 2 |
| **AWS Database Migration Service (DMS)** | Migrate databases with minimal downtime | 2, 3 |
| **AWS DataSync** | Online data transfer on-prem ↔ AWS | 3 |
| **AWS Transfer Family** | SFTP/FTPS/FTP into S3/EFS | 3 |

## Concept → "which service" cheat
- Need **virtual server** → **EC2**
- Need **no server management, event-driven** → **Lambda**
- Need **containers without managing servers** → **Fargate**
- Need **object storage** → **S3**
- Need **block storage for one EC2** → **EBS**
- Need **shared file system across EC2** → **EFS**
- Need **relational DB** → **RDS** (or **Aurora** for AWS-native HA)
- Need **NoSQL, single-digit ms, serverless** → **DynamoDB**
- Need **in-memory cache** → **ElastiCache**
- Need **data warehouse** → **Redshift**
- Need **decouple components** → **SQS** (queue) or **SNS** (fan-out)
- Need **orchestrate workflows** → **Step Functions**
- Need **API front door** → **API Gateway**
- Need **CDN / edge cache** → **CloudFront**
- Need **DNS + failover routing** → **Route 53**
- Need **private subnet internet outbound** → **NAT Gateway**
- Need **private access to S3/DynamoDB** → **VPC Gateway Endpoint**
- Need **private access to other AWS APIs** → **VPC Interface Endpoint**
- Need **encrypt at rest with your keys** → **KMS** (or **CloudHSM** for dedicated HSM)
- Need **rotate DB passwords automatically** → **Secrets Manager**
- Need **store config (not auto-rotate)** → **SSM Parameter Store**
- Need **free TLS cert for ALB/CloudFront** → **ACM**
- Need **block SQL injection at edge** → **WAF**
- Need **DDoS protection** → **Shield**
- Need **audit API calls** → **CloudTrail**
- Need **track resource config changes** → **Config**
- Need **compliance reports** → **Artifact**
- Need **find PII in S3** → **Macie**
- Need **threat detection** → **GuardDuty**
- Need **vulnerability scan** → **Inspector**
- Need **multi-account guardrails** → **Organizations + SCPs**
- Need **steady-state compute discount** → **Reserved Instances / Savings Plans**
- Need **cheapest interruptible compute** → **Spot Instances**
- Need **migrate DB with near-zero downtime** → **DMS**
- Need **lift-and-shift VMs** → **Application Migration Service (MGN)**

## Confusion pairs to NOT get wrong
- **Security Group** (stateful, instance) ≠ **NACL** (stateless, subnet).
- **NAT Gateway** (managed, HA per-AZ) ≠ **NAT Instance** (self-managed, single point of failure).
- **Internet Gateway** (VPC↔internet) ≠ **NAT Gateway** (private subnet outbound only).
- **ALB** (L7 HTTP routing) ≠ **NLB** (L4 TCP/UDP, static IP, ultra-low latency).
- **SQS** (pull queue, 1 consumer) ≠ **SNS** (push pub/sub, many subscribers).
- **SQS Standard** (at-least-once) ≠ **SQS FIFO** (exactly-once, ordering).
- **Secrets Manager** (auto-rotate secrets) ≠ **SSM Parameter Store** (config, manual rotation).
- **KMS** (shared multi-tenant keys) ≠ **CloudHSM** (dedicated hardware, full key control).
- **Multi-AZ** (sync failover, HA) ≠ **Read Replica** (async, read scaling / DR).
- **Aurora** (AWS-native, auto storage) ≠ **RDS** (traditional managed RDBMS).
- **DynamoDB** (NoSQL, key-value) ≠ **RDS** (relational, SQL).
- **ElastiCache Redis** (persistence, complex) ≠ **Memcached** (simple, no persistence).
- **CloudFront** (HTTP CDN cache) ≠ **Global Accelerator** (TCP/UDP anycast, no caching).
- **VPC Gateway Endpoint** (S3, DynamoDB, free) ≠ **Interface Endpoint** (other services, per-hour).
- **Site-to-Site VPN** (encrypted over internet) ≠ **Direct Connect** (dedicated private line).
- **AWS Backup** (centralized backup) ≠ **EBS Snapshots** (per-volume, manual/scheduled).
- **CloudWatch** (metrics/logs/alarms) ≠ **CloudTrail** (API audit) ≠ **Config** (resource state).
- **Reserved Instances** (specific instance family) ≠ **Savings Plans** (flexible compute commitment).
- **Spot** (interruptible, cheapest) ≠ **On-Demand** (no commitment, most expensive per hour).
- **S3 Standard** (frequent access) ≠ **S3 Glacier** (archive, retrieval minutes–hours).
- **EventBridge** (event bus, routing) ≠ **SNS** (notification fan-out) ≠ **SQS** (work queue).
- **API Gateway** (HTTP API front) ≠ **ALB** (load balance to backends).
- **DMS** (database migration) ≠ **MGN** (server/VM migration).
- **Athena** (ad-hoc SQL on S3) ≠ **Redshift** (persistent data warehouse).
- **Kinesis Data Streams** (custom consumers, real-time) ≠ **Kinesis Firehose** (load to destinations).

---

## Developer Tools & CI/CD
| Service | Job | Domain |
|---|---|---|
| **CodeCommit** | Managed Git repos | 2 |
| **CodeBuild** | Managed build (compile, test) | 2, 3 |
| **CodeDeploy** | Automated deployment (blue/green, rolling) | 2 |
| **CodePipeline** | CI/CD orchestration | 2 |
| **CloudFormation** | Infrastructure as Code | 2 |
| **CDK** | IaC in programming languages | 2 |
| **SAM** | Serverless IaC | 2, 3 |

## Migration & Transfer
| Service | Job | Domain |
|---|---|---|
| **MGN** | Server/VM lift-and-shift migration | 2 |
| **DMS** | Database migration with CDC | 2, 3 |
| **DataSync** | Online data transfer on-prem ↔ AWS | 3 |
| **Transfer Family** | SFTP/FTPS/FTP to S3/EFS | 3 |
| **Snowball / Snowmobile** | Physical offline data transfer | 3 |

## IoT
| Service | Job | Domain |
|---|---|---|
| **IoT Core** | Device connectivity (MQTT/HTTP) | 3 |
| **IoT Greengrass** | Edge computing for devices | 3 |
| **IoT Analytics** | IoT data processing | 3 |

## Additional In-Scope Services
| Service | Job | Domain |
|---|---|---|
| **App Runner** | Containerized web apps from source | 3 |
| **App Mesh** | Service mesh for microservices | 2, 3 |
| **Lake Formation** | Data lake governance | 3 |
| **OpenSearch Service** | Search + log analytics | 3 |
| **MWAA** | Managed Apache Airflow | 3 |
| **Firewall Manager** | Centralized WAF/SG management | 1 |
| **RAM** | Share resources across accounts | 1, 2 |
| **Service Catalog** | Governed self-service provisioning | 2 |
| **Compute Optimizer** | Rightsizing recommendations | 4 |
| **Cost Anomaly Detection** | ML-based spend alerts | 4 |
| **S3 Storage Lens** | Org-wide storage analytics | 4 |
| **S3 Object Lambda** | Transform objects on GET | 3 |
| **S3 Access Points** | Named S3 endpoints with policies | 1, 4 |

---

## "If the question mentions X → pick Y" Master Table

| Question mentions… | Pick… |
|---|---|
| access keys on EC2 | IAM Role |
| automatic secret rotation | Secrets Manager |
| SSO / multiple accounts | IAM Identity Center |
| org-wide deny guardrail | SCP |
| SQL injection / XSS | WAF |
| DDoS | Shield |
| threat / anomaly / compromised | GuardDuty |
| vulnerability / CVE / patch | Inspector |
| PII in S3 | Macie |
| compliance report SOC/ISO | Artifact |
| who called API / audit | CloudTrail |
| is encryption on / config rule | Config |
| centralized security dashboard | Security Hub |
| outbound internet private subnet | NAT Gateway |
| private S3 access | Gateway Endpoint |
| private KMS/SNS/SQS access | Interface Endpoint |
| SSH without port 22 | SSM Session Manager |
| decouple / buffer / queue | SQS |
| fan-out / notify many | SNS |
| event routing / cron schedule | EventBridge |
| workflow orchestration | Step Functions |
| read scaling DB | Read Replica |
| HA DB failover | Multi-AZ |
| cross-region DR DB | Aurora Global DB |
| global static content | CloudFront |
| global TCP/UDP latency | Global Accelerator |
| nearest region routing | Route 53 Latency |
| active/passive DNS failover | Route 53 Failover |
| gradual traffic shift | Route 53 Weighted |
| serverless API | API Gateway + Lambda |
| NoSQL serverless | DynamoDB on-demand |
| cache DynamoDB reads | DAX |
| cache RDS queries | ElastiCache |
| data warehouse | Redshift |
| SQL on S3 files | Athena |
| real-time streaming | Kinesis Data Streams |
| load stream to S3 | Kinesis Firehose |
| ETL / data catalog | Glue |
| migrate database | DMS |
| migrate servers/VMs | MGN |
| IaC | CloudFormation |
| steady compute discount | RI / Savings Plans |
| interruptible compute | Spot |
| archive storage | Glacier |
| infrequent S3 access | IA / Intelligent-Tiering |
| immutable / WORM | Object Lock |
| FIPS HSM | CloudHSM |
| TLS certificate | ACM |
| mobile app sign-in | Cognito User Pool |
| users upload to S3 | Cognito Identity Pool |
| hub VPC connectivity | Transit Gateway |
| dedicated private line | Direct Connect |
| rightsizing | Compute Optimizer |
| spending alert | Budgets |
| cost spike detection | Cost Anomaly Detection |
| centralized WAF rules | Firewall Manager |
| Windows file share | FSx for Windows |
| HPC file system | FSx for Lustre |
| HPC low latency | Placement Group Cluster |
| 15+ VPCs connected | Transit Gateway |
| offer API privately | PrivateLink |
| detect manual infra changes | CloudFormation drift |
| provisioned Lambda no cold start | Provisioned Concurrency |
| mix On-Demand + Spot in ASG | Mixed Instances Policy |
