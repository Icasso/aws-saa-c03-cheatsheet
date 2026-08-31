# Architecture Patterns Reference — SAA-C03
*Know these reference architectures cold. The exam describes variations of these patterns.*

---

## Pattern 1: Three-Tier Web Application
```
                    Internet
                       │
                  [Route 53]
                       │
              [ALB - public subnet]
                  /         \
         [EC2/ASG]       [EC2/ASG]     ← private subnet, AZ-a / AZ-b
              \         /
              [RDS Multi-AZ]              ← isolated subnet
```
| Component | Service | Why |
|---|---|---|
| DNS | Route 53 | Health checks, failover |
| Load balancer | ALB | L7 routing, SSL termination (ACM) |
| Compute | EC2 + ASG | Auto-scale across AZs |
| Database | RDS Multi-AZ | Sync failover, HA |
| Security | WAF on ALB, SGs, private subnets | Defense in depth |
| **Variations:** Replace EC2 with ECS/Fargate. Add ElastiCache for sessions. Add CloudFront in front. |

## Pattern 2: Serverless API
```
Client → [API Gateway] → [Lambda] → [DynamoDB]
                ↓
           [Cognito] (auth)
```
| Component | Service | Why |
|---|---|---|
| API | API Gateway | Throttling, auth, caching |
| Compute | Lambda | Pay per request, auto-scale |
| Database | DynamoDB on-demand | Serverless, single-digit ms |
| Auth | Cognito User Pool | Managed user directory |
| **Variations:** S3 instead of DynamoDB. Step Functions for workflows. SQS for async. |

## Pattern 3: Event-Driven Processing
```
[S3 upload] → [S3 Event] → [SQS] → [Lambda] → [DynamoDB]
                                ↓
                           [DLQ] (failed messages)
```
| Component | Service | Why |
|---|---|---|
| Trigger | S3 event notification | React to uploads |
| Buffer | SQS | Decouple, retry, DLQ |
| Process | Lambda | Serverless, event-driven |
| **Variations:** SNS fan-out to multiple SQS. EventBridge for complex routing. Kinesis for streaming. |

## Pattern 4: Hybrid (On-Premises + AWS)
```
On-Prem DC ──[DX primary]──► [VPC]
         ╲                  /    \
          ──[VPN backup]───       [Workloads]
```
| Component | Service | Why |
|---|---|---|
| Primary link | Direct Connect | Dedicated, consistent latency |
| Backup link | Site-to-Site VPN | Encrypted over internet |
| Routing hub | Transit Gateway | Connect multiple VPCs + on-prem |
| DNS | Route 53 Resolver | Hybrid DNS resolution |
| **Variations:** VPN only (lower bandwidth). Storage Gateway for on-prem cache. Outposts for AWS on-prem. |

## Pattern 5: Multi-Region Active-Passive DR
```
us-east-1 (ACTIVE)                    us-west-2 (STANDBY)
[ALB + ASG + RDS Multi-AZ]           [ASG min=0 + RDS snapshot/replica]
         │                                    │
         └──── [Route 53 Failover] ───────────┘
              (health check on primary)
```
| Component | Service | Why |
|---|---|---|
| Failover DNS | Route 53 failover | Auto-route on primary failure |
| Data replication | S3 CRR, Aurora Global DB, DMS | Cross-region data sync |
| Compute standby | ASG with min=0 in DR region | Scale up on failover |
| **Variations:** Pilot light (DB always on). Warm standby (min=1). Active-active (both regions live). |

## Pattern 6: Microservices on ECS
```
[ALB] → [ECS Service A] → [RDS A]
      → [ECS Service B] → [DynamoDB]
      → [ECS Service C] → [SQS] → [Lambda]
         (Service Discovery via Cloud Map)
```
| Component | Service | Why |
|---|---|---|
| Load balancer | ALB | Path-based routing to services |
| Containers | ECS on Fargate | No EC2 management |
| Discovery | Cloud Map | Service-to-service DNS |
| Async comms | SQS/EventBridge | Loose coupling |
| **Variations:** EKS instead of ECS. API Gateway instead of ALB. App Mesh for observability. |

## Pattern 7: Data Lake
```
[Sources] → [Kinesis/Glue/DMS] → [S3 Data Lake]
                                       │
                              [Glue Data Catalog]
                                  /         \
                            [Athena]    [QuickSight]
                           (SQL queries)  (dashboards)
```
| Component | Service | Why |
|---|---|---|
| Storage | S3 | Cheap, durable, unlimited |
| Catalog | Glue Data Catalog | Schema discovery |
| Query | Athena | Serverless SQL |
| ETL | Glue jobs | Transform raw → curated |
| BI | QuickSight | Dashboards and reports |
| **Variations:** EMR for Spark. Redshift for warehouse. Lake Formation for governance. |

## Pattern 8: Static Website
```
User → [Route 53] → [CloudFront] → [S3 bucket]
                         (ACM cert)
```
| Component | Service | Why |
|---|---|---|
| Hosting | S3 static website | Cheap, durable |
| CDN | CloudFront | Global edge caching |
| DNS | Route 53 alias to CloudFront | Apex domain support |
| TLS | ACM certificate | Free HTTPS |
| **Variations:** S3 + CloudFront OAI/OAC for private bucket. Lambda@Edge for dynamic content. |

## Pattern 9: CI/CD Pipeline
```
[CodeCommit/GitHub] → [CodePipeline] → [CodeBuild] → [CodeDeploy]
                                                          ↓
                                                    [EC2/ECS/Lambda]
                                                    (blue/green deploy)
```
| Component | Service | Why |
|---|---|---|
| Source | CodeCommit / GitHub / S3 | Version control |
| Pipeline | CodePipeline | Orchestrate stages |
| Build | CodeBuild | Compile, test, package |
| Deploy | CodeDeploy | Blue/green, rolling, in-place |
| **Variations:** Jenkins on EC2. GitHub Actions. CodeDeploy to ECS/Fargate. |

## Pattern 10: IoT Data Pipeline
```
[IoT Devices] → [IoT Core] → [Kinesis Data Streams] → [Lambda] → [DynamoDB]
                                    ↓
                              [Kinesis Firehose] → [S3] → [Athena]
```
| Component | Service | Why |
|---|---|---|
| Ingestion | IoT Core | MQTT/HTTP device connectivity |
| Streaming | Kinesis Data Streams | Real-time ordered processing |
| Storage | Firehose → S3 | Durable archive |
| Analytics | Athena | SQL on archived data |
| **Variations:** IoT Analytics. Timestream for time-series. SageMaker for ML on IoT data. |

---

## Architecture Selection Guide (exam speed)

| Business requirement | Start with this pattern |
|---|---|
| Public web app with database | Pattern 1 (3-tier) |
| REST API, variable traffic | Pattern 2 (serverless) |
| File upload triggers processing | Pattern 3 (event-driven) |
| Connect datacenter to AWS | Pattern 4 (hybrid) |
| Survive region failure | Pattern 5 (multi-region DR) |
| Multiple independent services | Pattern 6 (microservices) |
| Analytics on large datasets | Pattern 7 (data lake) |
| Marketing/docs website | Pattern 8 (static) |
| Automated deployments | Pattern 9 (CI/CD) |
| Connected devices / sensors | Pattern 10 (IoT) |
