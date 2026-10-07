import React, { useState } from 'react';
import { DisruptionItem, PrescriptionOption } from '../types';
import {
  ArrowRight,
  TrendingDown,
  Clock,
  Leaf,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  Zap,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface DecisionMatrixViewProps {
  disruptions: DisruptionItem[];
  onOpenDrawer: (item: DisruptionItem) => void;
  onExecutePrescription: (disruption: DisruptionItem, prescription: PrescriptionOption) => void;
  executingId: string | null;
}

// 5-bar segmented confidence gauge SVG
export const ConfidenceGauge: React.FC<{ score: number }> = ({ score }) => {
  // Score: 0 - 100
  // Categorical color: < 60 Red (#dc2626), 60-85 Amber (#d97706), > 85 Emerald (#059669)
  let activeColor = '#059669';
  if (score < 60) activeColor = '#dc2626';
  else if (score <= 85) activeColor = '#d97706';

  const bars = [1, 2, 3, 4, 5];
  const filledCount = Math.round((score / 100) * 5);

  return (
    <div className="flex items-center gap-1.5" title={`Algorithmic Confidence: ${score}%`}>
      <div className="flex items-center gap-1">
        {bars.map((bar) => {
          const isFilled = bar <= filledCount;
          return (
            <div
              key={bar}
              className="w-1.5 h-3.5 rounded-[1px] transition-colors"
              style={{
                backgroundColor: isFilled ? activeColor : '#e2e8f0',
              }}
            />
          );
        })}
      </div>
      <span className="font-mono text-xs font-semibold" style={{ color: activeColor }}>
        {score}%
      </span>
    </div>
  );
};

export const DecisionMatrixView: React.FC<DecisionMatrixViewProps> = ({
  disruptions,
  onOpenDrawer,
  onExecutePrescription,
  executingId,
}) => {
  // Track selected prescription per disruption card
  const [selectedPrescriptionMap, setSelectedPrescriptionMap] = useState<Record<string, string>>({});

  const actionableDisruptions = disruptions.filter(
    (d) => d.prescriptions && d.prescriptions.length > 0
  );

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">
              Algorithmic Prescriptions & Decision Matrices
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#eff6ff] text-[#0051d5] border border-[#dbe1ff]">
              {actionableDisruptions.length} Active Prescriptions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dual-tone comparative evaluation: Current Baseline Trajectory vs Algorithmic Prescriptive Intervention.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#059669]"></span> High Conf &gt;85%
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#d97706]"></span> Moderate 60-85%
          </span>
        </div>
      </div>

      {/* Decision Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {actionableDisruptions.map((disruption) => {
          const activePrescriptionId =
            selectedPrescriptionMap[disruption.id] || disruption.prescriptions[0].id;
          const activePrescription =
            disruption.prescriptions.find((p) => p.id === activePrescriptionId) ||
            disruption.prescriptions[0];

          const isExecuting = executingId === activePrescription.id;
          const isResolved = disruption.status === 'resolved';

          return (
            <div
              key={disruption.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all ${
                isResolved
                  ? 'border-[#a7f3d0] bg-[#fafdfb]'
                  : disruption.severity === 'disruption'
                  ? 'border-[#e2e8f0] hover:border-[#cbd5e1]'
                  : 'border-[#e2e8f0]'
              }`}
            >
              {/* Card Meta Bar */}
              <div className="px-5 py-3 border-b border-[#e2e8f0] bg-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#0f172a]">
                    {disruption.id}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="font-mono text-xs font-semibold text-[#0051d5]">
                    {disruption.sku}
                  </span>
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    · {disruption.category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Confidence Gauge */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400 font-normal">Model Conf:</span>
                    <ConfidenceGauge score={activePrescription.confidenceScore} />
                  </div>

                  {/* Drawer Trigger */}
                  <button
                    onClick={() => onOpenDrawer(disruption)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    title="Open Rationale Drawer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Disruption Context Banner */}
              <div className="px-5 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-800">
                    {disruption.lane.origin} ({disruption.lane.originCode})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">
                    {disruption.lane.destination} ({disruption.lane.destCode})
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Impacted: <span className="font-medium text-slate-700">{disruption.facilityImpacted}</span>
                </div>
              </div>

              {/* Prescription Strategy Selector Tabs (if multiple) */}
              {disruption.prescriptions.length > 1 && (
                <div className="px-5 pt-3 pb-1 flex items-center gap-2 border-b border-slate-100 bg-white">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Alternative Strategies:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {disruption.prescriptions.map((rx, idx) => (
                      <button
                        key={rx.id}
                        onClick={() =>
                          setSelectedPrescriptionMap({
                            ...selectedPrescriptionMap,
                            [disruption.id]: rx.id,
                          })
                        }
                        className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                          activePrescription.id === rx.id
                            ? 'bg-[#eff6ff] text-[#0051d5] font-semibold border border-[#b4c5ff]'
                            : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                        }`}
                      >
                        Option {String.fromCharCode(65 + idx)}: {rx.strategyCode.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title of Active Prescription */}
              <div className="px-5 pt-4 pb-2">
                <h3 className="text-sm font-semibold text-[#0f172a] leading-snug">
                  {activePrescription.title}
                </h3>
              </div>

              {/* Dual-Tone Split Comparison Header: Baseline vs Prescriptive */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e2e8f0] border-y border-[#e2e8f0]">
                
                {/* Left: Baseline Operational State (#F8FAFC) */}
                <div className="bg-[#f8fafc] p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Baseline (Do Nothing)
                    </span>
                    <span className="text-xs font-mono font-medium text-[#dc2626]">
                      High Drift Risk
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Transport Mode:</span>
                      <span className="font-medium text-slate-800 text-right">
                        {activePrescription.baseline.transportMode}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Total Transit:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {activePrescription.baseline.transitDays} days
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Projected Line Stockout:</span>
                      <span className="font-mono font-bold text-[#dc2626]">
                        In {activePrescription.baseline.projectedStockoutDays} days
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Unmitigated Loss Risk:</span>
                      <span className="font-mono font-bold text-[#0f172a]">
                        ${(activePrescription.baseline.unmitigatedCostRisk / 1000).toLocaleString()}k
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>OTIF SLA Expectation:</span>
                      <span className="font-mono font-semibold text-[#bc4800]">
                        {activePrescription.baseline.otifRiskPercentage}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Proposed Prescriptive State (#EFF6FF) */}
                <div className="bg-[#eff6ff]/70 p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0051d5]">
                      Algorithmic Prescriptive Path
                    </span>
                    <span className="text-xs font-mono font-medium text-[#059669]">
                      Zero Line-Down
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Prescribed Mode:</span>
                      <span className="font-medium text-[#0051d5] text-right">
                        {activePrescription.prescriptive.transportMode}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-700">
                      <span>Transit Window:</span>
                      <span className="font-mono font-semibold text-[#059669]">
                        {activePrescription.prescriptive.transitDays} days ({activePrescription.leadTimeCompressionDays}d faster)
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-700">
                      <span>Stockout Avoided:</span>
                      <span className="font-mono font-bold text-[#059669]">
                        100% Buffer Intact
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-700">
                      <span>Net Intervention Cost:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        ${(activePrescription.prescriptive.netInterventionCost / 1000).toLocaleString()}k
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-700">
                      <span>Projected OTIF Score:</span>
                      <span className="font-mono font-bold text-[#059669]">
                        {activePrescription.prescriptive.projectedOtifScore}%
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Key Financial Impact Strip */}
              <div className="px-5 py-3.5 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-[#e2e8f0]">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Net Exposure Delta</div>
                  <div className="text-lg font-bold font-mono text-[#059669]">
                    -${Math.abs(activePrescription.financialDelta / 1000).toFixed(0)}k
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Holding Cost Delta</div>
                  <div className="text-lg font-bold font-mono text-slate-800">
                    -${Math.abs(activePrescription.holdingCostDelta / 1000).toFixed(0)}k
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Lead Time Gain</div>
                  <div className="text-lg font-bold font-mono text-[#0051d5]">
                    +{activePrescription.leadTimeCompressionDays} Days
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Scope 3 CO2 Delta</div>
                  <div className="text-lg font-bold font-mono text-slate-700">
                    {activePrescription.carbonOffsetKg < 0 ? '' : '+'}
                    {activePrescription.carbonOffsetKg} kg
                  </div>
                </div>
              </div>

              {/* Algorithmic Rationale Bullet Summary */}
              <div className="px-5 py-3 bg-[#faf8ff] text-xs space-y-1.5 border-b border-[#e2e8f0]">
                <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#306bf3]" />
                  Algorithmic Rationale:
                </div>
                <ul className="space-y-1 text-slate-600 pl-4 list-disc">
                  {activePrescription.algorithmicRationale.map((point, i) => (
                    <li key={i} className="leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="px-5 py-3.5 bg-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {activePrescription.erpPurchaseOrderRequired ? 'ERP PO Trigger' : 'No PO Req'}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {activePrescription.tmsReRoutingRequired ? 'TMS EDI 204 Ready' : 'Direct Feeder'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDrawer(disruption)}
                    className="px-3 py-1.5 text-xs font-medium text-[#1e293b] bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc] rounded transition-colors"
                  >
                    Deep Rationale & Curve
                  </button>

                  <button
                    onClick={() => onExecutePrescription(disruption, activePrescription)}
                    disabled={isExecuting || isResolved}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-all flex items-center gap-1.5 shadow-sm ${
                      isResolved
                        ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] cursor-default'
                        : isExecuting
                        ? 'bg-[#306bf3]/80 text-white cursor-wait'
                        : 'bg-[#306bf3] hover:bg-[#2551c5] text-white shadow-[0_1px_2px_rgba(52,110,246,0.2)]'
                    }`}
                  >
                    {isResolved ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Dispatched & Authorized
                      </>
                    ) : isExecuting ? (
                      <>
                        <Zap className="w-3.5 h-3.5 animate-bounce" />
                        Dispatching EDI / ERP...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        Authorize & Execute
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
