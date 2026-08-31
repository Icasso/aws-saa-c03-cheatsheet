# Exam Scenario Playbook — 50 Patterns to Ace SAA-C03
*When you see these trigger phrases in a question stem, go straight to the answer pattern.*

---

## Pattern 1: "Least operational overhead" / "Managed service"
**Think:** AWS manages patching, scaling, HA for you.
| Scenario | Answer |
|---|---|
| Run a database | **RDS/Aurora** (not EC2 + self-installed MySQL) |
| Run containers | **Fargate** (not self-managed ECS on EC2) |
| Run code on events | **Lambda** (not EC2 cron) |
| Outbound internet from private subnet | **NAT Gateway** (not NAT Instance) |
| SSH to private EC2 | **SSM Session Manager** (not bastion host) |
| Rotate DB passwords | **Secrets Manager** (not manual scripts) |
| Threat detection | **GuardDuty** (not custom CloudWatch rules) |
| Migrate servers | **MGN** (not manual AMI copy) |
| Migrate databases | **DMS** (not manual dump/restore) |
| **Trap:** "custom solution" or "self-managed" — almost always wrong when stem says "least overhead." |

## Pattern 2: "Most cost-effective" / "Minimize cost"
**Think:** Cheapest option that still meets the requirement.
| Scenario | Answer |
|---|---|
| Steady 24/7 compute (3yr) | **Reserved Instances / Savings Plans** |
| Fault-tolerant batch/CI | **Spot Instances** |
| Infrequent S3 access | **S3 Standard-IA** or **Intelligent-Tiering** |
| Archive data | **S3 Glacier** (Deep Archive for rarely accessed) |
| Private subnet → S3/DynamoDB | **Gateway VPC Endpoint** (free, no NAT) |
| Global static content delivery | **CloudFront** (cheaper egress than S3 direct) |
| Unpredictable serverless traffic | **Lambda on-demand** (not always-on EC2) |
| NoSQL with variable traffic | **DynamoDB on-demand** |
| Dev/test compute | **T instances** or **Spot** |
| **Trap:** On-Demand for steady workloads. NAT Gateway when VPC endpoint works. Over-provisioned instances. |

## Pattern 3: "Highly available" / "Fault tolerant" / "No downtime"
**Think:** Multi-AZ, auto-healing, load balancing.
| Scenario | Answer |
|---|---|
| Web application | **ALB + ASG across ≥2 AZs** |
| Database | **RDS/Aurora Multi-AZ** (sync failover) |
| NAT for private subnets | **NAT Gateway per AZ** |
| DNS failover | **Route 53 failover routing** + health checks |
| Decouple components | **SQS** between services |
| **Trap:** Single AZ. Single instance. Read replica alone (not HA). Bigger instance (vertical, not HA). |

## Pattern 4: "Minimize data transfer costs"
| Scenario | Answer |
|---|---|
| Users download from S3 globally | **CloudFront** in front of S3 |
| Private subnet accesses S3/DynamoDB | **Gateway VPC Endpoint** |
| Private subnet accesses other AWS APIs | **Interface VPC Endpoint** |
| Cross-AZ traffic | Design for **same-AZ** communication |
| On-prem to AWS bulk transfer | **Direct Connect** or **Snowball** |
| **Trap:** NAT Gateway for S3 access. Direct S3 internet egress for global users. |

## Pattern 5: "Migrate with minimal downtime"
| Scenario | Answer |
|---|---|
| Database migration | **DMS** with ongoing replication (CDC) |
| Server/VM migration | **MGN** (Application Migration Service) |
| Large data transfer on-prem | **DataSync** or **Snowball** |
| Application deployment | **CodeDeploy blue/green** or **Beanstalk** |
| **Trap:** Manual dump/restore (downtime). Snapshot copy (not continuous). |

## Pattern 6: "Decouple" / "Scale independently" / "Buffer"
| Scenario | Answer |
|---|---|
| Smooth traffic spikes | **SQS** queue between producer and consumer |
| One event, many consumers | **SNS** fan-out to SQS queues |
| Event routing with filtering | **EventBridge** rules |
| API front door | **API Gateway** in front of backends |
| **Trap:** Direct synchronous HTTP calls between services. Tight coupling. |

