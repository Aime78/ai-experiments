import { useState } from "react"

// ── Types ──────────────────────────────────────────────────────────────────
type NodeType = "start" | "end" | "process" | "decision" | "document" | "parallel"

interface FlowNode {
  id: string
  type: NodeType
  label: string
  sublabel?: string
  color?: string
}

interface FlowEdge {
  from: string
  to: string
  label?: string
}

interface Flow {
  id: string
  title: string
  description: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  accentColor: string
}

// ── Node Component ─────────────────────────────────────────────────────────
function Node({ node, accentColor }: { node: FlowNode; accentColor: string }) {
  const base = "flex flex-col items-center justify-center text-center px-4 py-2 font-medium text-sm leading-snug"

  if (node.type === "start" || node.type === "end") {
    return (
      <div
        className={`${base} rounded-full px-8 py-3 text-white shadow-md`}
        style={{ backgroundColor: accentColor, minWidth: 160 }}
      >
        {node.label}
      </div>
    )
  }

  if (node.type === "decision") {
    return (
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 80 }}>
        <div
          className="absolute rotate-45 rounded-md shadow-md"
          style={{
            width: 140,
            height: 140,
            backgroundColor: node.color ?? "#fef3c7",
            border: `2px solid ${accentColor}`,
            transform: "rotate(45deg) scale(0.55)",
          }}
        />
        <div className="relative z-10 px-2 text-center text-sm font-semibold" style={{ color: "#78350f" }}>
          {node.label}
          {node.sublabel && <div className="text-xs font-normal text-amber-700">{node.sublabel}</div>}
        </div>
      </div>
    )
  }

  if (node.type === "document") {
    return (
      <div
        className={`${base} text-gray-700 shadow-sm`}
        style={{
          minWidth: 200,
          backgroundColor: "#f0fdf4",
          border: `1.5px dashed ${accentColor}`,
          borderRadius: 8,
        }}
      >
        <span className="mb-0.5 text-xs font-bold uppercase tracking-wide text-green-600">Document</span>
        {node.label}
        {node.sublabel && <div className="mt-0.5 text-xs text-gray-500">{node.sublabel}</div>}
      </div>
    )
  }

  if (node.type === "parallel") {
    return (
      <div
        className={`${base} text-gray-700 shadow-sm`}
        style={{
          minWidth: 220,
          backgroundColor: "#eff6ff",
          border: `1.5px solid #93c5fd`,
          borderRadius: 8,
        }}
      >
        <span className="mb-0.5 text-xs font-bold uppercase tracking-wide text-blue-500">Parallel</span>
        {node.label}
        {node.sublabel && <div className="mt-0.5 text-xs text-gray-500">{node.sublabel}</div>}
      </div>
    )
  }

  // default: process
  return (
    <div
      className={`${base} text-gray-700 shadow-sm`}
      style={{
        minWidth: 220,
        backgroundColor: "#ffffff",
        border: `1.5px solid ${accentColor}`,
        borderRadius: 8,
      }}
    >
      {node.label}
      {node.sublabel && <div className="mt-0.5 text-xs text-gray-500">{node.sublabel}</div>}
    </div>
  )
}

// ── Arrow ──────────────────────────────────────────────────────────────────
function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="mb-0.5 rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">{label}</span>
      )}
      <div className="flex flex-col items-center">
        <div className="h-6 w-0.5 bg-gray-300" />
        <div
          className="border-t-gray-300"
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid #d1d5db",
          }}
        />
      </div>
    </div>
  )
}

// ── Types for rendering ────────────────────────────────────────────────────
interface RenderItem {
  node: FlowNode
  edgeLabel?: string
  isBranch?: boolean
  branchItems?: Array<{ node: FlowNode; edgeLabel?: string }[]>
}

