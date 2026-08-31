# Domain 1 — Design Secure Architectures (30% of scored exam)

*Highest-weight domain. Expect scenario questions on IAM, VPC networking, encryption, and "which security service?"*

## Shared Responsibility Model (security lens)

| Layer | AWS is responsible for | **You** are responsible for |
|---|---|---|
| **Infrastructure** | Physical security of data centers, hardware, hypervisor, managed service patching (where applicable) | — |
| **Platform / managed services** | OS patching on managed compute (e.g., RDS engine), service availability, encryption *options* | Configuring security groups, encryption settings, IAM access, network placement |
| **Customer data & apps** | — | Data classification, encryption key management choices, IAM policies, app-level security, OS patching on EC2, client-side encryption |
| **Identity & access** | IAM service itself | Creating users/roles, MFA, least privilege, credential rotation, federation setup |
| **Network config** | Global network fabric | VPC design, subnets, NACLs/SGs, routing, VPN/DX setup on your side |

**Exam shortcut:** If the question is about *choosing/designing* security controls → **customer**. If about *underlying hardware/hypervisor* → **AWS**.

---

## T1.1 — Design secure access to AWS resources

### IAM building blocks

| Component | Purpose | Exam notes |
|---|---|---|
| **IAM User** | Long-term identity with access keys / console password | Avoid for apps; prefer roles. Enable MFA. One human = one user. |
| **IAM Group** | Collection of users; attach policies here | Groups cannot be principals in resource policies. No nesting. |
| **IAM Role** | Temporary credentials via **STS**; assumed by users, services, or accounts | **Default for EC2, Lambda, cross-account.** No access keys stored on role itself. |
| **IAM Policy** | JSON document: Effect, Action, Resource, Condition | Identity-based (user/role/group) or resource-based (S3 bucket, KMS key, SNS). |
| **Permission boundary** | Sets the **maximum** permissions a role/user can ever have | Does **not** grant permissions by itself — caps what identity policies can allow. |
| **Service control policy (SCP)** | Applied in **AWS Organizations** to **accounts or OUs** | **Guardrail** — never grants permissions; filters what identity/resource policies can allow. Does **not** affect management account by default. |

### Policy evaluation logic (memorize)

```
1. Explicit DENY  → always wins
2. Explicit ALLOW → if no deny
3. Implicit DENY  → default (no allow = denied)
```

- **Resource-based policies** (S3 bucket policy, KMS key policy) can grant cross-account access **without** a role in the other account — but the **external account's IAM** must still allow the action (unless bucket policy is open).
- **Cross-account role:** Account A creates role trusting Account B → user in B **assumes role** → gets temporary creds in A.

### Federation & SSO

| Method | Protocol | Typical use |
|---|---|---|
| **IAM Identity Center (SSO)** | SAML 2.0 / OIDC | Central SSO portal → permission sets → AWS accounts & apps. **Preferred over per-account IAM users.** |
| **SAML 2.0 federation** | SAML | Enterprise IdP (AD FS, Okta, Azure AD) → AWS (via IAM or Identity Center). |
| **OIDC federation** | OpenID Connect | Web/mobile apps, GitHub Actions, EKS IRSA. |
| **Web identity (Cognito)** | OIDC/OAuth | Consumer-facing apps → federated AWS access via Cognito Identity Pools. |

**Confusion pair — IAM Identity Center vs IAM:**
- **Identity Center** = org-wide SSO, permission sets, multi-account access from one portal.
- **IAM** = per-account identities and policies. Legacy: create IAM user in every account (avoid).

### MFA & credential hygiene

- **Virtual MFA** (app), **hardware MFA** (YubiKey / U2F), **SMS** (discouraged).
- **Root account:** enable MFA; use only for break-glass tasks; create admin IAM user/role for daily work.
- **Access keys:** rotate; never embed in code → use **IAM roles** (EC2 instance profile, Lambda execution role).
- **STS temporary credentials** expire (default 1h, up to 12h for role chaining scenarios).

### Least privilege patterns

- Start with **AWS managed policies** (broad) → refine to **customer managed** → **inline** for one-off.
- Use **IAM Access Analyzer** to find overly permissive policies and external access.
- **Condition keys:** `aws:MultiFactorAuthPresent`, `aws:SourceIp`, `aws:PrincipalOrgID`, `s3:prefix`, `kms:ViaService`.
- **Permission boundaries** + **SCPs** = defense in depth for delegated admin / sandbox accounts.

### T1.1 service cheat sheet

