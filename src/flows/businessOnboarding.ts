import type { Flow } from "../types"

export const businessOnboarding: Flow = {
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
}
