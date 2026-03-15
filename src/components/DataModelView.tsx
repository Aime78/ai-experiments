import type { DataEntity, DataRelationship } from "../types"

const dataEntities: DataEntity[] = [
  // Client Module
  {
    id: "client", name: "Client", module: "Client Module", color: "#2563eb",
    fields: [
      { name: "client_id", type: "UUID", pk: true },
      { name: "type", type: "Individual | Business" },
      { name: "kyc_status", type: "Pending | Verified | Rejected | Expired" },
      { name: "created_at", type: "timestamp" },
    ],
  },
  {
    id: "individual_profile", name: "IndividualProfile", module: "Client Module", color: "#2563eb",
    fields: [
      { name: "profile_id", type: "UUID", pk: true },
      { name: "client_id", type: "UUID", fk: "Client" },
      { name: "first_name", type: "string" },
      { name: "last_name", type: "string" },
      { name: "middle_name", type: "string" },
      { name: "date_of_birth", type: "date" },
      { name: "place_of_birth", type: "string" },
      { name: "gender", type: "enum" },
      { name: "nationality", type: "string" },
      { name: "marital_status", type: "Single | Married | Divorced" },
      { name: "profession", type: "Trader | Student | Employee | Other" },
      { name: "province_of_origin", type: "string" },
      { name: "id_type", type: "NationalID | Passport | CEPGL" },
      { name: "id_number", type: "string" },
      { name: "id_issue_date", type: "date" },
      { name: "id_expiry_date", type: "date" },
      { name: "province", type: "string" },
      { name: "municipality", type: "string" },
      { name: "neighborhood", type: "string" },
      { name: "street", type: "string" },
      { name: "plot_number", type: "string" },
      { name: "phone", type: "string" },
      { name: "email", type: "string", optional: true },
      { name: "biometric_type", type: "Signature | Fingerprint" },
    ],
  },
  {
    id: "business_profile", name: "BusinessProfile", module: "Client Module", color: "#2563eb",
    fields: [
      { name: "profile_id", type: "UUID", pk: true },
      { name: "client_id", type: "UUID", fk: "Client" },
      { name: "company_name", type: "string" },
      { name: "neighborhood", type: "string" },
      { name: "street", type: "string" },
      { name: "municipality", type: "string" },
      { name: "plot_number", type: "string" },
    ],
  },
  {
    id: "representative", name: "Representative", module: "Client Module", color: "#2563eb",
    fields: [
      { name: "representative_id", type: "UUID", pk: true },
      { name: "client_id", type: "UUID", fk: "Client" },
      { name: "first_name", type: "string" },
      { name: "last_name", type: "string" },
      { name: "middle_name", type: "string" },
      { name: "gender", type: "enum", optional: true },
      { name: "id_type", type: "NationalID | Passport | CEPGL", optional: true },
      { name: "id_number", type: "string", optional: true },
      { name: "date_of_birth", type: "date", optional: true },
      { name: "place_of_birth", type: "string", optional: true },
      { name: "province_of_origin", type: "string", optional: true },
      { name: "marital_status", type: "enum", optional: true },
      { name: "profession", type: "enum", optional: true },
      { name: "address", type: "JSON", optional: true },
      { name: "role", type: "string", optional: true },
      { name: "is_mandatory_signatory", type: "boolean" },
      { name: "biometric_type", type: "Signature | Fingerprint", optional: true },
    ],
  },
  {
    id: "signature_policy", name: "SignaturePolicy", module: "Client Module", color: "#2563eb",
    fields: [
      { name: "policy_id", type: "UUID", pk: true },
      { name: "client_id", type: "UUID", fk: "Client" },
      { name: "policy_type", type: "Single | TwoRequired | MandatoryPlusOptional" },
    ],
  },
  {
    id: "minor_guardian", name: "MinorGuardian", module: "Client Module", color: "#2563eb",
    fields: [
      { name: "guardian_id", type: "UUID", pk: true },
      { name: "client_id", type: "UUID", fk: "Client" },
      { name: "full_name", type: "string" },
      { name: "id_document_ref", type: "string" },
    ],
  },
  {
    id: "client_document", name: "ClientDocument", module: "Client Module", color: "#2563eb",
    fields: [
      { name: "document_id", type: "UUID", pk: true },
      { name: "client_id", type: "UUID", fk: "Client", optional: true },
      { name: "representative_id", type: "UUID", fk: "Representative", optional: true },
      { name: "guardian_id", type: "UUID", fk: "MinorGuardian", optional: true },
      { name: "doc_type", type: "NationalID | Passport | CEPGLCard | PassportPhoto | RegistrationDoc | OpeningRequestLetter | IDCopy" },
      { name: "file_ref", type: "string" },
      { name: "uploaded_at", type: "timestamp" },
    ],
  },
  // Accounts Module
  {
    id: "account", name: "Account", module: "Accounts Module", color: "#059669",
    fields: [
      { name: "account_id", type: "UUID", pk: true },
      { name: "account_number", type: "string" },
      { name: "client_id", type: "UUID", fk: "Client" },
      { name: "account_type", type: "Savings | Checking | Business" },
      { name: "series", type: "A | B" },
      { name: "currency", type: "USD | FC" },
      { name: "status", type: "Pending | Active | Frozen | Dormant | Closed" },
      { name: "balance", type: "decimal" },
      { name: "open_date", type: "date" },
      { name: "created_at", type: "timestamp" },
    ],
  },
  // Transactions Module
  {
    id: "transaction", name: "Transaction", module: "Transactions Module", color: "#0891b2",
    fields: [
      { name: "transaction_id", type: "UUID", pk: true },
      { name: "account_id", type: "UUID", fk: "Account" },
      { name: "type", type: "Deposit | Withdrawal | Transfer" },
      { name: "amount", type: "decimal" },
      { name: "currency", type: "USD | FC" },
      { name: "reason", type: "string" },
      { name: "teller_id", type: "UUID" },
      { name: "date", type: "timestamp" },
      { name: "status", type: "enum" },
      { name: "reference_document", type: "string", optional: true },
    ],
  },
  // Loan Module
  {
    id: "loan", name: "Loan", module: "Loan Module", color: "#be185d",
    fields: [
      { name: "loan_id", type: "UUID", pk: true },
      { name: "client_id", type: "UUID", fk: "Client" },
      { name: "account_id", type: "UUID", fk: "Account" },
      { name: "loan_type", type: "SalaryAdvance | PersonalLoan | Overdraft" },
      { name: "amount", type: "decimal" },
      { name: "outstanding_balance", type: "decimal" },
      { name: "interest_rate", type: "decimal" },
      { name: "duration_months", type: "integer" },
      { name: "status", type: "Pending | Active | Rejected | Repaid" },
      { name: "disbursed_at", type: "timestamp", optional: true },
      { name: "officer_id", type: "UUID" },
    ],
  },
  {
    id: "loan_repayment", name: "LoanRepayment", module: "Loan Module", color: "#be185d",
    fields: [
      { name: "repayment_id", type: "UUID", pk: true },
      { name: "loan_id", type: "UUID", fk: "Loan" },
      { name: "amount", type: "decimal" },
      { name: "paid_at", type: "timestamp" },
      { name: "penalty_amount", type: "decimal" },
      { name: "status", type: "OnTime | Late | Penalized" },
    ],
  },
  // Accounting Module
  {
    id: "journal_entry", name: "JournalEntry", module: "Accounting Module", color: "#374151",
    fields: [
      { name: "entry_id", type: "UUID", pk: true },
      { name: "transaction_id", type: "UUID", fk: "Transaction", optional: true },
      { name: "loan_id", type: "UUID", fk: "Loan", optional: true },
      { name: "date", type: "date" },
      { name: "reference", type: "string" },
      { name: "description", type: "string" },
      { name: "created_by", type: "UUID" },
      { name: "status", type: "Draft | Posted" },
    ],
  },
  {
    id: "journal_line", name: "JournalLine", module: "Accounting Module", color: "#374151",
    fields: [
      { name: "line_id", type: "UUID", pk: true },
      { name: "entry_id", type: "UUID", fk: "JournalEntry" },
      { name: "account_code", type: "string", fk: "ChartOfAccounts" },
      { name: "debit", type: "decimal" },
      { name: "credit", type: "decimal" },
    ],
  },
  {
    id: "chart_of_accounts", name: "ChartOfAccounts", module: "Accounting Module", color: "#374151",
    fields: [
      { name: "account_code", type: "string", pk: true },
      { name: "account_name", type: "string" },
      { name: "account_type", type: "Asset | Liability | Revenue | Expense | Equity" },
      { name: "parent_code", type: "string", fk: "ChartOfAccounts", optional: true },
      { name: "status", type: "Active | Inactive" },
    ],
  },
]

