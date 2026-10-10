/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  INITIAL_DISRUPTIONS,
  INITIAL_EXECUTION_LEDGER,
  NETWORK_NODES,
} from './data/mockData';
import {
  DisruptionItem,
  ExecutionRecord,
  NetworkNode,
  PrescriptionOption,
  SimulationParams,
  WorkflowStage,
} from './types';
import { Header } from './components/Header';
import { WorkflowBanner } from './components/WorkflowBanner';
import { KpiMetrics } from './components/KpiMetrics';
import { DecisionMatrixView } from './components/DecisionMatrixView';
import { DisruptionTableView } from './components/DisruptionTableView';
import { ExecutionLedgerView } from './components/ExecutionLedgerView';
import { ScenarioSimulatorView } from './components/ScenarioSimulatorView';
import { NetworkTopologyView } from './components/NetworkTopologyView';
import { DecisionDrawer } from './components/DecisionDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [disruptions, setDisruptions] = useState<DisruptionItem[]>(INITIAL_DISRUPTIONS);
  const [ledger, setLedger] = useState<ExecutionRecord[]>(INITIAL_EXECUTION_LEDGER);
  const [nodes, setNodes] = useState<NetworkNode[]>(NETWORK_NODES);

  const [activeTab, setActiveTab] = useState<string>('prescriptions');
  const [selectedScope, setSelectedScope] = useState<string>('Global All-Nodes (42 Hubs)');
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(false);
  const [autoPilotEnabled, setAutoPilotEnabled] = useState<boolean>(true);

  const [currentWorkflowStage, setCurrentWorkflowStage] = useState<WorkflowStage | 'all'>('all');
  const [drawerItem, setDrawerItem] = useState<DisruptionItem | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [isBatchExecuting, setIsBatchExecuting] = useState<boolean>(false);
  const [isRecalibrating, setIsRecalibrating] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      description,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 5000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Execute prescription
  const handleExecutePrescription = (
    disruption: DisruptionItem,
    prescription: PrescriptionOption
  ) => {
    setExecutingId(prescription.id);

    setTimeout(() => {
      // Update disruption state
      setDisruptions((prev) =>
        prev.map((item) => {
          if (item.id === disruption.id) {
            return {
              ...item,
              status: 'resolved',
              workflowStage: 'execute',
              leadTimeDriftDays: 0.2,
              valueAtRisk: Math.round(item.valueAtRisk * 0.1),
            };
          }
          return item;
        })
      );

      // Create ledger entry
      const newLedgerItem: ExecutionRecord = {
        id: `EXE-2026-${Math.floor(1050 + Math.random() * 50)}`,
        disruptionId: disruption.id,
        timestamp: 'Just now (Automated)',
        sku: disruption.sku,
        lane: `${disruption.lane.originCode} → ${disruption.lane.destCode}`,
        strategy: prescription.title.split(':')[1]?.trim() || prescription.title,
        predictedSavings: Math.abs(prescription.financialDelta),
        realizedSavings: Math.abs(prescription.financialDelta) + Math.round(Math.random() * 18000),
        predictedLeadTimeDelta: -prescription.leadTimeCompressionDays,
        realizedLeadTimeDelta: -(prescription.leadTimeCompressionDays + 0.2),
        executionMode: autoPilotEnabled ? 'autonomous' : 'operator_authorized',
        status: 'completed',
        feedbackScore: 98,
        auditTrail: {
          auditHash: `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}7f4c9a81e309bb2a41d5018cb1749830`,
          triggerCondition: `Buffer depletion drift +${disruption.leadTimeDriftDays}d on corridor ${disruption.lane.originCode} → ${disruption.lane.destCode}`,
          policyRuleApplied: autoPilotEnabled
            ? 'AUTONOMOUS_INTERVENTION_CRITICAL_HIGH_CONFIDENCE_V4'
            : 'OPERATOR_DISPATCH_MANUAL_AUTHORIZED_RULE_1',
          erpReference: `SAP-S4HANA-PO-${Math.floor(882000 + Math.random() * 999)}`,
          tmsSignature: `EDI-204-DISPATCH-${disruption.lane.destCode}-${Math.floor(1000 + Math.random() * 9000)}`,
          customsBondId: `CBP-ENTRY-${Math.floor(300 + Math.random() * 50)}-${Math.floor(100000 + Math.random() * 899999)}`,
          authorizedActor: autoPilotEnabled
            ? 'Autonomous Engine (Agent: DISPATCH_POLICY_CORE_01)'
            : 'S. Sterling (Global Tower Dispatch Director)',
          complianceStandard: 'ISO 28000:2022 / 21 CFR Part 11 / SOC 2 Type II',
          rationaleNotes: prescription.algorithmicRationale,
        },
      };

      setLedger((prev) => [newLedgerItem, ...prev]);
      setExecutingId(null);

      // Update drawer if opened
      if (drawerItem && drawerItem.id === disruption.id) {
        setDrawerItem({
          ...drawerItem,
          status: 'resolved',
          workflowStage: 'execute',
        });
      }

      addToast(
        `Dispatched: ${prescription.strategyCode}`,
        `Transmitted EDI 315 / SAP PO. Saved $${Math.abs(prescription.financialDelta / 1000).toFixed(0)}k in line exposure. ETA confirmed.`
      );
    }, 1200);
  };

  // Batch execute selected items
  const handleBatchExecute = (selectedIds: string[]) => {
    setIsBatchExecuting(true);
    setTimeout(() => {
      setDisruptions((prev) =>
        prev.map((item) => {
          if (selectedIds.includes(item.id)) {
            return {
              ...item,
              status: 'resolved',
              workflowStage: 'execute',
              leadTimeDriftDays: 0.3,
            };
          }
          return item;
        })
      );
      setIsBatchExecuting(false);
      addToast(
        `Batch Authorization Complete (${selectedIds.length} Corridors)`,
        `Executed multi-echelon diversion orders across SAP S/4HANA & TMS carriers.`
      );
    }, 1400);
  };

  // Recalibrate models
  const handleRecalibrate = () => {
    setIsRecalibrating(true);
    setTimeout(() => {
      setDisruptions((prev) =>
        prev.map((d) => ({
          ...d,
          modelHealth: 'converged',
          modelConfidence: Math.min(99, d.modelConfidence + 2),
        }))
      );
      setIsRecalibrating(false);
      addToast(
        'Models Recalibrated with Fresh Telemetry',
        'Ingested 14,200 AIS maritime vessel pings and supplier EDI feeds. Covariate drift minimized to 0.4%.'
      );
    }, 1500);
  };

  // Apply scenario simulation
  const handleApplyScenario = (params: SimulationParams) => {
    addToast(
      'Contingency Buffer Allocated',
      `Locked 6 express intermodal rail slots and toll-blender call-off PO to shield against +${params.portCongestionFactor}% berth congestion.`
    );
  };

  // Tune objective function weights
  const handleTuneWeights = (weights: { leadTime: number; cost: number; carbon: number }) => {
    addToast(
      'Reinforcement Weights Rebalanced',
      `Lead Time: ${weights.leadTime}%, Cost: ${weights.cost}%, Carbon: ${weights.carbon}%. Prescriptions re-ranked globally.`
    );
  };

  // Compute Stage counts
  const stageCounts: Record<WorkflowStage, number> = {
    detect: disruptions.filter((d) => d.workflowStage === 'detect').length,
    predict: disruptions.filter((d) => d.workflowStage === 'predict').length,
    prescribe: disruptions.filter((d) => d.workflowStage === 'prescribe').length,
    execute: disruptions.filter((d) => d.workflowStage === 'execute').length,
    evaluate: ledger.length,
    learn: 12,
  };

  // Filtered disruptions based on ribbon selection
  const stageFilteredDisruptions =
    currentWorkflowStage === 'all'
      ? disruptions
      : disruptions.filter((d) => d.workflowStage === currentWorkflowStage);

  // Dynamic KPI sums
  const totalValueAtRisk = disruptions
    .filter((d) => d.status !== 'resolved')
    .reduce((acc, curr) => acc + curr.valueAtRisk, 0);

  const activeDisruptionsCount = disruptions.filter(
    (d) => d.severity === 'disruption' && d.status !== 'resolved'
  ).length;

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#191b24] flex flex-col font-sans selection:bg-[#306bf3] selection:text-white pb-16">
      
      {/* 1. Global Header with 3-Zone Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedScope={selectedScope}
        setSelectedScope={setSelectedScope}
        isSimulationMode={isSimulationMode}
        setIsSimulationMode={setIsSimulationMode}
        autoPilotEnabled={autoPilotEnabled}
        setAutoPilotEnabled={setAutoPilotEnabled}
        onRecalibrate={handleRecalibrate}
        isRecalibrating={isRecalibrating}
      />

      {/* 2. Interactive Closed-Loop Workflow Banner */}
      <WorkflowBanner
        currentStage={currentWorkflowStage}
        onSelectStage={(stage) => {
          setCurrentWorkflowStage(stage);
          if (stage === 'evaluate' || stage === 'learn') {
            setActiveTab('ledger');
          } else if (stage === 'prescribe') {
            setActiveTab('prescriptions');
          } else if (stage === 'detect' || stage === 'predict' || stage === 'execute') {
            setActiveTab('disruptions');
          }
        }}
        stageCounts={stageCounts}
      />

      {/* 3. High-Throughput Tabular KPI Metrics Bar */}
      <KpiMetrics
        totalValueAtRisk={totalValueAtRisk}
        mitigatedToday={1240000}
        otifRate={98.4}
        stockoutRiskIndex={3.4}
        autoResolutionRate={88.6}
        activeDisruptionsCount={activeDisruptionsCount}
      />

      {/* 4. Main Dynamic Viewport */}
      <main className="flex-1">
        {activeTab === 'prescriptions' && (
          <DecisionMatrixView
            disruptions={stageFilteredDisruptions}
            onOpenDrawer={(item) => setDrawerItem(item)}
            onExecutePrescription={handleExecutePrescription}
            executingId={executingId}
          />
        )}

        {activeTab === 'disruptions' && (
          <DisruptionTableView
            disruptions={stageFilteredDisruptions}
            onOpenDrawer={(item) => setDrawerItem(item)}
            onBatchExecute={handleBatchExecute}
            isBatchExecuting={isBatchExecuting}
          />
        )}

        {activeTab === 'ledger' && (
          <ExecutionLedgerView
            ledger={ledger}
            onTuneWeights={handleTuneWeights}
          />
        )}

        {activeTab === 'simulator' && (
          <ScenarioSimulatorView
            onApplyScenario={handleApplyScenario}
          />
        )}

        {activeTab === 'topology' && (
          <NetworkTopologyView
            nodes={nodes}
            disruptions={disruptions}
            onSelectNode={(node) => {
              const matched = disruptions.find(
                (d) =>
                  d.lane.originCode === node.code ||
                  d.lane.destCode === node.code
              );
              if (matched) {
                setDrawerItem(matched);
              } else {
                addToast(
                  `Node Inspected: ${node.name}`,
                  `Inventory Health: ${node.inventoryHealth}%. Daily throughput: ${node.throughputUnits.toLocaleString()} units.`,
                  'info'
                );
              }
            }}
            onOpenDisruptionDrawer={(item) => setDrawerItem(item)}
          />
        )}
      </main>

      {/* 5. Contextual 420px Decision Flyout Drawer */}
      <DecisionDrawer
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
        onExecute={handleExecutePrescription}
        isExecuting={executingId !== null}
      />

      {/* 6. Execution Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* 7. Footer: Quiet Attributable Site Bar */}
      <footer className="mt-auto border-t border-[#e2e8f0] bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Autonomous Control Tower</span>
            <span>·</span>
            <span>Closed-Loop Algorithmic Supply Chain Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>Deterministic Execution Engine v26.4</span>
            <span>·</span>
            <span>ISO 28000 Security Hardened</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
