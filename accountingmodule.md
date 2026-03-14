## Module Purpose

The **Accounting Module** records and organizes all financial movements of the institution from an accounting perspective.

While the **Transactions Module** processes operational activities such as deposits, withdrawals, and transfers, the Accounting Module:

- records the **accounting impact** of these operations
- maintains the **general ledger**
- ensures **double-entry accounting integrity**
- produces **monthly financial reports**

The module must guarantee:

- accuracy of financial records
- traceability of transactions
- automatic journal generation
- reliable reporting for management and auditors

---

# Accounting Principles

The system follows **double-entry accounting**.

Every financial operation generates at least **two accounting entries**:

- one **debit**
- one **credit**

Example:

Client deposits $100 to savings.

| Account | Debit | Credit |
| --- | --- | --- |
| Cash | 100 |  |
| Savings Deposits |  | 100 |

This guarantees:

```
Total Debits = Total Credits
```

This rule prevents accounting imbalance and ensures reliability at scale.

---

# Module Components

The Accounting Module contains five main components:

1. Chart of Accounts
2. Journal Entries
3. Journal Lines
4. Accounting Categories
5. Financial Reports

---

# 1. Chart of Accounts

## Purpose

Defines all accounting accounts used by the institution.

Each financial transaction must be linked to one or more accounts.

## Data Structure

| Field | Description |
| --- | --- |
| Account Code | Unique accounting code |
| Account Name | Name of the account |
| Account Type | Asset / Liability / Revenue / Expense / Equity |
| Parent Account | Optional hierarchy |
| Status | Active / Inactive |

## Examples

| Code | Name | Type |
| --- | --- | --- |
| 1001 | Cash | Asset |
| 2001 | Savings Deposits | Liability |
| 2002 | Current Accounts | Liability |
| 4001 | Interest Income | Revenue |
| 6001 | Electricity Expense | Expense |

---

# 2. Journal Entries

## Purpose

A journal entry represents a **financial event** recorded in the accounting system.

Each entry groups the debit and credit lines that describe the financial impact of an operation.

Journal entries are usually **generated automatically from transactions**.

## Data Structure

| Field | Description |
| --- | --- |
| Entry ID | Unique identifier |
| Date | Entry date |
| Reference | Transaction reference |
| Description | Explanation of the entry |
| Created By | System user |
| Status | Draft / Posted |

---

# 3. Journal Lines

## Purpose

Each journal entry contains one or more **journal lines**.

Journal lines define the **accounts affected** and the **amounts debited or credited**.

## Data Structure

| Field | Description |
| --- | --- |
| Entry ID | Related journal entry |
| Account | Accounting account |
| Debit | Debit amount |
| Credit | Credit amount |

Example:

Loan repayment.

| Account | Debit | Credit |
| --- | --- | --- |
| Cash | 500 |  |
| Loan Portfolio |  | 450 |
| Interest Income |  | 50 |

---

# 4. Accounting Categories

## Purpose

Accounting categories allow grouping transactions for **reporting purposes**.

These categories correspond to the types of entries seen in the manual journals.

Examples from the current paper reports:

### Revenue Categories

- Versement compte courant
- Versement compte épargne
- Commissions
- Intérêts
- Autres recettes

### Expense Categories

- Electricité
- Essence
- Fournitures de bureau
- Matériel informatique
- Entretien
- Frais bancaires
- Autres charges

Each category is linked to an **account in the chart of accounts**.

---

# 5. Financial Reports

The system automatically generates reports based on journal entries.

These reports replicate the structure of the current accounting tables used by the institution.

---

# Report 1: Cash Journal — Versement (Money In)

## Purpose

Displays all **cash inflows during a given month**.

Equivalent to the **Versement journal** used manually today.

## Data Source

Generated from:

- journal entries
- revenue accounts
- deposit transactions

## Report Structure

| Date | Previous Balance | Savings | Cheques | Current | Sub Total | Other Income | Total |

This report allows accountants to follow **daily inflows and cash movement**.

---

# Report 2: Cash Journal — Remboursement (Money Out)

## Purpose

Displays all **cash outflows during the month**.

Equivalent to the **Remboursement journal**.

## Data Source

Generated from:

- withdrawal transactions
- expense accounts
- operational payments

## Report Structure

| Date | Savings | Cheques | Current | Sub Total | Expenses | Other | Total |

---

# Report 3: Monthly Revenue Summary

## Purpose

Displays **all income grouped by category for the month**.

Equivalent to the **Recettes journal**.

## Example Output

| Category | Amount |
| --- | --- |
| Versement compte courant | XXXX |
| Versement compte épargne | XXXX |
| Commission encaissement | XXXX |
| Intérêts sur prêts | XXXX |
| Autres recettes | XXXX |
| **Total Recettes** | XXXX |

---

# Report 4: Monthly Expense Summary

## Purpose

Displays **all expenses grouped by category**.

Equivalent to the **Dépenses journal**.

## Example Output

| Category | Amount |
| --- | --- |
| Electricité | XXXX |
| Essence | XXXX |
| Fournitures bureau | XXXX |
| Matériel informatique | XXXX |
| Entretien | XXXX |
| Frais bancaires | XXXX |
| Autres charges | XXXX |
| **Total Dépenses** | XXXX |

---

# Integration With Other Modules

The Accounting Module receives data automatically from:

### Transactions Module

- deposits
- withdrawals
- transfers

### Loan Module

- loan disbursement
- loan repayments
- interest payments

### Fees

- penalties
- commissions
- service fees

Each operation automatically generates **journal entries**.

No manual accounting entry is required for standard operations.

---

# Internal Controls

To reduce errors and ensure reliability, the system must enforce:

### Double-entry validation

Every journal entry must satisfy:

```
Total Debits = Total Credits
```

---

### Transaction traceability

Each accounting entry must store:

- originating transaction
- user who performed the operation
- timestamp

---

### Audit history

The system records:

- creation
- modification
- approval

---

# Scalability

This design allows the system to handle:

- millions of transactions
- multiple branches
- large financial volumes

Reports are generated dynamically from the accounting ledger, ensuring accuracy and consistency even as the institution grows.