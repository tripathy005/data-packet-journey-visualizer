import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Packet,
  SimulationConfig,
  SimulationStats,
  PacketStatus,
  TopologyType,
} from '../types';
import { getTopologyData } from './topologies';
import { cyberAudio } from '../utils/audio';
import confetti from 'canvas-confetti';

const DEFAULT_CONFIG: SimulationConfig = {
  packetCount: 10,
  payloadText: 'CYBER-PACKET-NET-2026',
  lossProbabilityPercent: 15,
  minDelayMs: 100,
  maxDelayMs: 400,
  speedMultiplier: 1,
  protocol: 'TCP',
  topology: 'mesh',
  autoRetransmitTimeoutMs: 3000,
};

export function useSimulationEngine() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [topology, setTopology] = useState(() => getTopologyData(config.topology));
  const [packets, setPackets] = useState<Packet[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stepMode, setStepMode] = useState<boolean>(false);
  const [selectedPacketId, setSelectedPacketId] = useState<string | null>(null);

  const [stats, setStats] = useState<SimulationStats>({
    totalPackets: DEFAULT_CONFIG.packetCount,
    packetsSent: 0,
    packetsInTransit: 0,
    packetsDelivered: 0,
    packetsLost: 0,
    packetsRetransmitted: 0,
    packetsReassembled: 0,
    averageDelayMs: 0,
    simulationTimeMs: 0,
    isReassembled: false,
    assembledPayload: '',
  });

  const arrivalCounterRef = useRef<number>(0);
  const nextSendIndexRef = useRef<number>(0);
  const lastSendTimeRef = useRef<number>(0);
  const tickTimerRef = useRef<number | null>(null);

  // Helper to split payload into chunks
  const preparePacketsFromConfig = useCallback((cfg: SimulationConfig) => {
    const topo = getTopologyData(cfg.topology);
    setTopology(topo);

    const count = cfg.packetCount;
    const text = cfg.payloadText || 'DATA-PACKET-TRANSFER';
    const chunkSize = Math.max(1, Math.ceil(text.length / count));

    const newPackets: Packet[] = [];
    for (let i = 0; i < count; i++) {
      const start = i * chunkSize;
      const end = Math.min(text.length, (i + 1) * chunkSize);
      const chunk = start < text.length ? text.substring(start, end) : `[P${i + 1}]`;

      // Select path
      const pathIndex = i % topo.availablePaths.length;
      const pathNodeIds = topo.availablePaths[pathIndex];

      const pktNumberStr = String(i + 1).padStart(2, '0');

      newPackets.push({
        id: `pkt-${i + 1}`,
        seqNumber: i + 1,
        displayId: `Packet ${pktNumberStr}`,
        payloadChunk: chunk,
        status: 'Waiting',
        pathNodeIds,
        currentHopIndex: 0,
        progressOnCurrentEdge: 0,
        currentEdgeDelayMs: 0,
        accumulatedDelayMs: 0,
        isDelayed: false,
        delayTimerMs: 0,
        attempt: 0,
        isLost: false,
        history: [],
      });
    }

    setPackets(newPackets);
    arrivalCounterRef.current = 0;
    nextSendIndexRef.current = 0;
    lastSendTimeRef.current = 0;

    setStats({
      totalPackets: count,
      packetsSent: 0,
      packetsInTransit: 0,
      packetsDelivered: 0,
      packetsLost: 0,
      packetsRetransmitted: 0,
      packetsReassembled: 0,
      averageDelayMs: 0,
      simulationTimeMs: 0,
      isReassembled: false,
      assembledPayload: '',
    });
  }, []);

  // Initialize on mount or config change
  useEffect(() => {
    preparePacketsFromConfig(config);
  }, [config.packetCount, config.payloadText, config.topology, preparePacketsFromConfig]);

  // Restart simulation completely
  const restart = useCallback(() => {
    setIsPlaying(false);
    preparePacketsFromConfig(config);
  }, [config, preparePacketsFromConfig]);

  // Play / Pause
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const setSpeed = useCallback((multiplier: number) => {
    setConfig((prev) => ({ ...prev, speedMultiplier: multiplier }));
  }, []);

  const changeTopology = useCallback((newTopo: TopologyType) => {
    setIsPlaying(false);
    setConfig((prev) => ({ ...prev, topology: newTopo }));
  }, []);

  // Manual Trigger: Send next waiting packet or retransmit lost
  const triggerSendPacket = useCallback(() => {
    setPackets((prevPackets) => {
      const idx = prevPackets.findIndex(
        (p) => p.status === 'Waiting' || (p.status === 'Lost' && config.protocol === 'TCP')
      );
      if (idx === -1) return prevPackets;

      const updated = [...prevPackets];
      const p = { ...updated[idx] };
      const isRetx = p.status === 'Lost';

      p.status = isRetx ? 'Retransmitting' : 'In Transit';
      p.attempt += 1;
      p.isLost = false;
      p.currentHopIndex = 0;
      p.progressOnCurrentEdge = 0;
      p.history = [
        ...p.history,
        {
          nodeId: p.pathNodeIds[0],
          timestamp: Date.now(),
          action: 'departed',
        },
      ];

      updated[idx] = p;

      if (isRetx) {
        cyberAudio.playRetransmit();
      } else {
        cyberAudio.playSend();
      }

      return updated;
    });
  }, [config.protocol]);

  // Manual Packet Controls
  const injectDelayToPacket = useCallback((packetId: string, delayMs: number = 300) => {
    setPackets((prev) =>
      prev.map((p) => {
        if (p.id === packetId && (p.status === 'In Transit' || p.status === 'Sending')) {
          cyberAudio.playDelay();
          return {
            ...p,
            status: 'Delayed',
            isDelayed: true,
            currentEdgeDelayMs: delayMs,
            delayTimerMs: delayMs,
            accumulatedDelayMs: p.accumulatedDelayMs + delayMs,
          };
        }
        return p;
      })
    );
  }, []);

  const forceDropPacket = useCallback((packetId: string) => {
    setPackets((prev) =>
      prev.map((p) => {
        if (p.id === packetId && p.status !== 'Delivered' && p.status !== 'Reassembled' && p.status !== 'Lost') {
          cyberAudio.playLoss();
          return {
            ...p,
            status: 'Lost',
            isLost: true,
            lostAtNodeId: p.pathNodeIds[p.currentHopIndex] || 'wire',
          };
        }
        return p;
      })
    );
    setStats((prev) => ({ ...prev, packetsLost: prev.packetsLost + 1 }));
  }, []);

  // Main Core Simulation Tick Function
  const stepSimulation = useCallback(() => {
    const TICK_INTERVAL_MS = 50;
    const effectiveDelta = TICK_INTERVAL_MS * config.speedMultiplier;

    setPackets((prevPackets) => {
      let isAnyPacketChanged = false;

      // 1. Check if we should automatically launch next waiting packet
      let packetsToLaunch = 0;
      const waitingIndex = prevPackets.findIndex((p) => p.status === 'Waiting');
      if (waitingIndex !== -1 && isPlaying) {
        const inTransitCount = prevPackets.filter(
          (p) => p.status === 'In Transit' || p.status === 'Delayed' || p.status === 'Retransmitting'
        ).length;

        // Spread out sends
        if (inTransitCount < 4) {
          packetsToLaunch = 1;
        }
      }

      const nextPackets = prevPackets.map((pkt, idx) => {
        let p = { ...pkt };

        // Launch packet if waiting and selected
        if (p.status === 'Waiting' && idx === waitingIndex && packetsToLaunch > 0) {
          p.status = 'In Transit';
          p.attempt = 1;
          p.currentHopIndex = 0;
          p.progressOnCurrentEdge = 0;
          p.history = [
            { nodeId: p.pathNodeIds[0], timestamp: Date.now(), action: 'departed' },
          ];
          cyberAudio.playSend();
          isAnyPacketChanged = true;
          return p;
        }

        // Handle Delayed state hold timer
        if (p.status === 'Delayed') {
          p.delayTimerMs -= effectiveDelta;
          if (p.delayTimerMs <= 0) {
            p.status = 'In Transit';
            p.isDelayed = false;
            p.delayTimerMs = 0;
          }
          isAnyPacketChanged = true;
          return p;
        }

        // Handle Retransmission timeout for lost packets in TCP mode
        if (p.status === 'Lost' && config.protocol === 'TCP') {
          // Check if auto-retransmit timer passed
          p.delayTimerMs = (p.delayTimerMs || 0) + effectiveDelta;
          if (p.delayTimerMs > config.autoRetransmitTimeoutMs / config.speedMultiplier) {
            // Retransmit
            p.status = 'Retransmitting';
            p.attempt += 1;
            p.isLost = false;
            p.currentHopIndex = 0;
            p.progressOnCurrentEdge = 0;
            p.delayTimerMs = 0;
            p.history = [
              ...p.history,
              { nodeId: p.pathNodeIds[0], timestamp: Date.now(), action: 'departed' },
            ];
            cyberAudio.playRetransmit();
            isAnyPacketChanged = true;
          }
          return p;
        }

        // Handle Active Moving Packets (In Transit / Retransmitting)
        if (p.status === 'In Transit' || p.status === 'Retransmitting') {
          isAnyPacketChanged = true;

          // Edge movement speed
          const SPEED_STEP = 0.03 * config.speedMultiplier;
          p.progressOnCurrentEdge += SPEED_STEP;

          // Check mid-wire event (Random Delay or Loss trigger at 40%-60% progress)
          if (p.progressOnCurrentEdge >= 0.4 && p.progressOnCurrentEdge <= 0.6 && !p.isDelayed) {
            // 1. Loss check
            const rollLoss = Math.random() * 100;
            if (rollLoss < config.lossProbabilityPercent / 10) { // Normalized check
              p.status = 'Lost';
              p.isLost = true;
              p.lostAtNodeId = p.pathNodeIds[p.currentHopIndex];
              p.delayTimerMs = 0; // reset for retx timer
              cyberAudio.playLoss();
              return p;
            }

            // 2. Latency Delay check
            const rollDelay = Math.random() * 100;
            if (rollDelay < 20) { // 20% chance of latency burst
              const randomDelay = Math.floor(
                config.minDelayMs + Math.random() * (config.maxDelayMs - config.minDelayMs)
              );
              p.status = 'Delayed';
              p.isDelayed = true;
              p.currentEdgeDelayMs = randomDelay;
              p.delayTimerMs = randomDelay;
              p.accumulatedDelayMs += randomDelay;
              cyberAudio.playDelay();
              return p;
            }
          }

          // Check if reached next hop/node
          if (p.progressOnCurrentEdge >= 1.0) {
            p.progressOnCurrentEdge = 0;
            p.currentHopIndex += 1;

            // Arrived at destination node
            if (p.currentHopIndex >= p.pathNodeIds.length - 1) {
              p.status = 'Delivered';
              p.progressOnCurrentEdge = 1.0; // lock at end
              arrivalCounterRef.current += 1;
              p.arrivalOrder = arrivalCounterRef.current;
              p.deliveredTimeMs = Date.now();
              p.history = [
                ...p.history,
                { nodeId: p.pathNodeIds[p.pathNodeIds.length - 1], timestamp: Date.now(), action: 'arrived' },
              ];
              cyberAudio.playDelivered();
            } else {
              // Reached intermediate router node
              p.history = [
                ...p.history,
                { nodeId: p.pathNodeIds[p.currentHopIndex], timestamp: Date.now(), action: 'arrived' },
              ];
            }
          }

          return p;
        }

        return p;
      });

      // 2. Check Reassembly status
      const deliveredPackets = nextPackets.filter(
        (p) => p.status === 'Delivered' || p.status === 'Reassembled'
      );

      // If all packets delivered and not yet reassembled, trigger Reassembly!
      if (deliveredPackets.length === prevPackets.length && prevPackets.length > 0) {
        const anyNotReassembled = nextPackets.some((p) => p.status === 'Delivered');

        if (anyNotReassembled) {
          // Reassemble in sequence order
          const sorted = [...nextPackets].sort((a, b) => a.seqNumber - b.seqNumber);
          const fullPayload = sorted.map((p) => p.payloadChunk).join('');

          cyberAudio.playReassembled();
          try {
            confetti({
              particleCount: 60,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#00f0ff', '#10b981', '#a855f7'],
            });
          } catch {}

          setStats((st) => ({
            ...st,
            isReassembled: true,
            assembledPayload: fullPayload,
          }));

          return nextPackets.map((p) => ({ ...p, status: 'Reassembled' as PacketStatus }));
        }
      }

      return isAnyPacketChanged ? nextPackets : prevPackets;
    });

    // Update Live Simulation Stats
    setPackets((currentPkts) => {
      const sent = currentPkts.filter((p) => p.status !== 'Waiting').length;
      const transit = currentPkts.filter(
        (p) => p.status === 'In Transit' || p.status === 'Delayed' || p.status === 'Retransmitting'
      ).length;
      const delivered = currentPkts.filter(
        (p) => p.status === 'Delivered' || p.status === 'Reassembled'
      ).length;
      const lost = currentPkts.filter((p) => p.status === 'Lost').length;
      const retx = currentPkts.reduce((sum, p) => sum + Math.max(0, p.attempt - 1), 0);

      const totalDelay = currentPkts.reduce((sum, p) => sum + p.accumulatedDelayMs, 0);
      const avgDelay = sent > 0 ? Math.round(totalDelay / sent) : 0;

      setStats((prevSt) => ({
        ...prevSt,
        packetsSent: sent,
        packetsInTransit: transit,
        packetsDelivered: delivered,
        packetsLost: lost,
        packetsRetransmitted: retx,
        averageDelayMs: avgDelay,
      }));

      return currentPkts;
    });
  }, [config, isPlaying]);

  // Loop timer effect
  useEffect(() => {
    if (!isPlaying) {
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
      return;
    }

    tickTimerRef.current = window.setInterval(() => {
      stepSimulation();
    }, 50);

    return () => {
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    };
  }, [isPlaying, stepSimulation]);

  return {
    config,
    setConfig,
    topology,
    packets,
    stats,
    isPlaying,
    stepMode,
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
  };
}
