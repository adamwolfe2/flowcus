'use client'

import { useState } from 'react'
import { Plus, List, Calendar, Brain } from 'lucide-react'

interface SidebarProps {
  onCreateProject: () => void
  onCreateTask: () => void
}

export default function Sidebar({ onCreateProject, onCreateTask }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('projects')

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-indigo-500" />
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            Flowcus
          </span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">Your Neural Network Dashboard</p>
      </div>

      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'projects'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'tasks'
              ? 'text-white border-b-2 border-indigo-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tasks
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'projects' && (
          <div className="space-y-2">
            <button
              onClick={onCreateProject}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-2">
            <button
              onClick={onCreateTask}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm">
          <List className="w-4 h-4" />
          Daily To-Do
        </button>
        <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm">
          <Calendar className="w-4 h-4" />
          Journal Entry
        </button>
      </div>
    </div>
  )
}