| Service / feature | One-line purpose |
|---|---|
| **IAM** | Users, groups, roles, policies |
| **IAM Identity Center** | Org SSO + permission sets |
| **STS** | Issue temporary security credentials |
| **Organizations + SCPs** | Multi-account guardrails |
| **IAM Access Analyzer** | External access & policy findings |
| **AWS IAM Identity Center** | (same as SSO) |

### T1.1 confusion pairs

| A | B | Pick A when… | Pick B when… |
|---|---|---|---|
| **IAM Role** | **IAM User** | EC2/Lambda/cross-account/service access | Legacy long-term human (prefer SSO instead) |
| **Identity-based policy** | **Resource-based policy** | Attach to user/role/group | Attach to S3 bucket, KMS key, SNS topic |
| **Permission boundary** | **SCP** | Cap max permissions for a **role/user** in one account | Cap max permissions for **whole account/OU** in org |
| **SCP** | **IAM policy** | Org-wide deny guardrail (e.g., no `us-east-1`) | Grant/deny specific actions to identities |
| **SAML federation** | **OIDC** | Enterprise IdP SSO | Web/mobile, CI/CD, Kubernetes IRSA |
| **AssumeRole** | **GetSessionToken** | Cross-account or elevated role | MFA-protected long-term user session extension |

---

## T1.2 — Design secure workloads and applications

### VPC subnet design

```
Internet
    │
 [IGW] ──► Public subnet (route 0.0.0.0/0 → IGW)
              │ NAT Gateway / NAT Instance
              ▼
         Private subnet (route 0.0.0.0/0 → NAT) — outbound internet, no inbound
              │
         Isolated subnet (no default route to IGW/NAT) — DB tier, no internet
```

| Subnet type | Route to IGW | Route to NAT | Typical workloads |
|---|---|---|---|
| **Public** | Yes (direct) | — | ALB, NAT Gateway, bastion (legacy) |
| **Private (with NAT)** | No | Yes (0.0.0.0/0 → NAT) | App servers, Lambda in VPC |
| **Isolated / private no NAT** | No | No | RDS, ElastiCache, internal-only |

### Security Groups vs NACLs

| | **Security Group (SG)** | **Network ACL (NACL)** |
|---|---|---|
| **Level** | Instance/ENI (stateful) | Subnet (stateless) |
| **State** | **Stateful** — return traffic auto-allowed | **Stateless** — must allow inbound AND outbound explicitly |
| **Rules** | Allow only; evaluate all rules | Allow + deny; numbered order (lowest first) |
| **Scope** | One SG → many ENIs; many SGs → one ENI | One NACL per subnet |
| **Default** | Default SG: allow outbound, deny inbound from outside | Default: allow all in/out |
| **Exam tip** | Primary control for instances | Subnet-level deny/block (e.g., block IP range) |

### NAT Gateway vs NAT Instance

| | **NAT Gateway** | **NAT Instance** |
|---|---|---|
| **Managed** | Yes (AWS) | Self-managed EC2 |
| **AZ** | One per AZ; create in each AZ for HA | Single point; you patch/scale |
| **Bandwidth** | Up to 100 Gbps | Instance type limited |
| **Cost** | Hourly + data processing | EC2 hourly |
| **Exam answer** | Almost always preferred | Legacy / exam distractor |

### VPC endpoints — Gateway vs Interface

| | **Gateway Endpoint** | **Interface Endpoint (PrivateLink)** |
|---|---|---|
| **Services** | **S3**, **DynamoDB** only | Most other AWS APIs (EC2, SNS, SQS, KMS, Secrets Manager, etc.) |
| **Cost** | Free | Hourly + data per AZ |
| **Route** | Route table entry (prefix list) | ENI with private IP in subnet |
| **Access control** | Bucket policy + endpoint policy | SG on endpoint ENI + resource policy |
| **DNS** | Not needed | `enableDnsSupport` + private DNS name |

**PrivateLink** = expose **your** service to other VPCs/accounts via NLB + endpoint service. Consumer uses **interface endpoint**.

### Edge & network security services

| Service | Layer | Does what |
|---|---|---|
| **AWS WAF** | Layer 7 (HTTP/S) | Web ACLs: SQLi, XSS, geo block, rate-based rules. Attach to **ALB, CloudFront, API Gateway, AppSync**. |
| **AWS Shield Standard** | L3/L4 | Free DDoS protection for CloudFront, Route 53, ALB, Global Accelerator |
| **AWS Shield Advanced** | L3/L4/L7 | Paid 24/7 DRS, cost protection, advanced metrics; includes WAF fees for some resources |
| **AWS Network Firewall** | VPC | Stateful/stateless inspection, domain filtering, IPS, east-west + egress traffic in VPC |
| **GuardDuty** | Threat detection | ML-based; analyzes CloudTrail, VPC Flow Logs, DNS — **not** a firewall |

