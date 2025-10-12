
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Create test parent user
    const testUser = await prisma.user.create({
      data: {
        email: 'john@doe.com',
        name: 'John Doe',
        accountType: 'PARENT',
        parentProfile: {
          create: {
            emailNotifications: true,
            weeklyReports: true
          }
        }
      }
    })

    console.log('✅ Created test user')

    // Create children with different age groups
    const children = await Promise.all([
      prisma.child.create({
        data: {
          name: 'Emma',
          age: 4,
          ageGroup: 'AGE_3_5',
          parentId: testUser.id,
          level: 2,
          xp: 450,
          coins: 850,
          avatar: {
            create: {
              body: 'body1',
              face: 'face2',
              hair: 'hair3',
              clothing: 'clothing1',
              accessory: 'accessory2'
            }
          }
        }
      }),
      prisma.child.create({
        data: {
          name: 'Liam',
          age: 7,
          ageGroup: 'AGE_6_8',
          parentId: testUser.id,
          level: 5,
          xp: 1250,
          coins: 1200,
          avatar: {
            create: {
              body: 'body2',
              face: 'face1',
              hair: 'hair2',
              clothing: 'clothing3',
              accessory: 'accessory1'
            }
          }
        }
      }),
      prisma.child.create({
        data: {
          name: 'Sophie',
          age: 10,
          ageGroup: 'AGE_9_12',
          parentId: testUser.id,
          level: 8,
          xp: 2450,
          coins: 1800,
          avatar: {
            create: {
              body: 'body3',
              face: 'face3',
              hair: 'hair1',
              clothing: 'clothing2',
              accessory: 'accessory3'
            }
          }
        }
      })
    ])

    console.log('✅ Created child profiles')

    // Create learning modules
    const modules = await Promise.all([
      // Speaking modules for each age group
      prisma.learningModule.create({
        data: {
          name: 'Speaking Adventures',
          type: 'SPEAKING',
          ageGroup: 'AGE_3_5',
          description: 'Learn to speak with fun pronunciation games'
        }
      }),
      prisma.learningModule.create({
        data: {
          name: 'Conversation Club',
          type: 'SPEAKING',
          ageGroup: 'AGE_6_8',
          description: 'Practice conversations and improve fluency'
        }
      }),
      prisma.learningModule.create({
        data: {
          name: 'Advanced Speaking',
          type: 'SPEAKING',
          ageGroup: 'AGE_9_12',
          description: 'Master pronunciation and complex conversations'
        }
      }),

      // Writing modules for each age group
      prisma.learningModule.create({
        data: {
          name: 'Letter Fun',
          type: 'WRITING_SPELLING',
          ageGroup: 'AGE_3_5',
          description: 'Trace letters and learn the alphabet'
        }
      }),
      prisma.learningModule.create({
        data: {
          name: 'Word Builder',
          type: 'WRITING_SPELLING',
          ageGroup: 'AGE_6_8',
          description: 'Build words and practice spelling'
        }
      }),
      prisma.learningModule.create({
        data: {
          name: 'Creative Writing',
          type: 'WRITING_SPELLING',
          ageGroup: 'AGE_9_12',
          description: 'Write stories and master grammar'
        }
      }),

      // Games modules for each age group
      prisma.learningModule.create({
        data: {
          name: 'Fun Games',
          type: 'GAMES',
          ageGroup: 'AGE_3_5',
          description: 'Simple matching and memory games'
        }
      }),
      prisma.learningModule.create({
        data: {
          name: 'Learning Games',
          type: 'GAMES',
          ageGroup: 'AGE_6_8',
          description: 'Educational puzzles and quiz games'
        }
      }),
      prisma.learningModule.create({
        data: {
          name: 'Challenge Games',
          type: 'GAMES',
          ageGroup: 'AGE_9_12',
          description: 'Advanced word games and challenges'
        }
      })
    ])

    console.log('✅ Created learning modules')

    // Create activities for each module
    const activities = []
    
    // Speaking activities
    for (const module of modules.filter(m => m.type === 'SPEAKING')) {
      activities.push(
        ...[
          {
            name: 'Pronunciation Practice',
            type: 'PRONUNCIATION',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 1,
            instructions: 'Listen and repeat the words clearly',
            points: 10,
            content: {
              words: ['cat', 'dog', 'sun', 'tree', 'bird'],
              difficulty: module.ageGroup === 'AGE_3_5' ? 'easy' : module.ageGroup === 'AGE_6_8' ? 'medium' : 'hard'
            }
          },
          {
            name: 'Role Play Adventure',
            type: 'ROLE_PLAY',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 2,
            instructions: 'Act out conversations with characters',
            points: 15,
            content: {
              scenarios: ['Meeting a friend', 'Ordering food', 'At the zoo'],
              characters: ['Friend', 'Waiter', 'Zookeeper']
            }
          },
          {
            name: 'Sing & Speak',
            type: 'SING_SPEAK',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 1,
            instructions: 'Sing along and practice pronunciation',
            points: 12,
            content: {
              songs: ['ABC Song', 'Old MacDonald', 'Twinkle Star'],
              tempo: 'slow'
            }
          }
        ]
      )
    }

    // Writing activities
    for (const module of modules.filter(m => m.type === 'WRITING_SPELLING')) {
      activities.push(
        ...[
          {
            name: 'Letter Tracing',
            type: 'LETTER_TRACING',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 1,
            instructions: 'Trace the letters carefully',
            points: 8,
            content: {
              letters: module.ageGroup === 'AGE_3_5' ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D', 'E'],
              style: 'dotted'
            }
          },
          {
            name: 'Word Builder',
            type: 'WORD_BUILDER',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 2,
            instructions: 'Build words using letter blocks',
            points: 12,
            content: {
              targetWords: module.ageGroup === 'AGE_3_5' ? ['CAT', 'DOG'] : ['HOUSE', 'SCHOOL', 'FRIEND'],
              letterPool: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
            }
          },
          {
            name: 'Sentence Puzzle',
            type: 'SENTENCE_PUZZLE',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 3,
            instructions: 'Arrange words to make sentences',
            points: 15,
            content: {
              sentences: module.ageGroup === 'AGE_3_5' ? ['The cat is big'] : ['The quick brown fox jumps over the lazy dog'],
              scrambled: true
            }
          }
        ]
      )
    }

    // Games activities
    for (const module of modules.filter(m => m.type === 'GAMES')) {
      activities.push(
        ...[
          {
            name: 'Memory Match',
            type: 'MEMORY_MATCH',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 2,
            instructions: 'Match pairs of cards',
            points: 20,
            content: {
              pairs: module.ageGroup === 'AGE_3_5' ? 6 : module.ageGroup === 'AGE_6_8' ? 8 : 12,
              theme: 'animals'
            }
          },
          {
            name: 'Story Adventure',
            type: 'STORY_ADVENTURE',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 2,
            instructions: 'Choose your adventure path',
            points: 25,
            content: {
              story: 'The Magic Forest',
              choices: ['Go left', 'Go right', 'Climb tree'],
              outcomes: ['Find treasure', 'Meet fairy', 'See birds']
            }
          },
          {
            name: 'Spelling Bee',
            type: 'SPELLING_BEE',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 3,
            instructions: 'Spell the words correctly',
            points: 18,
            content: {
              words: module.ageGroup === 'AGE_3_5' ? ['cat', 'dog', 'sun'] : module.ageGroup === 'AGE_6_8' ? ['school', 'friend', 'happy'] : ['beautiful', 'adventure', 'imagination'],
              hints: true
            }
          },
          {
            name: 'Quiz Arena',
            type: 'QUIZ_ARENA',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 2,
            instructions: 'Answer the questions correctly',
            points: 15,
            content: {
              questions: [
                {
                  question: 'What sound does a cat make?',
                  options: ['Woof', 'Meow', 'Moo', 'Chirp'],
                  correct: 1
                }
              ]
            }
          },
          {
            name: 'Word Hunt',
            type: 'WORD_HUNT',
            ageGroup: module.ageGroup,
            moduleId: module.id,
            difficulty: 3,
            instructions: 'Find hidden words in the grid',
            points: 22,
            content: {
              grid: [
                ['C', 'A', 'T', 'X', 'M'],
                ['R', 'Y', 'D', 'O', 'N'],
                ['S', 'U', 'N', 'G', 'P'],
                ['Q', 'T', 'R', 'E', 'E'],
                ['W', 'V', 'B', 'H', 'K']
              ],
              words: ['CAT', 'DOG', 'SUN', 'TREE']
            }
          }
        ]
      )
    }

    // Create all activities
    for (const activityData of activities) {
      await prisma.activity.create({ data: activityData })
    }

    console.log('✅ Created activities')

    // Create vocabulary words
    const vocabularyWords = [
      // Age 3-5 words
      { word: 'cat', definition: 'A furry pet that says meow', ageGroup: 'AGE_3_5', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300' },
      { word: 'dog', definition: 'A friendly pet that says woof', ageGroup: 'AGE_3_5', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300' },
      { word: 'sun', definition: 'Bright star in the sky', ageGroup: 'AGE_3_5', category: 'nature', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300' },
      { word: 'tree', definition: 'Tall plant with leaves', ageGroup: 'AGE_3_5', category: 'nature', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300' },
      { word: 'apple', definition: 'Round red or green fruit', ageGroup: 'AGE_3_5', category: 'food', imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300' },
      
      // Age 6-8 words
      { word: 'elephant', definition: 'Large gray animal with trunk', ageGroup: 'AGE_6_8', category: 'animals', imageUrl: 'https://images.unsplash.com/photo-1564760290292-23341e4df6ec?w=300' },
      { word: 'butterfly', definition: 'Colorful flying insect', ageGroup: 'AGE_6_8', category: 'animals', imageUrl: 'https://placehold.co/1200x600/e2e8f0/1e293b?text=colorful_butterfly_flying_insect' },
      { word: 'rainbow', definition: 'Colorful arc in the sky after rain', ageGroup: 'AGE_6_8', category: 'nature', imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300' },
      { word: 'school', definition: 'Place where children learn', ageGroup: 'AGE_6_8', category: 'places', imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300' },
      { word: 'friend', definition: 'Someone you like to play with', ageGroup: 'AGE_6_8', category: 'people', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300' },
      
      // Age 9-12 words
      { word: 'adventure', definition: 'An exciting journey or experience', ageGroup: 'AGE_9_12', category: 'concepts', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300' },
      { word: 'imagination', definition: 'The ability to create ideas in your mind', ageGroup: 'AGE_9_12', category: 'concepts', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
      { word: 'beautiful', definition: 'Something that looks very nice', ageGroup: 'AGE_9_12', category: 'adjectives', imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300' },
      { word: 'creative', definition: 'Good at making new things', ageGroup: 'AGE_9_12', category: 'adjectives', imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300' },
      { word: 'knowledge', definition: 'Things that you know and understand', ageGroup: 'AGE_9_12', category: 'concepts', imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300' }
    ]

    for (const wordData of vocabularyWords) {
      await prisma.vocabularyWord.create({ data: wordData })
    }

    console.log('✅ Created vocabulary words')

    // Create stories
    const stories = [
      {
        title: 'The Friendly Cat',
        content: 'Once upon a time, there was a friendly cat named Whiskers. Whiskers loved to play with children and purr loudly when happy.',
        ageGroup: 'AGE_3_5',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'
      },
      {
        title: 'The Magic School Bus',
        content: 'Emma and her friends boarded the magic school bus for an amazing adventure. They visited different countries and learned new words in each place.',
        ageGroup: 'AGE_6_8',
        imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400'
      },
      {
        title: 'The Adventure of Learning',
        content: 'Sophie discovered that learning English was like going on a great adventure. Every new word was like finding a treasure, and every sentence was like solving a puzzle.',
        ageGroup: 'AGE_9_12',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      }
    ]

    for (const storyData of stories) {
      await prisma.story.create({ data: storyData })
    }

    console.log('✅ Created stories')

    // Create sample progress for children
    for (const child of children) {
      const childModules = modules.filter(m => m.ageGroup === child.ageGroup)
      
      for (const module of childModules) {
        const moduleActivities = activities.filter(a => a.moduleId === module.id)
        
        // Create progress for some activities
        for (let i = 0; i < Math.min(3, moduleActivities.length); i++) {
          const activity = moduleActivities[i]
          await prisma.progress.create({
            data: {
              childId: child.id,
              moduleId: module.id,
              activityId: activity.id, // This should work now that activities are created
              completed: Math.random() > 0.3,
              score: Math.floor(Math.random() * 40) + 60, // Score between 60-100
              timeSpent: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
              attempts: Math.floor(Math.random() * 3) + 1,
              completedAt: Math.random() > 0.5 ? new Date() : null
            }
          })
        }
      }
    }

    console.log('✅ Created progress records')

    // Create achievements for children
    const achievementTypes = ['FIRST_ACTIVITY', 'VOCABULARY_EXPERT', 'PRONUNCIATION_PRO', 'GAME_CHAMPION', 'LEVEL_UP']
    const achievementData = [
      { type: 'FIRST_ACTIVITY', name: 'First Steps', description: 'Completed your first activity!', icon: '👶' },
      { type: 'VOCABULARY_EXPERT', name: 'Word Master', description: 'Learned 50 new words', icon: '📚' },
      { type: 'PRONUNCIATION_PRO', name: 'Speaking Star', description: 'Perfect pronunciation 10 times', icon: '🎤' },
      { type: 'GAME_CHAMPION', name: 'Game Champion', description: 'Won 25 games', icon: '🏆' },
      { type: 'LEVEL_UP', name: 'Level Up', description: 'Reached a new level', icon: '⭐' }
    ]

    for (const child of children) {
      const numAchievements = Math.floor(Math.random() * 3) + 1
      const selectedAchievements = achievementData.slice(0, numAchievements)
      
      for (const achievement of selectedAchievements) {
        await prisma.achievement.create({
          data: {
            childId: child.id,
            name: achievement.name,
            description: achievement.description,
            type: achievement.type as any,
            icon: achievement.icon
          }
        })
      }
    }

    console.log('✅ Created achievements')

    // Create badges for children
    const badgeData = [
      { name: 'First Word', description: 'Learned your first word', category: 'SPEAKING', icon: '🎯' },
      { name: 'Letter Master', description: 'Traced 20 letters perfectly', category: 'WRITING', icon: '✍️' },
      { name: 'Game Winner', description: 'Won your first game', category: 'GAMES', icon: '🏆' },
      { name: 'Daily Learner', description: 'Learned for 7 days straight', category: 'PROGRESS', icon: '📅' },
      { name: 'Speed Learner', description: 'Completed activity in record time', category: 'SPECIAL', icon: '⚡' }
    ]

    for (const child of children) {
      const numBadges = Math.floor(Math.random() * 3) + 1
      const selectedBadges = badgeData.slice(0, numBadges)
      
      for (const badge of selectedBadges) {
        await prisma.badge.create({
          data: {
            childId: child.id,
            name: badge.name,
            description: badge.description,
            category: badge.category as any,
            icon: badge.icon
          }
        })
      }
    }

    console.log('✅ Created badges')

    // Create daily challenges for children
    const challengeData = [
      { name: 'Word Master', description: 'Learn 5 new words today', type: 'LEARN_WORDS', target: 5, reward: 50 },
      { name: 'Speaking Star', description: 'Practice pronunciation for 10 minutes', type: 'PRACTICE_PRONUNCIATION', target: 10, reward: 75 },
      { name: 'Game Champion', description: 'Complete 3 games', type: 'PLAY_GAMES', target: 3, reward: 60 },
      { name: 'Activity Hero', description: 'Complete 5 activities', type: 'COMPLETE_ACTIVITIES', target: 5, reward: 80 },
      { name: 'Creative Writer', description: 'Write 2 creative pieces', type: 'CREATIVE_TASKS', target: 2, reward: 90 }
    ]

    for (const child of children) {
      const numChallenges = Math.floor(Math.random() * 2) + 1
      const selectedChallenges = challengeData.slice(0, numChallenges)
      
      for (const challenge of selectedChallenges) {
        await prisma.dailyChallenge.create({
          data: {
            childId: child.id,
            name: challenge.name,
            description: challenge.description,
            type: challenge.type as any,
            target: challenge.target,
            current: Math.floor(Math.random() * challenge.target),
            reward: challenge.reward,
            completed: Math.random() > 0.5,
            completedAt: Math.random() > 0.5 ? new Date() : null
          }
        })
      }
    }

    console.log('✅ Created daily challenges')

    console.log('🎉 Database seed completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
