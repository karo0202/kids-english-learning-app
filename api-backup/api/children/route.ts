
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        children: {
          include: {
            avatar: true,
            progress: {
              orderBy: { createdAt: 'desc' },
              take: 10
            },
            achievements: {
              orderBy: { unlockedAt: 'desc' },
              take: 5
            },
            badges: {
              orderBy: { earnedAt: 'desc' },
              take: 5
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user.children)
  } catch (error) {
    console.error('Error fetching children:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
