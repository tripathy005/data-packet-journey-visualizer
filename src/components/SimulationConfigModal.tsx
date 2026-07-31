import React, { useState } from 'react';
import { SimulationConfig, TopologyType, ProtocolMode } from '../types';
import { X, Sliders, Layers, Network, Zap, Shield, RotateCcw } from 'lucide-react';

interface SimulationConfigModalProps {
  config: SimulationConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (newConfig: SimulationConfig) => void;
}

export const SimulationConfigModal: React.FC<SimulationConfigModalProps> = ({
  config,
  isOpen,
  onClose,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = useState<SimulationConfig>(config);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.2)] overflow-hidden font-mono text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
              SCENARIO & PARAMETER BUILDER
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Custom Payload String */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Payload Message Text
            </label>
            <input
              type="text"
              value={localConfig.payloadText}
              onChange={(e) => setLocalConfig({ ...localConfig, payloadText: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 outline-none transition"
              placeholder="e.g. CYBER-PACKET-NET-2026"
            />
            <p className="text-[10px] text-slate-500">
              This text will be split evenly across the total packet count and reassembled at destination.
            </p>
          </div>

          {/* Packet Count Slider */}
          <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Total Packets:</span>
              <span className="font-bold text-cyan-400 text-sm">{localConfig.packetCount} Packets</span>
            </div>
            <input
              type="range"
              min={5}
              max={20}
              step={1}
              value={localConfig.packetCount}
              onChange={(e) => setLocalConfig({ ...localConfig, packetCount: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Packet Loss Probability Slider */}
          <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Packet Loss Rate:</span>
              <span className="font-bold text-red-400 text-sm">{localConfig.lossProbabilityPercent}% Probability</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={localConfig.lossProbabilityPercent}
              onChange={(e) => setLocalConfig({ ...localConfig, lossProbabilityPercent: Number(e.target.value) })}
              className="w-full accent-red-400 cursor-pointer"
            />
          </div>

          {/* Latency Range Sliders */}
          <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Max Random Latency Delay:</span>
              <span className="font-bold text-amber-400 text-sm">{localConfig.maxDelayMs} ms</span>
            </div>
            <input
              type="range"
              min={100}
              max={800}
              step={50}
              value={localConfig.maxDelayMs}
              onChange={(e) => setLocalConfig({ ...localConfig, maxDelayMs: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Topology Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" /> Network Topology Layout
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'mesh', label: 'Multi-Path Mesh' },
                { id: 'linear', label: 'Linear Highway' },
                { id: 'star', label: 'Star Core Grid' },
              ].map((topo) => (
                <button
                  key={topo.id}
                  type="button"
                  onClick={() => setLocalConfig({ ...localConfig, topology: topo.id as TopologyType })}
                  className={`p-2 rounded-xl border text-center font-bold transition ${
                    localConfig.topology === topo.id
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {topo.label}
                </button>
              ))}
            </div>
          </div>

          {/* Protocol Selector (TCP vs UDP) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Protocol Mode
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setLocalConfig({ ...localConfig, protocol: 'TCP' })}
                className={`p-2.5 rounded-xl border text-left font-bold transition ${
                  localConfig.protocol === 'TCP'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-sm">TCP (Transmission Control)</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Reliable, Selective Retransmission, In-Order Reassembly
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLocalConfig({ ...localConfig, protocol: 'UDP' })}
                className={`p-2.5 rounded-xl border text-left font-bold transition ${
                  localConfig.protocol === 'UDP'
                    ? 'bg-purple-950 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-sm">UDP (User Datagram)</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                  Fast, No Retransmissions, Lost Packets Are Permanently Dropped
                </div>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">QUICK PRESETS</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  setLocalConfig({
                    ...localConfig,
                    lossProbabilityPercent: 0,
                    maxDelayMs: 150,
                    packetCount: 8,
                    topology: 'mesh',
                  })
                }
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-[11px]"
              >
                ⚡ High-Speed Zero Loss
              </button>
              <button
                type="button"
                onClick={() =>
                  setLocalConfig({
                    ...localConfig,
                    lossProbabilityPercent: 35,
                    maxDelayMs: 600,
                    packetCount: 12,
                    topology: 'mesh',
                  })
                }
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-[11px]"
              >
                ⚠️ Congested Lossy Network
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition"
            >
              Apply Scenario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
