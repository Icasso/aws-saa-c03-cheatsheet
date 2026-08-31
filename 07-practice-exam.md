# Practice Exam — AWS Certified Solutions Architect — Associate (SAA-C03)
**40 scenario questions, domain-tagged. Solve them FIRST. Answer key + explanations at the bottom
(scrolled past the questions — don't skip over it but don't read it early).**

Style notes: real exam includes MCQ (one correct) and multiple-response ("Select all that apply"
— usually 2–4 correct AND trap wrong options). I've flagged multi-answers with [M].
Time yourself to **~130 min** (matches real exam duration) but practice speed doesn't matter —
accuracy matters.

---

## QUESTIONS

**Q1. [D1]** A company runs a web application on EC2 instances that must read objects from an S3
bucket without storing long-term AWS credentials on the servers. Which approach meets the requirement
with least operational overhead?
- A. Create an IAM user per EC2 instance and embed access keys in user data
- B. **Attach an IAM role to the EC2 instance profile with an S3 read policy**
- C. Store access keys in a file on the root EBS volume with chmod 600
- D. Share one IAM user's access keys across all instances via Secrets Manager

**Q2. [D1]** An application in private subnets must download security patches from the internet.
The architecture must be highly available and managed by AWS. What should be deployed?
- A. A NAT instance in one private subnet with an Elastic IP
- B. **NAT gateways in each Availability Zone used by the private subnets**
- C. An internet gateway attached directly to the private subnets
- D. A VPC peering connection to a partner VPC with internet access

**Q3. [D1]** A security team wants stateful, instance-level firewall rules that automatically allow
return traffic for established connections and support referencing other instances by security group
ID. Which control should they use?
- A. Network ACL
- B. **Security group**
- C. AWS WAF web ACL
- D. Route table entry

**Q4. [D1]** A healthcare company must encrypt all patient records at rest in S3 using keys that
the company fully controls and can audit usage of. Which approach is MOST appropriate?
- A. SSE-S3 with AWS-managed keys only
- B. **SSE-KMS with a customer-managed CMK and key policies**
- C. Client-side encryption with no KMS involvement
- D. Disable encryption because S3 is already durable

**Q5. [D1]** A microservices team needs to rotate database credentials automatically and retrieve
them programmatically with audit logging. Which AWS service should they use?
- A. AWS Systems Manager Parameter Store (Standard tier only)
- B. **AWS Secrets Manager**
- C. Store credentials in an encrypted S3 object
- D. Hard-code credentials in AWS CloudFormation templates

**Q6. [D1]** A VPC-hosted application must access S3 and DynamoDB without traffic traversing the
public internet or a NAT gateway. Which combination achieves this MOST cost-effectively?
- A. Interface VPC endpoints for both S3 and DynamoDB
- B. **A gateway VPC endpoint for S3 and a gateway VPC endpoint for DynamoDB**
- C. NAT gateway plus privateLink for each service
- D. AWS Direct Connect to every AWS service endpoint

**Q7. [D1]** A public-facing API must block SQL injection and rate-limit abusive clients at the edge
before traffic reaches the application load balancer. Which service should be deployed?
- A. AWS Shield Standard only
- B. **AWS WAF attached to the Application Load Balancer (or CloudFront)**
- C. Security group deny rules for known bad IPs only
- D. AWS Network Firewall inside the VPC only

**Q8. [D1]** Which of the following are IAM best practices for production AWS accounts?
[Select all that apply.] [M]
- A. **Enable MFA for privileged users**
- B. **Use roles instead of long-term access keys for applications**
- C. **Apply least-privilege policies and review permissions regularly**
- D. **Share the root account access keys with the DevOps team for emergencies**

**Q9. [D1]** Account B must allow developers in Account A to assume a role in Account B to manage
specific resources, without creating IAM users in Account B for each developer. What should be
configured?
- A. IAM user federation with Active Directory in Account B for every developer
- B. **A cross-account IAM role in Account B with a trust policy allowing Account A principals**
- C. Copy IAM users from Account A into Account B nightly
- D. Store Account B access keys in Account A's Parameter Store

