import React from 'react';
import { Packet, SimulationStats } from '../types';
import { CheckCircle, ShieldCheck, Cpu, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReassemblyAreaProps {
  packets: Packet[];
  stats: SimulationStats;
}

export const ReassemblyArea: React.FC<ReassemblyAreaProps> = ({
  packets,
  stats,
}) => {
  // Delivered or Reassembled packets
  const receiverBuffer = packets.filter(
    (p) => p.status === 'Delivered' || p.status === 'Reassembled'
  );

  // Sorted by arrival order to demonstrate out-of-order delivery
  const arrivalOrderList = [...receiverBuffer].sort(
    (a, b) => (a.arrivalOrder || 0) - (b.arrivalOrder || 0)
  );

  // Sorted by sequence number (01 -> 02 -> 03...) for reassembled state
  const seqOrderList = [...receiverBuffer].sort((a, b) => a.seqNumber - b.seqNumber);

  const totalRequired = packets.length;
  const isComplete = stats.isReassembled;

  return (
    <div className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.06)] relative overflow-hidden">
      {/* Background Neon Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              PACKET REASSEMBLY ENGINE
              {isComplete && (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded-full font-sans font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Receiver Buffer & Protocol Sequence Reordering Slot Matrix
            </p>
          </div>
        </div>

        {/* Progress Counter */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Buffer Slots:</span>
          <span className="font-bold text-cyan-400 text-sm">
            {receiverBuffer.length} / {totalRequired}
          </span>
          <div className="w-24 h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isComplete ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-cyan-400'
              }`}
              style={{
                width: `${(receiverBuffer.length / Math.max(1, totalRequired)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Reassembly Completion Banner */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4 p-3 bg-gradient-to-r from-emerald-950/90 via-cyan-950/90 to-emerald-950/90 border border-emerald-400/60 rounded-xl flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500 text-slate-950 font-bold">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-emerald-300 tracking-wider">
                  DATA SUCCESSFULLY REASSEMBLED
                </h3>
                <p className="text-xs text-emerald-200/90 font-mono">
                  All {totalRequired} packets reordered & decoded into original message payload!
                </p>
              </div>
            </div>
            <div className="hidden md:block font-mono text-xs text-emerald-400 font-bold bg-slate-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/40">
              Payload: "{stats.assembledPayload}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Arrival Order Stream vs Final Reassembled Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Out-of-Order Arrival Stream */}
        <div className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl">
          <div className="text-xs font-mono text-slate-400 font-semibold mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-300">
              <AlertCircle className="w-3.5 h-3.5" />
              1. Unordered Arrival Buffer Stream
            </span>
            <span className="text-[10px] text-slate-500">(Order as received)</span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[52px] items-center">
            {arrivalOrderList.length === 0 ? (
              <span className="text-xs font-mono text-slate-600 italic">
                Awaiting incoming packet stream at receiver node...
              </span>
            ) : (
              arrivalOrderList.map((pkt) => (
                <div
                  key={`arrival-${pkt.id}`}
                  className="px-2.5 py-1.5 bg-slate-900 border border-amber-500/40 text-amber-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                >
                  <span className="text-[10px] text-amber-400/70">#{pkt.arrivalOrder}</span>
                  <span>{pkt.displayId}</span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-1 rounded border border-amber-800">
                    "{pkt.payloadChunk}"
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Sequence Sorted Reassembly Matrix */}
        <div className="bg-slate-950/80 border border-cyan-500/30 p-3 rounded-xl">
          <div className="text-xs font-mono text-cyan-300 font-semibold mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              2. Reassembled Sequence Array (01 → N)
            </span>
            <span className="text-[10px] text-cyan-400/80 font-bold">
              {isComplete ? 'REORDER COMPLETE' : 'BUFFERING'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[52px] items-center">
            {Array.from({ length: totalRequired }).map((_, i) => {
              const seqNum = i + 1;
              const pkt = seqOrderList.find((p) => p.seqNumber === seqNum);
              const displayLabel = `Packet ${String(seqNum).padStart(2, '0')}`;

              return (
                <div
                  key={`seq-${seqNum}`}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all duration-300 flex items-center gap-1.5 ${
                    pkt
                      ? isComplete
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'bg-slate-950 border-slate-800/80 text-slate-600 border-dashed'
                  }`}
                >
                  <span>{displayLabel}</span>
                  {pkt ? (
                    <span className="text-[10px] bg-slate-900 px-1 rounded text-cyan-300">
                      "{pkt.payloadChunk}"
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-700">EMPTY</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