## Pattern 7: "Global low latency"
| Scenario | Answer |
|---|---|
| Static content (images, CSS, JS) | **CloudFront** CDN |
| Dynamic API with caching | **CloudFront** + ALB origin |
| TCP/UDP (gaming, IoT) | **Global Accelerator** |
| Route users to nearest region | **Route 53 latency routing** |
| Multi-region active DB | **Aurora Global DB** or **DynamoDB Global Tables** |
| **Trap:** Single region deployment. CloudFront for non-HTTP. |

## Pattern 8: "Encrypt" + "audit trail" / "compliance"
| Scenario | Answer |
|---|---|
| S3 encryption with key audit | **SSE-KMS** (customer managed CMK) |
| FIPS 140-2 Level 3 | **CloudHSM** |
| TLS for ALB/CloudFront | **ACM** certificate |
| Auto-rotate secrets | **Secrets Manager** |
| Immutable storage (WORM) | **S3 Object Lock** (compliance mode) |
| **Trap:** SSE-S3 when audit required. Hardcoded keys. Unencrypted EBS. |

## Pattern 9: "Block SQL injection" / "Web attack" / "Rate limit"
| Scenario | Answer |
|---|---|
| HTTP/S attack protection | **AWS WAF** on ALB/CloudFront/API GW |
| DDoS protection | **Shield Standard** (free) or **Advanced** (paid) |
| VPC-level traffic inspection | **Network Firewall** |
| **Trap:** Security Groups (L4 only). NACLs (no L7 inspection). Shield for SQLi (it's DDoS). |

## Pattern 10: "Multi-account governance"
| Scenario | Answer |
|---|---|
| Org-wide guardrails | **SCPs** in Organizations |
| Centralized SSO | **IAM Identity Center** |
| Landing zone setup | **Control Tower** |
| Centralized logging | **CloudTrail org trail** in log archive account |
| Centralized security findings | **Security Hub** delegated admin |
| Consistent WAF rules | **Firewall Manager** |
| **Trap:** Per-account IAM users. Manual policy in each account. |

## Pattern 11: "No long-term credentials on EC2/Lambda"
**Always:** IAM Role + instance profile / execution role.
**Never:** Access keys in code, user data, or environment variables.

## Pattern 12: "Cross-account access"
| Scenario | Answer |
|---|---|
| S3 cross-account read | **Bucket policy** in owner account |
| Cross-account API access | **IAM role** with trust policy + ExternalId |
| Centralized audit | **CloudTrail org trail** |

## Pattern 13: "Private subnet needs AWS service access"
| Service | Endpoint type |
|---|---|
| S3 | **Gateway** (free) |
| DynamoDB | **Gateway** (free) |
| Everything else (KMS, SNS, SQS, Secrets Manager, etc.) | **Interface** (hourly + data) |

## Pattern 14: "Read scaling for database"
**Answer:** Read replicas (async, read traffic).
**Not:** Multi-AZ (that's HA/failover, not read scaling).

## Pattern 15: "DR with specific RTO/RPO"
| RTO/RPO | Strategy |
|---|---|
| Hours/days | Backup & Restore |
| Tens of minutes | Pilot Light |
| Minutes | Warm Standby |
| Near zero | Multi-Site Active-Active |

## Pattern 16: "Real-time streaming data"
| Need | Service |
|---|---|
| Custom consumers, real-time | **Kinesis Data Streams** |
| Load to S3/Redshift | **Kinesis Firehose** |
| SQL on streams | **Kinesis Data Analytics** (Flink) |

## Pattern 17: "Ad-hoc SQL on data in S3"
**Answer:** **Athena** (serverless, pay per query).
**Not:** Redshift (persistent warehouse). EMR (cluster management).

## Pattern 18: "Serverless" / "Event-driven"
**Answer:** Lambda + API Gateway + DynamoDB/S3/SQS.
**Not:** EC2 + cron. Always-on infrastructure.

## Pattern 19: "Detect threats" vs "Scan vulnerabilities" vs "Check compliance"
| Need | Service |
|---|---|
| Threat detection (anomalies, compromised creds) | **GuardDuty** |
| Vulnerability scanning (CVEs, patches) | **Inspector** |
| Configuration compliance (encryption on? SG open?) | **Config** |
| PII in S3 | **Macie** |
| Centralized findings | **Security Hub** |

## Pattern 20: "Audit API calls" vs "Monitor network traffic"
| Need | Service |
|---|---|
| Who called which API | **CloudTrail** |
| IP/port traffic metadata | **VPC Flow Logs** |
| Application logs | **CloudWatch Logs** |

---

## Quick Decision Trees

### "Which load balancer?"
```
HTTP/HTTPS routing (path, host, header)? → ALB
TCP/UDP ultra-low latency, static IP? → NLB
Inline security appliance (firewall)? → GWLB
Legacy? → CLB (avoid)
```

### "Which database?"
```
Relational + SQL? → RDS or Aurora
NoSQL + key-value + serverless? → DynamoDB
Data warehouse / analytics? → Redshift
Graph? → Neptune
MongoDB-compatible? → DocumentDB
In-memory cache? → ElastiCache
Time-series? → Timestream
```

### "Which queue/messaging?"
```
Buffer between services (pull)? → SQS
Fan-out to many (push)? → SNS
Event routing with rules? → EventBridge
Ordered + exactly-once? → SQS FIFO
```

### "Which storage?"
```
Objects (files, images, backups)? → S3
Block storage for one EC2? → EBS
Shared file system (Linux)? → EFS
Windows file shares? → FSx for Windows
HPC / ML training data? → FSx for Lustre
```

### "Which encryption?"
```
Simple S3 encryption? → SSE-S3
Audit + IAM control? → SSE-KMS
Customer provides key? → SSE-C
FIPS HSM? → CloudHSM
TLS cert? → ACM
Auto-rotate secrets? → Secrets Manager
```

---

## 30 "Trap Answer" Patterns (wrong answers designed to fool you)

1. **NAT Instance** when NAT Gateway is an option → always pick NAT Gateway.
2. **Bastion host** when SSM Session Manager is an option → always pick SSM.
3. **IAM User with access keys** for EC2/Lambda → always pick IAM Role.
4. **Read Replica** when question asks for HA/failover → pick Multi-AZ.
5. **Multi-AZ** when question asks for read scaling → pick Read Replica.
6. **CloudFront** for non-HTTP protocols → pick Global Accelerator.
7. **Global Accelerator** for static content caching → pick CloudFront.
8. **On-Demand** for steady 3-year workload → pick RI/Savings Plan.
9. **Over-provisioned instance** when rightsizing is an option.
10. **Single AZ** when HA is required.
11. **SNS** when you need buffering/retries → pick SQS.
12. **SQS** when you need fan-out to many → pick SNS.
13. **Manual snapshots** when AWS Backup is an option for multi-service.
14. **Interface endpoint** for S3/DynamoDB → pick Gateway endpoint (free).
15. **SSE-S3** when audit trail is required → pick SSE-KMS.
16. **Parameter Store** when auto-rotation is required → pick Secrets Manager.
17. **GuardDuty** when vulnerability scanning is asked → pick Inspector.
18. **Inspector** when threat detection is asked → pick GuardDuty.
19. **Config** when API audit is asked → pick CloudTrail.
20. **CloudTrail** when config compliance is asked → pick Config.
21. **VPC Peering** when accessing a specific service cross-account → pick PrivateLink.
22. **VPN only** when high bandwidth is needed → pick Direct Connect.
23. **ElastiCache** for DynamoDB caching → pick DAX.
24. **DAX** for RDS caching → pick ElastiCache.
25. **EMR** for simple SQL on S3 → pick Athena.
26. **Redshift** for ad-hoc queries on S3 → pick Athena.
27. **EC2** for event-driven sporadic tasks → pick Lambda.
28. **Lambda** for long-running (>15 min) batch → pick Batch or EC2.
29. **Public S3 bucket** for cross-account access → pick bucket policy (private).
30. **Root account** for daily operations → pick IAM role/SSO.
