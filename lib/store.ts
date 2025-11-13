import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Project {
  id: string
  name: string
  description: string
  color: string
  icon: string
  positionX: number
  positionY: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate: string | null
  source: string
  externalId: string | null
  url: string | null
  projectId: string | null
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  source: string
  externalId: string | null
  url: string | null
  projectId: string | null
  createdAt: string
  updatedAt: string
}

export interface Idea {
  id: string
  title: string
  content: string
  projectId: string | null
  createdAt: string
  updatedAt: string
}

interface StoreState {
  projects: Project[]
  tasks: Task[]
  notes: Note[]
  ideas: Idea[]

  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void

  // Idea actions
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateIdea: (id: string, updates: Partial<Idea>) => void
  deleteIdea: (id: string) => void

  // Helpers
  getProjectWithDetails: (id: string) => {
    project: Project
    tasks: Task[]
    notes: Note[]
    ideas: Idea[]
  } | null
}

const generateId = () => Math.random().toString(36).substring(2, 15)

// Initial projects
const initialProjects: Project[] = [
  {
    id: generateId(),
    name: 'Modern Amenities',
    description: 'Modern amenities project',
    color: '#3b82f6',
    icon: '🏢',
    positionX: 100,
    positionY: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'AIMS',
    description: 'AIMS project',
    color: '#8b5cf6',
    icon: '🎯',
    positionX: 400,
    positionY: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'GHL',
    description: 'GHL project',
    color: '#ec4899',
    icon: '📊',
    positionX: 700,
    positionY: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Bisqy',
    description: 'Bisqy project',
    color: '#f59e0b',
    icon: '🚀',
    positionX: 100,
    positionY: 400,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'DevSwarm',
    description: 'DevSwarm project',
    color: '#10b981',
    icon: '💻',
    positionX: 400,
    positionY: 400,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Accordant Capital',
    description: 'Accordant Capital project',
    color: '#06b6d4',
    icon: '💰',
    positionX: 700,
    positionY: 400,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'UO Foundation',
    description: 'UO Foundation project',
    color: '#6366f1',
    icon: '🏛️',
    positionX: 400,
    positionY: 700,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      projects: initialProjects,
      tasks: [],
      notes: [],
      ideas: [],

      // Project actions
      addProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.filter((t) => t.projectId !== id),
          notes: state.notes.filter((n) => n.projectId !== id),
          ideas: state.ideas.filter((i) => i.projectId !== id),
        })),

      // Task actions
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      // Note actions
      addNote: (note) =>
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        })),

      // Idea actions
      addIdea: (idea) =>
        set((state) => ({
          ideas: [
            ...state.ideas,
            {
              ...idea,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateIdea: (id, updates) =>
        set((state) => ({
          ideas: state.ideas.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
          ),
        })),

      deleteIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.filter((i) => i.id !== id),
        })),

      // Helpers
      getProjectWithDetails: (id) => {
        const state = get()
        const project = state.projects.find((p) => p.id === id)
        if (!project) return null

        return {
          project,
          tasks: state.tasks.filter((t) => t.projectId === id),
          notes: state.notes.filter((n) => n.projectId === id),
          ideas: state.ideas.filter((i) => i.projectId === id),
        }
      },
    }),
    {
      name: 'flowcus-storage',
    }
  )
)