### Load balancer security

| | **ALB** | **NLB** |
|---|---|---|
| **Layer** | L7 (HTTP/HTTPS) | L4 (TCP/UDP/TLS) |
| **WAF** | Yes | No (use Shield) |
| **TLS termination** | ACM cert on listener | TLS listener or pass-through |
| **Use case** | Web apps, path/host routing | Static IP, extreme performance, PrivateLink target |
| **Security** | SG on ALB; target can be private | SG optional on NLB (newer); targets private |

- **ALB in public subnets** → targets in **private subnets** (common secure pattern).
- **Security groups:** ALB SG allows 443 from internet; app SG allows 443 **only from ALB SG** (not 0.0.0.0/0).

### Hybrid & remote connectivity

| Option | Connection | Use when |
|---|---|---|
| **Site-to-Site VPN** | Encrypted tunnel over internet to VGW or Transit Gateway | Quick hybrid, backup link, moderate bandwidth |
| **AWS Client VPN** | Users → AWS (OpenVPN-based managed service) | Remote workforce to VPC |
| **Direct Connect (DX)** | Dedicated private fiber to AWS | Consistent low latency, high bandwidth, compliance |
| **DX + VPN** | DX primary, VPN backup | Resilient hybrid |
| **Transit Gateway (TGW)** | Hub for VPCs, VPN, DX, peering | Many VPCs/accounts; central routing |

**Bastion host:** EC2 jump box in public subnet → SSH/RDP to private instances. Exam trend: prefer **SSM Session Manager** (no open SSH port, no bastion).

### T1.2 confusion pairs

| A | B | Pick A when… | Pick B when… |
|---|---|---|---|
| **SG** | **NACL** | Instance-level allow rules (default) | Subnet-level deny/block specific CIDRs |
| **Gateway endpoint** | **Interface endpoint** | Private access to **S3 or DynamoDB** | Private access to **KMS, Secrets Manager, etc.** |
| **NAT Gateway** | **IGW** | Outbound internet from **private** subnet | Inbound/outbound for **public** subnet resources |
| **WAF** | **Network Firewall** | HTTP/S app exploits (SQLi, XSS) | VPC-wide L3–L7 filtering, domain lists, IPS |
| **Shield Standard** | **Shield Advanced** | Default free DDoS (always on) | Enterprise DDoS + DRT + cost protection |
| **Site-to-Site VPN** | **Direct Connect** | Fast to deploy, lower cost, over internet | Dedicated line, predictable performance |
| **PrivateLink** | **VPC Peering** | Access **specific service** across accounts/VPCs | Full network mesh between two VPC CIDRs |
| **Bastion** | **SSM Session Manager** | Legacy / exam distractor | No inbound SSH; IAM-based access (preferred) |

---

## T1.3 — Determine appropriate data security controls

### Encryption at rest

| Method | Key managed by | Exam trigger |
|---|---|---|
| **SSE-S3** | S3 (AES-256) | Default S3 encryption; simplest; no KMS audit trail |
| **SSE-KMS** | **AWS KMS** CMK | Need key rotation, audit (CloudTrail), granular IAM, cross-account |
| **SSE-C** | **Customer** provides key; S3 encrypts/decrypts | You manage keys outside AWS; rare |
| **Client-side encryption** | Customer before upload | Maximum control; you handle all crypto |
| **EBS / RDS / Redshift / etc.** | KMS CMK (default or specified) | Enable at creation; can't downgrade RDS encryption |

### AWS KMS essentials

- **CMK (Customer Master Key)** — never export plaintext key material in standard KMS.
- **AWS managed key** — free, AWS rotates, service-scoped (`aws/s3`).
- **Customer managed key** — you control policy, rotation, deletion window.
- **AWS CloudHSM** — **FIPS 140-2 Level 3** hardware; **you** manage keys on dedicated HSM cluster. Use when regulations require single-tenant HSM or custom key hierarchy. KMS can use CloudHSM as custom key store (custom key store).
- **Envelope encryption:** data key encrypts data; CMK encrypts data key.

### Encryption in transit

- **TLS 1.2+** everywhere (HTTPS, SSL on RDS, in-transit options on ElastiCache, etc.).
- **ACM (AWS Certificate Manager)** — provision/manage **public and private** TLS certs; auto-renew public certs used with ALB, CloudFront, API Gateway.
- **S3:** HTTPS-only bucket policies (`aws:SecureTransport`).
- **VPN / DX** encrypt traffic over the wire to AWS.

