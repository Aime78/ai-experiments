import type { Flow } from "../types"

export const accountOpening: Flow = {
  id: "account-opening",
  title: "Account Opening",
  description: "Opening a savings, checking, or business current account for a registered client.",
  accentColor: "#059669",
  nodes: [
    { id: "s", type: "start", label: "Start Account Opening" },
    { id: "n1", type: "process", label: "Select Client", sublabel: "Client must already exist in the system" },
    { id: "n2", type: "decision", label: "Account Type?" },
    { id: "n2a", type: "process", label: "Savings Account (SAV-433)" },
    { id: "n2b", type: "process", label: "Checking Account Series A" },
    { id: "n2c", type: "process", label: "Business Current Account Series B" },
    { id: "n3", type: "process", label: "Select Currency", sublabel: "USD or FC (Congolese Franc)" },
    { id: "n5", type: "process", label: "Generate Account Number" },
    { id: "n6", type: "process", label: "Status → Pending" },
    { id: "e", type: "end", label: "Account Created — Pending" },
  ],
  edges: [
    { from: "s", to: "n1" },
    { from: "n1", to: "n2" },
    { from: "n2", to: "n2a", label: "Savings" },
    { from: "n2", to: "n2b", label: "Checking" },
    { from: "n2", to: "n2c", label: "Business" },
    { from: "n2a", to: "n3" },
    { from: "n2b", to: "n3" },
    { from: "n2c", to: "n3" },
    { from: "n3", to: "n5" },
    { from: "n5", to: "n6" },
    { from: "n6", to: "e" },
  ],
}
