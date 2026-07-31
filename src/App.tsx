import React, { useState } from 'react';
import { useSimulationEngine } from './simulation/useSimulationEngine';
import { Navbar } from './components/Navbar';
import { PacketStats } from './components/PacketStats';
import { NetworkVisualizer } from './components/NetworkVisualizer';
import { ControlPanel } from './components/ControlPanel';
import { ReassemblyArea } from './components/ReassemblyArea';
import { PacketTable } from './components/PacketTable';
import { PacketInspectorModal } from './components/PacketInspectorModal';
import { SimulationConfigModal } from './components/SimulationConfigModal';
import { EducationalGuideModal } from './components/EducationalGuideModal';
import { cyberAudio } from './utils/audio';

export default function App() {
  const {
    config,
    setConfig,
    topology,
    packets,
    stats,
    isPlaying,
    selectedPacketId,
    setSelectedPacketId,
    togglePlay,
    restart,
    setSpeed,
    changeTopology,
    stepSimulation,
    triggerSendPacket,
    injectDelayToPacket,
    forceDropPacket,
  } = useSimulationEngine();

  const [isMuted, setIsMuted] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    cyberAudio.setMuted(nextMuted);
  };

  const selectedPacket = packets.find((p) => p.id === selectedPacketId) || null;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        topology={config.topology}
        protocol={config.protocol}
        onTopologyChange={changeTopology}
        onProtocolChange={(proto) => setConfig((prev) => ({ ...prev, protocol: proto }))}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-5">
        {/* Real-time Live Metrics Dashboard */}
        <PacketStats stats={stats} speedMultiplier={config.speedMultiplier} />

        {/* Network Topology Visualizer Canvas */}
        <NetworkVisualizer
          nodes={topology.nodes}
          edges={topology.edges}
          packets={packets}
          selectedPacketId={selectedPacketId}
          onSelectPacket={setSelectedPacketId}
          onInjectDelay={injectDelayToPacket}
          onForceDrop={forceDropPacket}
        />

        {/* Interactive Control Panel */}
        <ControlPanel
          isPlaying={isPlaying}
          speedMultiplier={config.speedMultiplier}
          onTogglePlay={togglePlay}
          onRestart={restart}
          onStep={stepSimulation}
          onSetSpeed={setSpeed}
          onSendPacket={triggerSendPacket}
        />

        {/* Receiver Packet Reassembly Engine */}
        <ReassemblyArea packets={packets} stats={stats} />

        {/* Live Packet Telemetry Table */}
        <PacketTable
          packets={packets}
          selectedPacketId={selectedPacketId}
          onSelectPacket={setSelectedPacketId}
          onInjectDelay={injectDelayToPacket}
          onForceDrop={forceDropPacket}
        />
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-800 py-4 text-center font-mono text-xs text-slate-500">
        Data Packet Journey Visualizer &copy; {new Date().getFullYear()} &bull; Interactive Cyber Network Protocol Simulator
      </footer>

      {/* Modals & Drawers */}
      <PacketInspectorModal
        packet={selectedPacket}
        onClose={() => setSelectedPacketId(null)}
        onInjectDelay={injectDelayToPacket}
        onForceDrop={forceDropPacket}
      />

      <SimulationConfigModal
        config={config}
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaveConfig={(newCfg) => setConfig(newCfg)}
      />

      <EducationalGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
