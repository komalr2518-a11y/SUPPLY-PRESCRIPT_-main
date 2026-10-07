import React, { useState } from 'react';
import { DisruptionItem, ModelHealth, SeverityLevel, WorkflowStage } from '../types';
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink,
  Ship,
  Plane,
  Train,
  Truck,
  Check,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface DisruptionTableViewProps {
  disruptions: DisruptionItem[];
  onOpenDrawer: (item: DisruptionItem) => void;
  onBatchExecute: (selectedIds: string[]) => void;
  isBatchExecuting: boolean;
}

// Inline Metric Sparkline (width 84px, height 20px, 1.5px stroke)
export const SparklineCell: React.FC<{ data: number[]; isDisrupted: boolean }> = ({
  data,
  isDisrupted,
}) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 84;
  const height = 20;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isDisrupted ? '#dc2626' : '#306bf3';
  const fillColor = isDisrupted ? 'url(#disruptionGradient)' : 'none';

  return (
    <div className="flex items-center">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="disruptionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {isDisrupted && (
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill={fillColor}
          />
        )}

        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};

// Model Health Indicator with pulsing 6px dot
export const ModelHealthBadge: React.FC<{ status: ModelHealth }> = ({ status }) => {
  let color = '#10b981'; // green
  let label = 'Model Converged';

  if (status === 'drift') {
    color = '#f59e0b'; // amber
    label = 'Covariate Drift';
  } else if (status === 'degraded') {
    color = '#ef4444'; // ruby
    label = 'Model Degraded';
  }

  return (
    <div className="flex items-center gap-1.5" title={label}>
      <span className="relative flex h-2 w-2">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: color }}
        />
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ backgroundColor: color }}
        />
      </span>
      <span className="text-[11px] font-mono text-slate-600 hidden sm:inline whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};

