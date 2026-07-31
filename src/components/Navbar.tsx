import React from 'react';
import {
  Activity,
  Volume2,
  VolumeX,
  HelpCircle,
  Settings,
  Share2,
  Cpu,
  Layers,
  Network,
} from 'lucide-react';
import { TopologyType, ProtocolMode } from '../types';
import { cyberAudio } from '../utils/audio';

interface NavbarProps {
  topology: TopologyType;
  protocol: ProtocolMode;
  onTopologyChange: (topo: TopologyType) => void;
  onProtocolChange: (proto: ProtocolMode) => void;
  onOpenConfig: () => void;
  onOpenGuide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  topology,
  protocol,
  onTopologyChange,
  onProtocolChange,
  onOpenConfig,
  onOpenGuide,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="w-full bg-slate-950/90 border-b border-cyan-500/20 backdrop-blur-md px-4 py-3 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 uppercase font-mono">
              DATA PACKET JOURNEY
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Interactive Network Packet Routing Simulator
            </p>
          </div>
        </div>

        {/* Topo / Protocol Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Topology Selector */}
          <div className="flex items-center bg-slate-900/80 border border-slate-700/60 rounded-lg p-1 text-xs">
            <Network className="w-3.5 h-3.5 text-cyan-400 ml-2 mr-1" />
            <span className="text-slate-400 mr-2 font-mono hidden sm:inline">TOPOLOGY:</span>
            <select
              value={topology}
              onChange={(e) => onTopologyChange(e.target.value as TopologyType)}
              className="bg-slate-950 text-cyan-300 font-mono text-xs font-semibold px-2 py-1 rounded outline-none cursor-pointer border border-cyan-500/30 hover:border-cyan-400 transition"
            >
              <option value="mesh">Multi-Path Mesh (Dynamic)</option>
              <option value="linear">Linear Highway (Multi-Hop)</option>
              <option value="star">Star Core Grid</option>
            </select>
          </div>

          {/* Protocol Toggle (TCP vs UDP) */}
          <div className="flex items-center bg-slate-900/80 border border-slate-700/60 rounded-lg p-1 text-xs">
            <Layers className="w-3.5 h-3.5 text-indigo-400 ml-2 mr-1" />
            <span className="text-slate-400 mr-1 font-mono hidden sm:inline">PROTOCOL:</span>
            <div className="flex bg-slate-950 rounded p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => onProtocolChange('TCP')}
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition ${
                  protocol === 'TCP'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="TCP: Reliable, Retransmission, Reassembly"
              >
                TCP
              </button>
              <button
                type="button"
                onClick={() => onProtocolChange('UDP')}
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition ${
                  protocol === 'UDP'
                    ? 'bg-purple-500 text-slate-950 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="UDP: Fast, Unreliable (No Retransmission)"
              >
                UDP
              </button>
            </div>
          </div>

          {/* Mute Button */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-cyan-950/50 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/60 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Custom Config Button */}
          <button
            type="button"
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-mono font-semibold rounded-lg transition"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scenario</span>
          </button>

          {/* Educational Guide Modal Trigger */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-semibold rounded-lg transition shadow-[0_0_10px_rgba(99,102,241,0.2)]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
