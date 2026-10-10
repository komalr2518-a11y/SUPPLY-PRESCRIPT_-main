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
  Search,
  Filter,
  Lock,
  ChevronDown,
  ChevronUp,
  Copy,
  Hash,
  ExternalLink,
  ShieldAlert,
  Terminal,
} from 'lucide-react';

interface ExecutionLedgerViewProps {
  ledger: ExecutionRecord[];
  onTuneWeights: (weights: { leadTime: number; cost: number; carbon: number }) => void;
}

export const ExecutionLedgerView: React.FC<ExecutionLedgerViewProps> = ({
  ledger,
  onTuneWeights,
}) => {
  const [activeSubView, setActiveSubView] = useState<'operational' | 'audit_log'>('operational');
  const [weights, setWeights] = useState({
    leadTime: 50,
    cost: 35,
    carbon: 15,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Compliance Audit Log Filters
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditModeFilter, setAuditModeFilter] = useState<'all' | 'autonomous' | 'operator_authorized'>('all');
  const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  const handleWeightChange = (type: 'leadTime' | 'cost' | 'carbon', value: number) => {
    const updated = { ...weights, [type]: value };
    setWeights(updated);
  };

  const handleApplyWeights = () => {
    onTuneWeights(weights);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const toggleExpandAuditRecord = (id: string) => {
    if (expandedRecordIds.includes(id)) {
      setExpandedRecordIds(expandedRecordIds.filter((item) => item !== id));
    } else {
      setExpandedRecordIds([...expandedRecordIds, id]);
    }
  };

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard?.writeText?.(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
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
      'Audit Signature Hash',
      'ERP Reference',
      'TMS Signature',
      'Authorized Actor',
      'Compliance Standard',
    ];

    const rows = ledger.map((rec) => {
      const variance = rec.realizedSavings - rec.predictedSavings;
      const hash = rec.auditTrail?.auditHash || `sha256:${rec.id}-auto-sig`;
      const erp = rec.auditTrail?.erpReference || 'SAP-S4HANA-AUTO';
      const tms = rec.auditTrail?.tmsSignature || 'EDI-204-CONFIRMED';
      const actor = rec.auditTrail?.authorizedActor || (rec.executionMode === 'autonomous' ? 'Autonomous Engine' : 'Operator Supervised');
      const standard = rec.auditTrail?.complianceStandard || 'ISO 28000:2022 / 21 CFR Part 11';

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
        `"${hash}"`,
        `"${erp}"`,
        `"${tms}"`,
        `"${actor}"`,
        `"${standard}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `compliance_execution_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
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

  // Filtered Audit Records
  const filteredAuditRecords = ledger.filter((rec) => {
    const matchesSearch =
      rec.id.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      rec.sku.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      rec.strategy.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      rec.lane.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      (rec.auditTrail?.auditHash && rec.auditTrail.auditHash.toLowerCase().includes(auditSearchTerm.toLowerCase())) ||
      (rec.auditTrail?.policyRuleApplied && rec.auditTrail.policyRuleApplied.toLowerCase().includes(auditSearchTerm.toLowerCase())) ||
      (rec.auditTrail?.authorizedActor && rec.auditTrail.authorizedActor.toLowerCase().includes(auditSearchTerm.toLowerCase()));

    const matchesMode =
      auditModeFilter === 'all' || rec.executionMode === auditModeFilter;

    return matchesSearch && matchesMode;
  });

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Section Header with View Mode Switcher */}
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

        {/* View Mode Switcher + Export Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveSubView('operational')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeSubView === 'operational'
                  ? 'bg-white text-[#0f172a] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Operational Ledger</span>
            </button>
            <button
              onClick={() => setActiveSubView('audit_log')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeSubView === 'audit_log'
                  ? 'bg-white text-[#0051d5] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0051d5]" />
              <span>Compliance Audit Log</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                {ledger.length}
              </span>
            </button>
          </div>

          {/* Download CSV Action */}
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

      {/* VIEW 1: Operational Ledger & Learning View */}
      {activeSubView === 'operational' && (
        <div className="space-y-6">
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

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubView('audit_log')}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#0051d5] bg-[#eff6ff] hover:bg-[#dbe1ff] border border-[#b4c5ff] rounded transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>View Timeline Audit Trail</span>
                </button>
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded transition-colors shadow-xs"
                  title="Download CSV Compliance Export"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
              </div>
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
      )}

      {/* VIEW 2: Compliance Audit Log (Read-Only Historical Timeline) */}
      {activeSubView === 'audit_log' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Regulatory Standards Banner */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#ecfdf5] text-[#059669] rounded-lg border border-[#a7f3d0] shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Read-Only Compliance & Traceability Ledger
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    Cryptographically Sealed
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Immutable chronological audit trail recording algorithmic decision provenance, ERP purchase commitments, TMS transport tenders, and regulatory compliance standards (ISO 28000, 21 CFR Part 11, SOC 2 Type II).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                <span>SHA-256 Validated</span>
              </div>
              <span className="text-slate-300">|</span>
              <div>Policy Engine: v26.4</div>
              <span className="text-slate-300">|</span>
              <div>Retention: 7 Years</div>
            </div>
          </div>

          {/* Audit Search and Filter Bar */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail by Ref ID, Hash, SKU, Policy Rule, or Actor..."
                value={auditSearchTerm}
                onChange={(e) => setAuditSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#e2e8f0] rounded text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-[#346ef6] focus:ring-3 focus:ring-[#346ef6]/12 transition-all font-sans"
              />
            </div>

            {/* Authority Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded">
              {[
                { id: 'all', label: 'All Decisions' },
                { id: 'autonomous', label: 'Autonomous Auto-Pilot' },
                { id: 'operator_authorized', label: 'Operator Authorized' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAuditModeFilter(tab.id as typeof auditModeFilter)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    auditModeFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Historical Timeline Container */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {filteredAuditRecords.length === 0 ? (
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-12 text-center text-xs text-slate-500">
                No compliance audit records found matching your search filter.
              </div>
            ) : (
              filteredAuditRecords.map((rec) => {
                const isExpanded = expandedRecordIds.includes(rec.id);
                const audit = rec.auditTrail || {
                  auditHash: `sha256:${rec.id.toLowerCase()}-deterministic-signature-verified`,
                  triggerCondition: `Buffer variance on corridor ${rec.lane}; unmitigated risk calculated at $${(rec.predictedSavings / 1000).toFixed(0)}k`,
                  policyRuleApplied: rec.executionMode === 'autonomous'
                    ? 'AUTONOMOUS_INTERVENTION_CRITICAL_HIGH_CONFIDENCE_V4'
                    : 'OPERATOR_SUPERVISED_INTERVENTION_POLICY_STANDARD',
                  erpReference: `SAP-S4HANA-REF-${rec.id.replace('EXE-2026-', 'PO-')}`,
                  tmsSignature: `EDI-204-TMS-DISPATCH-${rec.id.replace('EXE-2026-', 'TNDR-')}`,
                  customsBondId: `CBP-CUSTOMS-BOND-ENTRY-315`,
                  authorizedActor: rec.executionMode === 'autonomous'
                    ? 'Autonomous Engine (Agent: DISPATCH_POLICY_CORE_01)'
                    : 'Operations Dispatch Director',
                  complianceStandard: 'ISO 28000:2022 / 21 CFR Part 11 / SOC 2 Type II',
                  rationaleNotes: [
                    `Predicted savings verified at $${(rec.predictedSavings / 1000).toFixed(0)}k with ${rec.predictedLeadTimeDelta}d lead-time compression.`,
                    'Deterministic execution verified across carrier EDI and ERP interfaces.',
                  ],
                };

                const isAutonomous = rec.executionMode === 'autonomous';

                return (
                  <div key={rec.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[27px] sm:-left-[31px] top-4 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                        isAutonomous
                          ? 'border-[#0051d5] text-[#0051d5] group-hover:scale-110 shadow-xs'
                          : 'border-slate-500 text-slate-600 group-hover:scale-110 shadow-xs'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isAutonomous ? 'bg-[#0051d5]' : 'bg-slate-500'
                        }`}
                      />
                    </div>

                    {/* Timeline Record Card */}
                    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:border-slate-300 transition-all">
                      
                      {/* Card Header */}
                      <div className="px-5 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#0f172a]">
                            {rec.id}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {rec.timestamp}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="font-mono text-xs font-semibold text-[#0051d5]">
                            {rec.sku}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Execution Authority Badge */}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isAutonomous
                                ? 'bg-[#eff6ff] text-[#0051d5] border border-[#dbe1ff]'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isAutonomous ? 'Autonomous Auto-Pilot' : 'Operator Supervised'}
                          </span>

                          {/* Cryptographic Signature Copy Button */}
                          <button
                            onClick={() => handleCopyHash(rec.id, audit.auditHash)}
                            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded transition-colors"
                            title="Copy Cryptographic Audit Signature Hash"
                          >
                            {copiedHashId === rec.id ? (
                              <>
                                <Check className="w-3 h-3 text-[#059669]" />
                                <span className="text-[#059669]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Hash className="w-3 h-3 text-slate-400" />
                                <span>{audit.auditHash.substring(0, 14)}...</span>
                                <Copy className="w-3 h-3 text-slate-400 ml-0.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Core Content */}
                      <div className="p-5 space-y-4">
                        
                        {/* Summary Line */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div className="text-xs font-bold text-[#0f172a]">
                              {rec.strategy}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Corridor: <span className="font-semibold text-slate-700">{rec.lane}</span>
                              <span className="mx-1.5">·</span>
                              Linked Anomaly: <span className="font-mono text-slate-600">{rec.disruptionId}</span>
                            </div>
                          </div>

                          {/* Realized Metrics */}
                          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Realized Savings</span>
                              <span className="font-bold text-[#059669]">
                                +${(rec.realizedSavings / 1000).toFixed(0)}k
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Transit Delta</span>
                              <span className="font-semibold text-[#0051d5]">
                                {rec.realizedLeadTimeDelta} Days
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Model Reward</span>
                              <span className="font-bold text-slate-800">
                                {rec.feedbackScore}/100
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Audit Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          
                          {/* Left Column: Decision Provenance & Trigger */}
                          <div className="space-y-2 bg-[#f8fafc] p-3 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                                Anomaly Trigger Condition
                              </span>
                              <span className="text-slate-800 leading-snug">
                                {audit.triggerCondition}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                                Governing Policy Rule
                              </span>
                              <span className="font-mono text-[11px] text-[#0051d5] font-semibold">
                                {audit.policyRuleApplied}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                                Decision Authority Actor
                              </span>
                              <span className="text-slate-700 font-medium">
                                {audit.authorizedActor}
                              </span>
                            </div>
                          </div>

                          {/* Right Column: Immutable Electronic Signatures */}
                          <div className="space-y-2 bg-[#f8fafc] p-3 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                                ERP System Commitment
                              </span>
                              <div className="flex items-center justify-between font-mono text-[11px]">
                                <span className="text-slate-800 font-semibold">{audit.erpReference}</span>
                                <span className="text-[#059669] flex items-center gap-1 font-sans text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" /> Committed
                                </span>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                                TMS Transport Tender Signature
                              </span>
                              <div className="flex items-center justify-between font-mono text-[11px]">
                                <span className="text-slate-800 truncate max-w-[200px]" title={audit.tmsSignature}>
                                  {audit.tmsSignature}
                                </span>
                                <span className="text-[#059669] flex items-center gap-1 font-sans text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" /> Transmitted
                                </span>
                              </div>
                            </div>

                            {audit.customsBondId && (
                              <div>
                                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                                  Customs Security Bond
                                </span>
                                <div className="flex items-center justify-between font-mono text-[11px]">
                                  <span className="text-slate-800">{audit.customsBondId}</span>
                                  <span className="text-[#059669] flex items-center gap-1 font-sans text-[10px]">
                                    <CheckCircle2 className="w-3 h-3" /> Cleared
                                  </span>
                                </div>
                              </div>
                            )}

                            <div>
                              <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                                Certified Standard Framework
                              </span>
                              <span className="text-[11px] font-mono text-slate-600">
                                {audit.complianceStandard}
                              </span>
                            </div>
                          </div>

                        </div>

                        {/* Algorithmic Rationale Bullet Trail */}
                        {audit.rationaleNotes && audit.rationaleNotes.length > 0 && (
                          <div className="text-xs pt-1">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block mb-1">
                              Algorithmic Rationale Audit Trace
                            </span>
                            <ul className="space-y-1 text-slate-600 pl-4 list-disc text-[11px]">
                              {audit.rationaleNotes.map((note, idx) => (
                                <li key={idx} className="leading-relaxed">
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Expandable Technical Audit Payload (JSON View) */}
                        <div className="border-t border-slate-100 pt-3">
                          <button
                            onClick={() => toggleExpandAuditRecord(rec.id)}
                            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-medium transition-colors"
                          >
                            <Terminal className="w-3.5 h-3.5 text-slate-400" />
                            <span>{isExpanded ? 'Hide Raw Audit JSON Payload' : 'View Immutable Audit JSON Payload'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto border border-slate-800">
                              <pre className="leading-relaxed">
                                {JSON.stringify(
                                  {
                                    record_id: rec.id,
                                    disruption_id: rec.disruptionId,
                                    timestamp_utc: rec.timestamp,
                                    sku: rec.sku,
                                    corridor: rec.lane,
                                    execution_mode: rec.executionMode,
                                    financials: {
                                      predicted_savings_usd: rec.predictedSavings,
                                      realized_savings_usd: rec.realizedSavings,
                                      savings_variance_usd: rec.realizedSavings - rec.predictedSavings,
                                    },
                                    transit_compression_days: rec.realizedLeadTimeDelta,
                                    compliance_audit: {
                                      signature_sha256: audit.auditHash,
                                      policy_rule: audit.policyRuleApplied,
                                      erp_reference: audit.erpReference,
                                      tms_signature: audit.tmsSignature,
                                      customs_bond_id: audit.customsBondId,
                                      authorized_actor: audit.authorizedActor,
                                      compliance_framework: audit.complianceStandard,
                                      verification_status: 'IMMUTABLE_LOGGED',
                                    },
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          )}
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
};

