'use client'

import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'

import RockNode from './RockNode'
import { useStore, Rock, SubRock, Task, Note, Idea } from '@/lib/store'

const nodeTypes: NodeTypes = {
  rock: RockNode,
}

interface RockWithDetails extends Rock {
  subRocks: SubRock[]
  tasks: Task[]
  notes: Note[]
  ideas: Idea[]
}

interface FlowCanvasProps {
  onNodeSelect: (rock: RockWithDetails | null) => void
}

export default function FlowCanvas({ onNodeSelect }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { rocks, subRocks, tasks, notes, ideas, updateRock } = useStore()

  useEffect(() => {
    const flowNodes: Node[] = rocks.map((rock) => {
      const rockSubRocks = subRocks.filter((sr) => sr.rockId === rock.id)
      const rockTasks = tasks.filter((t) => t.rockId === rock.id)
      const rockNotes = notes.filter((n) => n.rockId === rock.id)
      const rockIdeas = ideas.filter((i) => i.rockId === rock.id)

      return {
        id: rock.id,
        type: 'rock',
        position: { x: rock.positionX, y: rock.positionY },
        data: {
          name: rock.name,
          description: rock.description,
          color: rock.color,
          icon: rock.icon,
          status: rock.status,
          progress: rock.progress,
          category: rock.category,
          taskCount: rockTasks.length,
          noteCount: rockNotes.length,
          subRockCount: rockSubRocks.length,
          onNodeClick: () => {
            onNodeSelect({
              ...rock,
              subRocks: rockSubRocks,
              tasks: rockTasks,
              notes: rockNotes,
              ideas: rockIdeas,
            })
          },
        },
      }
    })

    setNodes(flowNodes)
  }, [rocks, subRocks, tasks, notes, ideas, setNodes, onNodeSelect])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      updateRock(node.id, {
        positionX: node.position.x,
        positionY: node.position.y,
      })
    },
    [updateRock]
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-950"
      >
        <Background color="#374151" gap={16} />
        <Controls className="bg-gray-800 border-gray-700" />
        <MiniMap
          className="bg-gray-900 border border-gray-700"
          nodeColor={(node) => {
            const rock = rocks.find((r) => r.id === node.id)
            return rock?.color || '#6366f1'
          }}
        />
      </ReactFlow>
    </div>
  )
}
