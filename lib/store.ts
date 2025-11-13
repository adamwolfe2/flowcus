import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type RockStatus = 'not_started' | 'in_progress' | 'on_track' | 'at_risk' | 'complete'
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskSource = 'manual' | 'asana' | 'notion' | 'granola'
export type MeetingSource = 'manual' | 'granola'
export type EODSource = 'manual' | 'google_docs'

export interface Rock {
  id: string
  name: string
  description: string
  icon: string
  color: string

  // EOS-specific
  target: string // SMART goal
  targetDate: string
  progress: number // 0-100
  status: RockStatus
  category: string // "Modern Amenities", "AIMS", etc.

  // Position on canvas
  positionX: number
  positionY: number

  // Metadata
  createdAt: string
  updatedAt: string
}

export interface SubRock {
  id: string
  rockId: string
  name: string
  description: string
  target: string
  targetDate: string
  progress: number
  status: RockStatus
  order: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string

  // Assignment
  rockId: string | null
  subRockId: string | null

  // Status
  status: TaskStatus
  priority: TaskPriority

  // Dates
  dueDate: string | null
  completedDate: string | null

  // Metadata
  source: TaskSource
  externalId: string | null
  url: string | null
  tags: string[]
  timeEstimate: number | null // minutes

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
  rockId: string | null
  subRockId: string | null
  createdAt: string
  updatedAt: string
}

export interface Idea {
  id: string
  title: string
  content: string
  rockId: string | null
  subRockId: string | null
  createdAt: string
  updatedAt: string
}

export interface MeetingNote {
  id: string
  title: string
  content: string
  date: string
  attendees: string[]

  // Links
  rockId: string | null
  subRockId: string | null

  // Source
  source: MeetingSource
  externalId: string | null
  url: string | null

  // Extracted
  actionItems: string[]
  keyDecisions: string[]

  createdAt: string
  updatedAt: string
}

export interface JournalEntry {
  id: string
  date: string

  // Content
  content: string
  prompt: string | null

  // Structured fields
  gratitude: string | null
  wentWell: string[]
  couldImprove: string[]
  keyInsights: string[]
  tomorrowIntention: string | null

  // Links
  rockIds: string[]

  createdAt: string
  updatedAt: string
}

export interface EODReport {
  id: string
  date: string

  // Core content
  accomplished: string[]
  blockers: string[]
  tomorrowPriorities: string[]
  wins: string[]
  learnings: string[]

  // Metadata
  hoursWorked: number | null

  // Stats (auto-calculated)
  tasksCompleted: number
  rocksProgressed: string[]

  // Source
  source: EODSource
  externalId: string | null

  createdAt: string
  updatedAt: string
}

export interface DailyFocus {
  id: string
  date: string

  // Priorities
  priority1: string
  priority2: string
  priority3: string

  // Links
  priority1RockId: string | null
  priority2RockId: string | null
  priority3RockId: string | null

  // Outcomes
  priority1Completed: boolean
  priority2Completed: boolean
  priority3Completed: boolean

  createdAt: string
  updatedAt: string
}

export interface AgentMessage {
  id: string
  type: 'check_in' | 'reminder' | 'knowledge_gap' | 'eod_prompt' | 'meeting_reminder' | 'refocus'
  content: string
  timestamp: string
  dismissed: boolean
  responded: boolean
  response: string | null
}

export interface AgentContext {
  lastCheckIn: string | null
  lastEOD: string | null
  upcomingMeetings: MeetingNote[]
  urgentTasks: Task[]
  rocksAtRisk: Rock[]
  knowledgeGaps: string[]
}