**Q10. [D1]** A company must encrypt data in transit between users and its Application Load Balancer
using a custom domain name. Which AWS service provides and manages the TLS certificate?
- A. AWS KMS
- B. **AWS Certificate Manager (ACM)**
- C. AWS Secrets Manager
- D. Amazon CloudFront only (ALB cannot terminate TLS)

**Q11. [D1]** An organization uses AWS Organizations and wants to prevent member accounts from disabling
CloudTrail or creating public S3 buckets, regardless of local administrator actions. What should they
implement?
- A. IAM permission boundaries on every user
- B. **Service control policies (SCPs) attached to the organization or OU**
- C. Security groups on the management account only
- D. AWS Config rules without remediation

**Q12. [D1]** Database instances in private subnets must connect to Amazon RDS in the same VPC.
Application servers should NOT be reachable from the internet. Which subnet placement is correct?
- A. RDS and application EC2 in public subnets; block port 22 in the security group
- B. **RDS and application EC2 in private subnets; ALB in public subnets**
- C. RDS in public subnets; application EC2 in private subnets
- D. All resources in public subnets with NACL deny on port 443

**Q13. [D2]** A production MySQL database on RDS must survive the loss of an entire Availability Zone
with automatic failover and minimal manual intervention. Which configuration meets the requirement?
- A. Single-AZ RDS with automated backups
- B. **Multi-AZ RDS deployment with synchronous standby**
- C. Read replica in another Region only
- D. Daily manual snapshots copied to S3

**Q14. [D2]** An order-processing system receives bursts of orders. Workers can process orders
asynchronously and occasional duplicate processing is acceptable. Which queue type should be used?
- A. Amazon SQS FIFO queue with content-based deduplication
- B. **Amazon SQS standard queue**
- C. Amazon SNS topic with no subscribers
- D. Amazon Kinesis Data Streams with one shard

**Q15. [D2]** When a new image is uploaded to S3, multiple Lambda functions must run in parallel to
generate thumbnails, scan for malware, and update metadata. Which pattern is MOST appropriate?
- A. SQS queue with one consumer Lambda
- B. **SNS topic with multiple Lambda subscriptions (fan-out)**
- C. Direct synchronous Lambda invoke from the upload API
- D. AWS Step Functions with a single task

**Q16. [D2]** A company runs an active-passive DR site. When the primary Region fails health checks,
traffic must automatically fail over to the secondary Region's static IP endpoints. Which Route 53
routing policy should be used?
- A. Simple routing
- B. Weighted routing only
- C. **Failover routing with health checks**
- D. Geolocation routing

**Q17. [D2]** A financial application requires ultra-low latency TCP traffic handling millions of
connections per second with static IP addresses and preservation of the client source IP. Which load
balancer type should be used?
- A. Application Load Balancer
- B. **Network Load Balancer**
- C. Classic Load Balancer only
- D. Amazon CloudFront distribution

**Q18. [D2]** Web traffic spikes unpredictably during product launches. The web tier is stateless
behind a load balancer. Which service automatically adds and removes EC2 instances based on demand?
- A. AWS Elastic Beanstalk only (no scaling configuration)
- B. **Amazon EC2 Auto Scaling group tied to CPU or request count metrics**
- C. Manual launch of larger instance types before each launch
- D. Amazon RDS Multi-AZ

**Q19. [D2]** A company needs an RPO of minutes and RTO of tens of minutes for a critical database,
with a warm copy of the application stack running at reduced capacity in a secondary Region. Which
DR strategy fits?
- A. Backup and restore
- B. Pilot light
- C. **Warm standby**
- D. Multi-site active/active only (no warm standby concept)