const dataRelationships: DataRelationship[] = [
  { from: "Client", to: "IndividualProfile", cardinality: "1 → 1", label: "Individual clients have one personal profile" },
  { from: "Client", to: "BusinessProfile", cardinality: "1 → 1", label: "Business clients have one company profile" },
  { from: "Client", to: "Representative", cardinality: "1 → N", label: "A client can have multiple authorized representatives" },
  { from: "Client", to: "SignaturePolicy", cardinality: "1 → 1", label: "Business clients define one signature policy" },
  { from: "Client", to: "MinorGuardian", cardinality: "1 → 1", label: "Minor clients require one responsible adult" },
  { from: "Client", to: "ClientDocument", cardinality: "1 → N", label: "Documents that belong directly to the client" },
  { from: "Representative", to: "ClientDocument", cardinality: "1 → N", label: "Documents that belong to the representative (e.g. their ID copy)" },
  { from: "MinorGuardian", to: "ClientDocument", cardinality: "1 → N", label: "Documents that belong to the guardian (e.g. their ID copy)" },
  { from: "Client", to: "Account", cardinality: "1 → N", label: "A client can have multiple accounts" },
  { from: "Client", to: "Loan", cardinality: "1 → N", label: "A client can have multiple loans" },
  { from: "Account", to: "Transaction", cardinality: "1 → N", label: "An account has many transactions" },
  { from: "Account", to: "Loan", cardinality: "1 → N", label: "Loans are disbursed into an account" },
  { from: "Loan", to: "LoanRepayment", cardinality: "1 → N", label: "A loan has many repayment records" },
  { from: "Transaction", to: "JournalEntry", cardinality: "1 → 1", label: "Each transaction generates one journal entry" },
  { from: "Loan", to: "JournalEntry", cardinality: "1 → N", label: "Loan events generate journal entries" },
  { from: "JournalEntry", to: "JournalLine", cardinality: "1 → N", label: "A journal entry has many debit/credit lines" },
  { from: "JournalLine", to: "ChartOfAccounts", cardinality: "N → 1", label: "Each line references an account in the chart" },
  { from: "ChartOfAccounts", to: "ChartOfAccounts", cardinality: "1 → N", label: "Accounts can have child accounts (hierarchy)" },
]

