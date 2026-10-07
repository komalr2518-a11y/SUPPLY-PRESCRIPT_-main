export type WorkflowStage = 'detect' | 'predict' | 'prescribe' | 'execute' | 'evaluate' | 'learn';

export type SeverityLevel = 'disruption' | 'risk' | 'nominal';

export type ModelHealth = 'converged' | 'drift' | 'degraded';

export type TransportMode = 'ocean' | 'air' | 'rail' | 'road';

export interface LaneInfo {
  origin: string;
  originCode: string;
  destination: string;
  destCode: string;
  mode: TransportMode;
}

export interface BaselineOperationalState {
  transportMode: string;
  transitDays: number;
  projectedStockoutDays: number;
  unmitigatedCostRisk: number;
  otifRiskPercentage: number;
}

export interface PrescriptiveOperationalState {
  transportMode: string;
  transitDays: number;
  projectedStockoutDays: number;
  netInterventionCost: number;
  projectedOtifScore: number;
}

export interface PrescriptionOption {
  id: string;
  title: string;
  strategyCode: string;
  recommendationRank: number;
  confidenceScore: number; // 0 - 100
  confidenceTier: 'high' | 'medium' | 'low';
  financialDelta: number; // negative means cost reduction/savings
  holdingCostDelta: number;
  leadTimeCompressionDays: number;
  carbonOffsetKg: number;
  baseline: BaselineOperationalState;
  prescriptive: PrescriptiveOperationalState;
  algorithmicRationale: string[];
  executionSteps: string[];
  erpPurchaseOrderRequired: boolean;
  tmsReRoutingRequired: boolean;
}

export interface DisruptionItem {
  id: string;
  lane: LaneInfo;
  sku: string;
  skuName: string;
  category: string;
  severity: SeverityLevel;
  workflowStage: WorkflowStage;
  leadTimeDriftDays: number; // e.g. +4.2
  valueAtRisk: number;
  stockoutHorizonDays: number;
  currentInventoryUnits: number;
  safetyStockUnits: number;
  burnRatePerDay: number;
  modelHealth: ModelHealth;
  modelConfidence: number;
  sparkline: number[];
  rootCause: string;
  impactSummary: string;
  facilityImpacted: string;
  prescriptions: PrescriptionOption[];
  status: 'pending' | 'in_execution' | 'resolved';
  updatedAt: string;
}

export interface ExecutionRecord {
  id: string;
  disruptionId: string;
  timestamp: string;
  sku: string;
  lane: string;
  strategy: string;
  predictedSavings: number;
  realizedSavings: number;
  predictedLeadTimeDelta: number;
  realizedLeadTimeDelta: number;
  executionMode: 'autonomous' | 'operator_authorized';
  status: 'completed' | 'in_transit' | 'evaluating';
  feedbackScore: number; // 0 - 100
}

export interface SimulationParams {
  portCongestionFactor: number; // % delta e.g. 25
  leadTimeVarianceDays: number; // days e.g. 5
  fuelBunkerSurcharge: number; // % delta e.g. 15
  demandSurge: number; // % delta e.g. 30
}

export interface NetworkNode {
  id: string;
  name: string;
  code: string;
  type: 'hub' | 'port' | 'manufacturing' | 'distribution';
  x: number; // % 0-100 on map
  y: number; // % 0-100 on map
  status: SeverityLevel;
  activeDisruptions: number;
  inventoryHealth: number; // 0-100
  throughputUnits: number;
}
