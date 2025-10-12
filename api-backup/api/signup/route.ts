
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { AgeGroup } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { parentName, email, password, childName, childAge } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // (Optional) Hash password - not stored since User has no password field in schema
    // const hashedPassword = await bcrypt.hash(password, 10)

    // Determine age group
    let ageGroup: AgeGroup
    const age = parseInt(childAge)
    if (age >= 3 && age <= 5) {
      ageGroup = AgeGroup.AGE_3_5
    } else if (age >= 6 && age <= 8) {
      ageGroup = AgeGroup.AGE_6_8
    } else {
      ageGroup = AgeGroup.AGE_9_12
    }

    // Create user and child
    const user = await prisma.user.create({
      data: {
        name: parentName,
        email,
        accountType: 'PARENT',
        parentProfile: {
          create: {}
        },
        children: {
          create: {
            name: childName,
            age: age,
            ageGroup,
            avatar: {
              create: {}
            }
          }
        }
      },
      include: {
        children: {
          include: {
            avatar: true
          }
        }
      }
    })

    // Generate daily challenges for the new child
    try {
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
        }
      ]

      // Select 3-4 random challenges for the first day
      const numChallenges = Math.floor(Math.random() * 2) + 3 // 3-4 challenges
      const selectedChallenges = challengeTemplates
        .sort(() => 0.5 - Math.random())
        .slice(0, numChallenges)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Create challenges in database
      await Promise.all(
        selectedChallenges.map(challenge =>
          prisma.dailyChallenge.create({
            data: {
              childId: user.children[0].id,
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
    } catch (challengeError) {
      console.error('Error creating daily challenges:', challengeError)
      // Don't fail signup if challenges creation fails
    }

    return NextResponse.json({
      message: 'Account created successfully',
      userId: user.id
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