### Secrets Manager vs SSM Parameter Store

| | **Secrets Manager** | **SSM Parameter Store** |
|---|---|---|
| **Purpose** | Secrets (DB creds, API keys) | Config + secrets (hierarchical paths) |
| **Rotation** | **Built-in automatic rotation** (Lambda) | Manual or custom Lambda |
| **Cost** | Per secret + API calls | Standard params free; Advanced = paid |
| **Encryption** | KMS | KMS (SecureString) |
| **Exam pick** | "Automatic rotation of RDS password" | "Store AMI ID / config hierarchy / non-rotating secret" |

### S3 security controls

| Control | Purpose |
|---|---|
| **Bucket policy** | Resource-based IAM; cross-account, IP restriction, HTTPS-only |
| **Block Public Access (BPA)** | Account + bucket level; **override** any policy that would make bucket public |
| **Object Lock (WORM)** | Compliance mode / governance mode; retention legal hold |
| **Versioning** | Protect against overwrite/delete (with MFA delete optional) |
| **S3 Access Points** | Named access with dedicated policy per app/workload |

### Data discovery & classification

| Service | Does what |
|---|---|
| **Amazon Macie** | ML discovery of **PII** in S3; alerts, findings |
| **Amazon Inspector** | **Vulnerability scanning** for EC2, ECR container images, Lambda |
| **Amazon GuardDuty** | Threat detection (compromised instances, crypto mining, anomalous API) |
| **AWS Security Hub** | **Aggregate** findings from GuardDuty, Inspector, Macie, firewalls, partners — CSPM dashboard |
| **AWS Config** | **Configuration compliance** rules (is encryption on? is SG open?) |
| **AWS CloudTrail** | **API audit log** — who did what, when (management + optional data events) |
| **AWS Artifact** | On-demand **compliance reports** (SOC, PCI, ISO) — not a monitoring tool |

### Cognito (application identity)

| Component | Purpose |
|---|---|
| **User Pools** | User directory + sign-up/sign-in (OAuth/OIDC/SAML); JWT tokens |
| **Identity Pools** | Exchange federated/user pool tokens for **temporary AWS credentials** (fine-grained IAM roles) |
| **Exam scenario** | Mobile/web app users need AWS resource access → Cognito Identity Pool + IAM roles |

### T1.3 monitoring & compliance stack

```
CloudTrail (API audit) ──┐
Config (resource compliance) ──┼──► Security Hub (central findings)
GuardDuty (threats) ──┤
Inspector (vulnerabilities) ──┤
Macie (S3 PII) ──┘
```

### T1.3 confusion pairs

| A | B | Pick A when… | Pick B when… |
|---|---|---|---|
| **SSE-S3** | **SSE-KMS** | Simple default encryption | Audit trail, key policy, cross-account key use |
| **KMS** | **CloudHSM** | Managed keys, envelope encryption (most cases) | FIPS 140-2 L3, single-tenant HSM, custom key hierarchy |
| **Secrets Manager** | **Parameter Store** | Automatic secret **rotation** | Cheap config storage, hierarchical `/app/prod/` paths |
| **GuardDuty** | **Inspector** | Detect **threats/anomalies** | Scan for **CVEs/vulnerabilities** |
| **Security Hub** | **Config** | Central **security findings** dashboard | **Compliance rules** on resource configurations |
| **CloudTrail** | **VPC Flow Logs** | **Who** called **which API** | **IP/port** traffic metadata (not payload) |
| **Macie** | **Config** | Find **PII in S3** | Check "is bucket encrypted / public?" |
| **Artifact** | **Security Hub** | Download **compliance reports** (auditors) | Operational **security findings** |
| **User Pool** | **Identity Pool** | Authenticate **users** to your app | Grant users **AWS credentials** |
| **Object Lock** | **Versioning** | **Regulatory WORM** / legal hold | Accidental delete/overwrite protection |

---

## Domain 1 — Master service table

| Service | Category | Remember |
|---|---|---|
| IAM / Identity Center / STS | Access | Roles > users; SSO for humans; temp creds |
| Organizations SCP | Access | Org guardrails; never grants |
| VPC / SG / NACL | Network | SG stateful; NACL stateless deny |
| NAT GW / IGW | Network | NAT = outbound from private; IGW = public |
| VPC endpoints | Network | Gateway = S3/DDB; Interface = everything else |
| WAF / Shield / Network Firewall | Edge/VPC | WAF = L7 web; Shield = DDoS; NetFW = VPC inspection |
| KMS / CloudHSM | Encryption | KMS managed; HSM = dedicated hardware |
| Secrets Manager / SSM | Secrets | Rotation → Secrets Manager |
| Macie / GuardDuty / Inspector / Security Hub | Detection | PII / threats / CVEs / aggregate |
| CloudTrail / Config | Audit/compliance | API log / resource config rules |
| Cognito | App identity | User Pool = auth; Identity Pool = AWS creds |
| ACM | TLS | Free public certs for AWS services |
| Artifact | Compliance | SOC/PCI reports for auditors |

