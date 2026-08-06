import React, { useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNetworkMap } from './queries';
import { Card } from '../../shared/components/ui/Card';
import { LoadingState } from '../../shared/components/ui/LoadingState';
import { Server, Cpu, Router, Shield, Wifi } from 'lucide-react';

const nodeColors: Record<string, { bg: string; text: string; border: string }> = {
  'ISP': { bg: '#e0f2fe', text: '#0369a1', border: '#0284c7' },
  'Router': { bg: '#dbeafe', text: '#1d4ed8', border: '#2563eb' },
  'Switch': { bg: '#dcfce7', text: '#15803d', border: '#16a34a' },
  'AP': { bg: '#f3e8ff', text: '#7e22ce', border: '#9333ea' },
  'Server': { bg: '#f1f5f9', text: '#334155', border: '#475569' },
  'Computer': { bg: '#faf5ff', text: '#6b21a8', border: '#a855f7' },
};

export const TopologyMap: React.FC = () => {
  const { data, isLoading } = useNetworkMap();

  const { nodes, edges } = useMemo(() => {
    if (!data?.nodes) return { nodes: [], edges: [] };

    // Group nodes by type for vertical layout layers
    const groups: Record<string, any[]> = {
      'ISP': [],
      'Router': [],
      'Switch': [],
      'AP': [],
      'Server': [],
      'Computer': [],
    };

    data.nodes.forEach((n: any) => {
      const type = n.node_type;
      if (groups[type]) {
        groups[type].push(n);
      } else {
        groups['Computer'].push(n);
      }
    });

    const flowNodes: Node[] = [];
    const layers = ['ISP', 'Router', 'Switch', 'AP', 'Server', 'Computer'];
    const layerY: Record<string, number> = {
      'ISP': 50,
      'Router': 180,
      'Switch': 310,
      'AP': 440,
      'Server': 440,
      'Computer': 570,
    };

    // Calculate layout coordinates
    layers.forEach((layer) => {
      const list = groups[layer];
      const count = list.length;
      const y = layerY[layer];
      const totalWidth = 800;
      const step = count > 1 ? totalWidth / (count - 1) : 0;
      const offset = count === 1 ? totalWidth / 2 : 0;

      list.forEach((n: any, idx: number) => {
        const x = count > 1 ? idx * step : offset;
        const color = nodeColors[n.node_type] || nodeColors['Computer'];

        flowNodes.push({
          id: n.id,
          position: { x: x + 100, y },
          data: {
            label: (
              <div className="flex flex-col items-center p-2 text-center">
                <span className="font-bold text-xs">{n.node_label}</span>
                <span className="text-[9px] opacity-75">{n.node_type}</span>
              </div>
            ),
          },
          style: {
            background: color.bg,
            color: color.text,
            border: `2px solid ${color.border}`,
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            minWidth: '120px',
          },
        });
      });
    });

    // Create Edges
    const flowEdges: Edge[] = (data.links || []).map((link: any) => {
      const isWireless = link.link_type === 'Wireless';
      return {
        id: link.id,
        source: link.source_node_id,
        target: link.target_node_id,
        animated: isWireless,
        style: {
          stroke: isWireless ? '#a855f7' : link.link_type === 'Fiber' ? '#f59e0b' : '#3b82f6',
          strokeWidth: isWireless ? 2 : 3,
          strokeDasharray: isWireless ? '5 5' : undefined,
        },
        label: link.bandwidth_speed || undefined,
        labelStyle: { fill: '#64748b', fontSize: 10, fontWeight: 'bold' },
      };
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [data]);

  if (isLoading) {
    return <LoadingState title="Memuat Peta Jaringan" description="Mengunduh data node dan link topologi..." />;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Peta Topologi Jaringan NOC
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visualisasi dinamis hubungan logis &amp; fisik perangkat jaringan core laboratorium komputer.
        </p>
      </div>

      {/* MAP CONTROLS & INFO CARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-3 md:col-span-3 h-[600px] relative border border-slate-200 dark:border-slate-800 overflow-hidden rounded-xl">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            colorMode="system"
          >
            <Controls />
            <MiniMap style={{ height: 120 }} zoomable pannable />
            <Background />
          </ReactFlow>
        </Card>

        {/* SIDEBAR LEGEND */}
        <Card className="p-4 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Legenda Perangkat</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded border-2 border-sky-600 bg-sky-100" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">ISP / Gateway Gateway</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded border-2 border-blue-600 bg-blue-100" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Router Core NOC</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded border-2 border-emerald-600 bg-emerald-100" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Switch Distribusi</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded border-2 border-violet-600 bg-violet-100" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Access Point</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 rounded border-2 border-purple-500 bg-purple-100" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Workstation PC Client</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Tipe Koneksi</h2>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-6 h-0.5 bg-blue-500 inline-block" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Kabel Ethernet (Copper)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-6 h-0.5 bg-amber-500 inline-block" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Kabel Fiber Optic</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-6 h-0.5 border-t-2 border-dashed border-purple-500 inline-block" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Nirkabel (Wireless Link)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TopologyMap;
