import { useState } from "react"
import { LinearFlow, Legend } from "./components/FlowDiagram"
import { DataModelView } from "./components/DataModelView"
import { individualOnboarding } from "./flows/individualOnboarding"
import { businessOnboarding } from "./flows/businessOnboarding"
import { accountOpening } from "./flows/accountOpening"
import { deposit } from "./flows/deposit"
import { withdrawal } from "./flows/withdrawal"
import { transfer } from "./flows/transfer"
import { loan } from "./flows/loan"
import { accounting } from "./flows/accounting"
import type { Flow } from "./types"

const flows: Flow[] = [
  individualOnboarding,
  businessOnboarding,
  accountOpening,
  deposit,
  withdrawal,
  transfer,
  loan,
  accounting,
]

const tabs = [
  { id: "client-individual", label: "Individual Onboarding", emoji: "👤" },
  { id: "client-business", label: "Business Onboarding", emoji: "🏢" },
  { id: "account-opening", label: "Account Opening", emoji: "📂" },
  { id: "deposit", label: "Deposit", emoji: "💵" },
  { id: "withdrawal", label: "Withdrawal", emoji: "🏧" },
  { id: "transfer", label: "Transfer", emoji: "↔️" },
  { id: "loan", label: "Loan", emoji: "📋" },
  { id: "accounting", label: "Accounting", emoji: "📒" },
  { id: "data-model", label: "Data Model", emoji: "🗄️" },
]

export default function App() {
  const [activeTab, setActiveTab] = useState("client-individual")
  const activeFlow = flows.find((f) => f.id === activeTab)

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
        {activeTab === "data-model" ? (
          <DataModelView />
        ) : activeFlow ? (
          <>
            {/* Flow header */}
            <div className="mb-6">
              <div className="mb-1 flex items-center gap-3">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: activeFlow.accentColor }} />
                <h2 className="text-2xl font-bold text-gray-900">{activeFlow.title}</h2>
              </div>
              <p className="ml-7 text-sm text-gray-500">{activeFlow.description}</p>
            </div>

            <Legend />

            {/* Diagram */}
            <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <LinearFlow key={activeTab} flow={activeFlow} />
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
