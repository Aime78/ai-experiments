import type { Flow } from "../types"

export const deposit: Flow = {
  id: "deposit",
  title: "Deposit Transaction",
  description: "Process for depositing money into a savings, checking (A), or current (B) account.",
  accentColor: "#0891b2",
  nodes: [
    { id: "s", type: "start", label: "Client Requests Deposit" },
    { id: "n1", type: "process", label: "Teller Enters Account Number" },
    { id: "n2", type: "process", label: "System Retrieves Account" },
    { id: "n2d", type: "decision", label: "Account Pending?" },
    { id: "n2e", type: "process", label: "Verify Deposit ≥ $20", sublabel: "Minimum required to activate account" },
    { id: "n2f", type: "process", label: "Activate Account — Status: Active" },
    { id: "n3", type: "process", label: "Teller Enters Amount + Reason (Motif)" },
    { id: "n5", type: "process", label: "System Updates Account Balance" },
    { id: "n7", type: "process", label: "Accounting Module: Generate Journal Entry", sublabel: "Debit Cash / Credit Deposits Account" },
    { id: "n6", type: "document", label: "Issue Deposit Slip (Bordereau de Versement)" },
    { id: "e", type: "end", label: "Deposit Complete" },
  ],
  edges: [
    { from: "s", to: "n1" },
    { from: "n1", to: "n2" },
    { from: "n2", to: "n2d" },
    { from: "n2d", to: "n3", label: "No" },
    { from: "n2d", to: "n2e", label: "Yes" },
    { from: "n2e", to: "n2f" },
    { from: "n2f", to: "n3" },
    { from: "n3", to: "n5" },
    { from: "n5", to: "n7" },
    { from: "n7", to: "n6" },
    { from: "n6", to: "e" },
  ],
}
