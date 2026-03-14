# Core Banking System — Business Flow Documentation

This document describes all operational flows for the core banking system. Each flow reflects the updated, system-oriented process — manual verification tools and paper-based steps have been replaced with system actions.

---

## Flow 1 — Individual Client Onboarding

**Purpose:** Register an individual client and collect all required identity information.

### Steps

1. Enter Personal Details — Name, DOB, Gender, Nationality, Marital Status, Profession
2. Enter Address — Province, Commune, Quartier, Avenue, Plot Number, Phone
3. Record ID Document — Type (National ID / Passport / CEPGL Card) + ID Number
4. **Decision: Minor?**
   - **Yes (right)** → Add Responsible Adult (full name + ID copy required) → continue to step 5
   - **No (left)** → continue to step 5
5. **Decision: Add Mandataire?**
   - **Yes (right)** → Record Mandataire Info (name + ID copy) → continue to step 6
   - **No (left)** → continue to step 6
6. Upload ID Document *(document)* — scan of National ID / Passport / CEPGL Card
7. Upload Passport Photos *(document)* — 2 photos required
8. Capture Biometric — Signature OR Fingerprint
9. Create Client Record — system assigns Client ID and saves profile

**End:** Client Registered

---

## Flow 2 — Business / Organization Onboarding

**Purpose:** Register a company, school, or organization as a client.

### Steps

1. Enter Company Name — name of company / school / organization
2. Add Authorized Representatives (Mandataires) — name, ID, address, role, signature
3. Enter Company Address — Quartier, Avenue, Commune, Plot Number
4. Define Signature Policy — mandatory signatories vs optional signatories
5. Upload Registration Documents *(document)* — ministerial decree / notarized statutes / business certificate
6. Upload Account Opening Request Letter *(document)* — must name authorized representatives
7. Capture Biometric per Representative — Signature OR Fingerprint

**End:** Business Client Registered

---

## Flow 3 — Account Opening

**Purpose:** Open a savings, checking, or business current account for a registered client. Account is created in Pending status and only becomes Active after the first deposit meets the minimum requirement.

### Steps

1. Select Client — client must already exist in the system
2. **Decision: Account Type?**
   - **Savings** → Savings Account (SAV-433)
   - **Checking** → Checking Account Series A
   - **Business** → Business Current Account Series B
3. Select Currency — USD or FC (Congolese Franc)
4. Generate Account Number
5. Status → Pending

**End:** Account Created — Pending

> **Note:** Account activation happens through the Deposit flow. The first deposit must be ≥ $20 to trigger activation.

---

## Flow 4 — Deposit Transaction

**Purpose:** Deposit money into a savings, checking (Series A), or business current (Series B) account. Handles both active accounts and pending accounts requiring initial activation.

### Steps

1. Teller Enters Account Number
2. System Retrieves Account
3. **Decision: Account Pending?**
   - **Yes (right)** → Verify Deposit ≥ $20 (minimum required to activate account) → Activate Account — Status: Active → continue to step 4
   - **No (left)** → continue to step 4
4. Teller Enters Amount + Reason (Motif)
5. System Updates Account Balance
6. Accounting Module: Generate Journal Entry — Debit Cash / Credit Deposits Account
7. Issue Deposit Slip *(document)* — Bordereau de Versement

**End:** Deposit Complete

---

## Flow 5 — Withdrawal Transaction

**Purpose:** Withdraw money from an account. Verification steps differ by account type.

### Steps

1. **Decision: Account Type?**

   | Savings | Checking A | Business B |
   |---|---|---|
   | Teller Retrieves Account | Teller Retrieves Account | Teller Retrieves Account |
   | Teller Verifies Account & Client Information | Teller Verifies Account & Client Information | Teller Enforces Signature Policy (Single / Two / Mandatory + Optional) |

2. Teller Enters Withdrawal Amount
3. System Validates Balance
4. System Updates Balance
5. Accounting Module: Generate Journal Entry — Debit Deposits Account / Credit Cash
6. Issue Withdrawal Slip *(document)* — Bordereau

**End:** Withdrawal Complete

---

## Flow 6 — Transfer Transaction

**Purpose:** Transfer money from a sender to a recipient, either with or without a bank account.

### Steps

1. Sender Completes Withdrawal Process — following standard withdrawal flow
2. **Decision: Recipient has an Account?**

**Yes path — Internal Transfer:**
- Teller Enters Recipient Account Number or Name
- System Verifies Destination Account
- System Debits Sender / Credits Recipient
- Accounting Module: Generate Journal Entry
- Issue Deposit Slip *(document)* — Bordereau de Versement

**No path — External Transfer:**
- Sender Provides Recipient Full Name
- Apply Transfer Fee: 1% of amount
- Accounting Module: Generate Journal Entry
- Bank Issues Transfer Document *(document)* — 2 copies (bank copy + client copy)
- Recipient Presents Document to Claim Money

**End:** Transfer Complete

---

## Flow 7 — Loan Application

**Purpose:** End-to-end loan process covering all three loan types, officer review, disbursement, and repayment monitoring with penalty handling.

### Prerequisites

- Client account must be active for at least 6 months

### Step 1 — Loan Type Selection

**Decision: Loan Type?**

| Avance sur Salaire | Prêt Ordinaire | Découvert / Facilité de Caisse |
|---|---|---|
| 1 month · 2.5% · Max 50% salary · $12 form fee | 10–12 months · 5% · Amount by officer | 3 months · 2.5%/month · Amount by officer |
| Submit: Formulaire + Lettre de demande (Protocole d'accord + Acte d'engagement) | Submit: Certificat d'enregistrement + Formulaire + Lettre | Submit: Caution Morale + same docs as Prêt Ordinaire |

### Step 2 — Review & Approval

1. Loan Officer Reviews Request
2. **Decision: Approved?**
   - **No (left)** → Loan Rejected
   - **Yes (right)** → Loan Disbursed to Client Account → Monitor Monthly Repayment

### Step 3 — Repayment Monitoring

**Decision: Payment Status?**

| On Time | 1st Month Late | > 1 Month Late |
|---|---|---|
| Record Repayment + Interest | Send Reminders | Apply 11% Penalty Fee |
| Loan Fully Repaid | *(Client returns to next payment cycle)* | Record Repayment + Interest |
| | | Loan Fully Repaid |

---

## Flow 8 — Accounting & Journal Entry Flow

**Purpose:** Every financial operation automatically generates double-entry accounting records that update the general ledger and financial reports.

### Step 1 — Operation Type

**Decision: Operation Type?**

| Deposit | Withdrawal | Loan Disbursement | Loan Repayment | Fee / Penalty |
|---|---|---|---|---|
| Debit: Cash | Debit: Deposits | Debit: Loan Portfolio | Debit: Cash | Debit: Client Account |
| Credit: Deposits | Credit: Cash | Credit: Cash | Credit: Loan Portfolio + Interest Income | Credit: Fee Income |

### Step 2 — Journal Processing

1. System Creates Journal Entry — Entry ID, Date, Reference, Description, User
2. System Creates Journal Lines — Account, Debit Amount, Credit Amount
3. Validate: Total Debits = Total Credits
4. Post Entry to General Ledger
5. Ledger Updated
6. Update Financial Reports — Cash In · Cash Out · Monthly Revenue · Monthly Expenses

**End:** Accounting Complete
