import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  Position,
  Handle,
  NodeProps,
  NodeTypes,
} from 'reactflow';
import { memo } from 'react';
import 'reactflow/dist/style.css';
import './index.css';
import { fileSystem, parseFileSystem } from './fileSystem';

const EndpointNode = memo(({ data }: NodeProps) => (
  <div
    className="rounded-lg text-sm font-normal px-4 py-2"
    style={{
      background: 'oklch(0.205 0 0)',
      color: 'oklch(0.708 0 0)',
      border: '1px solid oklch(0.269 0 0)',
      width: '140px',
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <Handle
      type="target"
      position={Position.Left}
      style={{ width: 0, height: 0, background: 'transparent', border: 'none' }}
    />
    <span
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0,
      }}
    >
      {data.label}
    </span>
    <Handle
      type="source"
      position={Position.Right}
      style={{ width: 0, height: 0, background: 'transparent', border: 'none' }}
    />
  </div>
));

const nodeTypes: NodeTypes = {
  endpoint: EndpointNode,
};

// Generate nodes and edges from fake file system
const { nodes: generatedNodes, edges: generatedEdges } = parseFileSystem(fileSystem);

const initialNodes: Node[] = generatedNodes;
const initialEdges: Edge[] = generatedEdges;

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const filteredNodes = nodes;
  const filteredEdges = edges;

  return (
    <div className="h-screen w-screen">
      <div className="relative bg-neutral-900 h-full w-full">
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
          <h1 className="font-semibold text-neutral-50">Memory Dependency Tracker</h1>
          <div className="flex gap-3 items-center">
            <div className="flex gap-6 p-4 bg-neutral-900 border border-neutral-800 rounded-lg items-center">
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-3 h-3 rounded-sm bg-neutral-900"></div>
                <span>API Endpoints (42)</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-3 h-3 rounded-sm bg-neutral-900"></div>
                <span>Usecases (8)</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-3 h-3 rounded-sm bg-neutral-900"></div>
                <span>Core (6)</span>
              </div>
            </div>
            <button
              onClick={() => {
                setNodes(initialNodes);
                setEdges(initialEdges);
              }}
              className="px-5 py-2.5 bg-neutral-900 text-neutral-400 border border-neutral-800 rounded-md cursor-pointer text-sm font-medium transition-all hover:bg-neutral-800 hover:border-neutral-700"
            >
              Reset
            </button>
          </div>
        </div>
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          nodesConnectable={false}
          nodeTypes={nodeTypes}
          minZoom={0.1}
          snapToGrid
          snapGrid={[20, 20]}
          proOptions={{ hideAttribution: true }}
          zoomOnScroll={false}
          panOnScroll
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