function EntityCard({ entity }: { entity: DataEntity }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden text-xs">
      <div className="px-3 py-2.5 text-white" style={{ backgroundColor: entity.color }}>
        <div className="text-xs opacity-70 mb-0.5">{entity.module}</div>
        <div className="font-bold text-sm">{entity.name}</div>
      </div>
      <div className="divide-y divide-gray-100">
        {entity.fields.map((field, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            <span className="w-6 shrink-0 text-center text-xs font-bold">
              {field.pk && <span className="text-amber-500">PK</span>}
              {field.fk && !field.pk && <span className="text-blue-500">FK</span>}
            </span>
            <span className={`font-mono text-xs ${field.pk ? "font-bold text-gray-900" : "text-gray-700"}`}>
              {field.name}
              {field.optional && <span className="text-gray-400">?</span>}
            </span>
            <div className="ml-auto max-w-40 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="font-mono text-xs text-gray-400 whitespace-nowrap">{field.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DataModelView() {
  const moduleSections = [
    { name: "Client Module", color: "#2563eb", ids: ["client", "individual_profile", "business_profile", "representative", "signature_policy", "minor_guardian", "client_document"] },
    { name: "Accounts Module", color: "#059669", ids: ["account"] },
    { name: "Transactions Module", color: "#0891b2", ids: ["transaction"] },
    { name: "Loan Module", color: "#be185d", ids: ["loan", "loan_repayment"] },
    { name: "Accounting Module", color: "#374151", ids: ["journal_entry", "journal_line", "chart_of_accounts"] },
  ]

  return (
    <div className="space-y-10 py-6">

      {/* Module Overview */}
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-4">Module Overview</h3>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex flex-col gap-4">
            {/* Row 1 */}
            <div className="flex items-center gap-2">
              {[
                { name: "Client Module", color: "#2563eb", entities: ["Client", "IndividualProfile", "BusinessProfile", "Representative", "SignaturePolicy", "MinorGuardian", "ClientDocument"] },
                { name: "Accounts Module", color: "#059669", entities: ["Account"] },
                { name: "Transactions Module", color: "#0891b2", entities: ["Transaction"] },
              ].map((mod, i) => (
                <div key={mod.name} className="flex items-center gap-2">
                  <div className="rounded-lg border-2 px-4 py-3 text-center min-w-35" style={{ borderColor: mod.color }}>
                    <div className="text-xs font-bold mb-1" style={{ color: mod.color }}>{mod.name}</div>
                    {mod.entities.map((e) => (
                      <div key={e} className="text-xs text-gray-500 font-mono">{e}</div>
                    ))}
                  </div>
                  {i < 2 && <div className="text-gray-400 text-lg font-light">→</div>}
                </div>
              ))}
            </div>
            {/* Arrows down */}
            <div className="flex gap-2">
              <div className="flex flex-col items-center" style={{ minWidth: 140, marginLeft: 0 }}>
                <div className="text-gray-400 text-sm">↓</div>
              </div>
              <div style={{ minWidth: 32 }} />
              <div className="flex flex-col items-center" style={{ minWidth: 140 }}>
                <div className="text-gray-400 text-sm">↓</div>
              </div>
            </div>
            {/* Row 2 */}
            <div className="flex items-center gap-2">
              {[
                { name: "Loan Module", color: "#be185d", entities: ["Loan", "LoanRepayment"] },
                { name: "Accounting Module", color: "#374151", entities: ["JournalEntry", "JournalLine", "ChartOfAccounts"] },
              ].map((mod, i) => (
                <div key={mod.name} className="flex items-center gap-2">
                  <div className="rounded-lg border-2 px-4 py-3 text-center min-w-35" style={{ borderColor: mod.color }}>
                    <div className="text-xs font-bold mb-1" style={{ color: mod.color }}>{mod.name}</div>
                    {mod.entities.map((e) => (
                      <div key={e} className="text-xs text-gray-500 font-mono">{e}</div>
                    ))}
                  </div>
                  {i < 1 && <div className="text-gray-400 text-lg font-light">→</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Entity Cards by module */}
      {moduleSections.map((mod) => (
        <div key={mod.name}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: mod.color }} />
            <h3 className="text-base font-bold text-gray-800">{mod.name}</h3>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dataEntities
              .filter((e) => mod.ids.includes(e.id))
              .map((entity) => (
                <EntityCard key={entity.id} entity={entity} />
              ))}
          </div>
        </div>
      ))}

      {/* Relationships */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-3 w-3 rounded-full bg-gray-400" />
          <h3 className="text-base font-bold text-gray-800">Relationships</h3>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 font-semibold text-gray-600">From</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Cardinality</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-600">To</th>
                <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dataRelationships.map((rel, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono font-medium text-gray-800">{rel.from}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{rel.cardinality}</td>
                  <td className="px-4 py-2 font-mono font-medium text-gray-800">{rel.to}</td>
                  <td className="px-4 py-2 text-gray-500">{rel.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
