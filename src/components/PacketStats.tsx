import React from 'react';
import { SimulationStats } from '../types';
import {
  Layers,
  Send,
  Radio,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Zap,
} from 'lucide-react';

interface PacketStatsProps {
  stats: SimulationStats;
  speedMultiplier: number;
}

export const PacketStats: React.FC<PacketStatsProps> = ({
  stats,
  speedMultiplier,
}) => {
  const lossRate =
    stats.packetsSent > 0
      ? Math.round((stats.packetsLost / stats.packetsSent) * 100)
      : 0;

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* Total Packets */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono uppercase font-bold">Total Packets</span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-slate-100">
          {stats.totalPackets}
        </div>
      </div>

      {/* Sent */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-col justify-between backdrop-blur-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono uppercase font-bold text-sky-400">Sent</span>
          <Send className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-sky-300">
          {stats.packetsSent}
        </div>
      </div>

      {/* In Transit */}
      <div className="bg-slate-900/80 border border-cyan-500/30 p-3 rounded-xl flex flex-col justify-between backdrop-blur-sm bg-cyan-950/20 shadow-[0_0_12px_rgba(0,240,255,0.05)]">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono uppercase font-bold text-cyan-400">In Transit</span>
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-cyan-300 flex items-center gap-1.5">
          <span>{stats.packetsInTransit}</span>
          {stats.packetsInTransit > 0 && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          )}
        </div>
      </div>

      {/* Delivered */}
      <div className="bg-slate-900/80 border border-emerald-500/30 p-3 rounded-xl flex flex-col justify-between backdrop-blur-sm bg-emerald-950/20">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono uppercase font-bold text-emerald-400">Delivered</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-emerald-300">
          {stats.packetsDelivered}
        </div>
      </div>

      {/* Lost */}
      <div className="bg-slate-900/80 border border-red-500/30 p-3 rounded-xl flex flex-col justify-between backdrop-blur-sm bg-red-950/20">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono uppercase font-bold text-red-400">Lost</span>
          <XCircle className="w-4 h-4 text-red-400" />
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-red-300 flex items-center justify-between">
          <span>{stats.packetsLost}</span>
          {lossRate > 0 && (
            <span className="text-[10px] font-normal px-1 bg-red-950 text-red-300 rounded border border-red-800">
              {lossRate}%
            </span>
          )}
        </div>
      </div>

      {/* Retransmitted */}
      <div className="bg-slate-900/80 border border-purple-500/30 p-3 rounded-xl flex flex-col justify-between backdrop-blur-sm bg-purple-950/20">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono uppercase font-bold text-purple-400">Retx</span>
          <RefreshCw className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-purple-300">
          {stats.packetsRetransmitted}
        </div>
      </div>

      {/* Avg Delay */}
      <div className="bg-slate-900/80 border border-amber-500/30 p-3 rounded-xl flex flex-col justify-between backdrop-blur-sm bg-amber-950/20">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono uppercase font-bold text-amber-400">Avg Latency</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-amber-300">
          {stats.averageDelayMs} <span className="text-xs font-normal text-amber-400/70">ms</span>
        </div>
      </div>

      {/* Current Speed */}
      <div className="bg-slate-900/80 border border-indigo-500/30 p-3 rounded-xl flex flex-col justify-between backdrop-blur-sm bg-indigo-950/20">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-mono uppercase font-bold text-indigo-400">Sim Speed</span>
          <Zap className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="mt-2 text-xl font-bold font-mono text-indigo-300">
          {speedMultiplier}×
        </div>
      </div>
    </div>
  );
};
