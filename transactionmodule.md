## Module Purpose

The **Transactions Module** is responsible for processing all financial movements affecting client accounts.

These operations update account balances and generate transaction records.

Supported transaction types:

- **Deposit**
- **Withdrawal**
- **Transfer**

Each transaction must be:

- validated
- recorded in the system
- documented using official bank forms (bordereaux or cheques)

---

# 1. Deposit Transactions

A **deposit** adds money to an account.

Deposits can be performed on:

- Savings Account (Compte d’épargne)
- Checking Account (Series A)
- Business Current Account (Series B)

Each deposit requires a **deposit slip (bordereau de versement)**.

---

## 1.1 Deposit — Series A and Series B Accounts

### Required Information

- **Account Number**
- **Client Name** (optional but recommended)
- **Deposit Reason (Motif de versement)**

### Process

1. Teller receives deposit request.
2. Teller enters **account number** in the system.
3. System retrieves account.
4. Teller records:
    - deposit amount
    - reason for deposit.
5. System updates account balance.
6. A **deposit slip (bordereau)** is issued (Not sure, meant a receipt).

### Result

- Balance increases
- Transaction recorded

---

## 1.2 Deposit — Savings Account (Compte d’Épargne)

Savings accounts normally use a **Savings Passbook (Livret d’épargne)**.

However, deposits **can still be made without the passbook**.

### Required Information

- Account number
- Deposit amount
- Reason for deposit

Optional:

- Savings Passbook (Livret d’épargne)

### Process

1. Teller identifies the account.
2. Deposit is recorded in the system.
3. If the **passbook is present**, the teller updates the passbook balance.
4. Deposit slip (**bordereau** Not sure, meant a receipt) is issued.

### Result

- System balance updated
- Passbook updated (if available)

---

# 2. Withdrawal Transactions

A **withdrawal removes money from an account**.

The verification process differs depending on the account type.

---

# 2.1 Withdrawal — Savings Account

### Required Documents

- **Savings Passbook (Livret d’épargne)**

Internal verification tools:

- **Fiche Model 200**
    
    Internal document showing transaction history.
    
- **Livre de compte (Cahier Registre – Model 1)**
    
    Used for account identification.
    

### Process

1. Client presents **Savings Passbook**.
2. Teller verifies account details.
3. Teller checks **Model 200 transaction record**.
4. Teller verifies identity using **Account Register (Model 1)**.
5. Withdrawal amount entered in system.
6. System updates balance.
7. Passbook is updated.
8. Withdrawal slip (**bordereau** Not sure, meant a receipt) issued.

---

# 2.2 Withdrawal — Checking Account (Series A)

Withdrawals are normally done using **cheques**.

Two cheque types are supported.

---

## 2.2.1 Standard Cheque Withdrawal

### Required Information

- Cheque
- Account number
- Account holder name

### Verification

The teller must verify:

- Signature on cheque
- Account signature record

Internal verification documents:

- **Account Register (Model 1)**
- **Yellow Account File (Fiche Jaune)**
    
    Contains transaction history and signature specimen.
    

### Process

1. Client submits cheque.
2. Teller verifies:
    - account number
    - signature
3. Teller checks **Fiche Jaune**.
4. Teller confirms identity in **Account Register**.
5. Transaction is entered into system.
6. Withdrawal slip (**bordereau** Not sure, meant a receipt) issued.

---

## 2.2.2 Counter Cheque (Chèque Guichet)

This cheque is issued **directly at the bank counter**.

### Process

1. Client requests withdrawal.
2. Teller verifies account ownership.
3. Teller validates signature.
4. Transaction approved.
5. Withdrawal recorded in system.
6. Bordereau issued (Not sure, meant a receipt).

---

# 2.3 Withdrawal — Business Account (Series B)

The process is similar to **Series A**, but additional signature rules apply.

### Signature Rules

The system must enforce the **signature policy defined when the account was opened**.

Examples:

- Single signature required
- Two signatures required
- Mandatory + optional signature

### Process

1. Client submits cheque.
2. Teller verifies:
    - cheque validity
    - authorized signatories
3. Signature rule is checked.
4. System processes withdrawal.
5. Bordereau issued (Not sure, meant a receipt).

---

# 3. Transfer Transactions

A **transfer moves money from one person to another**.

Transfers can occur:

- **between accounts**
- **to someone without an account**

Applicable to:

- Savings
- Series A
- Series B

---

# 3.1 Transfer Between Accounts (Internal Transfer)

### Process

1. Sender performs **withdrawal process**.
2. Sender provides:
    - recipient account number
        
        OR
        
    - recipient name.
3. Teller verifies destination account.
4. A **deposit slip (bordereau de versement)** is generated.
5. System updates both accounts.

Result:

Sender account → debit

Recipient account → credit

---

# 3.2 Transfer to Non-Account Holder

If the recipient **does not have an account**.

### Process

1. Sender performs withdrawal procedure.
2. Sender provides:
- Full name of recipient.
1. Bank issues a **Transfer Document**.

Two copies:

- Bank internal record
- Client copy

The recipient presents the document to claim the money.

### Fee

Transfer fee:

```
1% of transaction amount
```

### System Update

Transaction recorded as:

```
Transfer to non-account holder
```

---

# 4. Transaction Documentation

Each transaction produces official documentation.

### Documents Used

Deposit:

- **Bordereau de versement**

Withdrawal:

- **Cheque**
- **Bordereau**

Transfer:

- **Bordereau**
- **Transfer Document**

Internal verification records:

- Model 200
- Model 1 (Account Register)
- Fiche Jaune

---

# 5. Transaction Record Structure

Each transaction stored in the system includes:

```
Transaction ID
Account Number
Transaction Type
Amount
Currency
Date
Branch
Teller ID
Reference Document
Reason (Motif)
Status
```

---

# 6. Transaction Validation Rules

Before processing a transaction, the system verifies:

- Account exists
- Account status is **Active**
- Sufficient balance (for withdrawals)
- Signature validity (for cheque accounts)
- Account ownership

---

# 7. Module Integration

The Transactions Module interacts with:

```
Client Module
      ↓
Accounts Module
      ↓
Transactions Module
      ↓
Ledger Module
```

The Transactions Module:

- updates balances
- records movements
- sends accounting entries to the ledger.

---

# Final Definition

The **Transactions Module** is responsible for:

> validating, processing, and recording all financial operations that modify account balances, including deposits, withdrawals, and transfers.
>