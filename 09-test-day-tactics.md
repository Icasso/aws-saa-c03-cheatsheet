# Test-Day Tactics & Final 24h Checklist (SAA-C03)

## Exam shape (recap)
- **~65 questions, 50 scored, 130 min.** Compensatory scoring → **~720/1000 to pass**, no per-domain minimum.
- No penalty for guessing. Blank = wrong → **always answer.**
- Types: **Multiple choice** (1 correct), **Multiple response** (2+ correct — read carefully).
- Scenario-heavy: long stems describing a company problem; pick the **best** AWS solution.

## Decision rules that win points
1. **"Most cost-effective / least expensive"** → Spot, S3 lifecycle/Glacier, Reserved Instances/Savings Plans, right-sizing, VPC endpoints (avoid NAT), CloudFront (reduce origin transfer).
2. **"Most secure / compliance / least privilege"** → IAM roles (not keys), encryption (KMS), private subnets, VPC endpoints, WAF, Secrets Manager, Macie, CloudTrail, MFA.
3. **"Highly available / fault tolerant / no downtime"** → Multi-AZ, ASG across AZs, ALB health checks, Route 53 failover, RDS Multi-AZ (not just read replica).
4. **"Least operational overhead / managed / fastest to deploy"** → managed service (RDS over EC2+MySQL, Fargate over self-managed K8s, Lambda over EC2 for event-driven).
5. **"Decouple / scale independently / buffer"** → SQS between components; SNS fan-out to SQS.
6. **"Migrate database with minimal downtime"** → DMS with ongoing replication.
7. **"Lift and shift servers"** → Application Migration Service (MGN).
8. **"Global low-latency static content"** → CloudFront.
9. **"Global low-latency TCP/UDP (not HTTP cache)"** → Global Accelerator.
10. **"Private subnet needs internet (outbound only)"** → NAT Gateway (not IGW, not bastion for outbound).
11. **"Encrypt S3 without managing keys"** → SSE-S3 or SSE-KMS.
12. **"Auto-rotate database credentials"** → Secrets Manager (not Parameter Store).
13. **"Audit who made API calls"** → CloudTrail.
14. **"Track resource configuration changes"** → Config.
15. **"Compliance reports (SOC/ISO/PCI)"** → Artifact.
16. **"Find PII in S3"** → Macie.
17. **"Block SQL injection / bot traffic"** → WAF.
18. **"DDoS protection"** → Shield (Standard free on ALB/CloudFront/Route 53).
19. **"Read scaling for database"** → Read replicas (not Multi-AZ — that's HA).
20. **"DR across regions"** → S3 CRR, Aurora Global Database, Route 53 failover, pilot light/warm standby.

## How to handle each question
- **Read the stem fully** — the qualifier (MOST/LEAST/FIRST/BEST) decides the answer.
- **Identify the domain** in your head; that narrows the service set.
- **Identify the priority** — cost? security? performance? availability? The stem usually states it.
- **Eliminate** clearly wrong options first; then judge the remaining.
- **Flag and move on** — don't sink 4 minutes on one Q (~2.6 min/Q budget).
- **Never leave blank** — guessing can't hurt.
- For **multiple-response**, count expected correct items if the stem says "select two/three."

## Reading comprehension traps
- "**EXCEPT** / **NOT** / **MOST / LEAST**" — flip what you're selecting. Read these in bold.
- "Which is **NOT** a benefit of Multi-AZ" — read replicas are for reads, not HA failover.
- "Most **cost-effective**" ≠ "most **performant**" — don't over-provision.
- "Most **secure**" — private subnet + encryption + IAM roles beats public + security group only.
- "**Minimize data transfer costs**" — CloudFront, VPC endpoints, same-AZ traffic, Direct Connect.
- "**Shared responsibility**" — AWS = security **of** the cloud; customer = security **in** the cloud (data, IAM, encryption config, OS patching on EC2).

## Final 24h checklist
- [ ] Finished `07-practice-exam.md` and re-read every miss's explanation.
- [ ] Services map (`05`) memorized — the "which service" half of the test.
- [ ] Well-Architected 6 pillars named from memory.
- [ ] SG vs NACL, NAT vs IGW, ALB vs NLB clear.
- [ ] S3 storage classes and when to use each.
- [ ] RDS Multi-AZ vs Read Replica distinction solid.
- [ ] DR strategies (backup-restore → pilot light → warm standby → active-active) with RTO/RPO.
- [ ] Route 53 routing policies memorized.
- [ ] RI vs Savings Plans vs Spot vs On-Demand clear.
- [ ] VPC Gateway Endpoint vs Interface Endpoint clear.
- [ ] No new study the night before — review only, sleep.

## Morning-of
- [ ] Read `08-flashcards-key-terms.md` once (skim, don't cram).
- [ ] Eat, hydrate. Check exam ID, photo ID, proctor requirements.
- [ ] Set a timer: **~130 min / 65 Qs** = ~2 min each. Don't front-load time.
- [ ] Flag hard Qs, answer easy ones first, come back.

## If you run out of time
- Finish **every** answer (blank = wrong). Even guesses. Compensatory scoring means a few wrongs are tolerable.
- On multi-response, **only lock in items you're sure of**.

*You've read the domains, the services map, and 40 practice Qs. That's enough for a strong attempt.
Sleep > cram. Good luck.*
