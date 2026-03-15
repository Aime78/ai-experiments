import type { Flow, FlowNode } from "../types"

// ── Node ────────────────────────────────────────────────────────────────────
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

// ── Arrow ───────────────────────────────────────────────────────────────────
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

// ── RenderItem ──────────────────────────────────────────────────────────────
interface RenderItem {
  node: FlowNode
  edgeLabel?: string
  isBranch?: boolean
  branchItems?: Array<{ node: FlowNode; edgeLabel?: string }[]>
}

// ── BranchBlock ─────────────────────────────────────────────────────────────
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

// ── LinearFlow ──────────────────────────────────────────────────────────────
export function LinearFlow({ flow }: { flow: Flow }) {
  const visited = new Set<string>()

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

  const renderItems: RenderItem[] = []

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
        for (const branch of branchItems) {
          if (branch.length > 0) {
            const lastNode = branch[branch.length - 1].node
            const lastNexts = edgeMap.get(lastNode.id) ?? []
            if (lastNexts.length > 1) {
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

// ── Legend ───────────────────────────────────────────────────────────────────
export function Legend() {
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
