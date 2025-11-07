'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  ArrowLeft, Star, Trophy, CheckCircle, XCircle, 
  BookOpen, Play, RotateCcw, Award, Sparkles
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GrammarTopic {
  id: string
  title: string
  category: string
  description: string
  explanation: string
  examples: string[]
  exercises: GrammarExercise[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: string
}

interface GrammarExercise {
  id: string
  type: 'multiple-choice' | 'fill-blank' | 'drag-drop' | 'identify'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
}

const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: 'nouns',
    title: 'Nouns',
    category: 'Parts of Speech',
    description: 'Words that name people, places, things, or ideas',
    explanation: 'A noun is a word that names a person, place, thing, or idea. For example: cat, school, happiness, teacher.',
    examples: [
      'The cat sat on the mat.',
      'Sarah went to school.',
      'Happiness is important.',
      'The teacher is kind.'
    ],
    exercises: [
      {
        id: 'n1',
        type: 'multiple-choice',
        question: 'Which word is a noun?',
        options: ['run', 'happy', 'dog', 'quickly'],
        correctAnswer: 'dog',
        explanation: 'Dog is a noun because it names an animal (a thing).'
      },
      {
        id: 'n2',
        type: 'identify',
        question: 'Find the noun in: "The bird sings beautifully."',
        options: ['The', 'bird', 'sings', 'beautifully'],
        correctAnswer: 'bird',
        explanation: 'Bird is a noun because it names an animal.'
      },
      {
        id: 'n3',
        type: 'fill-blank',
        question: 'Complete: "The ___ is playing in the park."',
        options: ['child', 'running', 'happy', 'quickly'],
        correctAnswer: 'child',
        explanation: 'Child is a noun because it names a person.'
      }
    ],
    difficulty: 'beginner',
    icon: '📚'
  },
  {
    id: 'verbs',
    title: 'Verbs',
    category: 'Parts of Speech',
    description: 'Action words that show what someone or something does',
    explanation: 'A verb is a word that shows an action or a state of being. For example: run, jump, is, think, love.',
    examples: [
      'The dog runs fast.',
      'She jumps high.',
      'I am happy.',
      'We love reading.'
    ],
    exercises: [
      {
        id: 'v1',
        type: 'multiple-choice',
        question: 'Which word is a verb?',
        options: ['table', 'jump', 'blue', 'quietly'],
        correctAnswer: 'jump',
        explanation: 'Jump is a verb because it shows an action.'
      },
      {
        id: 'v2',
        type: 'identify',
        question: 'Find the verb in: "The cat sleeps on the sofa."',
        options: ['The', 'cat', 'sleeps', 'sofa'],
        correctAnswer: 'sleeps',
        explanation: 'Sleeps is a verb because it shows what the cat does.'
      },
      {
        id: 'v3',
        type: 'fill-blank',
        question: 'Complete: "The bird ___ in the sky."',
        options: ['fly', 'flies', 'flying', 'flew'],
        correctAnswer: 'flies',
        explanation: 'Flies is a verb that shows what the bird does.'
      }
    ],
    difficulty: 'beginner',
    icon: '🏃'
  },
  {
    id: 'adjectives',
    title: 'Adjectives',
    category: 'Parts of Speech',
    description: 'Words that describe nouns and make sentences more interesting',
    explanation: 'An adjective is a word that describes a noun. It tells us what kind, how many, or which one. For example: big, red, three, happy.',
    examples: [
      'The big dog barked.',
      'She has a red ball.',
      'Three apples fell.',
      'The happy child smiled.'
    ],
    exercises: [
      {
        id: 'a1',
        type: 'multiple-choice',
        question: 'Which word is an adjective?',
        options: ['run', 'beautiful', 'quickly', 'table'],
        correctAnswer: 'beautiful',
        explanation: 'Beautiful is an adjective because it describes how something looks.'
      },
      {
        id: 'a2',
        type: 'identify',
        question: 'Find the adjective in: "The green frog jumped."',
        options: ['The', 'green', 'frog', 'jumped'],
        correctAnswer: 'green',
        explanation: 'Green is an adjective because it describes the color of the frog.'
      },
      {
        id: 'a3',
        type: 'fill-blank',
        question: 'Complete: "The ___ elephant is huge."',
        options: ['gray', 'walk', 'slowly', 'animal'],
        correctAnswer: 'gray',
        explanation: 'Gray is an adjective that describes the color of the elephant.'
      }
    ],
    difficulty: 'beginner',
    icon: '🎨'
  },
  {
    id: 'adverbs',
    title: 'Adverbs',
    category: 'Parts of Speech',
    description: 'Words that describe verbs, adjectives, or other adverbs',
    explanation: 'An adverb is a word that describes a verb, an adjective, or another adverb. It often tells us how, when, where, or how much. For example: quickly, slowly, here, very.',
    examples: [
      'She runs quickly.',
      'He speaks slowly.',
      'Come here now.',
      'It is very cold.'
    ],
    exercises: [
      {
        id: 'adv1',
        type: 'multiple-choice',
        question: 'Which word is an adverb?',
        options: ['happy', 'quickly', 'dog', 'big'],
        correctAnswer: 'quickly',
        explanation: 'Quickly is an adverb because it describes how something is done.'
      },
      {
        id: 'adv2',
        type: 'identify',
        question: 'Find the adverb in: "The cat meowed loudly."',
        options: ['The', 'cat', 'meowed', 'loudly'],
        correctAnswer: 'loudly',
        explanation: 'Loudly is an adverb because it describes how the cat meowed.'
      },
      {
        id: 'adv3',
        type: 'fill-blank',
        question: 'Complete: "She sings ___."',
        options: ['beautiful', 'beautifully', 'beauty', 'beautify'],
        correctAnswer: 'beautifully',
        explanation: 'Beautifully is an adverb that describes how she sings.'
      }
    ],
    difficulty: 'intermediate',
    icon: '⚡'
  },
  {
    id: 'pronouns',
    title: 'Pronouns',
    category: 'Parts of Speech',
    description: 'Words that take the place of nouns',
    explanation: 'A pronoun is a word that takes the place of a noun. Instead of repeating a name, we use pronouns. For example: I, you, he, she, it, we, they.',
    examples: [
      'Sarah is happy. She is smiling.',
      'The boys are playing. They are having fun.',
      'This is my book. It is interesting.',
      'We are friends.'
    ],
    exercises: [
      {
        id: 'p1',
        type: 'multiple-choice',
        question: 'Which word is a pronoun?',
        options: ['cat', 'happy', 'she', 'run'],
        correctAnswer: 'she',
        explanation: 'She is a pronoun because it takes the place of a girl\'s name.'
      },
      {
        id: 'p2',
        type: 'fill-blank',
        question: 'Complete: "Tom likes reading. ___ reads every day."',
        options: ['He', 'She', 'It', 'They'],
        correctAnswer: 'He',
        explanation: 'He is a pronoun that takes the place of Tom.'
      }
    ],
    difficulty: 'beginner',
    icon: '👤'
  },
  {
    id: 'prepositions',
    title: 'Prepositions',
    category: 'Parts of Speech',
    description: 'Words that show position, direction, or time',
    explanation: 'A preposition is a word that shows the relationship between a noun or pronoun and other words in a sentence. It tells us where, when, or how. For example: in, on, at, under, over, with.',
    examples: [
      'The book is on the table.',
      'The cat is under the bed.',
      'We go to school in the morning.',
      'She plays with her friends.'
    ],
    exercises: [
      {
        id: 'prep1',
        type: 'multiple-choice',
        question: 'Which word is a preposition?',
        options: ['cat', 'under', 'happy', 'run'],
        correctAnswer: 'under',
        explanation: 'Under is a preposition because it shows position.'
      },
      {
        id: 'prep2',
        type: 'fill-blank',
        question: 'Complete: "The ball is ___ the box."',
        options: ['in', 'run', 'big', 'quickly'],
        correctAnswer: 'in',
        explanation: 'In is a preposition that shows where the ball is.'
      }
    ],
    difficulty: 'intermediate',
    icon: '📍'
  },
  {
    id: 'conjunctions',
    title: 'Conjunctions',
    category: 'Parts of Speech',
    description: 'Words that join words, phrases, or sentences together',
    explanation: 'A conjunction is a word that joins words, phrases, or sentences together. For example: and, but, or, because, so.',
    examples: [
      'I like apples and oranges.',
      'She is tired but happy.',
      'Do you want tea or coffee?',
      'I stayed home because it was raining.'
    ],
    exercises: [
      {
        id: 'c1',
        type: 'multiple-choice',
        question: 'Which word is a conjunction?',
        options: ['cat', 'and', 'happy', 'run'],
        correctAnswer: 'and',
        explanation: 'And is a conjunction because it joins words together.'
      },
      {
        id: 'c2',
        type: 'fill-blank',
        question: 'Complete: "I like pizza ___ pasta."',
        options: ['and', 'but', 'or', 'because'],
        correctAnswer: 'and',
        explanation: 'And joins the two things I like together.'
      }
    ],
    difficulty: 'intermediate',
    icon: '🔗'
  },
  {
    id: 'sentences',
    title: 'Types of Sentences',
    category: 'Sentence Structure',
    description: 'Learn about statements, questions, commands, and exclamations',
    explanation: 'There are four types of sentences: statements (tell something), questions (ask something), commands (tell someone to do something), and exclamations (show strong feelings).',
    examples: [
      'Statement: The sun is shining.',
      'Question: Is it sunny today?',
      'Command: Please close the door.',
      'Exclamation: What a beautiful day!'
    ],
    exercises: [
      {
        id: 's1',
        type: 'multiple-choice',
        question: 'What type of sentence is: "What a wonderful day!"',
        options: ['Statement', 'Question', 'Command', 'Exclamation'],
        correctAnswer: 'Exclamation',
        explanation: 'This is an exclamation because it shows strong feeling with an exclamation mark!'
      },
      {
        id: 's2',
        type: 'multiple-choice',
        question: 'What type of sentence is: "Please sit down."',
        options: ['Statement', 'Question', 'Command', 'Exclamation'],
        correctAnswer: 'Command',
        explanation: 'This is a command because it tells someone to do something.'
      }
    ],
    difficulty: 'beginner',
    icon: '💬'
  },
  {
    id: 'tenses',
    title: 'Verb Tenses',
    category: 'Verb Forms',
    description: 'Learn about past, present, and future',
    explanation: 'Verb tenses tell us when something happens. Past tense (happened before), present tense (happening now), and future tense (will happen later).',
    examples: [
      'Past: I walked to school yesterday.',
      'Present: I walk to school every day.',
      'Future: I will walk to school tomorrow.'
    ],
    exercises: [
      {
        id: 't1',
        type: 'multiple-choice',
        question: 'Which sentence is in the past tense?',
        options: ['I play soccer.', 'I played soccer.', 'I will play soccer.'],
        correctAnswer: 'I played soccer.',
        explanation: 'Played is the past tense form of play.'
      },
      {
        id: 't2',
        type: 'fill-blank',
        question: 'Complete in past tense: "Yesterday, I ___ to the park."',
        options: ['go', 'went', 'will go'],
        correctAnswer: 'went',
        explanation: 'Went is the past tense of go.'
      }
    ],
    difficulty: 'intermediate',
    icon: '⏰'
  },
  {
    id: 'plurals',
    title: 'Plurals',
    category: 'Word Forms',
    description: 'Making words mean more than one',
    explanation: 'Plurals are words that mean more than one. Most words add -s (cat → cats), some add -es (box → boxes), and some change completely (child → children).',
    examples: [
      'One cat, two cats',
      'One box, two boxes',
      'One child, two children',
      'One mouse, two mice'
    ],
    exercises: [
      {
        id: 'pl1',
        type: 'multiple-choice',
        question: 'What is the plural of "dog"?',
        options: ['dog', 'dogs', 'doges'],
        correctAnswer: 'dogs',
        explanation: 'Most words just add -s to make them plural.'
      },
      {
        id: 'pl2',
        type: 'fill-blank',
        question: 'Complete: "I have three ___."',
        options: ['book', 'books', 'bookes'],
        correctAnswer: 'books',
        explanation: 'Books is the plural of book.'
      }
    ],
    difficulty: 'beginner',
    icon: '🔢'
  },
  {
    id: 'capitalization',
    title: 'Capitalization',
    category: 'Writing Rules',
    description: 'When to use capital letters',
    explanation: 'We use capital letters at the beginning of sentences, for names of people and places, for the word "I", and for days and months.',
    examples: [
      'My name is Sarah.',
      'I live in New York.',
      'Today is Monday.',
      'I love reading books.'
    ],
    exercises: [
      {
        id: 'cap1',
        type: 'multiple-choice',
        question: 'Which sentence is correct?',
        options: ['i like pizza.', 'I like pizza.', 'i Like pizza.'],
        correctAnswer: 'I like pizza.',
        explanation: 'I is always capitalized, and sentences start with a capital letter.'
      },
      {
        id: 'cap2',
        type: 'fill-blank',
        question: 'Complete: "___ name is Tom."',
        options: ['my', 'My', 'MY'],
        correctAnswer: 'My',
        explanation: 'Sentences always start with a capital letter.'
      }
    ],
    difficulty: 'beginner',
    icon: '🔤'
  },
  {
    id: 'punctuation',
    title: 'Punctuation',
    category: 'Writing Rules',
    description: 'Using periods, question marks, and exclamation marks',
    explanation: 'Punctuation marks help us understand sentences. Period (.) ends statements, question mark (?) ends questions, and exclamation mark (!) shows strong feelings.',
    examples: [
      'Statement: The cat is sleeping.',
      'Question: Is the cat sleeping?',
      'Exclamation: What a cute cat!'
    ],
    exercises: [
      {
        id: 'punc1',
        type: 'multiple-choice',
        question: 'Which punctuation is correct?',
        options: ['How are you.', 'How are you?', 'How are you!'],
        correctAnswer: 'How are you?',
        explanation: 'Questions end with a question mark.'
      },
      {
        id: 'punc2',
        type: 'fill-blank',
        question: 'Complete: "I love ice cream___"',
        options: ['.', '?', '!'],
        correctAnswer: '.',
        explanation: 'Statements end with a period.'
      }
    ],
    difficulty: 'beginner',
    icon: '✏️'
  }
]

