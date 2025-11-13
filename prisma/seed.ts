import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const projects = [
  {
    name: 'Modern Amenities',
    description: 'Modern amenities project',
    color: '#3b82f6',
    icon: '🏢',
    positionX: 100,
    positionY: 100,
  },
  {
    name: 'AIMS',
    description: 'AIMS project',
    color: '#8b5cf6',
    icon: '🎯',
    positionX: 400,
    positionY: 100,
  },
  {
    name: 'GHL',
    description: 'GHL project',
    color: '#ec4899',
    icon: '📊',
    positionX: 700,
    positionY: 100,
  },
  {
    name: 'Bisqy',
    description: 'Bisqy project',
    color: '#f59e0b',
    icon: '🚀',
    positionX: 100,
    positionY: 400,
  },
  {
    name: 'DevSwarm',
    description: 'DevSwarm project',
    color: '#10b981',
    icon: '💻',
    positionX: 400,
    positionY: 400,
  },
  {
    name: 'Accordant Capital',
    description: 'Accordant Capital project',
    color: '#06b6d4',
    icon: '💰',
    positionX: 700,
    positionY: 400,
  },
  {
    name: 'UO Foundation',
    description: 'UO Foundation project',
    color: '#6366f1',
    icon: '🏛️',
    positionX: 400,
    positionY: 700,
  },
]

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.journalEntry.deleteMany()
  await prisma.idea.deleteMany()
  await prisma.note.deleteMany()
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()

  // Create projects
  for (const project of projects) {
    await prisma.project.create({
      data: project,
    })
    console.log(`Created project: ${project.name}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
