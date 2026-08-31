# AWS Certified Solutions Architect — Associate (SAA-C03) — Review Kit

Full cheat sheet + **65-question practice exam**, aligned to the official AWS SAA-C03 exam outline
(30 / 26 / 24 / 20% domain split). Optimized for **reading on a phone**:
each file renders as a clean web page on app.github.com / the GitHub app.

## Start with these three →
- 🚀 **[00-README-start-here.md](00-README-start-here.md)** — how to study + top-10 facts
- 🎯 **[07-practice-exam.md](07-practice-exam.md)** — **65 scenario questions** + answer key & explanations
- 📋 **[10-exam-scenario-playbook.md](10-exam-scenario-playbook.md)** — 50 exam patterns to recognize instantly

## All files
| # | File | What | Weight |
|---|---|---|---|
| 01 | [domain1-design-secure-architectures](01-domain1-design-secure-architectures.md) | IAM, VPC security, encryption, compliance | **30%** |
| 02 | [domain2-design-resilient-architectures](02-domain2-design-resilient-architectures.md) | HA, DR, scaling, decoupling | 26% |
| 03 | [domain3-design-high-performing-architectures](03-domain3-design-high-performing-architectures.md) | Storage, compute, DB, network, data | 24% |
| 04 | [domain4-design-cost-optimized-architectures](04-domain4-design-cost-optimized-architectures.md) | RI, Spot, storage classes, rightsizing | 20% |
| 05 | [aws-services-map-memorize](05-aws-services-map-memorize.md) | service ↔ purpose (memorize cold) | — |
| 06 | [well-architected-framework](06-well-architected-framework.md) | 6 pillars + design principles | — |
| 07 | [practice-exam](07-practice-exam.md) | **65 Qs** + answer key | — |
| 08 | [flashcards-key-terms](08-flashcards-key-terms.md) | term definitions & gotchas | — |
| 09 | [test-day-tactics](09-test-day-tactics.md) | question-type tactics + 24h checklist | — |
| 10 | [exam-scenario-playbook](10-exam-scenario-playbook.md) | **50 exam patterns** + trap answers | — |
| 11 | [architecture-patterns-reference](11-architecture-patterns-reference.md) | 10 reference architectures | — |

## The 10 things to remember
1. **Well-Architected** — 6 pillars: Ops Excellence, Security, Reliability, Performance, Cost, Sustainability.
2. **SG** = stateful instance firewall · **NACL** = stateless subnet firewall.
3. **Private subnet** + **NAT Gateway** = outbound internet only.
4. **S3** object · **EBS** block (EC2) · **EFS** shared NFS.
5. **Multi-AZ** = sync HA · **Read replica / CRR** = async DR/scale.
6. **ALB** L7 · **NLB** L4 ultra-low latency · **GWLB** security appliances.
7. **SQS Standard** at-least-once · **FIFO** exactly-once · **SNS** pub/sub.
8. **IAM roles** on compute — never embed access keys.
9. **RI/Savings Plans** steady state · **Spot** interruptible · **On-Demand** flexible.
10. **Route 53** — Weighted, Latency, Failover, Geolocation, Geoproximity.

## Exam facts
130 min · 65 Qs (50 scored) · pass **720/1000** · no penalty for guessing · compensatory scoring.
**Ace target: 55/65 (85%+) on practice exam.**

*Verify any number on aws.amazon.com/certification. Study, don't cram — sleep well. Good luck!*