**Q20. [D2]** Which of the following design choices improve resilience through loose coupling?
[Select all that apply.] [M]
- A. **Using Amazon SQS between producers and consumers**
- B. **Publishing events to Amazon EventBridge for downstream handlers**
- C. **Storing session state in Amazon ElastiCache instead of local EC2 disk**
- D. Synchronous chain of direct HTTP calls between all microservices with no timeout

**Q21. [D2]** A company is migrating an on-premises Oracle database to Amazon RDS with minimal downtime
while keeping the source database online for continuous replication. Which AWS service should they
use?
- A. AWS Snowball Edge
- B. **AWS Database Migration Service (DMS) with ongoing replication**
- C. Manual mysqldump nightly
- D. Amazon S3 Transfer Acceleration

**Q22. [D2]** A web application session data must survive individual EC2 instance failures so users
are not logged out when an instance is replaced. Where should session state be stored?
- A. Local instance store on each EC2 instance
- B. **Amazon ElastiCache (Redis) or DynamoDB**
- C. EBS volume attached to a single EC2 instance
- D. Auto Scaling group launch template user data

**Q23. [D3]** A global media company serves static assets from S3 to users worldwide with low latency
and reduced origin load. Which service should sit in front of S3?
- A. Amazon Route 53 simple routing only
- B. **Amazon CloudFront**
- C. AWS Global Accelerator pointing directly to S3 without CloudFront
- D. NAT gateway in each Region

**Q24. [D3]** Infrequently accessed backup files must remain retrievable within minutes when needed,
but cost less than S3 Standard. Which storage class is MOST appropriate?
- A. S3 Glacier Flexible Retrieval (12-hour retrieval)
- B. **S3 Standard-IA (Infrequent Access)**
- C. S3 One Zone-IA for all production backups
- D. S3 Express One Zone for archival

**Q25. [D3]** An application needs a fully managed NoSQL database with single-digit millisecond
latency at any scale, with flexible schema and built-in global tables for multi-Region writes. Which
service should be chosen over Amazon RDS?
- A. Amazon Aurora
- B. **Amazon DynamoDB**
- C. Amazon Redshift
- D. Amazon DocumentDB only for relational workloads

**Q26. [D3]** A database workload requires the highest IOPS and lowest latency block storage for a
single EC2 instance running a transactional database. Which EBS volume type should be used?
- A. gp3 general purpose SSD
- B. **io2 Block Express (Provisioned IOPS SSD)**
- C. st1 throughput-optimized HDD
- D. sc1 cold HDD

**Q27. [D3]** A real-time gaming platform needs to improve global TCP/UDP performance to fixed endpoints
in multiple Regions using static anycast IPs. Which service should be used?
- A. Amazon CloudFront
- B. **AWS Global Accelerator**
- C. Application Load Balancer in one Region only
- D. Amazon Route 53 latency routing without endpoints

**Q28. [D3]** A read-heavy reporting workload must offload SELECT queries from the primary Amazon RDS
MySQL instance without affecting write performance on the primary. What should be added?
- A. Multi-AZ standby (automatically serves read traffic)
- B. **RDS read replica(s)**
- C. Larger instance class on the primary only
- D. Amazon S3 as a read cache for SQL queries

**Q29. [D3]** Which of the following actions improve performance for a globally distributed read-heavy
web application? [Select all that apply.] [M]
- A. **Amazon CloudFront caching at the edge**
- B. **Amazon DynamoDB DAX for microsecond DynamoDB reads**
- C. **RDS read replicas in Regions closer to users (where supported)**
- D. Disabling Multi-AZ on production RDS to reduce replication overhead

**Q30. [D3]** An REST API backed by Lambda experiences repeated identical GET requests. The team wants
to reduce Lambda invocations and latency for cacheable responses. Which feature should they enable?
- A. AWS X-Ray tracing only
- B. **Amazon API Gateway stage-level caching**
- C. AWS CloudTrail data events
- D. Amazon SQS long polling