// ── Linear Flow Renderer ───────────────────────────────────────────────────
function LinearFlow({ flow }: { flow: Flow }) {
  // Build ordered list from edges (assumes a mostly linear graph)
  const visited = new Set<string>()

  // find root (no incoming edges)
  const hasIncoming = new Set(flow.edges.map((e) => e.to))
  const root = flow.nodes.find((n) => !hasIncoming.has(n.id))
  if (!root) return null

  const edgeMap = new Map<string, { node: FlowNode; label?: string }[]>()
  for (const edge of flow.edges) {
    const target = flow.nodes.find((n) => n.id === edge.to)
    if (!target) continue
    if (!edgeMap.has(edge.from)) edgeMap.set(edge.from, [])
    edgeMap.get(edge.from)!.push({ node: target, label: edge.label })
  }

  // DFS to build render order
  const renderItems: RenderItem[] = []

  // Find the first node reachable from ALL branch start nodes (convergence point)
  function findConvergence(startIds: string[]): string | undefined {
    const reachableSets = startIds.map((startId) => {
      const set = new Set<string>()
      const seen = new Set<string>()
      let cur: string | undefined = startId
      while (cur && !seen.has(cur) && !visited.has(cur)) {
        seen.add(cur)
        set.add(cur)
        const nexts: { node: FlowNode; label?: string }[] = edgeMap.get(cur) ?? []
        cur = nexts.length === 1 ? nexts[0].node.id : undefined
      }
      return set
    })
    for (const id of reachableSets[0]) {
      if (reachableSets.every((s) => s.has(id))) return id
    }
    return undefined
  }

  function walk(nodeId: string, edgeLabel?: string) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    const node = flow.nodes.find((n) => n.id === nodeId)!
    const nexts = edgeMap.get(nodeId) ?? []

    if (nexts.length > 1) {
      const convergenceId = findConvergence(nexts.map((n) => n.node.id))
      const branchItems: Array<{ node: FlowNode; edgeLabel?: string }[]> = []
      for (const next of nexts) {
        const branchChain: { node: FlowNode; edgeLabel?: string }[] = []
        let cur: { node: FlowNode; label?: string } | undefined = next
        while (cur) {
          if (visited.has(cur.node.id) || cur.node.id === convergenceId) break
          visited.add(cur.node.id)
          branchChain.push({ node: cur.node, edgeLabel: cur.label })
          const nextNext: { node: FlowNode; label?: string }[] = edgeMap.get(cur.node.id) ?? []
          cur = nextNext.length === 1 ? nextNext[0] : undefined
        }
        branchItems.push(branchChain)
      }
      renderItems.push({ node, edgeLabel, isBranch: true, branchItems })
      if (convergenceId) {
        walk(convergenceId)
      } else {
        // No shared convergence — check if any branch chain stopped at a decision
        // node (multi-next). Extract it and continue the main flow from there.
        for (const branch of branchItems) {
          if (branch.length > 0) {
            const lastNode = branch[branch.length - 1].node
            const nexts = edgeMap.get(lastNode.id) ?? []
            if (nexts.length > 1) {
              branch.pop()
              visited.delete(lastNode.id)
              walk(lastNode.id)
              break
            }
          }
        }
      }
    } else if (nexts.length === 1) {
      renderItems.push({ node, edgeLabel })
      walk(nexts[0].node.id, nexts[0].label)
    } else {
      renderItems.push({ node, edgeLabel })
    }
  }

  walk(root.id)

  return (
    <div className="flex flex-col items-center gap-0 py-6">
      {renderItems.map((item, i) =>
        item.isBranch ? (
          <BranchBlock key={i} item={item} accentColor={flow.accentColor} />
        ) : (
          <div key={i} className="flex flex-col items-center">
            {i > 0 && <Arrow label={item.edgeLabel} />}
            <Node node={item.node} accentColor={flow.accentColor} />
          </div>
        ),
      )}
    </div>
  )
}

