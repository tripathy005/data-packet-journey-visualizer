export type PacketStatus =
  | 'Waiting'
  | 'Sending'
  | 'In Transit'
  | 'Delayed'
  | 'Lost'
  | 'Retransmitting'
  | 'Delivered'
  | 'Reassembled';

export type ProtocolMode = 'TCP' | 'UDP';

export type TopologyType = 'mesh' | 'linear' | 'star';

export interface NetworkNode {
  id: string;
  name: string;
  type: 'sender' | 'router' | 'receiver';
  ip: string;
  x: number; // percentage 0-100 or canvas coordinate
  y: number; // percentage 0-100
  status: 'active' | 'busy' | 'congested' | 'idle';
  iconType: 'workstation' | 'router' | 'firewall' | 'server';
  details?: string;
}

export interface NetworkEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  baseLatencyMs: number;
  bandwidthMbps: number;
  label?: string;
}

export interface PacketHopLog {
  nodeId: string;
  timestamp: number;
  action: 'arrived' | 'departed' | 'delayed' | 'dropped';
  delayMs?: number;
}

export interface Packet {
  id: string; // e.g. "pkt-01"
  seqNumber: number; // 1, 2, 3...
  displayId: string; // "Packet 01"
  payloadChunk: string; // e.g. "HEL"
  status: PacketStatus;
  
  // Routing & Position
  pathNodeIds: string[]; // e.g. ["sender", "r1", "r3", "receiver"]
  currentHopIndex: number; // index in pathNodeIds
  progressOnCurrentEdge: number; // 0.0 to 1.0 between pathNodeIds[i] and pathNodeIds[i+1]
  
  // Timing & Delay
  currentEdgeDelayMs: number;
  accumulatedDelayMs: number;
  isDelayed: boolean;
  delayTimerMs: number; // remaining delay hold time
  
  // Attempt & Loss
  attempt: number; // 1 for first transmission, 2+ for retransmission
  isLost: boolean;
  lostAtNodeId?: string;
  
  // Arrival & Reassembly
  arrivalOrder?: number;
  deliveredTimeMs?: number;
  
  // Logs
  history: PacketHopLog[];
}

export interface SimulationConfig {
  packetCount: number;
  payloadText: string;
  lossProbabilityPercent: number; // 0 - 50%
  minDelayMs: number;
  maxDelayMs: number;
  speedMultiplier: number; // 0.25, 0.5, 1, 1.5, 2, 4
  protocol: ProtocolMode; // TCP vs UDP
  topology: TopologyType;
  autoRetransmitTimeoutMs: number;
}

export interface SimulationStats {
  totalPackets: number;
  packetsSent: number;
  packetsInTransit: number;
  packetsDelivered: number;
  packetsLost: number;
  packetsRetransmitted: number;
  packetsReassembled: number;
  averageDelayMs: number;
  simulationTimeMs: number;
  isReassembled: boolean;
  assembledPayload: string;
}
