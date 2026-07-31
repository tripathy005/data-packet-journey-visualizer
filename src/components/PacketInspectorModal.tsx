import React from 'react';
import { Packet } from '../types';
import { X, Shield, Clock, RefreshCw, Cpu, Layers, ArrowRight } from 'lucide-react';

interface PacketInspectorModalProps {
  packet: Packet | null;
  onClose: () => void;
  onInjectDelay: (packetId: string) => void;
  onForceDrop: (packetId: string) => void;
}

export const PacketInspectorModal: React.FC<PacketInspectorModalProps> = ({
  packet,
  onClose,
  onInjectDelay,
  onForceDrop,
}) => {
  if (!packet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.2)] overflow-hidden font-mono text-slate-200">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
              {packet.displayId} TELEMETRY INSPECTOR
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Header Specs Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">SEQUENCE #</span>
              <span className="text-cyan-400 font-bold text-sm">#{packet.seqNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">STATUS</span>
              <span className="text-emerald-400 font-bold">{packet.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ATTEMPT COUNT</span>
              <span className="text-purple-300 font-bold">Attempt #{packet.attempt}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ACCUMULATED LATENCY</span>
              <span className="text-amber-300 font-bold">{packet.accumulatedDelayMs} ms</span>
            </div>
          </div>

          {/* Payload Data Chunk */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>PACKET PAYLOAD DATA CHUNK</span>
            </div>
            <div className="text-sm font-bold text-emerald-300 bg-slate-900 p-2 rounded border border-emerald-500/30">
              "{packet.payloadChunk}"
            </div>
          </div>

          {/* Route Path Hops */}
          <div className="space-y-2">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>ASSIGNED NETWORK ROUTE HOPS</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              {packet.pathNodeIds.map((nodeId, i) => (
                <React.Fragment key={nodeId}>
                  <span
                    className={`px-2 py-1 rounded border text-xs font-bold ${
                      i === packet.currentHopIndex
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {nodeId}
                  </span>
                  {i < packet.pathNodeIds.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Hop History Log */}
          <div className="space-y-2">
            <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>EVENT TIMELINE HISTORY</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs max-h-36 overflow-y-auto">
              {packet.history.length === 0 ? (
                <div className="text-slate-600 italic">No hop events logged yet.</div>
              ) : (
                packet.history.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-400 font-bold">{log.nodeId}</span>
                    <span className="text-cyan-400 uppercase text-[10px] font-bold">{log.action}</span>
                    <span className="text-slate-600 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(packet.status === 'In Transit' || packet.status === 'Sending') && (
              <>
                <button
                  type="button"
                  onClick={() => onInjectDelay(packet.id)}
                  className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-600/50 text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Inject Delay (+250ms)</span>
                </button>
                <button
                  type="button"
                  onClick={() => onForceDrop(packet.id)}
                  className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-600/50 text-red-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Force Drop</span>
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