function BranchBlock({ item, accentColor }: { item: RenderItem; accentColor: string }) {
  return (
    <div className="flex flex-col items-center">
      <Arrow label={item.edgeLabel} />
      <Node node={item.node} accentColor={accentColor} />
      <div className="mt-1 flex flex-row items-start gap-6">
        {item.branchItems?.map((branch, bi) => (
          <div key={bi} className="flex flex-col items-center">
            <Arrow label={branch[0]?.edgeLabel} />
            {branch.map((b, bj) => (
              <div key={bj} className="flex flex-col items-center">
                {bj > 0 && <Arrow />}
                <Node node={b.node} accentColor={accentColor} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Flow Definitions ───────────────────────────────────────────────────────
const flows: Flow[] = [
  // ── 1. Individual Client Onboarding ──
  {
    id: "client-individual",
    title: "Individual Client Onboarding",
    description: "Process for registering an individual client and collecting their identity information.",
    accentColor: "#2563eb",
    nodes: [
      { id: "s", type: "start", label: "Start Onboarding" },
      { id: "n1", type: "process", label: "Enter Personal Details", sublabel: "Name, DOB, Gender, Nationality, Marital Status, Profession" },
      { id: "n2", type: "process", label: "Enter Address", sublabel: "Province, Commune, Quartier, Avenue, Plot Number, Phone" },
      { id: "n3", type: "process", label: "Record ID Document", sublabel: "National ID / Passport / CEPGL Card + ID Number" },
      { id: "n5", type: "decision", label: "Minor?" },
      { id: "n5a", type: "process", label: "Add Responsible Adult", sublabel: "Full name + ID copy required" },
      { id: "n6", type: "decision", label: "Add Mandataire?" },
      { id: "n6a", type: "process", label: "Record Mandataire Info", sublabel: "Name + ID copy" },
      { id: "n4", type: "document", label: "Upload ID Document", sublabel: "Scan of National ID / Passport / CEPGL Card" },
      { id: "n9", type: "document", label: "Upload Passport Photos", sublabel: "2 photos required" },
      { id: "n7", type: "process", label: "Capture Biometric", sublabel: "Signature OR Fingerprint" },
      { id: "n8", type: "process", label: "Create Client Record", sublabel: "System assigns Client ID and saves profile" },
      { id: "e", type: "end", label: "Client Registered" },
    ],
    edges: [
      { from: "s", to: "n1" },
      { from: "n1", to: "n2" },
      { from: "n2", to: "n3" },
      { from: "n3", to: "n5" },
      { from: "n5", to: "n6", label: "No" },
      { from: "n5", to: "n5a", label: "Yes" },
      { from: "n5a", to: "n6" },
      { from: "n6", to: "n4", label: "No" },
      { from: "n6", to: "n6a", label: "Yes" },
      { from: "n6a", to: "n4" },
      { from: "n4", to: "n9" },
      { from: "n9", to: "n7" },
      { from: "n7", to: "n8" },
      { from: "n8", to: "e" },
    ],
  },

  // ── 2. Business Client Onboarding ──
  {
    id: "client-business",
    title: "Business / Organization Onboarding",
    description: "Process for registering a company, school, or organization as a client.",
    accentColor: "#7c3aed",
    nodes: [
      { id: "s", type: "start", label: "Start Business Onboarding" },
      { id: "n1", type: "process", label: "Enter Company Name", sublabel: "Name of company / school / organization" },
      { id: "n4", type: "process", label: "Add Authorized Representatives (Mandataires)", sublabel: "Name, ID, Address, Role, Signature" },
      { id: "n5", type: "process", label: "Enter Company Address", sublabel: "Quartier, Avenue, Commune, Plot Number" },
      { id: "n6", type: "process", label: "Define Signature Policy", sublabel: "Mandatory signatories vs Optional signatories" },
      { id: "n2", type: "document", label: "Upload Registration Documents", sublabel: "Ministerial decree / Notarized statutes / Business certificate" },
      { id: "n3", type: "document", label: "Upload Account Opening Request Letter", sublabel: "Must name authorized representatives" },
      { id: "n7", type: "process", label: "Capture Biometric per Representative", sublabel: "Signature OR Fingerprint" },
      { id: "e", type: "end", label: "Business Client Registered" },
    ],
    edges: [
      { from: "s", to: "n1" },
      { from: "n1", to: "n4" },
      { from: "n4", to: "n5" },
      { from: "n5", to: "n6" },
      { from: "n6", to: "n2" },
      { from: "n2", to: "n3" },
      { from: "n3", to: "n7" },
      { from: "n7", to: "e" },
    ],
  },

  // ── 3. Account Opening ──
  {
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
  },

  // ── 4. Deposit ──
  {
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
  },

  // ── 5. Withdrawal ──
  {
    id: "withdrawal",
    title: "Withdrawal Transaction",
    description: "Process for withdrawing money. Verification steps differ by account type.",
    accentColor: "#dc2626",
    nodes: [
      { id: "s", type: "start", label: "Client Requests Withdrawal" },
      { id: "n1", type: "decision", label: "Account Type?" },
      // Savings path
      { id: "sa1", type: "process", label: "Teller Retrieves Account", sublabel: "Savings account" },
      { id: "sa2", type: "process", label: "Teller Verifies Account & Client Information" },
      // Checking A path
      { id: "ca1", type: "process", label: "Teller Retrieves Account", sublabel: "Checking account" },
      { id: "ca2", type: "process", label: "Teller Verifies Account & Client Information" },
      // Business B path
      { id: "cb1", type: "process", label: "Teller Retrieves Account", sublabel: "Business account" },
      { id: "cb2", type: "process", label: "Teller Enforces Signature Policy", sublabel: "Single / Two / Mandatory + Optional" },
      // Common
      { id: "n3", type: "process", label: "Teller Enters Withdrawal Amount" },
      { id: "n4", type: "process", label: "System Validates Balance" },
      { id: "n5", type: "process", label: "System Updates Balance" },
      { id: "n7", type: "process", label: "Accounting Module: Generate Journal Entry", sublabel: "Debit Deposits Account / Credit Cash" },
      { id: "n6", type: "document", label: "Issue Withdrawal Slip (Bordereau)" },
      { id: "e", type: "end", label: "Withdrawal Complete" },
    ],
    edges: [
      { from: "s", to: "n1" },
      { from: "n1", to: "sa1", label: "Savings" },
      { from: "n1", to: "ca1", label: "Checking A" },
      { from: "n1", to: "cb1", label: "Business B" },
      { from: "sa1", to: "sa2" },
      { from: "sa2", to: "n3" },
      { from: "ca1", to: "ca2" },
      { from: "ca2", to: "n3" },
      { from: "cb1", to: "cb2" },
      { from: "cb2", to: "n3" },
      { from: "n3", to: "n4" },
      { from: "n4", to: "n5" },
      { from: "n5", to: "n7" },
      { from: "n7", to: "n6" },
      { from: "n6", to: "e" },
    ],
  },

  // ── 6. Transfer ──
  {
    id: "transfer",
    title: "Transfer Transaction",
    description: "Process for transferring money between accounts or to a non-account holder.",
    accentColor: "#d97706",
    nodes: [
      { id: "s", type: "start", label: "Client Requests Transfer" },
      { id: "n1", type: "process", label: "Sender Completes Withdrawal Process", sublabel: "Following standard withdrawal flow" },
      { id: "n2", type: "decision", label: "Recipient has an Account?" },
      // Has account
      { id: "ya1", type: "process", label: "Teller Enters Recipient Account Number or Name" },
      { id: "ya2", type: "process", label: "System Verifies Destination Account" },
      { id: "ya3", type: "process", label: "System Debits Sender / Credits Recipient" },
      { id: "ya_j", type: "process", label: "Accounting Module: Generate Journal Entry" },
      { id: "ya4", type: "document", label: "Issue Deposit Slip (Bordereau de Versement)" },
      // No account
      { id: "na1", type: "process", label: "Sender Provides Recipient Full Name" },
      { id: "na2", type: "process", label: "Apply Transfer Fee: 1% of Amount" },
      { id: "na_j", type: "process", label: "Accounting Module: Generate Journal Entry" },
      { id: "na3", type: "document", label: "Bank Issues Transfer Document (2 copies)", sublabel: "Bank copy + Client copy" },
      { id: "na4", type: "process", label: "Recipient Presents Document to Claim Money" },
      { id: "e", type: "end", label: "Transfer Complete" },
    ],
    edges: [
      { from: "s", to: "n1" },
      { from: "n1", to: "n2" },
      { from: "n2", to: "ya1", label: "Yes" },
      { from: "n2", to: "na1", label: "No" },
      { from: "ya1", to: "ya2" },
      { from: "ya2", to: "ya3" },
      { from: "ya3", to: "ya_j" },
      { from: "ya_j", to: "ya4" },
      { from: "ya4", to: "e" },
      { from: "na1", to: "na2" },
      { from: "na2", to: "na_j" },
      { from: "na_j", to: "na3" },
      { from: "na3", to: "na4" },
      { from: "na4", to: "e" },
    ],
  },

  // ── 7. Loan Application ──
  {
    id: "loan",
    title: "Loan Application",
    description: "End-to-end loan process covering all three loan types with repayment monitoring.",
    accentColor: "#be185d",
    nodes: [
      { id: "s", type: "start", label: "Client Requests a Loan" },
      { id: "n0", type: "process", label: "Verify Account Active ≥ 6 Months" },
      { id: "n1", type: "decision", label: "Loan Type?" },
      // Avance sur salaire
      { id: "la1", type: "process", label: "Avance sur Salaire", sublabel: "1 month · 2.5% · Max 50% salary · $12 form fee" },
      { id: "la2", type: "document", label: "Submit: Formulaire + Lettre de demande", sublabel: "Protocole d'accord + Acte d'engagement" },
      // Prêt ordinaire
      { id: "lb1", type: "process", label: "Prêt Ordinaire (Private / Business)", sublabel: "10–12 months · 5% · Amount by officer" },
      { id: "lb2", type: "document", label: "Submit: Certificat d'enregistrement + Formulaire + Lettre" },
      // Découvert
      { id: "lc1", type: "process", label: "Découvert / Facilité de Caisse", sublabel: "3 months · 2.5%/month · Amount by officer" },
      { id: "lc2", type: "document", label: "Submit: Caution Morale + Same docs as Prêt Ordinaire" },
      // Shared flow
      { id: "n2", type: "process", label: "Loan Officer Reviews Request" },
      { id: "n3", type: "decision", label: "Approved?" },
      { id: "n3b", type: "end", label: "Loan Rejected" },
      { id: "n4", type: "process", label: "Loan Disbursed to Client Account" },
      { id: "n5", type: "process", label: "Monitor Monthly Repayment" },
      // Payment status branch (3-way)
      { id: "n6", type: "decision", label: "Payment Status?" },
      { id: "n7", type: "process", label: "Record Repayment + Interest" },
      { id: "e1", type: "end", label: "Loan Fully Repaid" },
      { id: "n6a", type: "process", label: "Send Reminders", sublabel: "Client returns to next payment cycle" },
      { id: "n6b", type: "process", label: "Apply 11% Penalty Fee" },
      { id: "n7p", type: "process", label: "Record Repayment + Interest" },
      { id: "e2", type: "end", label: "Loan Fully Repaid" },
    ],
    edges: [
      { from: "s", to: "n0" },
      { from: "n0", to: "n1" },
      { from: "n1", to: "la1", label: "Avance Salaire" },
      { from: "n1", to: "lb1", label: "Prêt Ordinaire" },
      { from: "n1", to: "lc1", label: "Découvert" },
      { from: "la1", to: "la2" },
      { from: "la2", to: "n2" },
      { from: "lb1", to: "lb2" },
      { from: "lb2", to: "n2" },
      { from: "lc1", to: "lc2" },
      { from: "lc2", to: "n2" },
      { from: "n2", to: "n3" },
      { from: "n3", to: "n3b", label: "No" },
      { from: "n3", to: "n4", label: "Yes" },
      { from: "n4", to: "n5" },
      { from: "n5", to: "n6" },
      { from: "n6", to: "n7", label: "On Time" },
      { from: "n6", to: "n6a", label: "1st Month Late" },
      { from: "n6", to: "n6b", label: "> 1 Month Late" },
      { from: "n7", to: "e1" },
      { from: "n6b", to: "n7p" },
      { from: "n7p", to: "e2" },
    ],
  },

  // ── 8. Accounting Journal Flow ──
  {
    id: "accounting",
    title: "Accounting & Journal Entry Flow",
    description: "How every transaction automatically generates double-entry accounting records.",
    accentColor: "#374151",
    nodes: [
      { id: "s", type: "start", label: "Financial Operation Occurs" },
      { id: "n1", type: "decision", label: "Operation Type?" },
      { id: "d1", type: "process", label: "Deposit", sublabel: "Debit: Cash · Credit: Deposits" },
      { id: "d2", type: "process", label: "Withdrawal", sublabel: "Debit: Deposits · Credit: Cash" },
      { id: "d3", type: "process", label: "Loan Disbursement", sublabel: "Debit: Loan Portfolio · Credit: Cash" },
      { id: "d4", type: "process", label: "Loan Repayment", sublabel: "Debit: Cash · Credit: Loan Portfolio + Interest Income" },
      { id: "d5", type: "process", label: "Fee / Penalty", sublabel: "Debit: Client Account · Credit: Fee Income" },
      { id: "n2", type: "process", label: "System Creates Journal Entry", sublabel: "Entry ID, Date, Reference, Description, User" },
      { id: "n3", type: "process", label: "System Creates Journal Lines", sublabel: "Account, Debit Amount, Credit Amount" },
      { id: "n4", type: "process", label: "Validate: Total Debits = Total Credits" },
      { id: "n5", type: "process", label: "Post Entry to General Ledger" },
      { id: "n5b", type: "process", label: "Ledger Updated" },
      { id: "n6", type: "process", label: "Update Financial Reports", sublabel: "Cash In · Cash Out · Monthly Revenue · Monthly Expenses" },
      { id: "e", type: "end", label: "Accounting Complete" },
    ],
    edges: [
      { from: "s", to: "n1" },
      { from: "n1", to: "d1", label: "Deposit" },
      { from: "n1", to: "d2", label: "Withdrawal" },
      { from: "n1", to: "d3", label: "Loan Out" },
      { from: "n1", to: "d4", label: "Loan Repay" },
      { from: "n1", to: "d5", label: "Fee" },
      { from: "d1", to: "n2" },
      { from: "d2", to: "n2" },
      { from: "d3", to: "n2" },
      { from: "d4", to: "n2" },
      { from: "d5", to: "n2" },
      { from: "n2", to: "n3" },
      { from: "n3", to: "n4" },
      { from: "n4", to: "n5" },
      { from: "n5", to: "n5b" },
      { from: "n5b", to: "n6" },
      { from: "n6", to: "e" },
    ],
  },
]

// ── Tab definitions ────────────────────────────────────────────────────────
const tabs = [
  { id: "client-individual", label: "Individual Onboarding", emoji: "👤" },
  { id: "client-business", label: "Business Onboarding", emoji: "🏢" },
  { id: "account-opening", label: "Account Opening", emoji: "📂" },
  { id: "deposit", label: "Deposit", emoji: "💵" },
  { id: "withdrawal", label: "Withdrawal", emoji: "🏧" },
  { id: "transfer", label: "Transfer", emoji: "↔️" },
  { id: "loan", label: "Loan", emoji: "📋" },
  { id: "accounting", label: "Accounting", emoji: "📒" },
]

// ── Legend ─────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-xs text-gray-600 shadow-sm">
      <span className="font-semibold text-gray-700">Legend:</span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block rounded-full bg-gray-800 px-3 py-0.5 text-white">●</span> Start / End
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block rounded border border-blue-400 bg-white px-3 py-0.5">■</span> Process Step
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block rotate-45 bg-yellow-200 px-2 py-1 text-yellow-900">◆</span> Decision
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block rounded border border-dashed border-green-500 bg-green-50 px-3 py-0.5 text-green-700">▭</span> Document
      </span>
    </div>
  )
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("client-individual")
  const activeFlow = flows.find((f) => f.id === activeTab)!

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Core Banking System — Business Flow Diagrams</h1>
          <p className="text-sm text-gray-500">Visual overview of all key operational processes</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl overflow-x-auto px-6">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {tab.emoji} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Flow header */}
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: activeFlow.accentColor }}
            />
            <h2 className="text-2xl font-bold text-gray-900">{activeFlow.title}</h2>
          </div>
          <p className="ml-7 text-sm text-gray-500">{activeFlow.description}</p>
        </div>

        <Legend />

        {/* Diagram */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <LinearFlow key={activeTab} flow={activeFlow} />
        </div>
      </main>
    </div>
  )
}