export default function GrammarModule() {
  const router = useRouter()
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [score, setScore] = useState(0)
  const [totalExercises, setTotalExercises] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  const filteredTopics = useMemo(() => {
    if (filter === 'all') return GRAMMAR_TOPICS
    return GRAMMAR_TOPICS.filter(topic => topic.difficulty === filter)
  }, [filter])

  const categories = useMemo(() => {
    const cats = new Set(GRAMMAR_TOPICS.map(t => t.category))
    return Array.from(cats)
  }, [])

  const handleTopicSelect = (topic: GrammarTopic) => {
    setSelectedTopic(topic)
    setCurrentExercise(0)
    setScore(0)
    setTotalExercises(topic.exercises.length)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = () => {
    if (!selectedTopic || !selectedAnswer) return

    const exercise = selectedTopic.exercises[currentExercise]
    const correct = Array.isArray(exercise.correctAnswer)
      ? exercise.correctAnswer.includes(selectedAnswer)
      : exercise.correctAnswer === selectedAnswer

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      setScore(prev => prev + 1)
    }
  }

  const handleNextExercise = () => {
    if (!selectedTopic) return

    if (currentExercise < selectedTopic.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Completed all exercises
      setCompletedTopics(prev => new Set([...prev, selectedTopic.id]))
      setSelectedTopic(null)
      setCurrentExercise(0)
      setScore(0)
      setTotalExercises(0)
    }
  }

  const handleReset = () => {
    if (!selectedTopic) return
    setCurrentExercise(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const currentExerciseData = selectedTopic?.exercises[currentExercise]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-b border-purple-100/50 dark:border-white/10 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard')}
                className="hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  English Grammar
                </h1>
                <p className="text-gray-600 dark:text-white/70 text-sm">
                  Learn grammar from A to Z! ✨
                </p>
              </div>
            </div>
            {selectedTopic && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-white/70">Score</div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {score} / {totalExercises}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-white/70">Progress</div>
                  <div className="text-xl font-bold text-pink-600 dark:text-pink-400">
                    {currentExercise + 1} / {totalExercises}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!selectedTopic ? (
          <>
            {/* Topic Selection */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className="rounded-full"
                >
                  All Topics
                </Button>
                <Button
                  variant={filter === 'beginner' ? 'default' : 'outline'}
                  onClick={() => setFilter('beginner')}
                  className="rounded-full"
                >
                  Beginner
                </Button>
                <Button
                  variant={filter === 'intermediate' ? 'default' : 'outline'}
                  onClick={() => setFilter('intermediate')}
                  className="rounded-full"
                >
                  Intermediate
                </Button>
                <Button
                  variant={filter === 'advanced' ? 'default' : 'outline'}
                  onClick={() => setFilter('advanced')}
                  className="rounded-full"
                >
                  Advanced
                </Button>
              </div>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`card-kid cursor-pointer group relative overflow-hidden ${
                      completedTopics.has(topic.id) ? 'ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => handleTopicSelect(topic)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-4xl">{topic.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                              {topic.title}
                            </h3>
                            {completedTopics.has(topic.id) && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                            {topic.category}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            topic.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                            topic.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {topic.difficulty}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-white/70 text-sm mb-3">
                        {topic.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BookOpen className="w-4 h-4" />
                        <span>{topic.exercises.length} exercises</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Topic Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="card-kid mb-6">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{selectedTopic.icon}</div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        {selectedTopic.title}
                      </h2>
                      <p className="text-purple-600 dark:text-purple-400 font-semibold">
                        {selectedTopic.category}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                      What is {selectedTopic.title}?
                    </h3>
                    <p className="text-gray-700 dark:text-white/80 text-lg mb-4">
                      {selectedTopic.explanation}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                      Examples:
                    </h3>
                    <ul className="space-y-2">
                      {selectedTopic.examples.map((example, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Star className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-white/80">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => setSelectedTopic(null)}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Topics
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Exercise */}
            {currentExerciseData && (
              <motion.div
                key={currentExercise}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
              >
                <Card className="card-kid">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Exercise {currentExercise + 1}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        className="rounded-xl"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <p className="text-xl text-gray-700 dark:text-white/80 mb-6">
                        {currentExerciseData.question}
                      </p>

                      {currentExerciseData.type === 'multiple-choice' && currentExerciseData.options && (
                        <div className="space-y-3">
                          {currentExerciseData.options.map((option, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAnswerSelect(option)}
                              onTouchStart={() => handleAnswerSelect(option)}
                              disabled={showResult}
                              type="button"
                              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                                showResult
                                  ? option === currentExerciseData.correctAnswer
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : selectedAnswer === option
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                                  : selectedAnswer === option
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                              }`}
                              style={{ pointerEvents: 'auto', zIndex: 10 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  showResult
                                    ? option === currentExerciseData.correctAnswer
                                      ? 'border-green-500 bg-green-500'
                                      : selectedAnswer === option
                                      ? 'border-red-500 bg-red-500'
                                      : 'border-gray-300'
                                    : selectedAnswer === option
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-gray-300'
                                }`}>
                                  {showResult && option === currentExerciseData.correctAnswer && (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  )}
                                  {showResult && selectedAnswer === option && option !== currentExerciseData.correctAnswer && (
                                    <XCircle className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <span className="text-gray-800 dark:text-white font-medium">
                                  {option}
                                </span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {currentExerciseData.type === 'fill-blank' && currentExerciseData.options && (
                        <div className="space-y-3">
                          {currentExerciseData.options.map((option, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAnswerSelect(option)}
                              onTouchStart={() => handleAnswerSelect(option)}
                              disabled={showResult}
                              type="button"
                              className={`w-full p-4 text-center rounded-xl border-2 transition-all ${
                                showResult
                                  ? option === currentExerciseData.correctAnswer
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : selectedAnswer === option
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                                  : selectedAnswer === option
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                              }`}
                              style={{ pointerEvents: 'auto', zIndex: 10 }}
                            >
                              <span className="text-gray-800 dark:text-white font-medium text-lg">
                                {option}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {currentExerciseData.type === 'identify' && currentExerciseData.options && (
                        <div className="space-y-3">
                          {currentExerciseData.options.map((option, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAnswerSelect(option)}
                              onTouchStart={() => handleAnswerSelect(option)}
                              disabled={showResult}
                              type="button"
                              className={`w-full p-4 text-center rounded-xl border-2 transition-all ${
                                showResult
                                  ? option === currentExerciseData.correctAnswer
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : selectedAnswer === option
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-200 dark:border-gray-700'
                                  : selectedAnswer === option
                                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                              }`}
                              style={{ pointerEvents: 'auto', zIndex: 10 }}
                            >
                              <span className="text-gray-800 dark:text-white font-medium text-lg">
                                {option}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {showResult && currentExerciseData.explanation && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`mt-6 p-4 rounded-xl ${
                            isCorrect
                              ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                              : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                            )}
                            <div>
                              <p className={`font-semibold mb-1 ${
                                isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                              }`}>
                                {isCorrect ? 'Correct! 🎉' : 'Not quite. Try again!'}
                              </p>
                              <p className="text-gray-700 dark:text-white/80">
                                {currentExerciseData.explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {!showResult ? (
                        <Button
                          onClick={handleSubmitAnswer}
                          disabled={!selectedAnswer}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                          size="lg"
                        >
                          Check Answer
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNextExercise}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                          size="lg"
                        >
                          {currentExercise < selectedTopic.exercises.length - 1 ? 'Next Exercise' : 'Complete Topic'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Completion Message */}
            {currentExercise >= (selectedTopic?.exercises.length || 0) - 1 && showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Card className="card-kid bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                  <CardContent className="p-8">
                    <Award className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Topic Complete! 🎉</h3>
                    <p className="text-lg mb-4">
                      You scored {score} out of {totalExercises}!
                    </p>
                    <Button
                      onClick={() => setSelectedTopic(null)}
                      className="bg-white text-green-600 hover:bg-gray-100"
                      size="lg"
                    >
                      Back to Topics
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

