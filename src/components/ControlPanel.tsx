import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Send,
  FastForward,
  Gauge,
} from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  speedMultiplier: number;
  onTogglePlay: () => void;
  onRestart: () => void;
  onStep: () => void;
  onSetSpeed: (speed: number) => void;
  onSendPacket: () => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2, 4];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isPlaying,
  speedMultiplier,
  onTogglePlay,
  onRestart,
  onStep,
  onSetSpeed,
  onSendPacket,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-cyan-500/20 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.4)] flex flex-wrap items-center justify-between gap-4">
      {/* Primary Simulation Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Play / Pause Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition shadow-lg ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>PLAY SIMULATION</span>
            </>
          )}
        </button>

        {/* Restart Button */}
        <button
          type="button"
          onClick={onRestart}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-slate-200 rounded-xl font-mono text-xs font-semibold transition"
          title="Reset packets and counters"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">RESTART</span>
        </button>

        {/* Step Mode (Single Step Advance) */}
        <button
          type="button"
          onClick={onStep}
          disabled={isPlaying}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl font-mono text-xs font-semibold transition ${
            isPlaying
              ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-300 hover:bg-indigo-900/90 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
          }`}
          title="Advance simulation by 1 step (Pause first)"
        >
          <StepForward className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">STEP MODE</span>
        </button>

        {/* Send Single Packet Button */}
        <button
          type="button"
          onClick={onSendPacket}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/90 rounded-xl font-mono text-xs font-semibold transition shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          title="Manually transmit next packet"
        >
          <Send className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">SEND PACKET</span>
        </button>
      </div>

      {/* Speed Controller */}
      <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1 text-slate-400 px-2 font-mono text-xs">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline font-semibold">SPEED:</span>
        </div>
        <div className="flex items-center gap-1">
          {SPEED_OPTIONS.map((speed) => {
            const isActive = speedMultiplier === speed;
            return (
              <button
                key={speed}
                type="button"
                onClick={() => onSetSpeed(speed)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {speed}×
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
