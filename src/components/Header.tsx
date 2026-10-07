import React, { useState } from 'react';
import { RefreshCw, Play, ShieldAlert, Cpu, ChevronDown } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedScope: string;
  setSelectedScope: (scope: string) => void;
  isSimulationMode: boolean;
  setIsSimulationMode: (val: boolean) => void;
  autoPilotEnabled: boolean;
  setAutoPilotEnabled: (val: boolean) => void;
  onRecalibrate: () => void;
  isRecalibrating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedScope,
  setSelectedScope,
  isSimulationMode,
  setIsSimulationMode,
  autoPilotEnabled,
  setAutoPilotEnabled,
  onRecalibrate,
  isRecalibrating,
}) => {
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);

  const scopeOptions = [
    'Global All-Nodes (42 Hubs)',
    'Trans-Pacific Tier-1 (Shanghai - Long Beach)',
    'Trans-Atlantic Corridor (Rotterdam - Newark)',
    'APAC Semiconductor Lane (Hsinchu - Austin)',
    'European High-Speed Rail Corridor',
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#e2e8f0] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      {/* Primary Top Bar: 3-Zone Contract */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-7 h-7 rounded bg-[#0051d5] text-white font-semibold text-sm shadow-sm">
              <Cpu className="w-4 h-4 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10b981] ring-2 ring-white animate-pulse" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#0f172a] whitespace-nowrap">
              Autonomous Control Tower
            </span>
          </div>

          <span className="hidden lg:inline text-slate-300 font-light" aria-hidden="true">|</span>

          {/* Scope Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setScopeDropdownOpen(!scopeDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-[#1e293b] bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded transition-colors whitespace-nowrap"
            >
              <span className="text-slate-400 font-normal">Scope:</span>
              <span className="font-semibold text-slate-800">{selectedScope}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {scopeDropdownOpen && (
              <div 
                className="absolute left-0 mt-1 w-72 bg-white border border-[#cbd5e1] rounded-lg shadow-[0_4px_6px_-1px_rgba(15,23,42,0.08)] py-1 z-50"
                onMouseLeave={() => setScopeDropdownOpen(false)}
              >
                {scopeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedScope(opt);
                      setScopeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                      selectedScope === opt
                        ? 'bg-[#eff6ff] text-[#0051d5] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedScope === opt && <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5]"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-medium text-[#475569]">
          {[
            { id: 'prescriptions', label: 'Decision Matrices' },
            { id: 'disruptions', label: 'Disruption Ledger' },
            { id: 'ledger', label: 'Evaluate & Learn Loop' },
            { id: 'simulator', label: 'What-If Sandbox' },
            { id: 'topology', label: 'Network Corridors' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-[#eff6ff] text-[#0051d5] font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Operational Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Simulation Mode Switch */}
          <button
            onClick={() => setIsSimulationMode(!isSimulationMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors border ${
              isSimulationMode
                ? 'bg-[#fff8f5] border-[#fed7aa] text-[#bc4800]'
                : 'bg-white border-[#e2e8f0] text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle between deterministic live execution and hypothetical sandbox simulation"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulationMode ? 'text-[#bc4800]' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {isSimulationMode ? 'Sandbox: Simulation' : 'Mode: Live Real-Time'}
            </span>
          </button>

          {/* Autonomous Auto-Pilot Toggle */}
          <button
            onClick={() => setAutoPilotEnabled(!autoPilotEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
              autoPilotEnabled
                ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#059669]'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title="When active, confidence ≥ 92% prescriptions dispatch deterministically without manual click"
          >
            <span className={`w-2 h-2 rounded-full ${autoPilotEnabled ? 'bg-[#059669] animate-pulse' : 'bg-slate-400'}`} />
            <span className="hidden sm:inline">
              {autoPilotEnabled ? 'Closed-Loop Auto: ON' : 'Auto-Pilot: OFF'}
            </span>
          </button>

          {/* Model Recalibrate Action */}
          <button
            onClick={onRecalibrate}
            disabled={isRecalibrating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0051d5] hover:bg-[#2551c5] rounded transition-colors shadow-sm disabled:opacity-60 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalibrating ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Recalibrate Models</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src="/src/assets/images/dispatcher_avatar_1791390665160.jpg"
              alt="Operations Director"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-xs"
              onError={(e) => {
                // Fallback container if image fails
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="hidden 2xl:block text-left text-xs leading-none">
              <div className="font-semibold text-slate-800">Sarah Sterling</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Global Tower Dispatch</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for Small Screens */}
      <div className="xl:hidden flex items-center gap-1 px-4 py-1.5 bg-[#f8fafc] border-t border-[#e2e8f0] overflow-x-auto text-xs font-medium">
        {[
          { id: 'prescriptions', label: 'Decision Matrices' },
          { id: 'disruptions', label: 'Disruption Ledger' },
          { id: 'ledger', label: 'Evaluate & Learn Loop' },
          { id: 'simulator', label: 'What-If Sandbox' },
          { id: 'topology', label: 'Network Corridors' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
              activeTab === item.id
                ? 'bg-[#eff6ff] text-[#0051d5] font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
