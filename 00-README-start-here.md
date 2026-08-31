# AWS Certified Solutions Architect — Associate (SAA-C03) — Review Kit

> Structured for **last-mile revision** before the exam. The **AWS Services Map** and
> **Practice Exam** are the two highest-leverage files. Re-read the Practice Exam
> answers *after* you solve it.

## Exam Logistics (confirmed from AWS content overview)

| Item | Value |
|---|---|
| **Exam code** | AWS Certified Solutions Architect — Associate, code **SAA-C03** |
| **Level** | Associate |
| **Duration** | **130 minutes** |
| **Questions** | 65 total → **50 scored + ~15 unscored** |
| **Question types** | Multiple choice (1 correct), Multiple response (2+ correct) |
| **Passing score** | **720** on a 100–1000 scaled scale |
| **Penalty for guessing** | None (but blank = wrong) |
| **Scoring model** | **Compensatory** — need the overall pass, no per-section minimum |
| **Price** | USD, region/country-varying — **verify on aws.amazon.com/certification** |
| **Target candidate** | ~1 year hands-on experience **designing** AWS solutions |

> **Compensatory scoring = you can be weak in one domain and still pass.** Don't
> get stuck on one question — flag and move on. No negative marking.

## Domain Weightings (the whole exam lives here)

| # | Domain | Weight | File |
|---|---|---:|---|
| 1 | Design Secure Architectures | **30%** | `01-domain1-design-secure-architectures.md` |
| 2 | Design Resilient Architectures | **26%** | `02-domain2-design-resilient-architectures.md` |
| 3 | Design High-Performing Architectures | **24%** | `03-domain3-design-high-performing-architectures.md` |
| 4 | Design Cost-Optimized Architectures | **20%** | `04-domain4-design-cost-optimized-architectures.md` |

**Priority by points:** Domain 1 (30%) > Domain 2 (26%) > Domain 3 (24%) > Domain 4 (20%).
Spend most of your time on **1 & 2** — they are 56% of the exam.

## The "if you only remember 10 things" list

1. **Well-Architected Framework** — 6 pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability.
2. **Security groups** = stateful, instance-level firewall. **NACLs** = stateless, subnet-level. **SG deny by default; NACL allow/deny rules.**
3. **Private subnet** = no direct internet route. **NAT Gateway** (managed, per-AZ) lets private instances reach the internet outbound only.
4. **S3** = object storage, 11 nines durability. **EBS** = block storage for EC2. **EFS** = shared NFS for Linux. Pick storage by access pattern.
5. **Multi-AZ** = synchronous failover in one region (HA). **Read replicas / Cross-Region Replication** = async, DR/read scaling.
6. **ALB** = Layer 7 HTTP/HTTPS, path/host routing. **NLB** = Layer 4 TCP/UDP, ultra-low latency, static IP. **GWLB** = inline security appliances.
7. **SQS Standard** = at-least-once, best-effort ordering. **SQS FIFO** = exactly-once, strict ordering. **SNS** = pub/sub fan-out.
8. **IAM roles** for EC2/Lambda/cross-account — **never long-lived access keys on instances.** Least privilege always.
9. **Reserved Instances / Savings Plans** = steady-state compute discount. **Spot** = up to 90% off, interruptible. **On-Demand** = no commitment.
10. **Route 53 routing:** Simple, Weighted, Latency, Failover, Geolocation, Geoproximity, Multi-value (health checks).

## Study order (tight clock)

1. Read `05-aws-services-map-memorize.md` end to end (fast, high recall value).
2. Skim `06-well-architected-framework.md` for pillar vocabulary.
3. Read this file's "top 10."
4. **Do `07-practice-exam.md` (65 Qs) timed — 130 min. Don't peek.**
5. Read the answer key / explanations immediately; for every miss, find that term in the domain files.
6. Skim the 4 domain files only for whatever you got wrong.
7. `10-exam-scenario-playbook.md` — memorize the 50 patterns.
8. `08-flashcards-key-terms.md` + `09-test-day-tactics.md` on the way to bed / morning.

## Files in this kit
- `00-README-start-here.md` — this file
- `01-domain1-design-secure-architectures.md` — Domain 1 (30%)
- `02-domain2-design-resilient-architectures.md` — Domain 2 (26%)
- `03-domain3-design-high-performing-architectures.md` — Domain 3 (24%)
- `04-domain4-design-cost-optimized-architectures.md` — Domain 4 (20%)
- `05-aws-services-map-memorize.md` — AWS services ↔ purpose ↔ domain
- `06-well-architected-framework.md` — 6 pillars + design principles
- `07-practice-exam.md` — 40 scenario Qs + answer key w/ explanations
- `08-flashcards-key-terms.md` — definitions / gotchas
- `09-test-day-tactics.md` — how to handle each question type + final tips

*Content aligned to AWS SAA-C03 Exam Content Overview (docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03). Verify any number/price against the official page before you sit the exam.*

- `10-exam-scenario-playbook.md` — 50 exam patterns + trap answers
- `11-architecture-patterns-reference.md` — 10 reference architectures with diagrams
