import React from 'react';
import { ArrowDownRight, ArrowUpRight, ShieldCheck, Zap, AlertTriangle, TrendingDown } from 'lucide-react';

interface KpiMetricsProps {
  totalValueAtRisk: number;
  mitigatedToday: number;
  otifRate: number;
  stockoutRiskIndex: number;
  stockoutTrend?: number[];
  autoResolutionRate: number;
  activeDisruptionsCount: number;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({
  totalValueAtRisk,
  mitigatedToday,
  otifRate,
  stockoutRiskIndex,
  stockoutTrend = [5.6, 5.2, 4.9, 4.6, 4.2, 3.8, stockoutRiskIndex],
  autoResolutionRate,
  activeDisruptionsCount,
}) => {
  // Sparkline calculation for 7-Day Stockout Risk Index
  const minVal = Math.min(...stockoutTrend);
  const maxVal = Math.max(...stockoutTrend);
  const range = maxVal - minVal || 1;
  const sparkWidth = 76;
  const sparkHeight = 22;

  const sparkPoints = stockoutTrend
    .map((val, idx) => {
      const x = (idx / (stockoutTrend.length - 1)) * (sparkWidth - 6) + 3;
      const y = sparkHeight - ((val - minVal) / range) * (sparkHeight - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const lastX = sparkWidth - 3;
  const lastY =
    sparkHeight -
    ((stockoutRiskIndex - minVal) / range) * (sparkHeight - 6) -
    3;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-w-[1720px] mx-auto px-4 sm:px-6 pt-4">
      
      {/* Metric 1: Financial Exposure at Risk */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">Total Value at Risk</span>
          <span className="text-[11px] font-mono text-[#dc2626] flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" /> Active
          </span>
        </div>
        <div className="my-1.5">
          <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
            ${(totalValueAtRisk / 1000000).toFixed(2)}M
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-[#059669] font-mono font-medium flex items-center">
            <ArrowDownRight className="w-3.5 h-3.5" />
            -${(mitigatedToday / 1000).toFixed(0)}k
          </span>
          <span>mitigated past 24h</span>
        </div>
      </div>

      {/* Metric 2: Global OTIF Commitment Rate */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">OTIF Commitment Rate</span>
          <span className="text-[11px] font-mono text-[#059669] flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1" /> SLA Pass
          </span>
        </div>
        <div className="my-1.5">
          <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
            {otifRate.toFixed(1)}%
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-slate-700 font-mono font-medium">Target: 98.0%</span>
          <span>·</span>
          <span className="text-[#059669] font-mono">+0.4% delta</span>
        </div>
      </div>

      {/* Metric 3: Stockout Vulnerability Index */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">Stockout Risk Index</span>
          <span className="text-[11px] font-mono text-[#bc4800]">
            Threshold: &lt;5%
          </span>
        </div>

        <div className="my-1.5 flex items-center justify-between gap-2">
          <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
            {stockoutRiskIndex.toFixed(1)}%
          </div>

          {/* Mini 7-Day Sparkline Chart */}
          <div className="flex flex-col items-end shrink-0" title={`7-Day Stockout Risk Trend: ${stockoutTrend[0]}% → ${stockoutRiskIndex}% (Improving)`}>
            <svg
              width={sparkWidth}
              height={sparkHeight}
              className="overflow-visible"
              aria-label="7-day stockout risk trend line chart"
            >
              <defs>
                <linearGradient id="stockoutTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bc4800" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gradient Area Fill */}
              <polygon
                points={`3,${sparkHeight} ${sparkPoints} ${sparkWidth - 3},${sparkHeight}`}
                fill="url(#stockoutTrendGradient)"
              />

              {/* Trend Polyline */}
              <polyline
                fill="none"
                stroke="#bc4800"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparkPoints}
              />

              {/* Endpoint Dot indicating latest position */}
              <circle
                cx={lastX}
                cy={lastY}
                r="2"
                fill="#059669"
                stroke="#ffffff"
                strokeWidth="1"
              />
            </svg>
            <span className="text-[9px] font-mono text-slate-400 mt-0.5">7D Trend</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-[#059669] font-mono font-medium flex items-center">
            <TrendingDown className="w-3.5 h-3.5" /> -1.2%
          </span>
          <span>vs previous week</span>
        </div>
      </div>

      {/* Metric 4: Closed-Loop Auto Resolution */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">Autonomous Resolution Rate</span>
          <span className="text-[11px] font-mono text-[#0051d5] flex items-center">
            <Zap className="w-3 h-3 mr-1" /> Closed-Loop
          </span>
        </div>
        <div className="my-1.5">
          <div className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
            {autoResolutionRate.toFixed(1)}%
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-slate-700 font-mono font-medium">24 / 27</span>
          <span>dispatched zero-touch</span>
        </div>
      </div>

      {/* Metric 5: Active Anomaly Clusters */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">Active Disruption Clusters</span>
          <span className="text-[11px] font-mono text-slate-500">42 Monitored Corridors</span>
        </div>
        <div className="my-1.5">
          <div className="text-2xl font-bold font-mono tracking-tight text-[#dc2626]">
            {activeDisruptionsCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5 font-sans">Critical</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>3 Prescriptions Ready</span>
          <span>·</span>
          <span className="text-[#0051d5] font-medium">1 in execution</span>
        </div>
      </div>

    </div>
  );
};
