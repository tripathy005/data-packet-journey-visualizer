import { NetworkNode, NetworkEdge, TopologyType } from '../types';

export interface TopologyData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  availablePaths: string[][]; // Paths from sender to receiver e.g. [ ['sender', 'r1', 'r3', 'receiver'], ['sender', 'r2', 'r3', 'receiver'] ]
}

export function getTopologyData(type: TopologyType): TopologyData {
  switch (type) {
    case 'mesh':
      return {
        nodes: [
          {
            id: 'sender',
            name: 'Sender Host',
            type: 'sender',
            ip: '192.168.1.100',
            x: 10,
            y: 50,
            status: 'active',
            iconType: 'workstation',
            details: 'Client Source Machine',
          },
          {
            id: 'r1',
            name: 'Router Alpha (North)',
            type: 'router',
            ip: '10.0.1.1',
            x: 35,
            y: 22,
            status: 'active',
            iconType: 'router',
            details: 'High-speed Fiber Link',
          },
          {
            id: 'r2',
            name: 'Router Beta (South)',
            type: 'router',
            ip: '10.0.2.1',
            x: 35,
            y: 78,
            status: 'active',
            iconType: 'router',
            details: 'Satellite Transit Path',
          },
          {
            id: 'r3',
            name: 'Core Gateway',
            type: 'router',
            ip: '10.0.3.254',
            x: 65,
            y: 50,
            status: 'active',
            iconType: 'firewall',
            details: 'Packet Filter & Buffer',
          },
          {
            id: 'receiver',
            name: 'Receiver Server',
            type: 'receiver',
            ip: '172.16.0.50',
            x: 90,
            y: 50,
            status: 'active',
            iconType: 'server',
            details: 'Destination Reassembly Engine',
          },
        ],
        edges: [
          { id: 'e-s-r1', fromNodeId: 'sender', toNodeId: 'r1', baseLatencyMs: 15, bandwidthMbps: 1000, label: 'Fast Fiber' },
          { id: 'e-s-r2', fromNodeId: 'sender', toNodeId: 'r2', baseLatencyMs: 45, bandwidthMbps: 500, label: 'Secondary Satellite' },
          { id: 'e-r1-r3', fromNodeId: 'r1', toNodeId: 'r3', baseLatencyMs: 20, bandwidthMbps: 1000 },
          { id: 'e-r2-r3', fromNodeId: 'r2', toNodeId: 'r3', baseLatencyMs: 60, bandwidthMbps: 500 },
          { id: 'e-r3-rec', fromNodeId: 'r3', toNodeId: 'receiver', baseLatencyMs: 10, bandwidthMbps: 2000, label: 'Local LAN' },
        ],
        availablePaths: [
          ['sender', 'r1', 'r3', 'receiver'],
          ['sender', 'r2', 'r3', 'receiver'],
        ],
      };

    case 'star':
      return {
        nodes: [
          {
            id: 'sender',
            name: 'Sender Host',
            type: 'sender',
            ip: '192.168.1.100',
            x: 10,
            y: 50,
            status: 'active',
            iconType: 'workstation',
          },
          {
            id: 'r-switch',
            name: 'Central Core Switch',
            type: 'router',
            ip: '10.10.0.1',
            x: 45,
            y: 50,
            status: 'active',
            iconType: 'router',
            details: 'Multi-port Switch Matrix',
          },
          {
            id: 'r-fw',
            name: 'Edge Firewall',
            type: 'router',
            ip: '10.10.0.2',
            x: 70,
            y: 50,
            status: 'active',
            iconType: 'firewall',
          },
          {
            id: 'receiver',
            name: 'Receiver Server',
            type: 'receiver',
            ip: '172.16.0.50',
            x: 90,
            y: 50,
            status: 'active',
            iconType: 'server',
          },
        ],
        edges: [
          { id: 'e-s-sw', fromNodeId: 'sender', toNodeId: 'r-switch', baseLatencyMs: 20, bandwidthMbps: 1000 },
          { id: 'e-sw-fw', fromNodeId: 'r-switch', toNodeId: 'r-fw', baseLatencyMs: 25, bandwidthMbps: 1000 },
          { id: 'e-fw-rec', fromNodeId: 'r-fw', toNodeId: 'receiver', baseLatencyMs: 15, bandwidthMbps: 1000 },
        ],
        availablePaths: [
          ['sender', 'r-switch', 'r-fw', 'receiver'],
        ],
      };

    case 'linear':
    default:
      return {
        nodes: [
          {
            id: 'sender',
            name: 'Sender Workstation',
            type: 'sender',
            ip: '192.168.1.100',
            x: 12,
            y: 50,
            status: 'active',
            iconType: 'workstation',
          },
          {
            id: 'r-gw',
            name: 'Router Edge GW',
            type: 'router',
            ip: '192.168.1.1',
            x: 38,
            y: 50,
            status: 'active',
            iconType: 'router',
          },
          {
            id: 'r-isp',
            name: 'ISP Transit Node',
            type: 'router',
            ip: '80.12.0.4',
            x: 64,
            y: 50,
            status: 'active',
            iconType: 'router',
          },
          {
            id: 'receiver',
            name: 'Destination Server',
            type: 'receiver',
            ip: '172.16.0.50',
            x: 88,
            y: 50,
            status: 'active',
            iconType: 'server',
          },
        ],
        edges: [
          { id: 'e-s-gw', fromNodeId: 'sender', toNodeId: 'r-gw', baseLatencyMs: 15, bandwidthMbps: 1000 },
          { id: 'e-gw-isp', fromNodeId: 'r-gw', toNodeId: 'r-isp', baseLatencyMs: 35, bandwidthMbps: 500 },
          { id: 'e-isp-rec', fromNodeId: 'r-isp', toNodeId: 'receiver', baseLatencyMs: 20, bandwidthMbps: 1000 },
        ],
        availablePaths: [
          ['sender', 'r-gw', 'r-isp', 'receiver'],
        ],
      };
  }
}
