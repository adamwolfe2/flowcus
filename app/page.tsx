'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Sidebar from '@/components/Sidebar'
import DetailPanel from '@/components/DetailPanel'

const FlowCanvas = dynamic(() => import('@/components/FlowCanvas'), {
  ssr: false,
})

interface Project {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  positionX: number
  positionY: number
  tasks: any[]
  notes: any[]
  ideas: any[]
}

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleCreateProject = () => {
    // TODO: Implement create project modal
    alert('Create project feature coming soon!')
  }

  const handleCreateTask = () => {
    // TODO: Implement create task modal
    alert('Create task feature coming soon!')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950 text-white">
      <Sidebar
        onCreateProject={handleCreateProject}
        onCreateTask={handleCreateTask}
      />

      <main className="flex-1 relative">
        <FlowCanvas key={refreshKey} onNodeSelect={setSelectedProject} />
      </main>

      {selectedProject && (
        <DetailPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  )
}
