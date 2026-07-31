import React, { useState } from 'react';
import { Packet, PacketStatus } from '../types';
import {
  Search,
  Clock,
  XCircle,
  Eye,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface PacketTableProps {
  packets: Packet[];
  selectedPacketId: string | null;
  onSelectPacket: (packetId: string) => void;
  onInjectDelay: (packetId: string) => void;
  onForceDrop: (packetId: string) => void;
}

export const PacketTable: React.FC<PacketTableProps> = ({
  packets,
  selectedPacketId,
  onSelectPacket,
  onInjectDelay,
  onForceDrop,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredPackets = packets.filter((p) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'TRANSIT')
      return p.status === 'In Transit' || p.status === 'Sending';
    if (statusFilter === 'DELAYED') return p.status === 'Delayed';
    if (statusFilter === 'LOST') return p.status === 'Lost';
    if (statusFilter === 'RETX') return p.status === 'Retransmitting';
    if (statusFilter === 'DELIVERED')
      return p.status === 'Delivered' || p.status === 'Reassembled';
    return true;
  });

  const getStatusBadge = (status: PacketStatus) => {
    switch (status) {
      case 'Waiting':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            Waiting
          </span>
        );
      case 'In Transit':
      case 'Sending':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50 flex items-center gap-1 w-fit shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            <Zap className="w-3 h-3 text-cyan-400" />
            In Transit
          </span>
        );
      case 'Delayed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/50 flex items-center gap-1 w-fit shadow-[0_0_8px_rgba(245,158,11,0.2)]">
            <Clock className="w-3 h-3 text-amber-400 animate-spin" />
            Delayed
          </span>
        );
      case 'Lost':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-500/50 flex items-center gap-1 w-fit shadow-[0_0_8px_rgba(239,68,68,0.2)]">
            <XCircle className="w-3 h-3 text-red-400" />
            Lost
          </span>
        );
      case 'Retransmitting':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/50 flex items-center gap-1 w-fit shadow-[0_0_8px_rgba(168,85,247,0.2)]">
            <RefreshCw className="w-3 h-3 text-purple-400 animate-spin" />
            Retransmitting
          </span>
        );
      case 'Delivered':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Delivered
          </span>
        );
      case 'Reassembled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-900 text-emerald-200 border border-emerald-400 flex items-center gap-1 w-fit shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            Reassembled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col gap-3">
      {/* Table Header & Status Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
          <Search className="w-4 h-4 text-cyan-400" />
          <span>LIVE PACKET TELEMETRY LOG</span>
          <span className="text-slate-500">({filteredPackets.length} Packets)</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 font-mono text-xs bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'TRANSIT', label: 'Transit' },
            { id: 'DELAYED', label: 'Delayed' },
            { id: 'LOST', label: 'Lost' },
            { id: 'RETX', label: 'Retx' },
            { id: 'DELIVERED', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto w-full max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60 sticky top-0 z-10">
              <th className="py-2.5 px-3">Packet #</th>
              <th className="py-2.5 px-3">Payload Chunk</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Accumulated Delay</th>
              <th className="py-2.5 px-3">Attempt #</th>
              <th className="py-2.5 px-3">Arrival Order</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredPackets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  No packets match filter.
                </td>
              </tr>
            ) : (
              filteredPackets.map((pkt) => {
                const isSelected = pkt.id === selectedPacketId;
                return (
                  <tr
                    key={pkt.id}
                    onClick={() => onSelectPacket(pkt.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/60 border-l-4 border-cyan-400 text-white'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-cyan-300">
                      {pkt.displayId}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      "{pkt.payloadChunk}"
                    </td>
                    <td className="py-2.5 px-3">{getStatusBadge(pkt.status)}</td>
                    <td className="py-2.5 px-3 text-amber-300 font-semibold">
                      {pkt.accumulatedDelayMs > 0 ? `${pkt.accumulatedDelayMs} ms` : '0 ms'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      #{pkt.attempt}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {pkt.arrivalOrder ? `Order #${pkt.arrivalOrder}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Inject Delay Button */}
                        {(pkt.status === 'In Transit' || pkt.status === 'Sending') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onInjectDelay(pkt.id);
                            }}
                            className="px-2 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-600/50 text-amber-300 rounded text-[10px] font-semibold flex items-center gap-1 transition"
                            title="Inject Latency Delay (+250ms)"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Delay</span>
                          </button>
                        )}

                        {/* Force Drop Button */}
                        {pkt.status !== 'Delivered' &&
                          pkt.status !== 'Reassembled' &&
                          pkt.status !== 'Lost' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onForceDrop(pkt.id);
                              }}
                              className="px-2 py-1 bg-red-950 hover:bg-red-900 border border-red-600/50 text-red-300 rounded text-[10px] font-semibold flex items-center gap-1 transition"
                              title="Induce Packet Drop"
                            >
                              <XCircle className="w-3 h-3 text-red-400" />
                              <span>Drop</span>
                            </button>
                          )}

                        {/* Inspect Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPacket(pkt.id);
                          }}
                          className="px-2 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded text-[10px] font-semibold flex items-center gap-1 transition"
                          title="Inspect Packet Details"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
