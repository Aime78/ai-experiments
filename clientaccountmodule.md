## Module Purpose

The **Client Accounts Module** is responsible for creating and managing financial accounts that belong to clients.

An account represents a **financial container that stores balances** and will later interact with:

- Client Module
- Transactions Module
- Ledger Module

The module manages the **structure, configuration, and lifecycle of accounts**, but does **not process transactions**.

---

# 1. Global Account Rules

These rules apply to **all account types**.

### Minimum Opening Deposit

All accounts require a **minimum opening deposit of $20**.

Currency allowed:

- **USD**
- **FC (Congolese Franc)**

---

# 2. Account Products

The system currently supports **three account products**.

Each product defines:

- Account structure
- Checkbook rules
- Account numbering format
- Currency availability
- Product series

Future fields can include:

- Interest rate
- Minimum balance
- Dormancy period
- Withdrawal limits
- Fees

---

# 2.1 Savings Account (Compte d’Épargne)

This account is intended for **individual clients saving money**.

### Account Characteristics

Currency:

- USD
- FC

Account series:

```
50/001/2 → 50/999/2
Serie: 433
```

### Opening Requirements

- Minimum deposit: **$20**
- Client identification
- Passport photos
- Savings passbook

### Passbook

A **Savings Passbook (Livret d’épargne)** is required to track transactions.

Cost:

```
12 USD
```

### Product Code

Example internal configuration:

```
Product Name: Savings Account
Product Code: SAV-433
Type: Individual
Currency: USD / FC
Minimum Deposit: $20
Passbook Required: Yes
```

---

# 2.2 Checking Account (Compte Chèque – Série A)

This account is intended for **clients who need check payments**.

### Account Characteristics

Currency:

- USD
- FC

Account format example:

```
CADECO-1000-101.733 A/FC
CADECO-1000-101.733 A/USD
```

or

```
CADECO-1000-101.000
```

### Checkbook

Required:

```
Checkbook price: 12 USD
Format: Small format
```

### Product Code Example

```
Product Name: Checking Account
Product Code: CHK-A
Series: A
Currency: USD / FC
Minimum Deposit: $20
Checkbook: Small Format
Checkbook Cost: $12
```

---

# 2.3 Current Account for Businesses (Compte Courant – Série B)

This account is designed for **companies, schools, and organizations**.

### Account Characteristics

Currency:

- USD
- FC

Account number format:

```
CADECO-1000-010.733 B/FC
CADECO-1000-010.733 B/USD
```

### Checkbook

Required:

```
Checkbook price: 25 USD
Format: Large format
```

### Opening Requirements

Business accounts must provide:

- Company name
- Registration documents
- Authorized signatories

### Product Code Example

```
Product Name: Business Current Account
Product Code: CUR-B
Series: B
Currency: USD / FC
Minimum Deposit: $20
Checkbook: Large Format
Checkbook Cost: $25
Account Type: Business
```

---

# 3. Account Data Structure

Each account created in the system contains the following information.

### Core Fields

```
Account ID
Account Number
Account Type
Account Product
Currency
Client ID
Branch
Open Date
Status
Balance
```

### Additional Metadata

```
Account Series
Checkbook Type
Minimum Deposit Rule
Product Code
```

---

# 4. Account Status Management

Each account has a **lifecycle state**.

Possible statuses:

```
Pending
Active
Frozen
Dormant
Closed
```

Example lifecycle:

```
Create Account
      ↓
Activate Account
      ↓
Normal Operation
      ↓
Dormant (no activity for long time)
      ↓
Closed
```

---

# 5. Account Lifecycle

The system manages the following lifecycle steps.

### 1. Account Creation

The system:

- generates account number
- validates product rules
- verifies minimum deposit

Example:

```
Account ID: SAV-10234
Product: Savings
Currency: USD
Opening Deposit: $20
Status: Pending
```

---

### 2. Account Activation

After validation:

```
Status → Active
```

The account becomes operational.

---

### 3. Dormancy

If no activity for a long period:

```
Status → Dormant
```

---

### 4. Account Closure

When a client closes an account:

```
Status → Closed
```

---

# 6. Account Listing and Search

The module provides a system interface to list and search accounts.

Example listing:

```
Accounts
-------------------------------------------------
Account ID | Type | Currency | Balance | Status
-------------------------------------------------
SA-10023   | Savings | USD | 20 | Active
CHK-10045  | Checking | FC | 0 | Dormant
CUR-20001  | Business | USD | 5000 | Active
```

Used by:

- Bank operations
- Customer service
- Audits
- Reporting

---

# 7. Module Boundaries

The Client Accounts Module **does not handle money movement**.

It only manages **account structure and lifecycle**.

Money operations are handled by:

```
Transactions Module
```

# 8. System Architecture Position

In the core banking system:

```
Client Module
      ↓
Client Accounts Module
      ↓
Transactions Module
      ↓
Ledger Module
```

---

# Final Definition

The **Client Accounts Module** is responsible for:

> creating, structuring, and managing financial accounts that belong to clients and will later hold transactions and balances.
>