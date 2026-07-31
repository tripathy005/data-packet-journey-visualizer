import React from 'react';
import { X, HelpCircle, Layers, Clock, AlertTriangle, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

interface EducationalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalGuideModal: React.FC<EducationalGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden font-mono text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider">
              EDUCATIONAL GUIDE: HOW DATA PACKETS TRAVEL
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

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs leading-relaxed">
          {/* Section 1: Data Chunking */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Layers className="w-4 h-4" />
              <span>1. Data Segmentation & Packet Headers</span>
            </div>
            <p className="text-slate-300">
              Large data (images, HTML, video streams) cannot be sent in a single piece over the internet. Instead, the sender breaks the data down into small manageable chunks called <strong className="text-cyan-300">Packets</strong>. Each packet contains payload data plus header metadata (Source IP, Destination IP, Sequence #).
            </p>
          </div>

          {/* Section 2: Latency */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>2. Network Latency & Path Jitter</span>
            </div>
            <p className="text-slate-300">
              Packets travel through multiple intermediate <strong className="text-amber-300">Routers & Switches</strong>. Different packets might take different physical paths (e.g., high-speed fiber vs satellite link). Router buffer congestion causes variable delays (<strong className="text-amber-300">Latency / Jitter</strong>), making packets slow down temporarily during travel.
            </p>
          </div>

          {/* Section 3: Packet Loss & Retransmission */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>3. Packet Loss & TCP Retransmission (ARQ)</span>
            </div>
            <p className="text-slate-300">
              Router queue overflows, hardware noise, or link degradation can cause a packet to be lost in transit. Under <strong className="text-indigo-300">TCP (Transmission Control Protocol)</strong>, the sender expects an Acknowledgement (ACK) receipt. When an ACK times out, the sender automatically triggers <strong className="text-purple-300">Retransmission</strong> to resend the missing packet.
            </p>
          </div>

          {/* Section 4: Out-of-Order & Reassembly */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>4. Out-of-Order Delivery & Packet Reassembly</span>
            </div>
            <p className="text-slate-300">
              Because packets experience variable delays and take multi-path routes, they frequently arrive out-of-order at the receiver (e.g., arrival sequence <strong className="text-amber-300">03 → 01 → 05 → 02 → 04</strong>). The receiver holds packets in a buffer slot array and uses sequence numbers to <strong className="text-emerald-300">Reassemble</strong> them back into the exact original message!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
          >
            Got It! Return to Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