**Q31. [D3]** A Linux file-sharing workload requires many EC2 instances across AZs to mount the same
shared POSIX file system concurrently with automatic scaling of throughput. Which storage service
should be used?
- A. Amazon EBS Multi-Attach on io2 only
- B. **Amazon EFS**
- C. Instance store volumes striped with LVM
- D. Amazon S3 mounted as a local disk without a file gateway

**Q32. [D3]** A tightly coupled HPC cluster needs the lowest network latency between EC2 instances
within a single Availability Zone. Which EC2 placement strategy should be used?
- A. Spread placement group
- B. **Cluster placement group**
- C. Partition placement group across Regions
- D. Default placement with no grouping

**Q33. [D4]** A steady-state production fleet runs 24/7 for three years with predictable instance
families and Regions. Which purchasing option provides the LARGEST discount for compute?
- A. On-Demand Instances only
- B. **Standard Reserved Instances (or Compute Savings Plans) for a 3-year term**
- C. Spot Instances for all production web servers
- D. Dedicated Hosts for every workload regardless of licensing needs

**Q34. [D4]** A batch analytics job can tolerate interruption and must minimize cost for thousands of
parallel workers that run for a few hours nightly. Which EC2 pricing model is BEST?
- A. On-Demand Instances
- B. **Spot Instances with a diversified allocation strategy**
- C. Reserved Instances with 1-year term
- D. Dedicated Instances

**Q35. [D4]** Log files in S3 Standard are accessed frequently for 30 days, then rarely for 90 days,
then should be deleted. Which feature automates the cost-optimal transitions?
- A. S3 Cross-Region Replication
- B. **S3 lifecycle rules (transition to IA/Glacier and expiration)**
- C. Enable S3 Versioning without lifecycle
- D. Store all logs in EBS snapshots

**Q36. [D4]** CloudWatch metrics show an m5.4xlarge EC2 instance averaging 5% CPU for weeks. The
workload is not latency-sensitive. What is the MOST cost-effective first action?
- A. Move to m5.12xlarge for headroom
- B. **Right-size to a smaller instance type (e.g., m5.large) after validation**
- C. Purchase a 3-year Reserved Instance for the current size
- D. Add a second m5.4xlarge and use Auto Scaling

**Q37. [D4]** Which of the following are effective cost-optimization strategies on AWS?
[Select all that apply.] [M]
- A. **Use AWS Cost Explorer and tagging to identify waste**
- B. **Delete unattached EBS volumes and idle Elastic IPs**
- C. **Use S3 Intelligent-Tiering for unpredictable access patterns**
- D. **Run all production databases on the largest instance type by default**

**Q38. [D4]** A data lake object access pattern is unpredictable: some objects are hot for weeks,
others go cold immediately. The team wants automatic tier movement without managing lifecycle rules
per prefix. Which S3 storage class should they use?
- A. S3 Standard only
- B. **S3 Intelligent-Tiering**
- C. S3 Glacier Deep Archive for all objects
- D. S3 One Zone-IA for all data regardless of durability needs

**Q39. [D4]** A finance team needs email alerts when monthly AWS spend exceeds a defined threshold,
and historical views of spend by service and tag. Which combination should they use?
- A. AWS CloudTrail only
- B. **AWS Budgets for alerts and AWS Cost Explorer for analysis**
- C. Amazon CloudWatch Logs Insights only
- D. AWS Trusted Advisor without Budgets

**Q40. [D4]** A company serves large video files from S3 to users in the same Region as the bucket.
Traffic costs are high. Which architecture change reduces data transfer cost while improving user
experience?
- A. Enable S3 Transfer Acceleration for same-Region users
- B. **Use CloudFront with an S3 origin (edge caching reduces repeated origin fetches and can lower transfer costs)**
- C. Copy every object to every Region manually
- D. Replace S3 with EBS volumes attached to EC2 in each AZ

---