export const DisruptionTableView: React.FC<DisruptionTableViewProps> = ({
  disruptions,
  onOpenDrawer,
  onBatchExecute,
  isBatchExecuting,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Transport mode icon helper
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'air':
        return <Plane className="w-3.5 h-3.5 text-sky-600" />;
      case 'rail':
        return <Train className="w-3.5 h-3.5 text-amber-600" />;
      case 'road':
        return <Truck className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Ship className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  // Filter items
  const filteredDisruptions = disruptions.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.skuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lane.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lane.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDisruptions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDisruptions.map((d) => d.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 space-y-4">
      
      {/* Top Filter & Search Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, Corridor, Port Code, or Disruption ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#e2e8f0] rounded text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-[#346ef6] focus:ring-3 focus:ring-[#346ef6]/12 transition-all"
          />
        </div>

        {/* Filters and Batch Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Severity Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded">
            {[
              { id: 'all', label: 'All Severities' },
              { id: 'disruption', label: 'Disruption' },
              { id: 'risk', label: 'Risk' },
              { id: 'nominal', label: 'Nominal' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSeverityFilter(tab.id as SeverityLevel | 'all')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  severityFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Batch Authorization Action */}
          {selectedIds.length > 0 && (
            <button
              onClick={() => onBatchExecute(selectedIds)}
              disabled={isBatchExecuting}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#0051d5] hover:bg-[#2551c5] rounded transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Batch Authorize ({selectedIds.length})</span>
            </button>
          )}

        </div>
      </div>

      {/* High-Density Data Grid Container */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#475569] font-medium h-10 select-none">
                <th className="w-10 px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === filteredDisruptions.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[#cbd5e1] text-[#346ef6] focus:ring-[#346ef6]/20 cursor-pointer accent-[#306bf3]"
                  />
                </th>
                <th className="px-3 py-2 whitespace-nowrap">ID / Corridor</th>
                <th className="px-3 py-2 whitespace-nowrap">Critical SKU & Impacted Facility</th>
                <th className="px-3 py-2 whitespace-nowrap">Loop Stage</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Lead-Time Drift</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Stockout Horizon</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Value at Risk</th>
                <th className="px-3 py-2 whitespace-nowrap">Runout Trajectory</th>
                <th className="px-3 py-2 whitespace-nowrap">Model Health</th>
                <th className="px-3 py-2 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#e2e8f0]">
              {filteredDisruptions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                    No active disruptions or anomalies matching your search filter.
                  </td>
                </tr>
              ) : (
                filteredDisruptions.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isDisrupted = item.severity === 'disruption';
                  const isResolved = item.status === 'resolved';

                  return (
                    <tr
                      key={item.id}
                      className={`h-11 hover:bg-[#f8fafc] transition-colors ${
                        isSelected ? 'bg-[#eff6ff]/50' : ''
                      } ${isResolved ? 'opacity-70 bg-emerald-50/20' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(item.id)}
                          className="w-4 h-4 rounded border-[#cbd5e1] text-[#346ef6] focus:ring-[#346ef6]/20 cursor-pointer accent-[#306bf3]"
                        />
                      </td>

                      {/* ID & Lane */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-[#0f172a]">
                            {item.id}
                          </span>
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            {getModeIcon(item.lane.mode)}
                            <span>{item.lane.originCode}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span>{item.lane.destCode}</span>
                          </span>
                        </div>
                      </td>

                      {/* SKU & Facility */}
                      <td className="px-3 py-2">
                        <div className="font-mono font-medium text-[#0f172a] truncate max-w-[220px]">
                          {item.sku}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[260px]">
                          {item.facilityImpacted}
                        </div>
                      </td>

                      {/* Stage Tag */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                            item.workflowStage === 'prescribe'
                              ? 'bg-[#eff6ff] text-[#0051d5] border border-[#b4c5ff]'
                              : item.workflowStage === 'detect'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : item.workflowStage === 'predict'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.workflowStage}
                        </span>
                      </td>

                      {/* Lead Time Drift */}
                      <td className="px-3 py-2 text-right font-mono font-semibold whitespace-nowrap">
                        <span
                          className={
                            item.leadTimeDriftDays > 3
                              ? 'text-[#dc2626]'
                              : item.leadTimeDriftDays > 1
                              ? 'text-[#bc4800]'
                              : 'text-slate-700'
                          }
                        >
                          +{item.leadTimeDriftDays.toFixed(1)}d
                        </span>
                      </td>

                      {/* Stockout Horizon */}
                      <td className="px-3 py-2 text-right font-mono font-semibold whitespace-nowrap">
                        <span
                          className={
                            item.stockoutHorizonDays < 5
                              ? 'text-[#dc2626]'
                              : 'text-slate-800'
                          }
                        >
                          {item.stockoutHorizonDays.toFixed(1)} days
                        </span>
                      </td>

                      {/* Value at Risk */}
                      <td className="px-3 py-2 text-right font-mono font-bold text-[#0f172a] whitespace-nowrap">
                        ${(item.valueAtRisk / 1000).toLocaleString()}k
                      </td>

                      {/* Inline Vector Sparkline */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <SparklineCell
                          data={item.sparkline}
                          isDisrupted={isDisrupted}
                        />
                      </td>

                      {/* Model Health */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <ModelHealthBadge status={item.modelHealth} />
                      </td>

                      {/* Drawer Inspect Action */}
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => onOpenDrawer(item)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#0051d5] bg-[#eff6ff] hover:bg-[#dbe1ff] rounded transition-colors inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Table Footer with Summary Stats */}
        <div className="px-4 py-2.5 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredDisruptions.length}</span> active corridors
          </div>
          <div className="flex items-center gap-4">
            <span>High Risk: <strong className="text-[#dc2626] font-mono">3</strong></span>
            <span>·</span>
            <span>Drift Warning: <strong className="text-[#bc4800] font-mono">2</strong></span>
            <span>·</span>
            <span>Nominal: <strong className="text-[#059669] font-mono">1</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
};
