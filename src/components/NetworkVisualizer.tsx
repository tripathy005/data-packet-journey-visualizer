import React, { useMemo } from 'react';
import {
  Packet,
  NetworkNode,
  NetworkEdge,
  TopologyType,
} from '../types';
import {
  Monitor,
  Router,
  Shield,
  Server,
  Zap,
  Clock,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Radio,
} from 'lucide-react';

interface NetworkVisualizerProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  packets: Packet[];
  selectedPacketId: string | null;
  onSelectPacket: (packetId: string) => void;
  onInjectDelay: (packetId: string) => void;
  onForceDrop: (packetId: string) => void;
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({
  nodes,
  edges,
  packets,
  selectedPacketId,
  onSelectPacket,
  onInjectDelay,
  onForceDrop,
}) => {
  // Map nodes by ID for fast lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, NetworkNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Calculate packet screen positions (X, Y) based on current hop & edge progress
  const activePacketPositions = useMemo(() => {
    return packets.map((pkt) => {
      if (pkt.status === 'Waiting') {
        const sender = nodeMap.get(pkt.pathNodeIds[0]);
        return {
          ...pkt,
          x: sender ? sender.x : 10,
          y: sender ? sender.y : 50,
          isVisible: false,
        };
      }

      const currNodeId = pkt.pathNodeIds[pkt.currentHopIndex];
      const nextNodeId = pkt.pathNodeIds[pkt.currentHopIndex + 1];

      const fromNode = nodeMap.get(currNodeId);
      const toNode = nodeMap.get(nextNodeId) || fromNode;

      if (!fromNode || !toNode) {
        return { ...pkt, x: 50, y: 50, isVisible: false };
      }

      // Interpolate position along line segment
      const t = Math.max(0, Math.min(1, pkt.progressOnCurrentEdge));
      const x = fromNode.x + (toNode.x - fromNode.x) * t;
      const y = fromNode.y + (toNode.y - fromNode.y) * t;

      return {
        ...pkt,
        x,
        y,
        isVisible: true,
      };
    });
  }, [packets, nodeMap]);

  // Helper for node icons
  const renderNodeIcon = (type: string) => {
    switch (type) {
      case 'workstation':
        return <Monitor className="w-6 h-6 text-cyan-400" />;
      case 'router':
        return <Router className="w-6 h-6 text-sky-400" />;
      case 'firewall':
        return <Shield className="w-6 h-6 text-indigo-400" />;
      case 'server':
        return <Server className="w-6 h-6 text-emerald-400" />;
      default:
        return <Router className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] bg-slate-950 rounded-2xl border border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.08)] flex flex-col justify-between">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,240,255,0.12),rgba(255,255,255,0))]" />
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00f0ff 1px, transparent 1px),
            linear-gradient(to bottom, #00f0ff 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Top Canvas Bar / Network Status */}
      <div className="relative z-10 px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">TOPOLOGY CANVAS</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400">LIVE MESH SIMULATION</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            In Transit
          </span>
          <span className="flex items-center gap-1.5 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            Latency Hold
          </span>
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            Packet Lost
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            Delivered
          </span>
        </div>
      </div>

      {/* SVG Container for Wires & Nodes & Traveling Packets */}
      <div className="relative w-full flex-1">
        <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            {/* Edge Glow Filter */}
            <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Packet Cyan Glow */}
            <filter id="packet-glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Packet Amber Glow */}
            <filter id="packet-glow-amber" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. DRAW NETWORK EDGES / WIRES */}
          {edges.map((edge) => {
            const from = nodeMap.get(edge.fromNodeId);
            const to = nodeMap.get(edge.toNodeId);
            if (!from || !to) return null;

            return (
              <g key={edge.id}>
                {/* Background Wire Tube */}
                <line
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Animated Glowing Connection Signal Line */}
                <line
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke="#00f0ff"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  filter="url(#wire-glow)"
                  className="opacity-70 animate-[dash_2s_linear_infinite]"
                />
                {/* Bandwidth / Latency Label */}
                {edge.label && (
                  <text
                    x={`${(from.x + to.x) / 2}%`}
                    y={`${(from.y + to.y) / 2 - 2}%`}
                    fill="#94a3b8"
                    fontSize="2.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none font-semibold"
                  >
                    {edge.label} ({edge.baseLatencyMs}ms)
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* 2. DRAW NETWORK NODES (HTML Overlay for crisp text & rich cards) */}
        {nodes.map((node) => {
          const isSender = node.type === 'sender';
          const isReceiver = node.type === 'receiver';

          return (
            <div
              key={node.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {/* Node Outer Pulsing Aura */}
              <div
                className={`relative flex items-center justify-center p-3 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                  isSender
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:scale-105'
                    : isReceiver
                    ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-105'
                    : 'bg-slate-900/90 border-slate-700/80 group-hover:border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                }`}
              >
                {renderNodeIcon(node.iconType)}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
                </span>
              </div>

              {/* Node Label & IP Badge */}
              <div className="mt-1.5 flex flex-col items-center pointer-events-none">
                <span className="font-mono text-[11px] font-bold text-slate-200 tracking-wide drop-shadow-md">
                  {node.name}
                </span>
                <span className="font-mono text-[9px] text-cyan-400 bg-slate-950/90 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  {node.ip}
                </span>
              </div>
            </div>
          );
        })}

        {/* 3. DRAW TRAVELING DATA PACKETS */}
        {activePacketPositions.map((pkt) => {
          if (!pkt.isVisible) return null;

          const isSelected = pkt.id === selectedPacketId;
          const isDelayed = pkt.status === 'Delayed';
          const isLost = pkt.status === 'Lost';
          const isRetx = pkt.status === 'Retransmitting';
          const isDelivered = pkt.status === 'Delivered' || pkt.status === 'Reassembled';

          return (
            <div
              key={pkt.id}
              onClick={() => onSelectPacket(pkt.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer transition-transform duration-75 group ${
                isSelected ? 'scale-125 z-40' : 'hover:scale-110'
              }`}
              style={{ left: `${pkt.x}%`, top: `${pkt.y}%` }}
            >
              {/* Packet Orb Representation */}
              <div className="relative flex items-center justify-center">
                {/* LOST PACKET GLITCH ANIMATION */}
                {isLost && (
                  <div className="relative flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-red-600/80 border-2 border-red-400 flex items-center justify-center animate-ping shadow-[0_0_15px_#ef4444]">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                    {/* Floating Status Badge for Lost */}
                    <div className="absolute -top-7 whitespace-nowrap bg-red-950/95 border border-red-500 text-red-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-bounce flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-red-400" />
                      <span>{pkt.displayId} → LOST</span>
                    </div>
                  </div>
                )}

                {/* DELAYED / LATENCY HOLD PACKET */}
                {isDelayed && (
                  <div className="relative flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-amber-500/30 border-2 border-amber-400 flex items-center justify-center animate-pulse shadow-[0_0_20px_#f59e0b]">
                      <Clock className="w-4 h-4 text-amber-300 animate-spin" />
                    </div>
                    {/* Floating Delay Badge */}
                    <div className="absolute -top-8 whitespace-nowrap bg-amber-950/95 border border-amber-400 text-amber-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-[0_0_12px_rgba(245,158,11,0.6)] flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span>{pkt.displayId}</span>
                      <span className="bg-amber-500/40 text-amber-100 px-1 rounded text-[9px]">
                        Delay: {pkt.currentEdgeDelayMs}ms
                      </span>
                    </div>
                  </div>
                )}

                {/* RETRANSMITTING PACKET */}
                {isRetx && (
                  <div className="relative flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-purple-600/80 border-2 border-purple-400 flex items-center justify-center shadow-[0_0_15px_#a855f7] animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 text-purple-200 animate-spin" />
                    </div>
                    {/* Retx Badge */}
                    <div className="absolute -top-8 whitespace-nowrap bg-purple-950/95 border border-purple-400 text-purple-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-[0_0_12px_rgba(168,85,247,0.6)] flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-purple-300" />
                      <span>{pkt.displayId} RETRANSMITTING</span>
                    </div>
                  </div>
                )}

                {/* NORMAL IN TRANSIT PACKET */}
                {!isLost && !isDelayed && !isRetx && !isDelivered && (
                  <div className="relative flex items-center justify-center">
                    {/* Glowing Trail Pulse */}
                    <div className="absolute w-10 h-10 rounded-full bg-cyan-400/20 animate-ping" />
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_15px_#00f0ff]">
                      <Zap className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                    {/* Packet ID Tag */}
                    <div className="absolute -top-7 whitespace-nowrap bg-slate-900/90 border border-cyan-500/50 text-cyan-200 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                      {pkt.displayId}
                    </div>
                  </div>
                )}

                {/* DELIVERED / REASSEMBLED AT RECEIVER */}
                {isDelivered && (
                  <div className="relative flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/80 border-2 border-emerald-300 flex items-center justify-center shadow-[0_0_12px_#10b981]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="absolute -top-6 whitespace-nowrap bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                      {pkt.displayId} ✓
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Interactive Tooltip on Hover */}
              <div className="hidden group-hover:flex absolute top-9 left-1/2 -translate-x-1/2 flex-col bg-slate-900/95 border border-cyan-500/40 p-2 rounded-lg text-[10px] font-mono text-slate-200 shadow-xl z-50 whitespace-nowrap gap-1">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                  <span className="font-bold text-cyan-400">{pkt.displayId}</span>
                  <span className="text-slate-400">Seq #{pkt.seqNumber}</span>
                </div>
                <div className="text-slate-300">Payload: <span className="text-emerald-400 font-bold">"{pkt.payloadChunk}"</span></div>
                <div className="text-slate-400">Attempt: #{pkt.attempt}</div>
                {pkt.status === 'In Transit' && (
                  <div className="flex gap-1 mt-1 pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInjectDelay(pkt.id);
                      }}
                      className="bg-amber-950 hover:bg-amber-900 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600/50 text-[9px]"
                    >
                      +Delay
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onForceDrop(pkt.id);
                      }}
                      className="bg-red-950 hover:bg-red-900 text-red-300 px-1.5 py-0.5 rounded border border-red-600/50 text-[9px]"
                    >
                      Drop
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Hint */}
      <div className="relative z-10 px-4 py-1.5 bg-slate-900/80 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span>💡 Click any traveling packet or row below to inspect headers & delay history</span>
        <span className="text-cyan-400/80 font-semibold">Interactive Realtime Engine</span>
      </div>
    </div>
  );
};