---

## Domain 1 quick-fire Qs (self-check)

- Q: EC2 app needs S3 access → **IAM role + instance profile** (not access keys).
- Q: Prevent any account in the org from disabling CloudTrail → **SCP** with Deny on `cloudtrail:StopLogging`.
- Q: Developer needs max permissions capped even if admin attaches `AdministratorAccess` → **permission boundary**.
- Q: Cross-account S3 access without role in consumer account → **bucket policy** granting consumer account principal (+ IAM allow on consumer side).
- Q: Enterprise users SSO into multiple AWS accounts → **IAM Identity Center** + permission sets.
- Q: Private subnet instances need OS patches from internet → **NAT Gateway** in public subnet + private route table.
- Q: Lambda in VPC needs Secrets Manager without public internet → **Interface VPC endpoint** for Secrets Manager.
- Q: Block SQL injection on internet-facing API → **AWS WAF** on ALB or API Gateway.
- Q: Free DDoS protection for CloudFront → **Shield Standard** (automatic).
- Q: Inspect egress traffic and block known bad domains at VPC level → **AWS Network Firewall**.
- Q: RDS password rotated automatically every 30 days → **Secrets Manager** rotation.
- Q: Need FIPS 140-2 Level 3 dedicated HSM → **CloudHSM** (not standard KMS).
- Q: Find which S3 buckets contain credit card numbers → **Amazon Macie**.
- Q: Detect compromised EC2 calling odd API endpoints → **GuardDuty**.
- Q: Scan EC2 for missing patches/CVEs → **Inspector**.
- Q: Single pane for GuardDuty + Inspector + firewall findings → **Security Hub**.
- Q: Prove who deleted a production S3 object → **CloudTrail** data event (must be enabled).
- Q: Ensure all EBS volumes are encrypted → **AWS Config** rule + remediation.
- Q: Mobile app users upload to S3 with temporary AWS creds → **Cognito Identity Pool** + IAM role.
- Q: Compliance auditor needs AWS SOC 2 report → **AWS Artifact** (not Security Hub).
- Q: S3 bucket must never be public even if admin misconfigures policy → **Block Public Access** at account level.
- Q: Regulatory requirement: objects cannot be deleted for 7 years → **S3 Object Lock** (compliance mode).
- Q: Remote employees access private VPC resources securely → **AWS Client VPN** or **SSM Session Manager**.
- Q: Consistent 10 Gbps private link to on-premises datacenter → **Direct Connect** (VPN is backup).
- Q: 50 VPCs need hub-and-spoke connectivity → **Transit Gateway**.

---

## T1.x scenario decision trees (exam speed)

**"Secure human access"**
```
Many accounts + IdP → Identity Center
One account + IdP → SAML/OIDC federation → IAM role
Break-glass → root + MFA (rare use)
```

**"Instance needs AWS API access"**
```
Always → IAM role (never long-term keys on disk)
```

**"Private AWS service access from VPC"**
```
S3 or DynamoDB → Gateway endpoint
Anything else → Interface endpoint (+ SG + endpoint policy)
```

**"Encrypt data at rest with audit"**
```
SSE-KMS with customer managed CMK (+ key policy + CloudTrail)
```

**"Something bad happened / proactive threat detection"**
```
API audit → CloudTrail
Threat behavior → GuardDuty
Misconfig → Config + Security Hub
Vuln scan → Inspector
PII leak risk → Macie
```

---

## IAM Policy Deep Dive (exam essentials)