# ANSWER KEY & EXPLANATIONS
*(Stop here and only read after you finish.)*

| Q | Answer | Why |
|---|---|---|
| 1 | **B** | **IAM roles + instance profiles** grant temporary credentials to EC2 — no long-term keys on disk. Users/embedded keys violate least privilege and rotation best practices. |
| 2 | **B** | **NAT gateways** are managed, AZ-resilient (deploy per AZ). NAT instances are a legacy single-point-of-failure pattern. IGW does not belong on private subnets. |
| 3 | **B** | **Security groups** are stateful, instance/ENI level, and can reference other SGs. NACLs are stateless subnet-level; WAF is Layer 7 at edge. |
| 4 | **B** | **SSE-KMS with customer-managed keys** gives audit trails (CloudTrail), rotation control, and separation of duties. SSE-S3 is simpler but less control. |
| 5 | **B** | **Secrets Manager** supports automatic rotation and native integration for RDS credentials. Parameter Store SecureString can store secrets but rotation is Secrets Manager's strength. |
| 6 | **B** | **Gateway endpoints** for S3 and DynamoDB are free and keep traffic on the AWS network. Interface endpoints cost hourly + data processing. |
| 7 | **B** | **AWS WAF** filters Layer 7 attacks (SQLi, rate limits) at ALB/CloudFront/API Gateway. Shield Standard is DDoS at L3/4; SGs are not a web application firewall. |
| 8 | **A, B, C** | MFA, roles over keys, and least privilege are core IAM best practices. **Never share root keys** — root should have MFA and almost no daily use. |
| 9 | **B** | **Cross-account roles** with trust policies are the standard federated-access pattern. Copying users or sharing keys does not scale and is insecure. |
| 10 | **B** | **ACM** issues and renews TLS certs for ALB, CloudFront, API Gateway. KMS encrypts data keys; it does not serve HTTPS certificates to browsers. |
| 11 | **B** | **SCPs** apply guardrails across accounts in Organizations — they can deny disabling CloudTrail or public buckets even for account admins. |
| 12 | **B** | **Private subnets** for compute/data; **public subnets** only for internet-facing load balancers/NAT. Defense in depth — no direct internet path to app/DB tier. |
| 13 | **B** | **Multi-AZ RDS** synchronous replication + automatic failover on AZ failure. Single-AZ and backups alone require restore time; cross-Region replica is DR not same-Region HA. |
| 14 | **B** | **SQS standard** = high throughput, at-least-once delivery (duplicates OK). FIFO = ordering + exactly-once when needed. |
| 15 | **B** | **SNS fan-out** to multiple subscribers (Lambda, SQS, etc.) in parallel. One SQS consumer is serial; sync invoke couples and scales poorly. |
| 16 | **C** | **Route 53 failover routing** + health checks = automatic DNS failover active-passive. Weighted splits traffic but doesn't fail over on health alone. |
| 17 | **B** | **NLB** = Layer 4, ultra-low latency, millions of connections, static IPs, preserves client IP. ALB is Layer 7 HTTP/HTTPS. |
| 18 | **B** | **EC2 Auto Scaling** adds/removes instances from metrics/scheduled policies. Stateless web + ALB is the classic elastic pattern. |
| 19 | **C** | **Warm standby** = scaled-down copy always running in DR Region → RTO minutes–tens of minutes, RPO minutes with replication. Pilot light = core only; backup/restore = hours. |
| 20 | **A, B, C** | Queues, event buses, and external session stores **decouple** components. Tight sync HTTP chains with no timeouts create cascading failures. |
| 21 | **B** | **AWS DMS** supports homogeneous/heterogeneous ongoing replication with CDC for minimal-downtime migrations. Snowball is bulk transfer; dumps are not continuous. |
| 22 | **B** | **ElastiCache/DynamoDB** centralizes session state so any web instance can serve any user after ASG replacement. Local/instance store is lost on failure. |
| 23 | **B** | **CloudFront** caches static content at edge PoPs → lower latency + fewer S3 GETs. Route 53 alone does not cache objects. |
| 24 | **B** | **S3 Standard-IA** = infrequent access, retrieval in milliseconds–minutes, lower storage cost than Standard. Glacier Flexible is for archival with longer retrieval. |
| 25 | **B** | **DynamoDB** = managed NoSQL, single-digit ms, auto scaling, global tables. RDS is relational/SQL; Redshift is analytics warehouse. |
| 26 | **B** | **io2/io2 Block Express** = highest IOPS/lowest latency EBS for transactional DBs. gp3 is general purpose; st1/sc1 are HDD throughput/cold. |
| 27 | **B** | **Global Accelerator** uses AWS global network + static anycast IPs for TCP/UDP to endpoints in multiple Regions. CloudFront is HTTP/S caching CDN. |
| 28 | **B** | **Read replicas** offload read traffic asynchronously. Multi-AZ standby is for failover only — not readable on most engines (except Aurora cluster readers). |
| 29 | **A, B, C** | Edge caching, DAX, and regional read replicas all improve read performance globally. **Disabling Multi-AZ** hurts availability, not a performance win for reads. |
| 30 | **B** | **API Gateway caching** stores responses for identical GETs → fewer Lambda invocations + lower latency. X-Ray/CloudTrail don't cache API responses. |
| 31 | **B** | **EFS** = shared NFS across AZs/instances, scales throughput. EBS is block storage per instance (Multi-Attach limited use case). S3 is object not POSIX shared file system. |
| 32 | **B** | **Cluster placement groups** pack instances on same AZ hardware for low-latency HPC. Spread maximizes hardware isolation; partition for large distributed workloads like Kafka. |
| 33 | **B** | **3-year Standard RIs / Compute Savings Plans** give largest compute discount for steady 24/7 workloads. Spot is for fault-tolerant; On-Demand is most expensive. |
| 34 | **B** | **Spot Instances** = up to ~90% savings for interruptible batch work. Use diversified pools + checkpointing. On-Demand/RI overpay for nightly batch. |
| 35 | **B** | **S3 lifecycle policies** automate transition Standard → IA → Glacier → expiration. Versioning without lifecycle increases storage cost. |
| 36 | **B** | **Right-sizing** matches capacity to utilization — 5% CPU on 4xlarge is waste. Validate then downsize before buying RIs for the wrong size. |
| 37 | **A, B, C** | Cost Explorer/tagging, cleaning idle resources, and Intelligent-Tiering are valid optimizations. **Oversizing everything by default** increases cost. |
| 38 | **B** | **S3 Intelligent-Tiering** auto-moves objects between access tiers without lifecycle management — ideal for unknown/changing patterns (small monitoring fee). |
| 39 | **B** | **AWS Budgets** sends threshold alerts; **Cost Explorer** analyzes historical spend by dimension. CloudTrail is audit, not billing alerts. |
| 40 | **B** | **CloudFront** caches at edge — repeat views don't re-fetch from S3 (saves transfer + improves latency). Transfer Acceleration helps cross-Region/long distance, not same-Region repeat access. |

## Score
Correct / 40. On the real exam **~70% of scored Qs (~35/50) ≈ passing 720**.
**Aim for 35/40 (87%) or better** to be safe given practice ≠ live.
- **38–40:** strong pass.
- **33–37:** ready with review.
- **<33:** reread the relevant domain file for every miss, then the AWS Services Map, then re-do all questions you got wrong.

## How to read a miss
For each wrong answer, **find the bolded service/concept in `05-aws-services-map-memorize.md`**,
then read the **domain file** for that service. You will see the pattern: it's nearly always
"a requirement↔service" (Q1–7, 13–17, 23–28, 33–40), "a pattern↔resilience goal" (Q14–16, 19–22),
or "a control↔security property" (Q4–6, 8–12).