export interface RockConnection {
  id: string
  fromRockId: string
  toRockId: string
  type: 'depends_on' | 'related_to' | 'blocks'
  createdAt: string
  updatedAt: string
}

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface StoreState {
  // Data
  rocks: Rock[]
  subRocks: SubRock[]
  tasks: Task[]
  notes: Note[]
  ideas: Idea[]
  meetingNotes: MeetingNote[]
  journalEntries: JournalEntry[]
  eodReports: EODReport[]
  dailyFocus: DailyFocus[]
  agentMessages: AgentMessage[]
  agentContext: AgentContext
  rockConnections: RockConnection[]

  // Rock actions
  addRock: (rock: Omit<Rock, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateRock: (id: string, updates: Partial<Rock>) => void
  deleteRock: (id: string) => void

  // SubRock actions
  addSubRock: (subRock: Omit<SubRock, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateSubRock: (id: string, updates: Partial<SubRock>) => void
  deleteSubRock: (id: string) => void

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

  // Meeting Note actions
  addMeetingNote: (note: Omit<MeetingNote, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateMeetingNote: (id: string, updates: Partial<MeetingNote>) => void
  deleteMeetingNote: (id: string) => void

  // Journal Entry actions
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void
  deleteJournalEntry: (id: string) => void

  // EOD Report actions
  addEODReport: (report: Omit<EODReport, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEODReport: (id: string, updates: Partial<EODReport>) => void
  deleteEODReport: (id: string) => void

  // Daily Focus actions
  setDailyFocus: (focus: Omit<DailyFocus, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDailyFocus: (id: string, updates: Partial<DailyFocus>) => void
  getTodaysFocus: () => DailyFocus | null

  // Agent actions
  addAgentMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void
  dismissAgentMessage: (id: string) => void
  respondToAgentMessage: (id: string, response: string) => void
  updateAgentContext: (context: Partial<AgentContext>) => void

  // Rock Connection actions
  addRockConnection: (connection: Omit<RockConnection, 'id' | 'createdAt' | 'updatedAt'>) => void
  deleteRockConnection: (id: string) => void

  // Helpers
  getRockWithDetails: (id: string) => {
    rock: Rock
    subRocks: SubRock[]
    tasks: Task[]
    notes: Note[]
    ideas: Idea[]
    meetingNotes: MeetingNote[]
    journalEntries: JournalEntry[]
  } | null
  getTasksDueToday: () => Task[]
  getTasksOverdue: () => Task[]
  getRocksAtRisk: () => Rock[]
  getRecentActivity: () => any[]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

const getTodayString = () => new Date().toISOString().split('T')[0]

// ============================================================================
// INITIAL SEED DATA (imported from separate file)
// ============================================================================

import { initialRocks, initialSubRocks } from './seedData'

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      rocks: initialRocks,
      subRocks: initialSubRocks,
      tasks: [],
      notes: [],
      ideas: [],
      meetingNotes: [],
      journalEntries: [],
      eodReports: [],
      dailyFocus: [],
      agentMessages: [],
      agentContext: {
        lastCheckIn: null,
        lastEOD: null,
        upcomingMeetings: [],
        urgentTasks: [],
        rocksAtRisk: [],
        knowledgeGaps: [],
      },
      rockConnections: [],

      // Rock actions
      addRock: (rock) =>
        set((state) => ({
          rocks: [
            ...state.rocks,
            {
              ...rock,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateRock: (id, updates) =>
        set((state) => ({
          rocks: state.rocks.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),

      deleteRock: (id) =>
        set((state) => ({
          rocks: state.rocks.filter((r) => r.id !== id),
          subRocks: state.subRocks.filter((sr) => sr.rockId !== id),
          tasks: state.tasks.filter((t) => t.rockId !== id),
          notes: state.notes.filter((n) => n.rockId !== id),
          ideas: state.ideas.filter((i) => i.rockId !== id),
        })),

      // SubRock actions
      addSubRock: (subRock) =>
        set((state) => ({
          subRocks: [
            ...state.subRocks,
            {
              ...subRock,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateSubRock: (id, updates) =>
        set((state) => ({
          subRocks: state.subRocks.map((sr) =>
            sr.id === id ? { ...sr, ...updates, updatedAt: new Date().toISOString() } : sr
          ),
        })),

      deleteSubRock: (id) =>
        set((state) => ({
          subRocks: state.subRocks.filter((sr) => sr.id !== id),
          tasks: state.tasks.filter((t) => t.subRockId !== id),
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
        set((state) => {
          const updatedTasks = state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...updates,
                  completedDate:
                    updates.status === 'done' && !t.completedDate
                      ? new Date().toISOString()
                      : t.completedDate,
                  updatedAt: new Date().toISOString(),
                }
              : t
          )
          return { tasks: updatedTasks }
        }),

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

      // Meeting Note actions
      addMeetingNote: (note) =>
        set((state) => ({
          meetingNotes: [
            ...state.meetingNotes,
            {
              ...note,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateMeetingNote: (id, updates) =>
        set((state) => ({
          meetingNotes: state.meetingNotes.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
          ),
        })),

      deleteMeetingNote: (id) =>
        set((state) => ({
          meetingNotes: state.meetingNotes.filter((m) => m.id !== id),
        })),

      // Journal Entry actions
      addJournalEntry: (entry) =>
        set((state) => ({
          journalEntries: [
            ...state.journalEntries,
            {
              ...entry,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateJournalEntry: (id, updates) =>
        set((state) => ({
          journalEntries: state.journalEntries.map((j) =>
            j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j
          ),
        })),

      deleteJournalEntry: (id) =>
        set((state) => ({
          journalEntries: state.journalEntries.filter((j) => j.id !== id),
        })),

      // EOD Report actions
      addEODReport: (report) =>
        set((state) => ({
          eodReports: [
            ...state.eodReports,
            {
              ...report,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          agentContext: {
            ...state.agentContext,
            lastEOD: new Date().toISOString(),
          },
        })),

      updateEODReport: (id, updates) =>
        set((state) => ({
          eodReports: state.eodReports.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        })),

      deleteEODReport: (id) =>
        set((state) => ({
          eodReports: state.eodReports.filter((e) => e.id !== id),
        })),

      // Daily Focus actions
      setDailyFocus: (focus) =>
        set((state) => ({
          dailyFocus: [
            ...state.dailyFocus.filter((f) => f.date !== focus.date),
            {
              ...focus,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateDailyFocus: (id, updates) =>
        set((state) => ({
          dailyFocus: state.dailyFocus.map((f) =>
            f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
          ),
        })),

      getTodaysFocus: () => {
        const today = getTodayString()
        return get().dailyFocus.find((f) => f.date === today) || null
      },

      // Agent actions
      addAgentMessage: (message) =>
        set((state) => ({
          agentMessages: [
            ...state.agentMessages,
            {
              ...message,
              id: generateId(),
              timestamp: new Date().toISOString(),
            },
          ],
        })),

      dismissAgentMessage: (id) =>
        set((state) => ({
          agentMessages: state.agentMessages.map((m) =>
            m.id === id ? { ...m, dismissed: true } : m
          ),
        })),

      respondToAgentMessage: (id, response) =>
        set((state) => ({
          agentMessages: state.agentMessages.map((m) =>
            m.id === id ? { ...m, responded: true, response } : m
          ),
        })),

      updateAgentContext: (context) =>
        set((state) => ({
          agentContext: {
            ...state.agentContext,
            ...context,
          },
        })),

      // Helpers
      getRockWithDetails: (id) => {
        const state = get()
        const rock = state.rocks.find((r) => r.id === id)
        if (!rock) return null

        return {
          rock,
          subRocks: state.subRocks.filter((sr) => sr.rockId === id),
          tasks: state.tasks.filter((t) => t.rockId === id),
          notes: state.notes.filter((n) => n.rockId === id),
          ideas: state.ideas.filter((i) => i.rockId === id),
          meetingNotes: state.meetingNotes.filter((m) => m.rockId === id),
          journalEntries: state.journalEntries.filter((j) => j.rockIds.includes(id)),
        }
      },

      getTasksDueToday: () => {
        const today = getTodayString()
        return get().tasks.filter(
          (t) => t.dueDate === today && t.status !== 'done'
        )
      },

      getTasksOverdue: () => {
        const today = getTodayString()
        return get().tasks.filter(
          (t) => t.dueDate && t.dueDate < today && t.status !== 'done'
        )
      },

      getRocksAtRisk: () => {
        return get().rocks.filter((r) => r.status === 'at_risk')
      },

      getRecentActivity: () => {
        const state = get()
        const activities = []

        // Recent task completions
        const recentTasks = state.tasks
          .filter((t) => t.status === 'done' && t.completedDate)
          .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())
          .slice(0, 5)
          .map((t) => ({
            type: 'task_completed',
            id: t.id,
            title: t.title,
            timestamp: t.completedDate,
            rockId: t.rockId,
          }))

        // Recent EOD reports
        const recentEODs = state.eodReports
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map((e) => ({
            type: 'eod_report',
            id: e.id,
            title: `EOD Report - ${e.date}`,
            timestamp: e.createdAt,
          }))

        // Recent journal entries
        const recentJournal = state.journalEntries
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map((j) => ({
            type: 'journal_entry',
            id: j.id,
            title: `Journal - ${j.date}`,
            timestamp: j.createdAt,
          }))

        return [...recentTasks, ...recentEODs, ...recentJournal]
          .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
          .slice(0, 10)
      },

      // Rock Connection actions
      addRockConnection: (connection) =>
        set((state) => ({
          rockConnections: [
            ...state.rockConnections,
            {
              ...connection,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      deleteRockConnection: (id) =>
        set((state) => ({
          rockConnections: state.rockConnections.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'flowcus-storage',
      version: 2,
    }
  )
)
