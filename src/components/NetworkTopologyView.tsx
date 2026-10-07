import React, { useState } from 'react';
import { NetworkNode, DisruptionItem } from '../types';
import {
  Globe,
  Radio,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface NetworkTopologyViewProps {
  nodes: NetworkNode[];
  disruptions: DisruptionItem[];
  onSelectNode: (node: NetworkNode) => void;
  onOpenDisruptionDrawer: (item: DisruptionItem) => void;
}

export const NetworkTopologyView: React.FC<NetworkTopologyViewProps> = ({
  nodes,
  disruptions,
  onSelectNode,
  onOpenDisruptionDrawer,
}) => {
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);

  // Corridors / Connections between nodes
  const corridors = [
    { from: 'node-sha', to: 'node-lgb', status: 'disrupted', label: 'Trans-Pacific Ocean' },
    { from: 'node-lgb', to: 'node-fmt', status: 'disrupted', label: 'California Rail Spur' },
    { from: 'node-tpe', to: 'node-aus', status: 'disrupted', label: 'Air Express Corridor' },
    { from: 'node-ngo', to: 'node-ord', status: 'nominal', label: 'Intermodal Great Circle' },
    { from: 'node-sin', to: 'node-rtm', status: 'disrupted', label: 'Cape Maritime Route' },
    { from: 'node-rtm', to: 'node-ewr', status: 'risk', label: 'North Atlantic Ocean' },
    { from: 'node-fra', to: 'node-ord', status: 'risk', label: 'Air Pharma Cold-Chain' },
    { from: 'node-rtm', to: 'node-dub', status: 'nominal', label: 'Short-Sea Feeder' },
    { from: 'node-ord', to: 'node-aus', status: 'nominal', label: 'Central Truckload' },
  ];

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  return (
    <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0f172a] tracking-tight">
              Global Multi-Node Corridor Topology
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#eff6ff] text-[#0051d5] border border-[#dbe1ff]">
              12 Tier-1 Corridors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geospatial intermodal network routing. Click any critical node or corridor to inspect active bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] animate-pulse"></span>
            Disrupted Corridor (3)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#bc4800]"></span>
            Lead-Time Drift (2)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
            Nominal Flow (7)
          </span>
        </div>
      </div>

      {/* Main Tactical Map Viewport */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative shadow-[0_4px_6px_-1px_rgba(15,23,42,0.1)] p-4 sm:p-6 min-h-[500px]">
        
        {/* Subtle Map Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#306bf3_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Tactical Overlay Top Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#306bf3] animate-pulse" />
            <span className="font-mono text-slate-200 font-semibold">
              TACTICAL NETWORK MESH: REAL-TIME TELEMETRY
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-400 flex items-center gap-3">
            <span>PING: 18ms</span>
            <span>·</span>
            <span>AIS MARITIME: ACTIVE</span>
            <span>·</span>
            <span>ADS-B CARGO: SYNCED</span>
          </div>
        </div>

        {/* SVG Network Canvas */}
        <div className="relative w-full h-[420px] my-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            
            {/* Draw Corridor Edges */}
            {corridors.map((c, idx) => {
              const fromNode = getNodeById(c.from);
              const toNode = getNodeById(c.to);
              if (!fromNode || !toNode) return null;

              const isDisrupted = c.status === 'disrupted';
              const isRisk = c.status === 'risk';
              const strokeColor = isDisrupted
                ? '#dc2626'
                : isRisk
                ? '#f59e0b'
                : '#059669';

              // Midpoint curve calculation
              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const cx = (fromNode.x + toNode.x) / 2;
              const cy = (fromNode.y + toNode.y) / 2 - 4; // slight upward arch

              return (
                <g key={idx}>
                  {/* Outer glowing path */}
                  <path
                    d={`M ${fromNode.x} ${fromNode.y} Q ${cx} ${cy} ${toNode.x} ${toNode.y}`}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isDisrupted ? '0.8' : '0.4'}
                    strokeDasharray={isDisrupted ? '1.5 1' : 'none'}
                    className={isDisrupted ? 'animate-pulse' : ''}
                    opacity={isDisrupted ? 0.9 : 0.6}
                  />

                  {/* Flow Particle */}
                  <circle r="0.8" fill={strokeColor}>
                    <animateMotion
                      path={`M ${fromNode.x} ${fromNode.y} Q ${cx} ${cy} ${toNode.x} ${toNode.y}`}
                      dur={isDisrupted ? '6s' : '3s'}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}

            {/* Draw Node Dots */}
            {nodes.map((node) => {
              const isDisrupted = node.status === 'disruption';
              const isRisk = node.status === 'risk';
              const fill = isDisrupted
                ? '#dc2626'
                : isRisk
                ? '#f59e0b'
                : '#10b981';

              return (
                <g
                  key={node.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectNode(node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Outer Halo */}
                  {isDisrupted && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="2.8"
                      fill="#dc2626"
                      opacity="0.25"
                      className="animate-ping"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="1.6"
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth="0.5"
                    className="transition-transform group-hover:scale-125"
                  />

                  {/* Code Label */}
                  <text
                    x={node.x}
                    y={node.y - 2.5}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="2.4"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {node.code}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hovered Node Tooltip Card */}
          {hoveredNode && (
            <div
              className="absolute z-20 bg-slate-900 border border-slate-700 text-white p-3 rounded-lg shadow-xl w-60 pointer-events-none"
              style={{
                left: `${Math.min(75, Math.max(5, hoveredNode.x))}%`,
                top: `${Math.min(70, Math.max(10, hoveredNode.y - 12))}%`,
              }}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                <span className="font-mono font-bold text-xs">{hoveredNode.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase font-semibold ${
                    hoveredNode.status === 'disruption'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : hoveredNode.status === 'risk'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {hoveredNode.status}
                </span>
              </div>
              <div className="text-[11px] space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-semibold capitalize">{hoveredNode.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inventory Health:</span>
                  <span className="font-mono text-emerald-400">{hoveredNode.inventoryHealth}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Throughput Rate:</span>
                  <span className="font-mono">{hoveredNode.throughputUnits.toLocaleString()} u/day</span>
                </div>
                {hoveredNode.activeDisruptions > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold pt-1 border-t border-slate-800">
                    <span>Critical Anomalies:</span>
                    <span className="font-mono">{hoveredNode.activeDisruptions} Pending</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Tactical Legend Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Nominal Hub
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Buffer Erosion
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#dc2626]"></span> High Disruption (Action Required)
            </span>
          </div>

          <div className="text-slate-500 font-mono text-[11px]">
            Connected Corridors: Pacific Rim, Trans-Atlantic, Eurasian High-Speed Rail
          </div>
        </div>

      </div>

      {/* Featured Automated Intermodal Logistics Hub Showcase */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)] grid grid-cols-1 md:grid-cols-12 gap-0">
        <div className="md:col-span-5 relative h-48 md:h-auto min-h-[180px]">
          <img
            src="/src/assets/images/facility_logistics_hub_1791390678278.jpg"
            alt="Automated Multimodal Logistics Hub"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent p-4 flex flex-col justify-end">
            <span className="font-mono text-xs font-semibold text-white/90">
              Corridor Inbound Terminal · Prince Rupert Intermodal Spur
            </span>
            <span className="text-[11px] text-white/70">
              Automated Rail Transfer Capacity: 18 trains / 24h
            </span>
          </div>
        </div>

        <div className="md:col-span-7 p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#0051d5] uppercase tracking-wider">
                Corridor Rebalancing Architecture
              </span>
              <span className="text-xs font-mono text-[#059669]">
                Dynamic Diversion Active
              </span>
            </div>
            <h3 className="text-base font-bold text-[#0f172a] mt-1">
              Multi-Echelon Autonomous Load Shifting
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              When Pacific Rim berth dwell exceeds 6 days, the Autonomous Control Tower automatically routes bonded intermodal rail spurs through secondary northern deepwater terminals, bypassing coastal drayage queues and safeguarding line continuity.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="font-mono font-semibold text-slate-800">
              Avg Dwell: <span className="text-[#059669]">1.4 Days</span>
            </div>
            <span>·</span>
            <div className="font-mono font-semibold text-slate-800">
              Customs Clearance: <span className="text-[#059669]">Bonded EDI 315</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
