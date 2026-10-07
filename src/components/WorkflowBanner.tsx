import React from 'react';
import { WorkflowStage } from '../types';
import { Check, ChevronRight, Activity, Radar, Lightbulb, PlayCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface WorkflowBannerProps {
  currentStage: WorkflowStage | 'all';
  onSelectStage: (stage: WorkflowStage | 'all') => void;
  stageCounts: Record<WorkflowStage, number>;
}

export const WorkflowBanner: React.FC<WorkflowBannerProps> = ({
  currentStage,
  onSelectStage,
  stageCounts,
}) => {
  const stages: {
    key: WorkflowStage;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      key: 'detect',
      label: '1. Detect',
      description: 'Telemetry Anomalies',
      icon: Radar,
    },
    {
      key: 'predict',
      label: '2. Predict',
      description: 'Lead-Time Drift',
      icon: Activity,
    },
    {
      key: 'prescribe',
      label: '3. Prescribe',
      description: 'Decision Matrices',
      icon: Lightbulb,
    },
    {
      key: 'execute',
      label: '4. Execute',
      description: 'ERP/TMS Dispatch',
      icon: PlayCircle,
    },
    {
      key: 'evaluate',
      label: '5. Evaluate',
      description: 'Realized Variance',
      icon: CheckCircle2,
    },
    {
      key: 'learn',
      label: '6. Learn',
      description: 'Model Weight Tuning',
      icon: RefreshCw,
    },
  ];

  return (
    <div className="bg-white border-b border-[#e2e8f0] py-2.5 px-4 sm:px-6">
      <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left Label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Autonomous Loop Phase:
          </span>
          <button
            onClick={() => onSelectStage('all')}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              currentStage === 'all'
                ? 'bg-[#0051d5] text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Show All
          </button>
        </div>

        {/* 6-Stage Ribbon */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = currentStage === stage.key;
            const count = stageCounts[stage.key] || 0;
            const isPastResolved = stage.key === 'evaluate' || stage.key === 'learn';

            return (
              <React.Fragment key={stage.key}>
                <button
                  onClick={() => onSelectStage(stage.key)}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 rounded transition-all whitespace-nowrap text-left border ${
                    isSelected
                      ? 'bg-[#306bf3] text-white border-[#306bf3] shadow-[0_1px_2px_rgba(52,110,246,0.2)]'
                      : isPastResolved
                      ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#059669] hover:bg-[#d1fae5]'
                      : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#475569] hover:bg-slate-200/60'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isPastResolved
                        ? 'bg-[#10b981]/20 text-[#059669]'
                        : 'bg-white text-slate-600'
                    }`}
                  >
                    {isPastResolved && !isSelected ? (
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                  </div>

                  {/* Stage Label & Metric */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-xs font-semibold">{stage.label}</span>
                      <span
                        className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-full ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : isPastResolved
                            ? 'bg-[#10b981]/20 text-[#059669]'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {count}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] leading-tight mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-slate-500'
                      }`}
                    >
                      {stage.description}
                    </span>
                  </div>

                  {/* Illuminated Chevron marker for active phase */}
                  {isSelected && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#306bf3] rotate-45 border-r border-b border-[#306bf3]" />
                  )}
                </button>

                {/* Separator Chevron */}
                {idx < stages.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
