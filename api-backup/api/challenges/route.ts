import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Generate daily challenges for a user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { childId } = await request.json()
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })
    }

    // Check if challenges already exist for today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingChallenges = await prisma.dailyChallenge.findMany({
      where: {
        childId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (existingChallenges.length > 0) {
      return NextResponse.json({ challenges: existingChallenges })
    }

    // Generate new daily challenges
    const challengeTemplates = [
      {
        name: 'Word Master',
        description: 'Learn 5 new words today',
        type: 'LEARN_WORDS',
        target: 5,
        reward: 50
      },
      {
        name: 'Speaking Star',
        description: 'Practice pronunciation for 10 minutes',
        type: 'PRACTICE_PRONUNCIATION',
        target: 10,
        reward: 75
      },
      {
        name: 'Game Champion',
        description: 'Complete 3 educational games',
        type: 'PLAY_GAMES',
        target: 3,
        reward: 60
      },
      {
        name: 'Letter Artist',
        description: 'Trace 8 letters perfectly',
        type: 'TRACE_LETTERS',
        target: 8,
        reward: 40
      },
      {
        name: 'Reading Explorer',
        description: 'Read 2 book pages',
        type: 'READ_PAGES',
        target: 2,
        reward: 55
      },
      {
        name: 'Story Adventurer',
        description: 'Complete 1 story adventure',
        type: 'STORY_ADVENTURE',
        target: 1,
        reward: 80
      },
      {
        name: 'Spelling Bee',
        description: 'Spell 6 words correctly',
        type: 'SPELL_WORDS',
        target: 6,
        reward: 65
      },
      {
        name: 'Quiz Master',
        description: 'Answer 5 quiz questions correctly',
        type: 'QUIZ_QUESTIONS',
        target: 5,
        reward: 70
      }
    ]

    // Select 3-5 random challenges for today
    const numChallenges = Math.floor(Math.random() * 3) + 3 // 3-5 challenges
    const selectedChallenges = challengeTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, numChallenges)

    // Create challenges in database
    const challenges = await Promise.all(
      selectedChallenges.map(challenge =>
        prisma.dailyChallenge.create({
          data: {
            childId,
            name: challenge.name,
            description: challenge.description,
            type: challenge.type as any,
            target: challenge.target,
            current: 0,
            reward: challenge.reward,
            completed: false,
            date: today
          }
        })
      )
    )

    return NextResponse.json({ challenges })

  } catch (error) {
    console.error('Error generating daily challenges:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily challenges' },
      { status: 500 }
    )
  }
}

// Get daily challenges for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get('childId')
    
    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 })
    }

    // Get today's challenges
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const challenges = await prisma.dailyChallenge.findMany({
      where: {
        childId,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ challenges })

  } catch (error) {
    console.error('Error fetching daily challenges:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily challenges' },
      { status: 500 }
    )
  }
}

// Update challenge progress
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { challengeId, progress, completed } = await request.json()
    
    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 })
    }

    const updatedChallenge = await prisma.dailyChallenge.update({
      where: { id: challengeId },
      data: {
        current: progress,
        completed: completed || false,
        completedAt: completed ? new Date() : null
      }
    })

    return NextResponse.json({ challenge: updatedChallenge })

  } catch (error) {
    console.error('Error updating challenge progress:', error)
    return NextResponse.json(
      { error: 'Failed to update challenge progress' },
      { status: 500 }
    )
  }
}
