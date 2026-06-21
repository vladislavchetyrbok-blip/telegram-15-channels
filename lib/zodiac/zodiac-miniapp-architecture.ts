export interface MiniAppModuleArchitecture {
  id: string;
  name: string;
  status: 'missing' | 'placeholder' | 'partially existing' | 'future';
  routeRecommendation: string;
  dataRequired: string[];
  uiRequired: string[];
  backendRequired: string[];
  paymentDependency: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  implementationPhase: number;
  safeNextAction: string;
}

export const miniAppArchitectureModules: MiniAppModuleArchitecture[] = [
  {
    id: "vip-entry",
    name: "VIP Entry Points",
    status: "missing",
    routeRecommendation: "/vip-access",
    dataRequired: ["Telegram User ID", "Payment Status", "Subscription Tier"],
    uiRequired: ["Paywall Gate", "Benefits Description", "Payment Method Selector"],
    backendRequired: ["Telegram Payment API integration", "Subscription webhook listener", "Database state for VIP"],
    paymentDependency: true,
    riskLevel: "high",
    implementationPhase: 3,
    safeNextAction: "Create UI mock for VIP state without real payment integration"
  },
  {
    id: "birth-matrix",
    name: "Birth Matrix",
    status: "placeholder",
    routeRecommendation: "/birth-matrix",
    dataRequired: ["Birth Date", "Birth Time (Optional)", "Name (Optional)"],
    uiRequired: ["Input Form", "Core Number Display", "Character Profile Display", "Energy Matrix View"],
    backendRequired: ["Numerology calculation logic", "Saved profiles schema"],
    paymentDependency: false,
    riskLevel: "low",
    implementationPhase: 1,
    safeNextAction: "Design static UI mock and local state calculation without database saving"
  },
  {
    id: "mystic-numbers",
    name: "Mystic Numbers / Angel Numbers",
    status: "placeholder",
    routeRecommendation: "/mystic-numbers",
    dataRequired: ["Input Number", "Daily Active Numbers"],
    uiRequired: ["Number Input Pad", "Interpretation Card", "History List"],
    backendRequired: ["Content source/LLM mapping for numbers", "Repeated-number detection"],
    paymentDependency: false,
    riskLevel: "medium",
    implementationPhase: 1,
    safeNextAction: "Define JSON schema for number meanings and static UI"
  },
  {
    id: "affirmations",
    name: "Affirmations",
    status: "placeholder",
    routeRecommendation: "/affirmations",
    dataRequired: ["Zodiac Sign", "Daily Random Seed"],
    uiRequired: ["Affirmation Card", "Share Button"],
    backendRequired: ["Daily generation task or static pool"],
    paymentDependency: false,
    riskLevel: "low",
    implementationPhase: 1,
    safeNextAction: "Create static pool of affirmations for UI testing"
  },
  {
    id: "compatibility",
    name: "Compatibility",
    status: "partially existing",
    routeRecommendation: "/compatibility",
    dataRequired: ["User Sign", "Partner Sign"],
    uiRequired: ["Selection Screen", "Result Overview"],
    backendRequired: ["Compatibility Text Storage", "Analytics Events"],
    paymentDependency: true, // For deep insights
    riskLevel: "medium",
    implementationPhase: 2,
    safeNextAction: "Audit existing flow and map boundaries where VIP upsell will go"
  },
  {
    id: "relationship-map",
    name: "Relationship Map",
    status: "future",
    routeRecommendation: "/relationship-map",
    dataRequired: ["List of saved profiles", "Compatibility graphs"],
    uiRequired: ["Graph Visualization", "Contact List"],
    backendRequired: ["Relational Database Schema for Contacts"],
    paymentDependency: true,
    riskLevel: "high",
    implementationPhase: 4,
    safeNextAction: "None. Wait for core compatibility and VIP to be stable"
  },
  {
    id: "lunar-calendar",
    name: "Lunar Calendar",
    status: "future",
    routeRecommendation: "/lunar-calendar",
    dataRequired: ["Moon Phase Data", "Daily interpretation"],
    uiRequired: ["Calendar Grid", "Phase Icon", "Daily Insight text"],
    backendRequired: ["Astronomical API or static calculation", "Content generation"],
    paymentDependency: false,
    riskLevel: "low",
    implementationPhase: 4,
    safeNextAction: "None. Wait for route stability"
  }
];

export const miniAppRouteBoundaries = [
  { area: "Mini App Core", path: "/compatibility*", isolation: "Can be modified without affecting bots" },
  { area: "Telegram Bots", path: "webhook endpoints", isolation: "DO NOT TOUCH during Mini App dev" },
  { area: "Dashboard", path: "/dashboard/networks/zodiac/*", isolation: "Admin only, safe to extend" }
];

export const miniAppImplementationPhases = [
  { phase: 1, name: "Static Mocks & Logic", focus: "UI routing, local state calculation, no DB" },
  { phase: 2, name: "Database Integration", focus: "Supabase schema creation, saving user profiles" },
  { phase: 3, name: "VIP & Payments", focus: "Telegram Payment API, paywalls, premium content" },
  { phase: 4, name: "Expansion Modules", focus: "Lunar Calendar, Relationship Maps" }
];

export const miniAppRiskControls = [
  "Do not modify live Telegram automation during UI updates",
  "Use local storage or state for testing before database schemas",
  "Ensure all VIP entry points gracefully degrade if payment API is missing"
];