### JSON policy anatomy
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowS3Read",
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::ACCOUNT:user/alice"},
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"],
    "Condition": {
      "StringEquals": {"aws:PrincipalOrgID": "o-abc123"},
      "Bool": {"aws:SecureTransport": "true"}
    }
  }]
}
```

| Field | Purpose | Exam note |
|---|---|---|
| **Effect** | Allow or Deny | Explicit Deny always wins |
| **Principal** | Who (resource-based policies only) | `*` = anyone; use account ID for cross-account |
| **Action** | API operations | Use wildcards carefully (`s3:*`) |
| **Resource** | ARN of affected resources | Bucket vs object ARNs differ for S3 |
| **Condition** | Optional constraints | `aws:SourceIp`, `aws:MultiFactorAuthPresent`, `s3:prefix` |

### Cross-account S3 bucket policy example
```json
{
  "Effect": "Allow",
  "Principal": {"AWS": "arn:aws:iam::111122223333:root"},
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::shared-data/*"
}
```
Consumer account users still need an **identity policy** allowing `s3:GetObject` on that bucket (unless bucket policy grants `*`).

### SCP example — deny leaving organization
```json
{
  "Effect": "Deny",
  "Action": ["organizations:LeaveOrganization"],
  "Resource": "*"
}
```
SCPs **never grant** — they only filter what identity/resource policies can allow.

### Trust policy for cross-account AssumeRole
```json
{
  "Effect": "Allow",
  "Principal": {"AWS": "arn:aws:iam::111122223333:root"},
  "Action": "sts:AssumeRole",
  "Condition": {"StringEquals": {"sts:ExternalId": "unique-external-id"}}
}
```
**ExternalId** prevents confused deputy problem in cross-account access.

### High-value condition keys
| Condition key | Use case |
|---|---|
| `aws:MultiFactorAuthPresent` | Require MFA for sensitive actions |
| `aws:SourceIp` | Restrict to corporate IP range |
| `aws:PrincipalOrgID` | Only principals from your org |
| `aws:SecureTransport` | Enforce HTTPS/TLS |
| `aws:SourceArn` | Restrict who can invoke Lambda/SNS |
| `s3:prefix` | Limit S3 listing to specific prefixes |
| `kms:ViaService` | Key only usable via specific AWS service |
| `ec2:Vpc` | Restrict API calls to specific VPC |

---

## Organizations & Multi-Account Security

### Control Tower landing zone
- **Account Factory** — automated new account provisioning with guardrails.
- **Guardrails** — implemented as SCPs (mandatory) and Config rules (detective).
- **Dashboard** — drift detection across org.

### Centralized security account pattern
```
Management Account (Organizations root)
├── Security OU
│   ├── Log Archive Account (CloudTrail org trail, Config aggregator)
│   └── Security Tooling Account (GuardDuty admin, Security Hub delegated admin)
├── Workloads OU
│   ├── Production accounts
│   └── Development accounts (SCPs restrict prod services)
```

### Common SCP guardrails
| SCP | Blocks |
|---|---|
| Deny unapproved regions | `ec2:*` in non-approved regions |
| Deny root user actions | All actions when `aws:PrincipalArn` = root |
| Require encryption | Deny `s3:PutObject` without `s3:x-amz-server-side-encryption` |
| Deny disabling security | `cloudtrail:StopLogging`, `guardduty:DeleteDetector` |
| Deny public S3 | `s3:PutBucketPublicAccessBlock` inverted logic |

### AWS Firewall Manager
- Centrally manage **WAF rules**, **Security Groups**, **Network Firewall policies**, **Shield Advanced** across accounts/regions.
- Use when: multi-account org needs consistent firewall rules without per-account config.

---

## Advanced VPC Security Scenarios

### 3-tier web app security checklist
```
Internet → [Route 53] → [ALB in public subnet, SG: 443 from 0.0.0.0/0]
                              ↓ (SG: 443 from ALB-SG only)
                         [App EC2 in private subnet + NAT GW]
                              ↓ (SG: 3306 from App-SG only)
                         [RDS in isolated subnet, no internet route]
```
- **WAF** on ALB for SQLi/XSS protection.
- **ACM** cert on ALB listener (TLS termination).
- **No SSH ports open** — use SSM Session Manager.
- **VPC Flow Logs** to CloudWatch/S3 for traffic analysis.

### Flow Logs vs CloudTrail vs GuardDuty
| Tool | What it logs | Use for |
|---|---|---|
| **VPC Flow Logs** | IP/port/protocol/packets (no payload) | Network troubleshooting, anomaly detection |
| **CloudTrail** | API calls (who/when/what) | Audit, compliance, forensics |
| **GuardDuty** | ML analysis of Flow Logs + CloudTrail + DNS | Threat detection (compromised instances) |

### SSM Session Manager vs Bastion Host
| | **SSM Session Manager** | **Bastion Host** |
|---|---|---|
| Inbound port | None (outbound HTTPS to SSM) | SSH 22 / RDP 3389 open to internet |
| Auth | IAM policies | SSH keys / passwords |
| Audit | Session logs in S3/CloudWatch | Manual logging |
| Cost | Free (SSM API calls) | EC2 instance hourly |
| **Exam answer** | **Preferred** | Legacy distractor |

---

## Encryption Decision Matrix

| Requirement | Solution |
|---|---|
| Default S3 encryption, no audit needed | **SSE-S3** |
| Audit key usage, granular IAM, cross-account | **SSE-KMS** (customer managed CMK) |
| Customer provides key per request | **SSE-C** |
| Maximum control, encrypt before upload | **Client-side encryption** |
| FIPS 140-2 Level 3, dedicated hardware | **CloudHSM** |
| Reduce KMS API costs on high-volume S3 | **S3 Bucket Key** (one KMS request per bucket per object) |

### RDS/Aurora encryption
- Enable at **creation** — cannot enable encryption on existing unencrypted RDS (must snapshot → copy encrypted → restore).
- **In-transit:** force SSL via parameter group (`rds.force_ssl = 1`).
- **Aurora:** storage always encrypted; encryption at rest uses KMS.

### EBS encryption
- Encrypt by default at account level (recommended).
- Encrypted snapshots → encrypted volumes; can share encrypted snapshots cross-account with KMS key policy.

---

## Cognito Deep Dive

### User Pool vs Identity Pool flow
```
User Pool flow (authentication):
User → sign up/sign in → User Pool → JWT tokens (ID, access, refresh)

Identity Pool flow (AWS credentials):
JWT from User Pool (or Google/Facebook/SAML)
  → Identity Pool → STS temporary AWS credentials → access S3/DynamoDB/etc.
```

| Component | Purpose | Exam trigger |
|---|---|---|
| **User Pool** | User directory, sign-up/in, MFA, hosted UI | "Authenticate mobile app users" |
| **Identity Pool** | Exchange identity for **temporary AWS creds** | "Users upload directly to S3" |
| **User Pool + Identity Pool** | Full auth + AWS resource access | Most common mobile/web pattern |

### Federated identity providers
- **Social:** Google, Facebook, Apple, Amazon (via User Pool).
- **Enterprise:** SAML 2.0 (Okta, Azure AD), OIDC.
- **Fine-grained access:** map User Pool groups → different IAM roles in Identity Pool.

---

## Domain 1 — Additional quick-fire Qs (Q41–Q60)

- Q41: Prevent IAM users from disabling MFA → **IAM policy Deny** on `iam:DeactivateMFADevice` without MFA present condition.
- Q42: Audit all KMS key usage across accounts → **CloudTrail** with KMS data events + centralized log account.
- Q43: Block all traffic from a specific country → **WAF geo match rule** on CloudFront or ALB.
- Q44: Ensure no security group allows 0.0.0.0/0 on port 22 → **AWS Config rule** + Security Hub.
- Q45: Centralized WAF rules across 20 accounts → **Firewall Manager**.
- Q46: Developer needs SSH to private EC2 without opening port 22 → **SSM Session Manager**.
- Q47: S3 bucket policy allows public read but BPA is on → **BPA wins** — bucket stays private.
- Q48: Cross-account KMS encrypt: Account A encrypts with Account B's key → **Key policy in B** must allow Account A principal.
- Q49: Lambda needs VPC access to RDS in private subnet → Lambda in **same VPC private subnets** + **security group** allowing RDS port.
- Q50: Compliance requires keys never leave FIPS-validated hardware → **CloudHSM** (not standard KMS).
- Q51: Detect if someone enables public access on S3 bucket → **Macie** or **Config rule** + **Security Hub**.
- Q52: Web app needs OAuth login with Google → **Cognito User Pool** with Google identity provider.
- Q53: Mobile app users need direct S3 upload with temp creds → **Cognito Identity Pool** + IAM role with S3 PutObject.
- Q54: Prevent any account from creating resources outside us-east-1 → **SCP** Deny all actions where `aws:RequestedRegion` ≠ us-east-1.
- Q55: API calls must only come from corporate IP range → **IAM condition** `aws:SourceIp` or **VPC endpoint policy**.
- Q56: Encrypt EBS volumes automatically for all new instances → **EBS encryption by default** at account level.
- Q57: RDS credentials in code → **Wrong.** Use **Secrets Manager** + rotation + IAM auth where supported.
- Q58: Need TLS cert for custom domain on CloudFront → **ACM cert in us-east-1** (CloudFront requirement).
- Q59: Detect compromised IAM credentials calling unusual APIs → **GuardDuty**.
- Q60: Prove encryption is enabled on all RDS instances → **AWS Config** rule `rds-storage-encrypted`.

---

## Domain 1 — Exam Scenario Walkthroughs

### Scenario 1: Cross-account S3 access
**Stem:** Account A owns S3 bucket. Account B's Lambda needs read access. Least privilege, no long-term keys.
**Analysis:** Cross-account = resource-based policy on bucket + IAM role in Account B.
**Answer:** Bucket policy in A granting B's role `s3:GetObject` + IAM role in B with trust + `s3:GetObject` on bucket ARN.
**Traps:** IAM user with access keys (wrong — use role). Making bucket public (wrong — least privilege).

### Scenario 2: Private subnet Lambda needs AWS APIs
**Stem:** Lambda in VPC private subnet must call DynamoDB and Secrets Manager without internet.
**Analysis:** Private subnet = no IGW. DynamoDB = gateway endpoint. Secrets Manager = interface endpoint.
**Answer:** Gateway VPC endpoint for DynamoDB + Interface VPC endpoint for Secrets Manager.
**Traps:** NAT Gateway (works but costs money + data traverses internet path for some APIs). Public subnet (wrong — security).

### Scenario 3: Regulatory WORM storage
**Stem:** Financial records in S3 must be immutable for 7 years; even admins cannot delete.
**Analysis:** WORM = Write Once Read Many. S3 Object Lock compliance mode.
**Answer:** Enable S3 Object Lock on bucket (at creation) + compliance mode retention for 7 years.
**Traps:** Versioning alone (admins can delete versions). Glacier (retrieval, not immutability guarantee).

### Scenario 4: Enterprise SSO to 50 AWS accounts
**Stem:** 500 employees need SSO access to 50 AWS accounts with different permission levels per team.
**Analysis:** Multi-account SSO = IAM Identity Center, not per-account IAM users.
**Answer:** IAM Identity Center connected to corporate IdP + permission sets per team + account assignments.
**Traps:** SAML federation to single account (doesn't scale). IAM users in each account (operational nightmare).

### Scenario 5: Detect and block SQL injection
**Stem:** Public REST API behind ALB; block SQL injection and rate-limit abusive IPs.
**Analysis:** L7 web attack = WAF. Rate limiting = WAF rate-based rule.
**Answer:** AWS WAF web ACL on ALB with SQLi managed rule group + rate-based rule.
**Traps:** Security Group (L4, can't inspect HTTP). NACL (stateless, no L7). Shield (DDoS, not SQLi).

### Scenario 6: Encrypt with full key audit trail
**Stem:** Healthcare app stores PHI in S3; must encrypt at rest with auditable key usage and ability to disable keys.
**Analysis:** Audit = KMS CloudTrail integration. Customer control = customer managed CMK.
**Answer:** SSE-KMS with customer managed CMK + key policy restricting access + CloudTrail logging.
**Traps:** SSE-S3 (no per-key audit). SSE-C (customer manages keys but no KMS audit).

### Scenario 7: Secure hybrid connectivity
**Stem:** On-premises datacenter needs 10 Gbps private connection to AWS with encrypted backup link.
**Analysis:** Primary = Direct Connect. Backup = Site-to-Site VPN.
**Answer:** DX connection as primary + VPN over internet as backup (DX + VPN).
**Traps:** VPN only (insufficient bandwidth). VPC Peering (doesn't connect on-prem).

### Scenario 8: Centralized threat detection
**Stem:** Security team wants automated threat detection across all accounts without deploying agents.
**Analysis:** Agentless = GuardDuty (analyzes CloudTrail, Flow Logs, DNS logs).
**Answer:** Enable GuardDuty in all regions + delegate admin to security account + Security Hub aggregation.
**Traps:** Inspector (vulnerability scanning, not threat detection). Config (compliance, not threats).

### Scenario 9: Prevent public S3 exposure
**Stem:** Company had data breach from public S3 bucket. Prevent recurrence account-wide.
**Analysis:** Defense in depth: BPA + Config rules + Macie + SCP.
**Answer:** Enable S3 Block Public Access at **account level** + Config rule detecting public buckets + SCP denying `s3:PutBucketPublicAccessBlock` removal.
**Traps:** Bucket policy only (admin can override). Macie alone (detective, not preventive).

### Scenario 10: Temporary elevated access
**Stem:** Developer needs admin access for 2 hours to debug production issue. Audit trail required.
**Analysis:** Temporary + auditable = STS AssumeRole with time-limited session.
**Answer:** IAM role with elevated permissions + `sts:AssumeRole` with `aws:userid` condition + CloudTrail logging + optional approval workflow (IAM Identity Center).
**Traps:** Sharing root credentials (never). Creating permanent IAM user with admin (violates least privilege).
