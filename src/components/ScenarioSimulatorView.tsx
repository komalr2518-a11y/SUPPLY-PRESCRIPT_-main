import React, { useState } from 'react';
import { SimulationParams } from '../types';
import {
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ScenarioSimulatorViewProps {
  onApplyScenario: (params: SimulationParams) => void;
}

export const ScenarioSimulatorView: React.FC<ScenarioSimulatorViewProps> = ({
  onApplyScenario,
}) => {
  const [params, setParams] = useState<SimulationParams>({
    portCongestionFactor: 35,
    leadTimeVarianceDays: 6,
    fuelBunkerSurcharge: 20,
    demandSurge: 25,
  });

  const [activePreset, setActivePreset] = useState<string>('custom');

  // Compute simulated impacts dynamically
  const baselineExposure = 4.82; // $4.82M
  const simulatedExposure = (
    baselineExposure *
    (1 +
      params.portCongestionFactor * 0.012 +
      params.leadTimeVarianceDays * 0.045 +
      params.demandSurge * 0.015)
  ).toFixed(2);

  const baselineOtif = 98.4;
  const simulatedOtif = Math.max(
    62.0,
    baselineOtif -
      (params.portCongestionFactor * 0.18 +
        params.leadTimeVarianceDays * 0.85 +
        params.demandSurge * 0.12)
  ).toFixed(1);

  const stockoutRisk = Math.min(
    74.0,
    3.4 +
      params.leadTimeVarianceDays * 3.2 +
      params.portCongestionFactor * 0.35 +
      params.demandSurge * 0.4
  ).toFixed(1);

  const handlePresetSelect = (preset: 'pacific_typhoon' | 'canal_blockage' | 'chip_shortage') => {
    if (preset === 'pacific_typhoon') {
      setActivePreset('pacific_typhoon');
      setParams({
        portCongestionFactor: 65,
        leadTimeVarianceDays: 9,
        fuelBunkerSurcharge: 15,
        demandSurge: 10,
      });
    } else if (preset === 'canal_blockage') {
      setActivePreset('canal_blockage');
      setParams({
        portCongestionFactor: 80,
        leadTimeVarianceDays: 14,
        fuelBunkerSurcharge: 45,
        demandSurge: 5,
      });
    } else if (preset === 'chip_shortage') {
      setActivePreset('chip_shortage');
      setParams({
        portCongestionFactor: 20,
        leadTimeVarianceDays: 12,
        fuelBunkerSurcharge: 10,
        demandSurge: 45,
      });
    }
  };

  const resetDefaults = () => {
    setActivePreset('custom');
    setParams({
      portCongestionFactor: 0,
      leadTimeVarianceDays: 0,
      fuelBunkerSurcharge: 0,
      demandSurge: 0,
    });
  };

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">
              What-If Algorithmic Scenario Sandbox
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#fff8f5] text-[#bc4800] border border-[#fed7aa]">
              Monte Carlo Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate macro disruptions, berth bottlenecks, and demand shocks to pre-synthesize autonomous hedging interventions.
          </p>
        </div>

        {/* Preset Triggers */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 uppercase font-semibold">Stress Presets:</span>
          <button
            onClick={() => handlePresetSelect('pacific_typhoon')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors"
          >
            Pacific Rim Typhoon
          </button>
          <button
            onClick={() => handlePresetSelect('canal_blockage')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors"
          >
            Canal Reroute +40%
          </button>
          <button
            onClick={() => handlePresetSelect('chip_shortage')}
            className="px-2.5 py-1 text-xs font-medium rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-colors"
          >
            Semiconductor Shock
          </button>
          <button
            onClick={resetDefaults}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
            title="Reset to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Interactive Dials vs Live Impact Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 4 Parameter Dials (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Disruption Shock Parameters
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Recalculation Active</span>
          </div>

          {/* Dial 1: Port Congestion Factor */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Port Berth Congestion Delta</span>
              <span className="font-mono font-bold text-[#dc2626]">+{params.portCongestionFactor}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.portCongestionFactor}
              onChange={(e) =>
                setParams({ ...params, portCongestionFactor: parseInt(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#dc2626]"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Nominal berth (0%)</span>
              <span>Severe queue hold (+100%)</span>
            </div>
          </div>

          {/* Dial 2: Supplier Lead Time Variance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Upstream Fabrication Drift</span>
              <span className="font-mono font-bold text-[#bc4800]">+{params.leadTimeVarianceDays} Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="21"
              value={params.leadTimeVarianceDays}
              onChange={(e) =>
                setParams({ ...params, leadTimeVarianceDays: parseInt(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#bc4800]"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Zero drift (0d)</span>
              <span>Severe delay (+21d)</span>
            </div>
          </div>

          {/* Dial 3: Fuel Surcharge Index */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Jet-A Fuel & Ocean Bunker Surcharge</span>
              <span className="font-mono font-bold text-slate-800">+{params.fuelBunkerSurcharge}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={params.fuelBunkerSurcharge}
              onChange={(e) =>
                setParams({ ...params, fuelBunkerSurcharge: parseInt(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Base contract rates</span>
              <span>High volatility (+60%)</span>
            </div>
          </div>

          {/* Dial 4: Regional Demand Surge */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">End-Customer Consumption Surge</span>
              <span className="font-mono font-bold text-[#0051d5]">+{params.demandSurge}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={params.demandSurge}
              onChange={(e) =>
                setParams({ ...params, demandSurge: parseInt(e.target.value) })
              }
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0051d5]"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Standard forecast</span>
              <span>Peak surge (+60%)</span>
            </div>
          </div>

        </div>

        {/* Right: Projected Shock Outcomes (5 cols) */}
        <div className="lg:col-span-5 bg-[#faf8ff] border border-[#e2e8f0] rounded-xl p-5 space-y-4">
          <div className="border-b border-[#e2e8f0] pb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Projected System Exposure Impact
            </span>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Comparative impact against current baseline
            </div>
          </div>

          <div className="space-y-3">
            {/* Impact 1: Value at risk */}
            <div className="bg-white p-3.5 rounded-lg border border-[#e2e8f0] flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Simulated Value at Risk</div>
                <div className="text-2xl font-bold font-mono text-[#dc2626]">
                  ${simulatedExposure}M
                </div>
              </div>
              <div className="text-right text-xs font-mono text-[#dc2626]">
                +${(parseFloat(simulatedExposure) - baselineExposure).toFixed(2)}M drift
              </div>
            </div>

            {/* Impact 2: OTIF SLA */}
            <div className="bg-white p-3.5 rounded-lg border border-[#e2e8f0] flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Degraded OTIF Commitment</div>
                <div className="text-2xl font-bold font-mono text-[#bc4800]">
                  {simulatedOtif}%
                </div>
              </div>
              <div className="text-right text-xs font-mono text-[#bc4800]">
                -{(baselineOtif - parseFloat(simulatedOtif)).toFixed(1)}% drop
              </div>
            </div>

            {/* Impact 3: Stockout Probability */}
            <div className="bg-white p-3.5 rounded-lg border border-[#e2e8f0] flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Stockout Vulnerability</div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {stockoutRisk}%
                </div>
              </div>
              <div className="text-right text-xs font-mono text-[#dc2626]">
                Critical risk threshold
              </div>
            </div>
          </div>

          {/* AI Recommended Autonomous Countermeasure */}
          <div className="bg-[#eff6ff] border border-[#b4c5ff] rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0051d5]">
              <Sparkles className="w-3.5 h-3.5 text-[#306bf3]" />
              Synthesized Autonomous Hedge:
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Auto-Pilot suggests activating <strong>Contract Toll-Blender Option 2</strong> and reserving <strong>6 priority intermodal rail unit trains</strong> now to cap total exposure delta below <strong>$5.20M</strong>.
            </p>
            <button
              onClick={() => onApplyScenario(params)}
              className="w-full mt-2 py-2 px-3 bg-[#0051d5] hover:bg-[#2551c5] text-white text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              Pre-Commit Contingency Capacity
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
