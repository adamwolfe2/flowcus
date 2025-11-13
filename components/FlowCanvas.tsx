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

import ProjectNode from './ProjectNode'
import { useStore, Project } from '@/lib/store'

const nodeTypes: NodeTypes = {
  project: ProjectNode,
}

interface ProjectWithDetails extends Project {
  tasks: any[]
  notes: any[]
  ideas: any[]
}

interface FlowCanvasProps {
  onNodeSelect: (project: ProjectWithDetails | null) => void
}

export default function FlowCanvas({ onNodeSelect }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { projects, tasks, notes, ideas, updateProject } = useStore()

  useEffect(() => {
    const flowNodes: Node[] = projects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id)
      const projectNotes = notes.filter((n) => n.projectId === project.id)
      const projectIdeas = ideas.filter((i) => i.projectId === project.id)

      return {
        id: project.id,
        type: 'project',
        position: { x: project.positionX, y: project.positionY },
        data: {
          name: project.name,
          description: project.description,
          color: project.color,
          icon: project.icon,
          taskCount: projectTasks.length,
          noteCount: projectNotes.length,
          ideaCount: projectIdeas.length,
          onNodeClick: () => {
            onNodeSelect({
              ...project,
              tasks: projectTasks,
              notes: projectNotes,
              ideas: projectIdeas,
            })
          },
        },
      }
    })

    setNodes(flowNodes)
  }, [projects, tasks, notes, ideas, setNodes, onNodeSelect])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      updateProject(node.id, {
        positionX: node.position.x,
        positionY: node.position.y,
      })
    },
    [updateProject]
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
            const project = projects.find((p) => p.id === node.id)
            return project?.color || '#6366f1'
          }}
        />
      </ReactFlow>
    </div>
  )
}
