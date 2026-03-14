## Module Purpose

The **Loan Module** is responsible for managing all credit operations granted to clients.

The module allows the institution to:

- configure loan products
- review and approve loan requests
- disburse loans
- monitor repayment
- apply penalties in case of late payments

A penalty fee of **11% is applied after a delay of one month**.

During the first month of delay, the client is in a **grace period where reminders are sent**.

The module supports the following loan types:

- Avance sur salaire
- Prêt privée ou prêt ordinaire
- Découvert ou facilité de caisse

---

# 1. Avance sur salaire

## Configuration

- Duration: **1 month**
- Interest fee: **2.5%**
- Form fee: **12$**
- Account must be **active for at least 6 months**
- Maximum loan: **half of the client’s salary**

## Required Data

- **Formulaire**
    - protocole d’accord
    - acte d’engagement
    - signed by the client and employer
- **Lettre de demande**

## Process

After submission of the required documents:

1. The loan request is **reviewed**.
2. The loan is **approved**.
3. The loan is **disbursed**.

---

# 2. Prêt privée ou prêt ordinaire (Personal or Business Loan)

## Configuration

- Maximum amount: **decided by the loan officer**
- Interest fee: **5%**
- Term: **10–12 months**
- Account must be **active for at least 6 months**

## Required Data

- **Certificat d’enregistrement**
- **Formulaire**
    - protocole d’accord
    - acte d’engagement
    - signed by the client and employer
- **Lettre de demande**

---

# 3. Découvert ou facilité de caisse (Personal or Business)

## Configuration

- Maximum amount: **decided by the loan officer**
- Duration: **3 months**
- Interest fee: **2.5% of the total loan taken per month**

Repayment structure:

- Paid over **3 months**
- Total amount = **principal + 2.5% of the principal per month**
- Account must be **active for at least 6 months**

## Required Data

- **Caution morale** (given by a government institution acting as guarantor)

Other required documents are the same as for:

- **Prêt privée ou prêt ordinaire**