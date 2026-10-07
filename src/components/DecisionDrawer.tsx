import React, { useState } from 'react';
import { DisruptionItem, PrescriptionOption } from '../types';
import {
  X,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  GitBranch,
  Layers,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ModelHealthBadge } from './DisruptionTableView';
import { ConfidenceGauge } from './DecisionMatrixView';

interface DecisionDrawerProps {
  item: DisruptionItem | null;
  onClose: () => void;
  onExecute: (disruption: DisruptionItem, prescription: PrescriptionOption) => void;
  isExecuting: boolean;
}

export const DecisionDrawer: React.FC<DecisionDrawerProps> = ({
  item,
  onClose,
  onExecute,
  isExecuting,
}) => {
  if (!item) return null;

  const [selectedRxId, setSelectedRxId] = useState<string>(
    item.prescriptions[0]?.id || ''
  );
  const [executionStepIndex, setExecutionStepIndex] = useState<number>(-1);

  const activeRx =
    item.prescriptions.find((p) => p.id === selectedRxId) || item.prescriptions[0];

  // Inventory Runout Curve SVG generator
  const days = [0, 2, 4, 6, 8, 10, 12, 14];
  const initialStock = item.currentInventoryUnits;
  const burn = item.burnRatePerDay;
  const safetyStock = item.safetyStockUnits;

  // Baseline stock trajectory (do nothing)
  const baselineTrajectory = days.map((d) => Math.max(0, initialStock - burn * d));
  // Prescriptive stock trajectory (replenishment arrives at prescribed transit day)
  const arrivalDay = activeRx ? Math.min(14, Math.max(2, activeRx.prescriptive.transitDays)) : 4;
  const replenishmentUnits = burn * 6; // batch size
  const prescriptiveTrajectory = days.map((d) => {
    let stock = initialStock - burn * d;
    if (d >= arrivalDay) {
      stock += replenishmentUnits;
    }
    return Math.max(0, stock);
  });

  const maxVal = Math.max(initialStock * 1.2, replenishmentUnits * 1.5, safetyStock * 1.3);
  const chartHeight = 120;
  const chartWidth = 360;

  const getSvgY = (val: number) => {
    return chartHeight - (val / maxVal) * (chartHeight - 16) - 8;
  };

  const getSvgX = (dayIdx: number) => {
    return (dayIdx / (days.length - 1)) * (chartWidth - 20) + 10;
  };

  const baselinePoints = days
    .map((d, i) => `${getSvgX(i)},${getSvgY(baselineTrajectory[i])}`)
    .join(' ');

  const prescriptivePoints = days
    .map((d, i) => `${getSvgX(i)},${getSvgY(prescriptiveTrajectory[i])}`)
    .join(' ');

  const safetyStockY = getSvgY(safetyStock);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* 420px Contextual Decision Drawer */}
      <div className="relative w-full max-w-[420px] bg-white h-full shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.05)] border-l border-[#cbd5e1] flex flex-col z-10 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#e2e8f0] bg-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0f172a]">
                {item.id}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-[#eff6ff] text-[#0051d5]">
                {item.workflowStage}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-1 line-clamp-1">
              {item.skuName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700">
          
          {/* Corridor & Exposure Summary */}
          <div className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-600">Transit Corridor:</span>
              <div className="flex items-center gap-1.5 text-[#0f172a]">
                <span>{item.lane.origin} ({item.lane.originCode})</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.lane.destination} ({item.lane.destCode})</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Facility at Risk:</span>
              <span className="font-medium text-slate-800">{item.facilityImpacted}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Exposure Value:</span>
              <span className="font-mono font-bold text-[#dc2626]">
                ${(item.valueAtRisk / 1000).toLocaleString()}k
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Model Telemetry:</span>
              <ModelHealthBadge status={item.modelHealth} />
            </div>
          </div>

          {/* Causal Chain Breakdown */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#0051d5]" />
              Algorithmic Causal Trace
            </div>

            <div className="border-l-2 border-slate-200 ml-2 pl-3 space-y-3.5 py-1">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Upstream Root Cause</span>
                <p className="text-xs font-medium text-slate-800 leading-snug">
                  {item.rootCause}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Drift Consequence</span>
                <p className="text-xs text-slate-700 leading-snug">
                  Lead time expanded by <strong className="font-mono text-[#dc2626]">+{item.leadTimeDriftDays} days</strong>. Safety buffer burn accelerating at <strong className="font-mono">{item.burnRatePerDay} units/day</strong>.
                </p>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Downstream Plant Impact</span>
                <p className="text-xs text-slate-700 leading-snug">
                  {item.impactSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Inventory Safety Stock Runout Curve */}
          <div className="border border-[#e2e8f0] rounded-xl p-3.5 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                14-Day Inventory Runout Simulation
              </span>
              <span className="text-[10px] font-mono text-slate-400">Units vs Days</span>
            </div>

            {/* SVG Chart */}
            <div className="w-full bg-[#f8fafc] border border-slate-200 rounded p-2">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-28">
                {/* Safety Stock Threshold Line */}
                <line
                  x1="10"
                  y1={safetyStockY}
                  x2={chartWidth - 10}
                  y2={safetyStockY}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x="12"
                  y={safetyStockY - 4}
                  fill="#b45309"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                >
                  Safety Buffer ({safetyStock.toLocaleString()}u)
                </text>

                {/* Stockout Zero Line */}
                <line
                  x1="10"
                  y1={chartHeight - 8}
                  x2={chartWidth - 10}
                  y2={chartHeight - 8}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />

                {/* Baseline Red Polyline */}
                <polyline
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeDasharray="3 2"
                  points={baselinePoints}
                />

                {/* Prescriptive Blue Polyline */}
                <polyline
                  fill="none"
                  stroke="#0051d5"
                  strokeWidth="2.5"
                  points={prescriptivePoints}
                />
              </svg>

              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-[#dc2626]"></span> Baseline (Stockout Day {item.stockoutHorizonDays})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-[#0051d5]"></span> Prescriptive Rebalance
                </span>
              </div>
            </div>
          </div>

          {/* Prescriptions Evaluation */}
          {activeRx && (
            <div className="border border-[#e2e8f0] rounded-xl p-3.5 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0051d5]">
                  Active Prescription
                </span>
                <span className="text-xs font-mono font-bold text-[#059669]">
                  Rank #{activeRx.recommendationRank}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {activeRx.title}
              </h4>

              {/* Rationale items */}
              <div className="space-y-1.5 bg-[#faf8ff] p-2.5 rounded border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#306bf3]" /> Key Algorithmic Rationale:
                </div>
                <ul className="space-y-1 text-slate-600 pl-3 list-disc">
                  {activeRx.algorithmicRationale.map((r, i) => (
                    <li key={i} className="leading-relaxed">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Automated Execution Steps */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-700">
                  Closed-Loop Execution Pipeline:
                </span>
                <div className="space-y-1 font-mono text-[11px]">
                  {activeRx.executionSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-1.5 bg-[#f8fafc] border border-slate-200 rounded text-slate-700"
                    >
                      <span className="text-slate-400 font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Drawer Action Footer */}
        {activeRx && (
          <div className="p-4 border-t border-[#e2e8f0] bg-white flex flex-col gap-2">
            <button
              onClick={() => onExecute(item, activeRx)}
              disabled={isExecuting || item.status === 'resolved'}
              className={`w-full py-2.5 px-4 rounded text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-sm ${
                item.status === 'resolved'
                  ? 'bg-[#059669] cursor-default'
                  : isExecuting
                  ? 'bg-[#306bf3]/80 cursor-wait'
                  : 'bg-[#306bf3] hover:bg-[#2551c5] shadow-[0_1px_2px_rgba(52,110,246,0.2)]'
              }`}
            >
              {item.status === 'resolved' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Prescription Executed & Dispatched
                </>
              ) : isExecuting ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  Transmitting to ERP / TMS Pipeline...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Authorize Deterministic Execution
                </>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-400 font-mono">
              Deterministic SLA: Auto-updates SAP S/4HANA PO & CN Rail Waybill
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
