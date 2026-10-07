import React, { useState } from 'react';
import { ExecutionRecord } from '../types';
import {
  CheckCircle2,
  RefreshCw,
  Sliders,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Check,
  Clock,
  ArrowDownRight,
  Info,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

interface ExecutionLedgerViewProps {
  ledger: ExecutionRecord[];
  onTuneWeights: (weights: { leadTime: number; cost: number; carbon: number }) => void;
}

export const ExecutionLedgerView: React.FC<ExecutionLedgerViewProps> = ({
  ledger,
  onTuneWeights,
}) => {
  const [weights, setWeights] = useState({
    leadTime: 50,
    cost: 35,
    carbon: 15,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleWeightChange = (type: 'leadTime' | 'cost' | 'carbon', value: number) => {
    const updated = { ...weights, [type]: value };
    setWeights(updated);
  };

  const handleApplyWeights = () => {
    onTuneWeights(weights);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDownloadCSV = () => {
    if (!ledger || ledger.length === 0) return;

    const headers = [
      'Execution Reference',
      'Disruption ID',
      'Timestamp',
      'Critical SKU',
      'Corridor / Lane',
      'Prescribed Strategy',
      'Predicted Savings ($)',
      'Realized Savings ($)',
      'Savings Variance ($)',
      'Predicted Lead Time Delta (Days)',
      'Realized Lead Time Delta (Days)',
      'Execution Mode',
      'Status',
      'Model Reward Score',
    ];

    const rows = ledger.map((rec) => {
      const variance = rec.realizedSavings - rec.predictedSavings;
      return [
        `"${rec.id}"`,
        `"${rec.disruptionId}"`,
        `"${rec.timestamp}"`,
        `"${rec.sku}"`,
        `"${rec.lane}"`,
        `"${rec.strategy.replace(/"/g, '""')}"`,
        rec.predictedSavings,
        rec.realizedSavings,
        variance,
        rec.predictedLeadTimeDelta,
        rec.realizedLeadTimeDelta,
        `"${rec.executionMode === 'autonomous' ? 'Autonomous Auto-Pilot' : 'Operator Authorized'}"`,
        `"${rec.status}"`,
        rec.feedbackScore,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `compliance_execution_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Calculate learning loop metrics
  const totalPredictedSavings = ledger.reduce((acc, curr) => acc + curr.predictedSavings, 0);
  const totalRealizedSavings = ledger.reduce((acc, curr) => acc + curr.realizedSavings, 0);
  const savingsAccuracy = ((totalRealizedSavings / totalPredictedSavings) * 100).toFixed(1);
  const avgConfidence = (
    ledger.reduce((acc, curr) => acc + curr.feedbackScore, 0) / ledger.length
  ).toFixed(1);

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">
              Closed-Loop Execution Ledger & Reinforcement Learning
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
              Evaluate & Learn Phase
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic post-execution verification: Ground-truth audit of algorithmic predictions versus realized freight outcomes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 text-xs font-mono mr-2">
            <div>
              Prediction Fidelity: <strong className="text-[#059669]">{savingsAccuracy}%</strong>
            </div>
            <span>·</span>
            <div>
              Convergence Health: <strong className="text-[#0051d5]">{avgConfidence}%</strong>
            </div>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1e293b] bg-white border border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc] rounded transition-colors shadow-xs"
            title="Export full ledger data as CSV for regulatory audit and compliance reporting"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span className="text-[#059669] font-semibold">CSV Exported</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top 3 Analytical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Cumulative Realized Savings</span>
            <span className="font-mono text-[#059669]">Audit Verified</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#0f172a] my-2">
            ${(totalRealizedSavings / 1000).toLocaleString()}k
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-[#059669]" />
            <span>+${((totalRealizedSavings - totalPredictedSavings) / 1000).toFixed(0)}k above algorithmic baseline</span>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Autonomous Execution Ratio</span>
            <span className="font-mono text-[#0051d5]">Zero Touch</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#0f172a] my-2">
            80.0%
          </div>
          <div className="text-xs text-slate-500">
            4 of 5 interventions executed deterministically
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Reinforcement Loop State</span>
            <span className="font-mono text-[#10b981]">Active</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#059669] my-2">
            Converged
          </div>
          <div className="text-xs text-slate-500">
            Weights auto-updating on 24-hour reward telemetry
          </div>
        </div>

      </div>

      {/* Main Execution Ledger Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="px-4 py-3 border-b border-[#e2e8f0] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Historical Execution Ledger
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-500">
              {ledger.length} verified interventions
            </span>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded transition-colors shadow-xs"
            title="Download CSV Compliance Export"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-slate-500 font-medium h-9">
                <th className="px-4 py-2">Execution Ref & Timestamp</th>
                <th className="px-4 py-2">Critical SKU & Corridor</th>
                <th className="px-4 py-2">Prescribed Strategy</th>
                <th className="px-4 py-2 text-right">Predicted vs Realized Savings</th>
                <th className="px-4 py-2 text-right">Lead Time Compression</th>
                <th className="px-4 py-2">Execution Mode</th>
                <th className="px-4 py-2 text-right">Model Reward</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e2e8f0]">
              {ledger.map((rec) => {
                const savingsDiff = rec.realizedSavings - rec.predictedSavings;

                return (
                  <tr key={rec.id} className="h-11 hover:bg-[#f8fafc] transition-colors">
                    
                    {/* ID & Time */}
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-900">{rec.id}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{rec.timestamp}</div>
                    </td>

                    {/* SKU & Lane */}
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="font-mono font-medium text-slate-900">{rec.sku}</div>
                      <div className="text-[11px] text-slate-500">{rec.lane}</div>
                    </td>

                    {/* Strategy */}
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-800">{rec.strategy}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Linked to {rec.disruptionId}</div>
                    </td>

                    {/* Savings comparison */}
                    <td className="px-4 py-2 text-right whitespace-nowrap font-mono">
                      <div className="font-bold text-[#059669]">
                        ${(rec.realizedSavings / 1000).toFixed(0)}k realized
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Pred: ${(rec.predictedSavings / 1000).toFixed(0)}k ({savingsDiff >= 0 ? '+' : ''}
                        {(savingsDiff / 1000).toFixed(0)}k)
                      </div>
                    </td>

                    {/* Lead time delta */}
                    <td className="px-4 py-2 text-right whitespace-nowrap font-mono">
                      <div className="font-semibold text-[#0051d5]">
                        {rec.realizedLeadTimeDelta}d actual
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Pred: {rec.predictedLeadTimeDelta}d
                      </div>
                    </td>

                    {/* Mode */}
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          rec.executionMode === 'autonomous'
                            ? 'bg-[#eff6ff] text-[#0051d5] border border-[#dbe1ff]'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rec.executionMode === 'autonomous' ? 'Autonomous Auto-Pilot' : 'Operator Authorized'}
                      </span>
                    </td>

                    {/* Reward Score */}
                    <td className="px-4 py-2 text-right whitespace-nowrap font-mono font-bold text-[#059669]">
                      {rec.feedbackScore}/100
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Reinforcement Calibration Card */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#0051d5]" />
            <h3 className="text-sm font-bold text-slate-900">
              Objective Function: Multi-Attribute Weight Tuning
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Controls Algorithmic Scoring for Rank #1 Prescriptions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Slider 1: Lead Time Priority */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Lead-Time Compression Weight</span>
              <span className="font-mono font-bold text-[#0051d5]">{weights.leadTime}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={weights.leadTime}
              onChange={(e) => handleWeightChange('leadTime', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0051d5]"
            />
            <p className="text-[11px] text-slate-400">
              Biases towards expedited air charter and priority intermodal rail.
            </p>
          </div>

          {/* Slider 2: Cost Priority */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Intervention Cost Minimization</span>
              <span className="font-mono font-bold text-[#059669]">{weights.cost}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={weights.cost}
              onChange={(e) => handleWeightChange('cost', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#059669]"
            />
            <p className="text-[11px] text-slate-400">
              Favors domestic re-balancing and contract toll-blenders over premium air freight.
            </p>
          </div>

          {/* Slider 3: Carbon Offset */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Scope 3 Decarbonization Weight</span>
              <span className="font-mono font-bold text-[#306bf3]">{weights.carbon}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.carbon}
              onChange={(e) => handleWeightChange('carbon', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#306bf3]"
            />
            <p className="text-[11px] text-slate-400">
              Penalizes fossil air charter emissions in favor of electrified rail corridors.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Changes re-score and re-rank all pending prescriptions across global queues.</span>
          </div>

          <button
            onClick={handleApplyWeights}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0051d5] hover:bg-[#2551c5] rounded transition-all flex items-center gap-1.5 shadow-sm"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Weights Updated & Recalibrated!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Apply Objective Weights</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
