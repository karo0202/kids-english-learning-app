
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
    explanation: 'A noun is a word that names a person, place, thing, or idea. For example: cat, school, happiness, teacher. Nouns can be people (boy, teacher), places (park, school), things (book, car), or ideas (love, happiness).',
    examples: [
      'The cat sat on the mat.',
      'Sarah went to school.',
      'Happiness is important.',
      'The teacher is kind.',
      'My dog loves to play.',
      'The book is on the table.',
      'We visited the park yesterday.',
      'Love makes people happy.',
      'The car is red.',
      'The student studies hard.',
      'The tree grows tall.',
      'Friendship is valuable.'
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
      },
      {
        id: 'n4',
        type: 'multiple-choice',
        question: 'Which word names a place?',
        options: ['run', 'school', 'happy', 'quickly'],
        correctAnswer: 'school',
        explanation: 'School is a noun that names a place.'
      },
      {
        id: 'n5',
        type: 'identify',
        question: 'Find all nouns in: "The cat and dog play in the garden."',
        options: ['cat, dog, garden', 'cat, play, garden', 'The, and, play'],
        correctAnswer: 'cat, dog, garden',
        explanation: 'Cat, dog, and garden are all nouns - they name things and a place.'
      },
      {
        id: 'n6',
        type: 'fill-blank',
        question: 'Complete: "My favorite ___ is reading." (idea)',
        options: ['book', 'hobby', 'teacher', 'school'],
        correctAnswer: 'hobby',
        explanation: 'Hobby is a noun that names an idea or activity.'
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
    explanation: 'A verb is a word that shows an action or a state of being. Action verbs show what someone does (run, jump, eat). Being verbs show what someone is (am, is, are). For example: run, jump, is, think, love, play, sleep.',
    examples: [
      'The dog runs fast.',
      'She jumps high.',
      'I am happy.',
      'We love reading.',
      'The cat sleeps all day.',
      'They play soccer.',
      'I eat breakfast.',
      'She reads books.',
      'The bird flies high.',
      'We sing songs.',
      'He is my friend.',
      'The flowers are beautiful.'
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
      },
      {
        id: 'v4',
        type: 'multiple-choice',
        question: 'Which word shows a state of being?',
        options: ['run', 'jump', 'is', 'play'],
        correctAnswer: 'is',
        explanation: '"Is" is a being verb that shows what something is.'
      },
      {
        id: 'v5',
        type: 'identify',
        question: 'Find the action verb in: "The children play in the park."',
        options: ['The', 'children', 'play', 'park'],
        correctAnswer: 'play',
        explanation: 'Play is an action verb - it shows what the children do.'
      },
      {
        id: 'v6',
        type: 'fill-blank',
        question: 'Complete: "She ___ her homework every day."',
        options: ['do', 'does', 'doing', 'did'],
        correctAnswer: 'does',
        explanation: 'Does is a verb that shows action (she does homework).'
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
    explanation: 'An adjective is a word that describes a noun. It tells us what kind (big, red), how many (three, many), or which one (this, that). Adjectives make sentences more interesting by adding details. For example: big, red, three, happy, beautiful, small.',
    examples: [
      'The big dog barked.',
      'She has a red ball.',
      'Three apples fell.',
      'The happy child smiled.',
      'The beautiful flower bloomed.',
      'I have a small cat.',
      'The old car is slow.',
      'She wore a blue dress.',
      'The tall tree sways.',
      'The sweet apple tastes good.',
      'The brave knight fought.',
      'The quiet room is peaceful.'
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
      },
      {
        id: 'a4',
        type: 'multiple-choice',
        question: 'Which word describes how many?',
        options: ['big', 'red', 'three', 'happy'],
        correctAnswer: 'three',
        explanation: 'Three is an adjective that tells how many.'
      },
      {
        id: 'a5',
        type: 'identify',
        question: 'Find all adjectives in: "The big red car is fast."',
        options: ['big, red, fast', 'The, car, is', 'big, car, fast'],
        correctAnswer: 'big, red, fast',
        explanation: 'Big, red, and fast are all adjectives describing the car.'
      },
      {
        id: 'a6',
        type: 'fill-blank',
        question: 'Complete: "She has a ___ smile." (describes happiness)',
        options: ['run', 'happy', 'quickly', 'table'],
        correctAnswer: 'happy',
        explanation: 'Happy is an adjective that describes the smile.'
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
    explanation: 'An adverb is a word that describes a verb, an adjective, or another adverb. It often tells us how (quickly, slowly), when (now, yesterday), where (here, there), or how much (very, quite). Many adverbs end in -ly. For example: quickly, slowly, here, very, always, never.',
    examples: [
      'She runs quickly. (how)',
      'He speaks slowly. (how)',
      'Come here now. (where, when)',
      'It is very cold. (how much)',
      'I always brush my teeth. (when)',
      'The bird flew away. (where)',
      'She sings beautifully. (how)',
      'He works hard. (how)',
      'They arrived yesterday. (when)',
      'The cat is very friendly. (how much)',
      'I never give up. (when)',
      'She speaks English well. (how)'
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
      },
      {
        id: 'adv4',
        type: 'multiple-choice',
        question: 'Which adverb tells "when"?',
        options: ['quickly', 'here', 'yesterday', 'very'],
        correctAnswer: 'yesterday',
        explanation: 'Yesterday is an adverb that tells when something happened.'
      },
      {
        id: 'adv5',
        type: 'identify',
        question: 'Find all adverbs in: "She always works very hard here."',
        options: ['always, very, hard, here', 'always, very, here', 'works, hard'],
        correctAnswer: 'always, very, hard, here',
        explanation: 'Always (when), very (how much), hard (how), here (where) are all adverbs.'
      },
      {
        id: 'adv6',
        type: 'fill-blank',
        question: 'Complete: "I ___ go to the park." (every time)',
        options: ['always', 'quickly', 'here', 'very'],
        correctAnswer: 'always',
        explanation: 'Always is an adverb that means every time (when).'
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
    explanation: 'A pronoun is a word that takes the place of a noun. Instead of repeating a name, we use pronouns. Common pronouns: I, you, he, she, it, we, they, me, him, her, us, them. For example: "Sarah is happy. She is smiling." (She replaces Sarah).',
    examples: [
      'Sarah is happy. She is smiling.',
      'The boys are playing. They are having fun.',
      'This is my book. It is interesting.',
      'We are friends.',
      'I love my dog. He is my best friend.',
      'The girls are smart. They study hard.',
      'You are kind. You help others.',
      'The cat is sleeping. It is tired.',
      'My friends and I play together. We have fun.',
      'The teacher helps us. She is nice.',
      'I gave him a book. He likes it.',
      'They are my classmates. I like them.'
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
      },
      {
        id: 'p3',
        type: 'multiple-choice',
        question: 'Which pronoun is for many people?',
        options: ['I', 'he', 'they', 'she'],
        correctAnswer: 'they',
        explanation: 'They is a pronoun used for more than one person.'
      },
      {
        id: 'p4',
        type: 'identify',
        question: 'Find the pronoun in: "The girls are playing. They are happy."',
        options: ['The', 'girls', 'They', 'happy'],
        correctAnswer: 'They',
        explanation: 'They is a pronoun that replaces "the girls".'
      },
      {
        id: 'p5',
        type: 'fill-blank',
        question: 'Complete: "I love my cat. ___ is fluffy."',
        options: ['He', 'She', 'It', 'They'],
        correctAnswer: 'It',
        explanation: 'It is a pronoun used for animals or things.'
      },
      {
        id: 'p6',
        type: 'identify',
        question: 'Which sentence uses a pronoun correctly?',
        options: [
          'Sarah is happy. Sarah is smiling.',
          'Sarah is happy. She is smiling.',
          'Sarah is happy. He is smiling.'
        ],
        correctAnswer: 'Sarah is happy. She is smiling.',
        explanation: 'She correctly replaces Sarah (a girl\'s name).'
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
    explanation: 'A preposition is a word that shows the relationship between a noun or pronoun and other words in a sentence. It tells us where (in, on, under), when (at, during, before), or how (with, by). Prepositions always come before a noun or pronoun. For example: in, on, at, under, over, with, by, for, from, to.',
    examples: [
      'The book is on the table. (where)',
      'The cat is under the bed. (where)',
      'We go to school in the morning. (when)',
      'She plays with her friends. (how)',
      'The bird flew over the house. (where)',
      'I study at the library. (where)',
      'She arrived before dinner. (when)',
      'He walked by the park. (where)',
      'The gift is for you. (for whom)',
      'I came from school. (where from)',
      'She sat next to me. (where)',
      'The dog ran behind the car. (where)'
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
      },
      {
        id: 'prep3',
        type: 'multiple-choice',
        question: 'Which preposition shows position above?',
        options: ['under', 'over', 'in', 'on'],
        correctAnswer: 'over',
        explanation: 'Over shows position above something.'
      },
      {
        id: 'prep4',
        type: 'identify',
        question: 'Find the preposition in: "She walked through the park."',
        options: ['She', 'walked', 'through', 'park'],
        correctAnswer: 'through',
        explanation: 'Through is a preposition showing movement from one side to another.'
      },
      {
        id: 'prep5',
        type: 'fill-blank',
        question: 'Complete: "The cat jumped ___ the fence." (above)',
        options: ['under', 'over', 'in', 'on'],
        correctAnswer: 'over',
        explanation: 'Over shows the cat went above the fence.'
      },
      {
        id: 'prep6',
        type: 'identify',
        question: 'Which sentence uses a preposition correctly?',
        options: [
          'The book is the table.',
          'The book is on the table.',
          'The book is table on.'
        ],
        correctAnswer: 'The book is on the table.',
        explanation: 'Prepositions come before the noun (on the table).'
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
    explanation: 'A conjunction is a word that joins words, phrases, or sentences together. Common conjunctions: and (adds), but (shows contrast), or (gives choice), because (shows reason), so (shows result), although (shows contrast). For example: and, but, or, because, so, although, while.',
    examples: [
      'I like apples and oranges. (adds)',
      'She is tired but happy. (contrast)',
      'Do you want tea or coffee? (choice)',
      'I stayed home because it was raining. (reason)',
      'It was raining, so I took an umbrella. (result)',
      'Although it was late, I finished my homework. (contrast)',
      'I like pizza and pasta. (adds)',
      'She is smart but lazy. (contrast)',
      'Would you like cake or ice cream? (choice)',
      'I was happy because I passed the test. (reason)',
      'He studied hard, so he got good grades. (result)',
      'While I was studying, my phone rang. (time)'
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
      },
      {
        id: 'c3',
        type: 'multiple-choice',
        question: 'Which conjunction shows contrast?',
        options: ['and', 'but', 'or', 'because'],
        correctAnswer: 'but',
        explanation: 'But shows contrast or difference between ideas.'
      },
      {
        id: 'c4',
        type: 'identify',
        question: 'Find the conjunction in: "I was tired, so I went to bed."',
        options: ['I', 'was', 'so', 'went'],
        correctAnswer: 'so',
        explanation: 'So is a conjunction that shows result (because I was tired, I went to bed).'
      },
      {
        id: 'c5',
        type: 'fill-blank',
        question: 'Complete: "I stayed home ___ it was raining." (reason)',
        options: ['and', 'but', 'because', 'or'],
        correctAnswer: 'because',
        explanation: 'Because shows the reason (why I stayed home).'
      },
      {
        id: 'c6',
        type: 'identify',
        question: 'Which sentence uses a conjunction correctly?',
        options: [
          'I like pizza. I like pasta.',
          'I like pizza and pasta.',
          'I like pizza, pasta.'
        ],
        correctAnswer: 'I like pizza and pasta.',
        explanation: 'And joins the two things together correctly.'
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
    explanation: 'There are four types of sentences: statements (tell something, end with .), questions (ask something, end with ?), commands (tell someone to do something, end with .), and exclamations (show strong feelings, end with !).',
    examples: [
      'Statement: The sun is shining.',
      'Question: Is it sunny today?',
      'Command: Please close the door.',
      'Exclamation: What a beautiful day!',
      'Statement: I love reading books.',
      'Question: Do you like pizza?',
      'Command: Stand up straight.',
      'Exclamation: How amazing!',
      'Statement: The cat is sleeping.',
      'Question: Where is my book?',
      'Command: Be quiet, please.',
      'Exclamation: I won the game!'
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
      },
      {
        id: 's3',
        type: 'identify',
        question: 'What type of sentence is: "The dog is barking."',
        options: ['Statement', 'Question', 'Command', 'Exclamation'],
        correctAnswer: 'Statement',
        explanation: 'This is a statement - it tells something and ends with a period.'
      },
      {
        id: 's4',
        type: 'fill-blank',
        question: 'Complete: "___ is your name?" (question)',
        options: ['What', 'The', 'Please', 'Wow'],
        correctAnswer: 'What',
        explanation: 'Questions often start with question words like What, Where, Who, How.'
      },
      {
        id: 's5',
        type: 'identify',
        question: 'Which sentence is a command?',
        options: [
          'I am happy.',
          'Are you happy?',
          'Be happy!',
          'What a happy day!'
        ],
        correctAnswer: 'Be happy!',
        explanation: 'Commands tell someone to do something. "Be happy!" tells someone to be happy.'
      },
      {
        id: 's6',
        type: 'multiple-choice',
        question: 'What punctuation does a question need?',
        options: ['.', '?', '!', ','],
        correctAnswer: '?',
        explanation: 'Questions end with a question mark (?).'
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
    explanation: 'Verb tenses tell us when something happens. Past tense (happened before - I played), present tense (happening now or always - I play), and future tense (will happen later - I will play). Each tense has different forms. Understanding tenses helps us talk about time correctly!',
    examples: [
      'Past: I walked to school yesterday.',
      'Present: I walk to school every day.',
      'Future: I will walk to school tomorrow.',
      'Past: She studied for the test.',
      'Present: She studies every night.',
      'Future: She will study tomorrow.',
      'Past: They ate pizza for dinner.',
      'Present: They eat lunch at noon.',
      'Future: They will eat breakfast soon.',
      'Past: He saw a movie last week.',
      'Present: He sees his friends daily.',
      'Future: He will see the doctor next month.'
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
      },
      {
        id: 't3',
        type: 'multiple-choice',
        question: 'Which sentence is in the future tense?',
        options: ['I play soccer.', 'I played soccer.', 'I will play soccer.'],
        correctAnswer: 'I will play soccer.',
        explanation: '"Will play" shows future tense (will happen later).'
      },
      {
        id: 't4',
        type: 'identify',
        question: 'Find the present tense verb in: "She reads books every day."',
        options: ['She', 'reads', 'books', 'every'],
        correctAnswer: 'reads',
        explanation: '"Reads" is present tense - it happens regularly (every day).'
      },
      {
        id: 't5',
        type: 'fill-blank',
        question: 'Complete in future tense: "Tomorrow, I ___ to the store."',
        options: ['go', 'went', 'will go'],
        correctAnswer: 'will go',
        explanation: '"Will go" is future tense (will happen tomorrow).'
      },
      {
        id: 't6',
        type: 'identify',
        question: 'Which sentence uses tenses correctly?',
        options: [
          'Yesterday I will go to school.',
          'Yesterday I went to school.',
          'Yesterday I go to school.'
        ],
        correctAnswer: 'Yesterday I went to school.',
        explanation: 'Use past tense (went) for things that happened yesterday.'
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
    explanation: 'Plurals are words that mean more than one. Most words add -s (cat → cats), some add -es (box → boxes), words ending in -y change to -ies (baby → babies), and some change completely (child → children, mouse → mice).',
    examples: [
      'One cat, two cats',
      'One box, two boxes',
      'One child, two children',
      'One mouse, two mice',
      'One book, many books',
      'One dog, three dogs',
      'One baby, two babies',
      'One toy, many toys',
      'One apple, five apples',
      'One bird, many birds',
      'One fish, two fish (or fishes)',
      'One tooth, many teeth'
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
      },
      {
        id: 'pl3',
        type: 'multiple-choice',
        question: 'What is the plural of "baby"?',
        options: ['babys', 'babies', 'babyes'],
        correctAnswer: 'babies',
        explanation: 'Words ending in -y change to -ies: baby → babies.'
      },
      {
        id: 'pl4',
        type: 'identify',
        question: 'Which is the correct plural?',
        options: [
          'one child, two childs',
          'one child, two children',
          'one child, two childes'
        ],
        correctAnswer: 'one child, two children',
        explanation: 'Child is irregular - the plural is children (not childs).'
      },
      {
        id: 'pl5',
        type: 'fill-blank',
        question: 'Complete: "I see many ___ in the sky." (bird)',
        options: ['bird', 'birds', 'birdes'],
        correctAnswer: 'birds',
        explanation: 'Most words add -s: bird → birds.'
      },
      {
        id: 'pl6',
        type: 'identify',
        question: 'Which sentence uses plural correctly?',
        options: [
          'I have one apple and two apple.',
          'I have one apple and two apples.',
          'I have one apples and two apple.'
        ],
        correctAnswer: 'I have one apple and two apples.',
        explanation: 'Use "apple" for one, "apples" for more than one.'
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
    explanation: 'We use capital letters at the beginning of sentences, for names of people and places, for the word "I", for days and months, and for titles. Always capitalize the first word of a sentence!',
    examples: [
      'My name is Sarah.',
      'I live in New York.',
      'Today is Monday.',
      'I love reading books.',
      'The cat is sleeping.',
      'She goes to school.',
      'We play in the park.',
      'He likes ice cream.',
      'They visit Paris.',
      'The book is interesting.',
      'I am happy today.',
      'Monday is the first day.'
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
      },
      {
        id: 'cap3',
        type: 'identify',
        question: 'Which word should always be capitalized?',
        options: ['you', 'he', 'I', 'they'],
        correctAnswer: 'I',
        explanation: 'The word "I" is always capitalized, even in the middle of a sentence.'
      },
      {
        id: 'cap4',
        type: 'multiple-choice',
        question: 'Which sentence has correct capitalization?',
        options: [
          'the cat is sleeping.',
          'The cat is sleeping.',
          'The Cat Is Sleeping.'
        ],
        correctAnswer: 'The cat is sleeping.',
        explanation: 'Only the first word of a sentence needs a capital letter (unless it\'s a name).'
      },
      {
        id: 'cap5',
        type: 'fill-blank',
        question: 'Complete: "___ is my favorite day." (monday)',
        options: ['monday', 'Monday', 'MONDAY'],
        correctAnswer: 'Monday',
        explanation: 'Days of the week are always capitalized: Monday, Tuesday, etc.'
      },
      {
        id: 'cap6',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'i am happy. i like school.',
          'I am happy. I like school.',
          'I am happy. i like school.'
        ],
        correctAnswer: 'I am happy. I like school.',
        explanation: 'Every sentence starts with a capital letter, and "I" is always capitalized.'
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
    explanation: 'Punctuation marks help us understand sentences. Period (.) ends statements, question mark (?) ends questions, and exclamation mark (!) shows strong feelings. Always use punctuation at the end of sentences!',
    examples: [
      'Statement: The cat is sleeping.',
      'Question: Is the cat sleeping?',
      'Exclamation: What a cute cat!',
      'I love reading books.',
      'Do you like pizza?',
      'Wow, that\'s amazing!',
      'The sun is shining.',
      'Where are you going?',
      'Happy birthday!',
      'She is my friend.',
      'Can you help me?',
      'I won the game!'
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
      },
      {
        id: 'punc3',
        type: 'identify',
        question: 'Which punctuation shows strong feeling?',
        options: ['.', '?', '!'],
        correctAnswer: '!',
        explanation: 'Exclamation mark (!) shows strong feelings like excitement or surprise.'
      },
      {
        id: 'punc4',
        type: 'multiple-choice',
        question: 'Which sentence needs a question mark?',
        options: [
          'I am happy.',
          'Are you happy?',
          'I am so happy!'
        ],
        correctAnswer: 'Are you happy?',
        explanation: 'Questions (sentences that ask something) end with a question mark.'
      },
      {
        id: 'punc5',
        type: 'fill-blank',
        question: 'Complete: "What a beautiful day___"',
        options: ['.', '?', '!'],
        correctAnswer: '!',
        explanation: 'Exclamations (sentences showing strong feelings) end with an exclamation mark.'
      },
      {
        id: 'punc6',
        type: 'identify',
        question: 'Which sentence has correct punctuation?',
        options: [
          'The dog is barking.',
          'The dog is barking',
          'The dog is barking?'
        ],
        correctAnswer: 'The dog is barking.',
        explanation: 'Statements (telling something) end with a period.'
      }
    ],
    difficulty: 'beginner',
    icon: '✏️'
  },
  {
    id: 'articles',
    title: 'Articles (a, an, the)',
    category: 'Parts of Speech',
    description: 'Using a, an, and the correctly',
    explanation: 'Articles are words that come before nouns. Use "a" before words starting with a consonant sound (a cat, a dog), "an" before words starting with a vowel sound (an apple, an elephant), and "the" when talking about a specific thing we know about (the sun, the book on the table).',
    examples: [
      'I see a cat. (any cat)',
      'I see an apple. (any apple)',
      'I see the cat. (a specific cat we know)',
      'A dog is friendly. An elephant is big. The sun is bright.',
      'I want a cookie. (any cookie)',
      'I want an orange. (any orange)',
      'I want the cookie. (a specific cookie we see)',
      'She has a book. (any book)',
      'He has an umbrella. (any umbrella)',
      'The book is on the table. (specific book)',
      'An hour is long. (starts with vowel sound)',
      'A unicorn is magical. (starts with consonant sound)'
    ],
    exercises: [
      {
        id: 'art1',
        type: 'multiple-choice',
        question: 'Choose the correct article: "I want ___ apple."',
        options: ['a', 'an', 'the'],
        correctAnswer: 'an',
        explanation: 'Use "an" before words starting with a vowel sound (a, e, i, o, u).'
      },
      {
        id: 'art2',
        type: 'fill-blank',
        question: 'Complete: "She has ___ book."',
        options: ['a', 'an', 'the'],
        correctAnswer: 'a',
        explanation: 'Use "a" before words starting with a consonant sound.'
      },
      {
        id: 'art3',
        type: 'identify',
        question: 'Which sentence uses "the" correctly?',
        options: [
          'I saw the bird in the tree.',
          'I saw a bird in a tree.',
          'I want the cookie.'
        ],
        correctAnswer: 'I saw the bird in the tree.',
        explanation: '"The" is used when we talk about specific things we can see or know about.'
      },
      {
        id: 'art4',
        type: 'multiple-choice',
        question: 'Choose the correct article: "I see ___ elephant."',
        options: ['a', 'an', 'the'],
        correctAnswer: 'an',
        explanation: 'Elephant starts with a vowel sound (e), so use "an".'
      },
      {
        id: 'art5',
        type: 'fill-blank',
        question: 'Complete: "___ sun is bright." (specific thing)',
        options: ['A', 'An', 'The'],
        correctAnswer: 'The',
        explanation: 'Use "the" for specific things everyone knows about (like the sun).'
      },
      {
        id: 'art6',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I want a cookie. (any cookie)',
          'I want an cookie. (any cookie)',
          'I want the cookie. (any cookie)'
        ],
        correctAnswer: 'I want a cookie. (any cookie)',
        explanation: 'Use "a" before words starting with a consonant sound (cookie).'
      }
    ],
    difficulty: 'beginner',
    icon: '📰'
  },
  {
    id: 'subject-verb',
    title: 'Subject-Verb Agreement',
    category: 'Sentence Structure',
    description: 'Making sure subjects and verbs match',
    explanation: 'The subject and verb in a sentence must agree. If the subject is singular (one), the verb is singular (runs, plays, is). If the subject is plural (more than one), the verb is plural (run, play, are). This is called subject-verb agreement. Always match the verb to the subject!',
    examples: [
      'The cat runs. (singular subject + singular verb)',
      'The cats run. (plural subject + plural verb)',
      'She plays. (singular subject + singular verb)',
      'They play. (plural subject + plural verb)',
      'He is happy. (singular subject + singular verb)',
      'We are happy. (plural subject + plural verb)',
      'The dog barks. (singular)',
      'The dogs bark. (plural)',
      'My sister studies. (singular)',
      'My sisters study. (plural)',
      'The bird flies. (singular)',
      'The birds fly. (plural)'
    ],
    exercises: [
      {
        id: 'sv1',
        type: 'multiple-choice',
        question: 'Choose the correct verb: "The dogs ___ in the park."',
        options: ['play', 'plays'],
        correctAnswer: 'play',
        explanation: 'Plural subject "dogs" needs plural verb "play".'
      },
      {
        id: 'sv2',
        type: 'fill-blank',
        question: 'Complete: "My friend ___ to school."',
        options: ['go', 'goes'],
        correctAnswer: 'goes',
        explanation: 'Singular subject "friend" needs singular verb "goes".'
      },
      {
        id: 'sv3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'The birds sings.',
          'The bird sing.',
          'The birds sing.'
        ],
        correctAnswer: 'The birds sing.',
        explanation: 'Plural "birds" needs plural verb "sing".'
      },
      {
        id: 'sv4',
        type: 'multiple-choice',
        question: 'Choose the correct verb: "The cat ___ on the bed."',
        options: ['sleep', 'sleeps'],
        correctAnswer: 'sleeps',
        explanation: 'Singular subject "cat" needs singular verb "sleeps".'
      },
      {
        id: 'sv5',
        type: 'fill-blank',
        question: 'Complete: "The students ___ their homework."',
        options: ['do', 'does'],
        correctAnswer: 'do',
        explanation: 'Plural subject "students" needs plural verb "do".'
      },
      {
        id: 'sv6',
        type: 'identify',
        question: 'Which sentence has correct subject-verb agreement?',
        options: [
          'The children is playing.',
          'The children are playing.',
          'The child are playing.'
        ],
        correctAnswer: 'The children are playing.',
        explanation: 'Plural "children" needs plural verb "are".'
      }
    ],
    difficulty: 'intermediate',
    icon: '🤝'
  },
  {
    id: 'contractions',
    title: 'Contractions',
    category: 'Word Forms',
    description: 'Shortening words by combining them',
    explanation: 'Contractions are shortened forms of words. We combine two words and use an apostrophe (\') to show where letters are removed. For example: "I am" becomes "I\'m", "do not" becomes "don\'t". Contractions make speaking and writing faster!',
    examples: [
      'I am = I\'m',
      'You are = You\'re',
      'He is = He\'s',
      'We are = We\'re',
      'Do not = Don\'t',
      'Cannot = Can\'t',
      'Will not = Won\'t',
      'It is = It\'s',
      'I am happy. = I\'m happy.',
      'You are kind. = You\'re kind.',
      'She is smart. = She\'s smart.',
      'They are friends. = They\'re friends.',
      'I do not know. = I don\'t know.',
      'I cannot go. = I can\'t go.'
    ],
    exercises: [
      {
        id: 'con1',
        type: 'multiple-choice',
        question: 'What is the contraction for "I am"?',
        options: ['I\'m', 'Im', 'Iam'],
        correctAnswer: 'I\'m',
        explanation: 'I am becomes I\'m with an apostrophe.'
      },
      {
        id: 'con2',
        type: 'fill-blank',
        question: 'Complete: "___ going to the park." (We are)',
        options: ['We\'re', 'Were', 'We are'],
        correctAnswer: 'We\'re',
        explanation: 'We are becomes We\'re.'
      },
      {
        id: 'con3',
        type: 'identify',
        question: 'Which contraction is correct?',
        options: [
          'I\'m happy.',
          'Im happy.',
          'I am happy.'
        ],
        correctAnswer: 'I\'m happy.',
        explanation: 'Contractions need an apostrophe to show where letters are removed.'
      },
      {
        id: 'con4',
        type: 'multiple-choice',
        question: 'What is the contraction for "do not"?',
        options: ['don\'t', 'dont', 'do\'nt'],
        correctAnswer: 'don\'t',
        explanation: 'Do not becomes don\'t - the "o" is removed and replaced with an apostrophe.'
      },
      {
        id: 'con5',
        type: 'fill-blank',
        question: 'Complete: "___ a good student." (She is)',
        options: ['She\'s', 'Shes', 'She is'],
        correctAnswer: 'She\'s',
        explanation: 'She is becomes She\'s.'
      },
      {
        id: 'con6',
        type: 'identify',
        question: 'Which sentence uses a contraction correctly?',
        options: [
          'I\'m going to school.',
          'Im going to school.',
          'I am going to school. (all are correct)'
        ],
        correctAnswer: 'I\'m going to school.',
        explanation: 'I\'m is the correct contraction for "I am" - it needs an apostrophe.'
      }
    ],
    difficulty: 'beginner',
    icon: '📝'
  },
  {
    id: 'possessives',
    title: 'Possessives',
    category: 'Word Forms',
    description: 'Showing ownership with apostrophes',
    explanation: 'Possessives show that something belongs to someone. Add an apostrophe and "s" (\'s) to show ownership. For example: "the cat\'s toy" means the toy belongs to the cat. For plural words ending in s, just add an apostrophe (the cats\' toys).',
    examples: [
      'The dog\'s bone (the bone belongs to the dog)',
      'Sarah\'s book (the book belongs to Sarah)',
      'The teacher\'s desk (the desk belongs to the teacher)',
      'My friend\'s house (the house belongs to my friend)',
      'The bird\'s nest (the nest belongs to the bird)',
      'The boy\'s toy (the toy belongs to the boy)',
      'The cat\'s food (the food belongs to the cat)',
      'Mom\'s car (the car belongs to mom)',
      'The students\' books (the books belong to the students)',
      'The children\'s toys (the toys belong to the children)',
      'My sister\'s room (the room belongs to my sister)',
      'The dog\'s tail (the tail belongs to the dog)'
    ],
    exercises: [
      {
        id: 'pos1',
        type: 'multiple-choice',
        question: 'Which shows ownership correctly?',
        options: ['the cats toy', 'the cat\'s toy', 'the cats\' toy'],
        correctAnswer: 'the cat\'s toy',
        explanation: 'Add \'s to show the toy belongs to the cat.'
      },
      {
        id: 'pos2',
        type: 'fill-blank',
        question: 'Complete: "That is ___ bike." (belongs to Tom)',
        options: ['Tom', 'Toms', 'Tom\'s'],
        correctAnswer: 'Tom\'s',
        explanation: 'Use Tom\'s to show the bike belongs to Tom.'
      },
      {
        id: 'pos3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'The girls doll is pretty.',
          'The girl\'s doll is pretty.',
          'The girls doll\'s is pretty.'
        ],
        correctAnswer: 'The girl\'s doll is pretty.',
        explanation: 'The apostrophe shows the doll belongs to the girl.'
      },
      {
        id: 'pos4',
        type: 'multiple-choice',
        question: 'Which shows ownership?',
        options: ['the dog', 'the dogs', 'the dog\'s'],
        correctAnswer: 'the dog\'s',
        explanation: 'The apostrophe and s (\'s) shows ownership.'
      },
      {
        id: 'pos5',
        type: 'fill-blank',
        question: 'Complete: "This is ___ book." (belongs to Sarah)',
        options: ['Sarah', 'Sarahs', 'Sarah\'s'],
        correctAnswer: 'Sarah\'s',
        explanation: 'Use Sarah\'s to show the book belongs to Sarah.'
      },
      {
        id: 'pos6',
        type: 'identify',
        question: 'Which sentence uses possessives correctly?',
        options: [
          'The cats toy is red.',
          'The cat\'s toy is red.',
          'The cat toy\'s is red.'
        ],
        correctAnswer: 'The cat\'s toy is red.',
        explanation: 'The apostrophe and s shows the toy belongs to the cat.'
      }
    ],
    difficulty: 'beginner',
    icon: '👑'
  },
  {
    id: 'comparatives',
    title: 'Comparatives and Superlatives',
    category: 'Adjectives',
    description: 'Comparing things using -er, -est, more, and most',
    explanation: 'We use comparatives to compare two things (add -er or use "more"). We use superlatives to compare three or more things (add -est or use "most"). For short words (1-2 syllables), add -er/-est. For long words (3+ syllables), use more/most. Some words are irregular (good → better → best).',
    examples: [
      'Big → Bigger (comparative) → Biggest (superlative)',
      'Happy → Happier → Happiest',
      'Beautiful → More beautiful → Most beautiful',
      'Fast → Faster → Fastest',
      'Good → Better → Best',
      'Bad → Worse → Worst',
      'She is taller than me. (comparing two people)',
      'He is the tallest in class. (comparing many people)',
      'This book is more interesting than that one. (comparing two books)',
      'This is the most interesting book. (comparing many books)',
      'I am faster than you. (comparing two people)',
      'She is the fastest runner. (comparing many runners)'
    ],
    exercises: [
      {
        id: 'comp1',
        type: 'multiple-choice',
        question: 'Which is the comparative form of "tall"?',
        options: ['tallest', 'taller', 'more tall'],
        correctAnswer: 'taller',
        explanation: 'Short words add -er for comparatives.'
      },
      {
        id: 'comp2',
        type: 'fill-blank',
        question: 'Complete: "This is the ___ mountain." (high)',
        options: ['high', 'higher', 'highest'],
        correctAnswer: 'highest',
        explanation: 'Use -est for superlatives (comparing many things).'
      },
      {
        id: 'comp3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'She is more smart than him.',
          'She is smarter than him.',
          'She is smartest than him.'
        ],
        correctAnswer: 'She is smarter than him.',
        explanation: 'Short words like "smart" use -er, not "more".'
      },
      {
        id: 'comp4',
        type: 'multiple-choice',
        question: 'Which is the superlative form of "good"?',
        options: ['gooder', 'better', 'best'],
        correctAnswer: 'best',
        explanation: '"Good" is irregular: good → better → best.'
      },
      {
        id: 'comp5',
        type: 'fill-blank',
        question: 'Complete: "This book is ___ than that one." (interesting - long word)',
        options: ['interesting', 'more interesting', 'most interesting'],
        correctAnswer: 'more interesting',
        explanation: 'Long words (3+ syllables) use "more" for comparatives.'
      },
      {
        id: 'comp6',
        type: 'identify',
        question: 'Which sentence uses comparatives correctly?',
        options: [
          'She is tall than me.',
          'She is taller than me.',
          'She is tallest than me.'
        ],
        correctAnswer: 'She is taller than me.',
        explanation: 'Use comparative form (-er) with "than" to compare two things.'
      }
    ],
    difficulty: 'intermediate',
    icon: '📊'
  },
  {
    id: 'question-words',
    title: 'Question Words',
    category: 'Sentence Structure',
    description: 'Using who, what, where, when, why, and how',
    explanation: 'Question words help us ask questions. Who asks about people, what asks about things, where asks about places, when asks about time, why asks about reasons, and how asks about ways or methods. These words always start questions!',
    examples: [
      'Who is your teacher? (person)',
      'What is your name? (thing)',
      'Where do you live? (place)',
      'When is your birthday? (time)',
      'Why are you happy? (reason)',
      'How do you get to school? (way/method)',
      'Who is your best friend?',
      'What do you like to eat?',
      'Where is the library?',
      'When do you go to bed?',
      'Why is the sky blue?',
      'How old are you?'
    ],
    exercises: [
      {
        id: 'qw1',
        type: 'multiple-choice',
        question: 'Which question word asks about a place?',
        options: ['who', 'what', 'where'],
        correctAnswer: 'where',
        explanation: 'Where asks about places.'
      },
      {
        id: 'qw2',
        type: 'fill-blank',
        question: 'Complete: "___ is your favorite color?"',
        options: ['Who', 'What', 'Where'],
        correctAnswer: 'What',
        explanation: 'What asks about things like colors.'
      },
      {
        id: 'qw3',
        type: 'identify',
        question: 'Which question is correct?',
        options: [
          'Who is your favorite book?',
          'What is your favorite book?',
          'Where is your favorite book?'
        ],
        correctAnswer: 'What is your favorite book?',
        explanation: 'What asks about things (like books).'
      },
      {
        id: 'qw4',
        type: 'multiple-choice',
        question: 'Which question word asks about a person?',
        options: ['who', 'what', 'where'],
        correctAnswer: 'who',
        explanation: 'Who asks about people.'
      },
      {
        id: 'qw5',
        type: 'fill-blank',
        question: 'Complete: "___ are you going?" (place)',
        options: ['Who', 'What', 'Where'],
        correctAnswer: 'Where',
        explanation: 'Where asks about places.'
      },
      {
        id: 'qw6',
        type: 'identify',
        question: 'Which question word asks about time?',
        options: ['who', 'when', 'what'],
        correctAnswer: 'when',
        explanation: 'When asks about time (like "when is your birthday?").'
      }
    ],
    difficulty: 'beginner',
    icon: '❓'
  },
  {
    id: 'prepositions-time-place',
    title: 'Prepositions of Time/Place',
    category: 'Prepositions',
    description: 'Using in, on, at for time and place',
    explanation: 'Prepositions show when or where something happens. For time: "in" for months/years/parts of day (in January, in the morning), "on" for days/dates (on Monday, on my birthday), "at" for specific times (at 3 o\'clock, at noon). For place: "in" for inside (in the box), "on" for surfaces (on the table), "at" for specific locations (at school, at home).',
    examples: [
      'Time: in January, on Monday, at 3 o\'clock',
      'Place: in the box, on the table, at school',
      'I go to school in the morning. (time)',
      'My birthday is on Friday. (time)',
      'The book is on the shelf. (place)',
      'We meet at the park. (place)',
      'I was born in 2010. (time - year)',
      'The meeting is on December 25th. (time - date)',
      'She arrives at 5 PM. (time - specific time)',
      'The cat is in the box. (place - inside)',
      'The pen is on the desk. (place - surface)',
      'I study at the library. (place - location)'
    ],
    exercises: [
      {
        id: 'prep1',
        type: 'multiple-choice',
        question: 'Which preposition is correct? "I play ___ the afternoon."',
        options: ['in', 'on', 'at'],
        correctAnswer: 'in',
        explanation: 'Use "in" for parts of the day (morning, afternoon, evening).'
      },
      {
        id: 'prep2',
        type: 'fill-blank',
        question: 'Complete: "The cat is ___ the table."',
        options: ['in', 'on', 'at'],
        correctAnswer: 'on',
        explanation: 'Use "on" for surfaces like tables.'
      },
      {
        id: 'prep3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I wake up at the morning.',
          'I wake up in the morning.',
          'I wake up on the morning.'
        ],
        correctAnswer: 'I wake up in the morning.',
        explanation: 'Use "in" for parts of the day.'
      },
      {
        id: 'prep4',
        type: 'multiple-choice',
        question: 'Which preposition is correct? "My birthday is ___ Friday."',
        options: ['in', 'on', 'at'],
        correctAnswer: 'on',
        explanation: 'Use "on" for days of the week (Monday, Friday, etc.).'
      },
      {
        id: 'prep5',
        type: 'fill-blank',
        question: 'Complete: "I will meet you ___ 3 o\'clock." (specific time)',
        options: ['in', 'on', 'at'],
        correctAnswer: 'at',
        explanation: 'Use "at" for specific times (at 3 o\'clock, at noon).'
      },
      {
        id: 'prep6',
        type: 'identify',
        question: 'Which sentence uses prepositions correctly?',
        options: [
          'I study in the library in Monday.',
          'I study at the library on Monday.',
          'I study on the library at Monday.'
        ],
        correctAnswer: 'I study at the library on Monday.',
        explanation: 'Use "at" for locations (library), "on" for days (Monday).'
      }
    ],
    difficulty: 'intermediate',
    icon: '🕐'
  },
  {
    id: 'common-rules',
    title: 'Common Grammar Rules',
    category: 'Grammar Rules',
    description: 'Important rules every student should know',
    explanation: 'Here are some important grammar rules: Start sentences with capital letters. End sentences with punctuation. Use "I" not "i". Use "a" before consonant sounds, "an" before vowel sounds. Add "s" to make most nouns plural. Use "is" for one thing, "are" for many things. These rules help make your writing clear and correct!',
    examples: [
      'Always start sentences with a capital letter.',
      'Use "I" with a capital letter, not "i".',
      'Add "s" to make plurals: cat → cats',
      'Use "is" for one: The cat is sleeping.',
      'Use "are" for many: The cats are sleeping.',
      'Use "a" before consonants: a dog, a cat',
      'Use "an" before vowels: an apple, an egg',
      'End statements with a period (.).',
      'End questions with a question mark (?).',
      'End exclamations with an exclamation mark (!).',
      'The dog is happy. (one dog)',
      'The dogs are happy. (many dogs)'
    ],
    exercises: [
      {
        id: 'rule1',
        type: 'multiple-choice',
        question: 'Which sentence follows the rules?',
        options: [
          'i like ice cream.',
          'I like ice cream.',
          'I like ice cream'
        ],
        correctAnswer: 'I like ice cream.',
        explanation: 'Start with capital "I" and end with a period.'
      },
      {
        id: 'rule2',
        type: 'fill-blank',
        question: 'Complete: "The dog ___ happy."',
        options: ['is', 'are', 'am'],
        correctAnswer: 'is',
        explanation: 'Use "is" for one thing (singular).'
      },
      {
        id: 'rule3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'The cats is sleeping.',
          'The cat are sleeping.',
          'The cats are sleeping.'
        ],
        correctAnswer: 'The cats are sleeping.',
        explanation: 'Plural "cats" needs plural verb "are".'
      },
      {
        id: 'rule4',
        type: 'multiple-choice',
        question: 'Which sentence follows capitalization rules?',
        options: [
          'i am happy. i like school.',
          'I am happy. I like school.',
          'I am happy. i like school.'
        ],
        correctAnswer: 'I am happy. I like school.',
        explanation: 'Every sentence starts with a capital letter, and "I" is always capitalized.'
      },
      {
        id: 'rule5',
        type: 'fill-blank',
        question: 'Complete: "I want ___ apple."',
        options: ['a', 'an', 'the'],
        correctAnswer: 'an',
        explanation: 'Use "an" before words starting with a vowel sound (apple).'
      },
      {
        id: 'rule6',
        type: 'identify',
        question: 'Which sentence follows all the rules?',
        options: [
          'the cat is sleeping',
          'The cat is sleeping.',
          'The cat is sleeping?'
        ],
        correctAnswer: 'The cat is sleeping.',
        explanation: 'Starts with capital, ends with period (statement).'
      }
    ],
    difficulty: 'beginner',
    icon: '📚'
  },
  {
    id: 'simple-present',
    title: 'Simple Present Tense',
    category: 'Verb Tenses',
    description: 'Talking about things that happen now or always',
    explanation: 'Simple present tense is used to talk about things that happen now, always, or regularly. Use the base form of the verb. For "he", "she", "it", add -s or -es. Examples: "I play" (I always play), "She plays" (She always plays), "They eat" (They always eat).',
    examples: [
      'I play soccer every day.',
      'She reads books every night.',
      'They eat breakfast at 8 AM.',
      'He goes to school.',
      'We like ice cream.',
      'The cat sleeps on the bed.',
      'I brush my teeth every morning.',
      'She walks to school.',
      'They play games after school.',
      'He helps his mom.',
      'We study English.',
      'The dog barks loudly.'
    ],
    exercises: [
      {
        id: 'sp1',
        type: 'multiple-choice',
        question: 'Which sentence is correct?',
        options: [
          'I play soccer.',
          'I plays soccer.',
          'I playing soccer.'
        ],
        correctAnswer: 'I play soccer.',
        explanation: 'With "I", use the base form "play" (no -s).'
      },
      {
        id: 'sp2',
        type: 'fill-blank',
        question: 'Complete: "She ___ to school every day." (go)',
        options: ['go', 'goes', 'going'],
        correctAnswer: 'goes',
        explanation: 'With "she", add -es to "go" → "goes".'
      },
      {
        id: 'sp3',
        type: 'identify',
        question: 'Which sentence uses simple present correctly?',
        options: [
          'I am play soccer.',
          'I play soccer.',
          'I will play soccer.'
        ],
        correctAnswer: 'I play soccer.',
        explanation: 'Simple present uses the base form of the verb (play).'
      },
      {
        id: 'sp4',
        type: 'multiple-choice',
        question: 'Which sentence is correct?',
        options: [
          'They plays soccer.',
          'They play soccer.',
          'They playing soccer.'
        ],
        correctAnswer: 'They play soccer.',
        explanation: 'With "they" (plural), use the base form "play" (no -s).'
      },
      {
        id: 'sp5',
        type: 'fill-blank',
        question: 'Complete: "The cat ___ on the bed." (sleep)',
        options: ['sleep', 'sleeps', 'sleeping'],
        correctAnswer: 'sleeps',
        explanation: 'With "the cat" (it), add -s to "sleep" → "sleeps".'
      },
      {
        id: 'sp6',
        type: 'identify',
        question: 'Which sentence uses simple present?',
        options: [
          'I played soccer yesterday.',
          'I play soccer every day.',
          'I will play soccer tomorrow.'
        ],
        correctAnswer: 'I play soccer every day.',
        explanation: 'Simple present is used for things that happen regularly (every day).'
      }
    ],
    difficulty: 'beginner',
    icon: '⏰'
  },
  {
    id: 'simple-past',
    title: 'Simple Past Tense',
    category: 'Verb Tenses',
    description: 'Talking about things that happened before',
    explanation: 'Simple past tense is used to talk about things that happened in the past (yesterday, last week, etc.). Most verbs add -ed. Some verbs are irregular (go → went, see → saw, eat → ate). Examples: "I played" (regular), "I went" (irregular).',
    examples: [
      'I played soccer yesterday.',
      'She went to school last week.',
      'They ate pizza for dinner.',
      'He saw a movie.',
      'We walked to the park.',
      'The cat slept all day.',
      'I finished my homework.',
      'She called her friend.',
      'They visited the zoo.',
      'He read a book.',
      'We cooked dinner.',
      'The dog ran fast.'
    ],
    exercises: [
      {
        id: 'spt1',
        type: 'multiple-choice',
        question: 'Which is the past tense of "play"?',
        options: ['play', 'played', 'playing'],
        correctAnswer: 'played',
        explanation: 'Add -ed to make "play" past tense → "played".'
      },
      {
        id: 'spt2',
        type: 'fill-blank',
        question: 'Complete: "I ___ to the store yesterday." (go)',
        options: ['go', 'went', 'going'],
        correctAnswer: 'went',
        explanation: '"Go" is irregular. Past tense is "went".'
      },
      {
        id: 'spt3',
        type: 'identify',
        question: 'Which sentence is in past tense?',
        options: [
          'I play soccer.',
          'I played soccer.',
          'I will play soccer.'
        ],
        correctAnswer: 'I played soccer.',
        explanation: '"Played" is past tense (happened before).'
      },
      {
        id: 'spt4',
        type: 'multiple-choice',
        question: 'Which is the past tense of "walk"?',
        options: ['walk', 'walked', 'walking'],
        correctAnswer: 'walked',
        explanation: 'Add -ed to make "walk" past tense → "walked".'
      },
      {
        id: 'spt5',
        type: 'fill-blank',
        question: 'Complete: "She ___ a book last night." (read)',
        options: ['read', 'reads', 'reading'],
        correctAnswer: 'read',
        explanation: '"Read" is the same for present and past (but sounds different).'
      },
      {
        id: 'spt6',
        type: 'identify',
        question: 'Which sentence uses past tense correctly?',
        options: [
          'I eat breakfast yesterday.',
          'I ate breakfast yesterday.',
          'I will eat breakfast yesterday.'
        ],
        correctAnswer: 'I ate breakfast yesterday.',
        explanation: '"Ate" is the past tense of "eat" (irregular verb).'
      }
    ],
    difficulty: 'beginner',
    icon: '📅'
  },
  {
    id: 'basic-sentence',
    title: 'Basic Sentence Structure',
    category: 'Sentence Structure',
    description: 'How to make simple sentences',
    explanation: 'A simple sentence has a subject (who or what) and a verb (action). Subject + Verb. Example: "The cat (subject) sleeps (verb)." You can add an object: "The cat (subject) eats (verb) fish (object)." Every sentence needs at least a subject and a verb!',
    examples: [
      'The cat sleeps. (subject + verb)',
      'I play. (subject + verb)',
      'She reads books. (subject + verb + object)',
      'They eat pizza. (subject + verb + object)',
      'The dog runs. (subject + verb)',
      'We sing songs. (subject + verb + object)',
      'The bird flies. (subject + verb)',
      'I love ice cream. (subject + verb + object)',
      'She draws pictures. (subject + verb + object)',
      'The sun shines. (subject + verb)',
      'They play games. (subject + verb + object)',
      'He reads books. (subject + verb + object)'
    ],
    exercises: [
      {
        id: 'bs1',
        type: 'multiple-choice',
        question: 'What is the subject in "The cat sleeps"?',
        options: ['cat', 'sleeps', 'the'],
        correctAnswer: 'cat',
        explanation: 'The subject is "cat" (who does the action).'
      },
      {
        id: 'bs2',
        type: 'fill-blank',
        question: 'Complete: "The bird ___." (fly)',
        options: ['fly', 'flies', 'flying'],
        correctAnswer: 'flies',
        explanation: 'Subject "bird" (singular) needs verb "flies".'
      },
      {
        id: 'bs3',
        type: 'identify',
        question: 'Which is a complete sentence?',
        options: [
          'The cat.',
          'The cat sleeps.',
          'sleeps.'
        ],
        correctAnswer: 'The cat sleeps.',
        explanation: 'A complete sentence needs a subject (cat) and a verb (sleeps).'
      },
      {
        id: 'bs4',
        type: 'multiple-choice',
        question: 'What is the verb in "The dog runs"?',
        options: ['The', 'dog', 'runs'],
        correctAnswer: 'runs',
        explanation: 'The verb is "runs" (the action).'
      },
      {
        id: 'bs5',
        type: 'fill-blank',
        question: 'Complete: "I ___ soccer." (play)',
        options: ['play', 'plays', 'playing'],
        correctAnswer: 'play',
        explanation: 'Subject "I" needs base form verb "play".'
      },
      {
        id: 'bs6',
        type: 'identify',
        question: 'Which sentence has both subject and verb?',
        options: [
          'The big cat.',
          'The cat sleeps.',
          'Sleeps on the bed.'
        ],
        correctAnswer: 'The cat sleeps.',
        explanation: 'It has a subject (cat) and a verb (sleeps).'
      }
    ],
    difficulty: 'beginner',
    icon: '📝'
  },
  {
    id: 'this-that',
    title: 'This, That, These, Those',
    category: 'Pronouns',
    description: 'Pointing to things near or far',
    explanation: 'Use "this" (one thing near), "that" (one thing far), "these" (many things near), "those" (many things far). Examples: "This book" (near me), "That car" (far from me), "These apples" (near me), "Those trees" (far from me).',
    examples: [
      'This is my book. (one thing near)',
      'That is your car. (one thing far)',
      'These are my toys. (many things near)',
      'Those are your shoes. (many things far)',
      'This apple is red.',
      'That bird is flying.',
      'These cookies are delicious.',
      'Those clouds are white.',
      'This is my pencil.',
      'That is your book.',
      'These are my shoes.',
      'Those are your toys.'
    ],
    exercises: [
      {
        id: 'tt1',
        type: 'multiple-choice',
        question: 'Which word is for one thing near you?',
        options: ['this', 'that', 'these'],
        correctAnswer: 'this',
        explanation: '"This" is for one thing near you.'
      },
      {
        id: 'tt2',
        type: 'fill-blank',
        question: 'Complete: "___ are my friends." (many people near)',
        options: ['This', 'That', 'These'],
        correctAnswer: 'These',
        explanation: '"These" is for many things near you.'
      },
      {
        id: 'tt3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'This are my books.',
          'These are my books.',
          'This is my books.'
        ],
        correctAnswer: 'These are my books.',
        explanation: '"These" (plural) goes with "are". "Books" is plural.'
      },
      {
        id: 'tt4',
        type: 'multiple-choice',
        question: 'Which word is for one thing far from you?',
        options: ['this', 'that', 'these'],
        correctAnswer: 'that',
        explanation: '"That" is for one thing far from you.'
      },
      {
        id: 'tt5',
        type: 'fill-blank',
        question: 'Complete: "___ are your shoes." (many things far)',
        options: ['This', 'That', 'Those'],
        correctAnswer: 'Those',
        explanation: '"Those" is for many things far from you.'
      },
      {
        id: 'tt6',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'That is my book.',
          'That are my books.',
          'Those is my books.'
        ],
        correctAnswer: 'That is my book.',
        explanation: '"That" (singular) goes with "is". "Book" is singular.'
      }
    ],
    difficulty: 'beginner',
    icon: '👆'
  },
  {
    id: 'yes-no-questions',
    title: 'Yes/No Questions',
    category: 'Questions',
    description: 'Asking questions that need yes or no answers',
    explanation: 'Yes/No questions start with "am", "is", "are", "do", "does", "can", "will", etc. The answer is "Yes" or "No". Examples: "Are you happy?" → "Yes, I am." / "No, I\'m not." "Do you like pizza?" → "Yes, I do." / "No, I don\'t."',
    examples: [
      'Are you happy? → Yes, I am. / No, I\'m not.',
      'Is she your friend? → Yes, she is. / No, she isn\'t.',
      'Do you like pizza? → Yes, I do. / No, I don\'t.',
      'Can you swim? → Yes, I can. / No, I can\'t.',
      'Will you come? → Yes, I will. / No, I won\'t.',
      'Is it raining? → Yes, it is. / No, it isn\'t.',
      'Are they coming? → Yes, they are. / No, they aren\'t.',
      'Do we have time? → Yes, we do. / No, we don\'t.',
      'Does he like pizza? → Yes, he does. / No, he doesn\'t.'
    ],
    exercises: [
      {
        id: 'yn1',
        type: 'multiple-choice',
        question: 'Which is a yes/no question?',
        options: [
          'What is your name?',
          'Are you happy?',
          'Where do you live?'
        ],
        correctAnswer: 'Are you happy?',
        explanation: 'Yes/No questions can be answered with "Yes" or "No".'
      },
      {
        id: 'yn2',
        type: 'fill-blank',
        question: 'Complete: "___ you like ice cream?"',
        options: ['Are', 'Do', 'What'],
        correctAnswer: 'Do',
        explanation: '"Do you like..." is a yes/no question.'
      },
      {
        id: 'yn3',
        type: 'identify',
        question: 'Which answer is correct? "Are you tired?"',
        options: [
          'Yes, I am.',
          'Yes, I do.',
          'Yes, I can.'
        ],
        correctAnswer: 'Yes, I am.',
        explanation: 'Answer "Are you...?" with "Yes, I am" or "No, I\'m not".'
      },
      {
        id: 'yn4',
        type: 'multiple-choice',
        question: 'Which question starts with "is"?',
        options: [
          'Is you happy?',
          'Is she happy?',
          'Is I happy?'
        ],
        correctAnswer: 'Is she happy?',
        explanation: 'Use "is" with "she", "he", "it" (singular).'
      },
      {
        id: 'yn5',
        type: 'fill-blank',
        question: 'Complete: "___ you come to my party?" (will)',
        options: ['Are', 'Do', 'Will'],
        correctAnswer: 'Will',
        explanation: '"Will you...?" is a yes/no question about the future.'
      },
      {
        id: 'yn6',
        type: 'identify',
        question: 'Which answer is correct? "Do you like pizza?"',
        options: [
          'Yes, I am.',
          'Yes, I do.',
          'Yes, I can.'
        ],
        correctAnswer: 'Yes, I do.',
        explanation: 'Answer "Do you...?" with "Yes, I do" or "No, I don\'t".'
      }
    ],
    difficulty: 'beginner',
    icon: '❓'
  },
  {
    id: 'basic-prepositions',
    title: 'Basic Prepositions',
    category: 'Prepositions',
    description: 'Words that show where things are',
    explanation: 'Prepositions show where things are. Common ones: "in" (inside), "on" (top), "under" (below), "next to" (beside), "behind" (back), "in front of" (before). Examples: "The book is on the table." "The cat is under the bed."',
    examples: [
      'The book is on the table.',
      'The cat is under the bed.',
      'I sit next to my friend.',
      'The ball is in the box.',
      'The dog is behind the tree.',
      'The car is in front of the house.'
    ],
    exercises: [
      {
        id: 'bp1',
        type: 'multiple-choice',
        question: 'Complete: "The book is ___ the table."',
        options: ['in', 'on', 'under'],
        correctAnswer: 'on',
        explanation: '"On" means on top of something.'
      },
      {
        id: 'bp2',
        type: 'fill-blank',
        question: 'Complete: "The cat is ___ the bed." (below)',
        options: ['on', 'in', 'under'],
        correctAnswer: 'under',
        explanation: '"Under" means below something.'
      },
      {
        id: 'bp3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'The ball is on the box.',
          'The ball is in the box.',
          'Both can be correct.'
        ],
        correctAnswer: 'Both can be correct.',
        explanation: '"On the box" = on top. "In the box" = inside. Both are possible.'
      }
    ],
    difficulty: 'beginner',
    icon: '📍'
  },
  {
    id: 'numbers',
    title: 'Numbers and Counting',
    category: 'Vocabulary',
    description: 'Learning to count from 1 to 100',
    explanation: 'Numbers help us count things. Learn 1-10 first: one, two, three, four, five, six, seven, eight, nine, ten. Then 11-20: eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty. Then count by tens: thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred.',
    examples: [
      'I have one apple.',
      'She has two cats.',
      'There are three birds.',
      'I see five cars.',
      'We have ten books.',
      'There are twenty students.',
      'I am eight years old.',
      'She has fifty toys.'
    ],
    exercises: [
      {
        id: 'num1',
        type: 'multiple-choice',
        question: 'What number comes after five?',
        options: ['four', 'six', 'seven'],
        correctAnswer: 'six',
        explanation: 'After five comes six.'
      },
      {
        id: 'num2',
        type: 'fill-blank',
        question: 'Complete: "I have ___ apples." (5)',
        options: ['five', 'fifty', 'fifteen'],
        correctAnswer: 'five',
        explanation: 'Five = 5.'
      },
      {
        id: 'num3',
        type: 'identify',
        question: 'Which number is correct?',
        options: [
          'I am ten years old.',
          'I am ten year old.',
          'I am ten year olds.'
        ],
        correctAnswer: 'I am ten years old.',
        explanation: 'Use "years" (plural) with numbers greater than one.'
      }
    ],
    difficulty: 'beginner',
    icon: '🔢'
  },
  {
    id: 'colors',
    title: 'Colors',
    category: 'Vocabulary',
    description: 'Learning color names',
    explanation: 'Colors describe how things look. Common colors: red, blue, yellow, green, orange, purple, pink, brown, black, white, gray. Use "is" with colors: "The apple is red." "The sky is blue."',
    examples: [
      'The apple is red.',
      'The sky is blue.',
      'The sun is yellow.',
      'The grass is green.',
      'The orange is orange.',
      'The flower is purple.',
      'The rose is pink.',
      'The tree is brown.'
    ],
    exercises: [
      {
        id: 'col1',
        type: 'multiple-choice',
        question: 'What color is the sky?',
        options: ['red', 'blue', 'green'],
        correctAnswer: 'blue',
        explanation: 'The sky is usually blue.'
      },
      {
        id: 'col2',
        type: 'fill-blank',
        question: 'Complete: "The apple is ___."',
        options: ['red', 'blue', 'green'],
        correctAnswer: 'red',
        explanation: 'Apples are usually red.'
      },
      {
        id: 'col3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'The apple red.',
          'The apple is red.',
          'The apple are red.'
        ],
        correctAnswer: 'The apple is red.',
        explanation: 'Use "is" with colors: "The apple is red."'
      }
    ],
    difficulty: 'beginner',
    icon: '🎨'
  },
  {
    id: 'family-words',
    title: 'Family Words',
    category: 'Vocabulary',
    description: 'Words for family members',
    explanation: 'Family words name people in your family. Common words: mom (mother), dad (father), brother, sister, grandma (grandmother), grandpa (grandfather), aunt, uncle, cousin. Use "my" before family words: "my mom", "my dad", "my sister".',
    examples: [
      'This is my mom.',
      'That is my dad.',
      'I have one brother.',
      'She has two sisters.',
      'My grandma is kind.',
      'My grandpa is funny.',
      'I love my family.',
      'We visit my aunt.'
    ],
    exercises: [
      {
        id: 'fw1',
        type: 'multiple-choice',
        question: 'What do you call your mother?',
        options: ['dad', 'mom', 'brother'],
        correctAnswer: 'mom',
        explanation: 'Mom is another word for mother.'
      },
      {
        id: 'fw2',
        type: 'fill-blank',
        question: 'Complete: "I have one ___." (boy sibling)',
        options: ['sister', 'brother', 'mom'],
        correctAnswer: 'brother',
        explanation: 'A brother is a boy sibling.'
      },
      {
        id: 'fw3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'This is mom.',
          'This is my mom.',
          'This is a mom.'
        ],
        correctAnswer: 'This is my mom.',
        explanation: 'Use "my" when talking about your own family: "my mom".'
      }
    ],
    difficulty: 'beginner',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    id: 'action-words',
    title: 'Action Words (Verbs)',
    category: 'Vocabulary',
    description: 'Common action words',
    explanation: 'Action words (verbs) tell what someone or something does. Common action words: run, walk, jump, sit, stand, eat, drink, sleep, play, read, write, sing, dance, swim, fly. Examples: "I run." "She jumps." "They play."',
    examples: [
      'I run fast.',
      'She jumps high.',
      'They play soccer.',
      'We eat lunch.',
      'He reads books.',
      'She sings songs.',
      'The bird flies.',
      'The fish swims.'
    ],
    exercises: [
      {
        id: 'aw1',
        type: 'multiple-choice',
        question: 'Which word is an action word?',
        options: ['happy', 'run', 'red'],
        correctAnswer: 'run',
        explanation: '"Run" is an action word (verb) - it tells what you do.'
      },
      {
        id: 'aw2',
        type: 'fill-blank',
        question: 'Complete: "I ___ to school." (move on foot)',
        options: ['run', 'walk', 'jump'],
        correctAnswer: 'walk',
        explanation: '"Walk" means to move on foot at a normal speed.'
      },
      {
        id: 'aw3',
        type: 'identify',
        question: 'Which sentence has an action word?',
        options: [
          'The cat is big.',
          'The cat runs.',
          'The cat is happy.'
        ],
        correctAnswer: 'The cat runs.',
        explanation: '"Runs" is an action word - it tells what the cat does.'
      }
    ],
    difficulty: 'beginner',
    icon: '🏃'
  },
  {
    id: 'opposites',
    title: 'Opposites',
    category: 'Vocabulary',
    description: 'Words that mean the opposite',
    explanation: 'Opposites are words with opposite meanings. Common opposites: big/small, hot/cold, happy/sad, up/down, in/out, fast/slow, good/bad, day/night, light/dark, young/old. Examples: "The elephant is big. The mouse is small."',
    examples: [
      'Big and small are opposites.',
      'Hot and cold are opposites.',
      'Happy and sad are opposites.',
      'Up and down are opposites.',
      'Fast and slow are opposites.',
      'Day and night are opposites.',
      'Good and bad are opposites.',
      'Light and dark are opposites.'
    ],
    exercises: [
      {
        id: 'opp1',
        type: 'multiple-choice',
        question: 'What is the opposite of "big"?',
        options: ['small', 'huge', 'large'],
        correctAnswer: 'small',
        explanation: 'The opposite of "big" is "small".'
      },
      {
        id: 'opp2',
        type: 'fill-blank',
        question: 'Complete: "Hot and ___ are opposites."',
        options: ['warm', 'cold', 'cool'],
        correctAnswer: 'cold',
        explanation: 'The opposite of "hot" is "cold".'
      },
      {
        id: 'opp3',
        type: 'identify',
        question: 'Which pair are opposites?',
        options: [
          'big and large',
          'big and small',
          'big and huge'
        ],
        correctAnswer: 'big and small',
        explanation: '"Big" and "small" have opposite meanings.'
      }
    ],
    difficulty: 'beginner',
    icon: '🔄'
  },
  {
    id: 'basic-adjectives',
    title: 'Describing Words (Adjectives)',
    category: 'Vocabulary',
    description: 'Words that describe things',
    explanation: 'Describing words (adjectives) tell us how things look, feel, or are. Common words: big, small, happy, sad, hot, cold, fast, slow, good, bad, pretty, ugly, new, old, clean, dirty. Use "is" or "are": "The cat is big." "The flowers are pretty."',
    examples: [
      'The cat is big.',
      'The flower is pretty.',
      'The ice cream is cold.',
      'The car is fast.',
      'The book is new.',
      'The room is clean.',
      'I am happy.',
      'She is kind.'
    ],
    exercises: [
      {
        id: 'adj1',
        type: 'multiple-choice',
        question: 'Which word describes how something looks?',
        options: ['run', 'big', 'quickly'],
        correctAnswer: 'big',
        explanation: '"Big" is a describing word (adjective) that tells size.'
      },
      {
        id: 'adj2',
        type: 'fill-blank',
        question: 'Complete: "The ice cream is ___." (not hot)',
        options: ['hot', 'cold', 'warm'],
        correctAnswer: 'cold',
        explanation: 'Ice cream is cold (not hot).'
      },
      {
        id: 'adj3',
        type: 'identify',
        question: 'Which sentence uses a describing word?',
        options: [
          'The cat runs.',
          'The cat is big.',
          'The cat quickly.'
        ],
        correctAnswer: 'The cat is big.',
        explanation: '"Big" is a describing word that tells about the cat.'
      }
    ],
    difficulty: 'beginner',
    icon: '✨'
  },
  {
    id: 'days-week',
    title: 'Days of the Week',
    category: 'Vocabulary',
    description: 'Learning the seven days',
    explanation: 'There are seven days in a week: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Monday is the first day of the school week. Sunday is the last day of the week. Use "on" with days: "on Monday", "on Friday".',
    examples: [
      'Monday is the first day of school.',
      'I go to school on Tuesday.',
      'Wednesday is in the middle of the week.',
      'Thursday comes after Wednesday.',
      'Friday is the last day of school.',
      'Saturday is a fun day.',
      'Sunday is a rest day.',
      'I play on weekends.'
    ],
    exercises: [
      {
        id: 'dw1',
        type: 'multiple-choice',
        question: 'What day comes after Monday?',
        options: ['Sunday', 'Tuesday', 'Wednesday'],
        correctAnswer: 'Tuesday',
        explanation: 'Tuesday comes after Monday.'
      },
      {
        id: 'dw2',
        type: 'fill-blank',
        question: 'Complete: "I go to school ___ Monday."',
        options: ['in', 'on', 'at'],
        correctAnswer: 'on',
        explanation: 'Use "on" with days: "on Monday".'
      },
      {
        id: 'dw3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I play on Saturday.',
          'I play in Saturday.',
          'I play at Saturday.'
        ],
        correctAnswer: 'I play on Saturday.',
        explanation: 'Use "on" with days of the week.'
      }
    ],
    difficulty: 'beginner',
    icon: '📆'
  },
  {
    id: 'months-year',
    title: 'Months of the Year',
    category: 'Vocabulary',
    description: 'Learning the twelve months',
    explanation: 'There are twelve months in a year: January, February, March, April, May, June, July, August, September, October, November, December. January is the first month. December is the last month. Use "in" with months: "in January", "in June".',
    examples: [
      'January is the first month.',
      'My birthday is in February.',
      'Spring starts in March.',
      'April has Easter.',
      'May has flowers.',
      'Summer starts in June.',
      'July is very hot.',
      'School starts in September.'
    ],
    exercises: [
      {
        id: 'my1',
        type: 'multiple-choice',
        question: 'What is the first month of the year?',
        options: ['January', 'February', 'March'],
        correctAnswer: 'January',
        explanation: 'January is the first month.'
      },
      {
        id: 'my2',
        type: 'fill-blank',
        question: 'Complete: "My birthday is ___ June."',
        options: ['in', 'on', 'at'],
        correctAnswer: 'in',
        explanation: 'Use "in" with months: "in June".'
      },
      {
        id: 'my3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'Christmas is in December.',
          'Christmas is on December.',
          'Christmas is at December.'
        ],
        correctAnswer: 'Christmas is in December.',
        explanation: 'Use "in" with months: "in December".'
      }
    ],
    difficulty: 'beginner',
    icon: '🗓️'
  },
  {
    id: 'present-continuous',
    title: 'Present Continuous Tense',
    category: 'Verb Tenses',
    description: 'Talking about things happening right now',
    explanation: 'Present continuous (also called present progressive) is used to talk about things happening right now or around now. Use "am/is/are" + verb + -ing. Example: "I am reading" (happening now), "She is playing" (happening now).',
    examples: [
      'I am reading a book right now.',
      'She is playing soccer.',
      'They are eating lunch.',
      'He is studying for the test.',
      'We are watching a movie.',
      'The cat is sleeping.',
      'I am writing a letter.',
      'She is cooking dinner.',
      'They are talking on the phone.',
      'He is running in the park.',
      'We are learning English.',
      'The birds are flying.'
    ],
    exercises: [
      {
        id: 'pc1',
        type: 'multiple-choice',
        question: 'Which sentence is in present continuous?',
        options: [
          'I read books.',
          'I am reading a book.',
          'I will read a book.'
        ],
        correctAnswer: 'I am reading a book.',
        explanation: 'Present continuous uses "am/is/are" + verb + -ing.'
      },
      {
        id: 'pc2',
        type: 'fill-blank',
        question: 'Complete: "She ___ soccer right now." (play)',
        options: ['play', 'plays', 'is playing'],
        correctAnswer: 'is playing',
        explanation: 'Present continuous: "is" + "playing" (verb + -ing).'
      },
      {
        id: 'pc3',
        type: 'identify',
        question: 'Which sentence uses present continuous correctly?',
        options: [
          'I am read a book.',
          'I am reading a book.',
          'I reading a book.'
        ],
        correctAnswer: 'I am reading a book.',
        explanation: 'Present continuous needs "am/is/are" + verb + -ing.'
      },
      {
        id: 'pc4',
        type: 'multiple-choice',
        question: 'Complete: "They ___ to music." (listen)',
        options: ['listen', 'are listening', 'listened'],
        correctAnswer: 'are listening',
        explanation: 'Present continuous: "are" + "listening" (verb + -ing).'
      },
      {
        id: 'pc5',
        type: 'fill-blank',
        question: 'Complete: "The dog ___ in the garden." (run)',
        options: ['run', 'runs', 'is running'],
        correctAnswer: 'is running',
        explanation: 'Present continuous: "is" + "running" (verb + -ing).'
      },
      {
        id: 'pc6',
        type: 'identify',
        question: 'When do we use present continuous?',
        options: [
          'For things that happen always.',
          'For things happening right now.',
          'For things that happened yesterday.'
        ],
        correctAnswer: 'For things happening right now.',
        explanation: 'Present continuous is used for actions happening at the moment of speaking.'
      }
    ],
    difficulty: 'intermediate',
    icon: '⏳'
  },
  {
    id: 'past-continuous',
    title: 'Past Continuous Tense',
    category: 'Verb Tenses',
    description: 'Talking about things that were happening in the past',
    explanation: 'Past continuous is used to talk about things that were happening at a specific time in the past. Use "was/were" + verb + -ing. Example: "I was reading" (was happening in the past), "They were playing" (were happening in the past).',
    examples: [
      'I was reading when you called.',
      'She was playing soccer at 3 PM.',
      'They were eating lunch when it started raining.',
      'He was studying all night.',
      'We were watching a movie yesterday.',
      'The cat was sleeping when I arrived.',
      'I was writing a letter at that time.',
      'She was cooking dinner when the phone rang.',
      'They were talking when I saw them.',
      'He was running in the park.',
      'We were learning English last year.',
      'The birds were flying in the sky.'
    ],
    exercises: [
      {
        id: 'pasc1',
        type: 'multiple-choice',
        question: 'Which sentence is in past continuous?',
        options: [
          'I read a book.',
          'I was reading a book.',
          'I will read a book.'
        ],
        correctAnswer: 'I was reading a book.',
        explanation: 'Past continuous uses "was/were" + verb + -ing.'
      },
      {
        id: 'pasc2',
        type: 'fill-blank',
        question: 'Complete: "She ___ soccer at 3 PM." (play)',
        options: ['played', 'was playing', 'plays'],
        correctAnswer: 'was playing',
        explanation: 'Past continuous: "was" + "playing" (verb + -ing).'
      },
      {
        id: 'pasc3',
        type: 'identify',
        question: 'Which sentence uses past continuous correctly?',
        options: [
          'I was read a book.',
          'I was reading a book.',
          'I reading a book.'
        ],
        correctAnswer: 'I was reading a book.',
        explanation: 'Past continuous needs "was/were" + verb + -ing.'
      },
      {
        id: 'pasc4',
        type: 'multiple-choice',
        question: 'Complete: "They ___ to music when I arrived." (listen)',
        options: ['listened', 'were listening', 'listen'],
        correctAnswer: 'were listening',
        explanation: 'Past continuous: "were" + "listening" (verb + -ing).'
      },
      {
        id: 'pasc5',
        type: 'fill-blank',
        question: 'Complete: "The dog ___ in the garden." (run - past)',
        options: ['ran', 'was running', 'runs'],
        correctAnswer: 'was running',
        explanation: 'Past continuous: "was" + "running" (verb + -ing).'
      },
      {
        id: 'pasc6',
        type: 'identify',
        question: 'When do we use past continuous?',
        options: [
          'For things happening now.',
          'For things that were happening in the past.',
          'For things that will happen.'
        ],
        correctAnswer: 'For things that were happening in the past.',
        explanation: 'Past continuous is used for actions that were in progress at a specific time in the past.'
      }
    ],
    difficulty: 'intermediate',
    icon: '⏪'
  },
  {
    id: 'future-tense',
    title: 'Future Tense (Will and Going to)',
    category: 'Verb Tenses',
    description: 'Talking about things that will happen',
    explanation: 'Future tense talks about things that will happen later. Use "will" + verb or "be going to" + verb. "Will" is for decisions made now or predictions. "Going to" is for plans or things we can see will happen. Example: "I will go" or "I am going to go".',
    examples: [
      'I will help you tomorrow.',
      'She is going to visit her friend.',
      'They will come to the party.',
      'He is going to study tonight.',
      'We will finish our homework.',
      'The weather will be nice tomorrow.',
      'I am going to buy a new book.',
      'She will call you later.',
      'They are going to travel next month.',
      'He will be here soon.',
      'We are going to have a test.',
      'It will rain tomorrow.'
    ],
    exercises: [
      {
        id: 'ft1',
        type: 'multiple-choice',
        question: 'Which sentence shows future tense?',
        options: [
          'I go to school.',
          'I will go to school.',
          'I went to school.'
        ],
        correctAnswer: 'I will go to school.',
        explanation: '"Will" + verb shows future tense.'
      },
      {
        id: 'ft2',
        type: 'fill-blank',
        question: 'Complete: "She ___ visit her friend tomorrow." (plan)',
        options: ['will', 'is going to', 'went'],
        correctAnswer: 'is going to',
        explanation: '"Going to" is used for plans.'
      },
      {
        id: 'ft3',
        type: 'identify',
        question: 'Which sentence uses future tense correctly?',
        options: [
          'I will helps you.',
          'I will help you.',
          'I will helping you.'
        ],
        correctAnswer: 'I will help you.',
        explanation: 'After "will", use the base form of the verb (help, not helps or helping).'
      },
      {
        id: 'ft4',
        type: 'multiple-choice',
        question: 'Complete: "They ___ come to the party." (decision)',
        options: ['will', 'are going to', 'came'],
        correctAnswer: 'will',
        explanation: '"Will" is used for decisions made at the moment.'
      },
      {
        id: 'ft5',
        type: 'fill-blank',
        question: 'Complete: "I ___ study tonight." (plan)',
        options: ['will', 'am going to', 'studied'],
        correctAnswer: 'am going to',
        explanation: '"Going to" is used for plans or intentions.'
      },
      {
        id: 'ft6',
        type: 'identify',
        question: 'Which sentence shows a prediction?',
        options: [
          'I will help you.',
          'It will rain tomorrow.',
          'I am going to help you.'
        ],
        correctAnswer: 'It will rain tomorrow.',
        explanation: '"Will" is used for predictions about the future.'
      }
    ],
    difficulty: 'intermediate',
    icon: '🔮'
  },
  {
    id: 'present-perfect',
    title: 'Present Perfect Tense',
    category: 'Verb Tenses',
    description: 'Talking about past actions with present results',
    explanation: 'Present perfect connects the past to the present. Use "have/has" + past participle. It shows actions that happened before now but are still important. Example: "I have finished" (finished in the past, but important now), "She has eaten" (ate before, but relevant now).',
    examples: [
      'I have finished my homework.',
      'She has eaten lunch.',
      'They have visited Paris.',
      'He has read that book.',
      'We have seen that movie.',
      'The cat has slept all day.',
      'I have lived here for five years.',
      'She has known him since childhood.',
      'They have worked here for a long time.',
      'He has been to Japan.',
      'We have learned many things.',
      'It has rained today.'
    ],
    exercises: [
      {
        id: 'pp1',
        type: 'multiple-choice',
        question: 'Which sentence is in present perfect?',
        options: [
          'I finished my homework.',
          'I have finished my homework.',
          'I will finish my homework.'
        ],
        correctAnswer: 'I have finished my homework.',
        explanation: 'Present perfect uses "have/has" + past participle.'
      },
      {
        id: 'pp2',
        type: 'fill-blank',
        question: 'Complete: "She ___ eaten lunch."',
        options: ['has', 'have', 'had'],
        correctAnswer: 'has',
        explanation: 'Use "has" with "she" (singular).'
      },
      {
        id: 'pp3',
        type: 'identify',
        question: 'Which sentence uses present perfect correctly?',
        options: [
          'I have finish my homework.',
          'I have finished my homework.',
          'I have finishing my homework.'
        ],
        correctAnswer: 'I have finished my homework.',
        explanation: 'Present perfect uses "have" + past participle (finished).'
      },
      {
        id: 'pp4',
        type: 'multiple-choice',
        question: 'Complete: "They ___ visited Paris."',
        options: ['has', 'have', 'had'],
        correctAnswer: 'have',
        explanation: 'Use "have" with "they" (plural).'
      },
      {
        id: 'pp5',
        type: 'fill-blank',
        question: 'Complete: "He ___ read that book."',
        options: ['has', 'have', 'had'],
        correctAnswer: 'has',
        explanation: 'Use "has" with "he" (singular).'
      },
      {
        id: 'pp6',
        type: 'identify',
        question: 'When do we use present perfect?',
        options: [
          'For things happening now.',
          'For past actions that are still important now.',
          'For things that will happen.'
        ],
        correctAnswer: 'For past actions that are still important now.',
        explanation: 'Present perfect connects past actions to the present.'
      }
    ],
    difficulty: 'intermediate',
    icon: '✅'
  },
  {
    id: 'irregular-verbs',
    title: 'Irregular Verbs',
    category: 'Verb Forms',
    description: 'Verbs that don\'t follow the -ed rule',
    explanation: 'Irregular verbs don\'t add -ed to make past tense. They change completely. Examples: go → went, see → saw, eat → ate, do → did, have → had, be → was/were. You need to memorize these special forms!',
    examples: [
      'Present: go → Past: went → Past participle: gone',
      'Present: see → Past: saw → Past participle: seen',
      'Present: eat → Past: ate → Past participle: eaten',
      'Present: do → Past: did → Past participle: done',
      'Present: have → Past: had → Past participle: had',
      'Present: be → Past: was/were → Past participle: been',
      'I go to school. → I went to school yesterday.',
      'I see a bird. → I saw a bird yesterday.',
      'I eat pizza. → I ate pizza yesterday.',
      'I do homework. → I did homework yesterday.',
      'I have a cat. → I had a cat last year.',
      'I am happy. → I was happy yesterday.'
    ],
    exercises: [
      {
        id: 'iv1',
        type: 'multiple-choice',
        question: 'What is the past tense of "go"?',
        options: ['goed', 'went', 'goes'],
        correctAnswer: 'went',
        explanation: '"Go" is irregular. Past tense is "went" (not "goed").'
      },
      {
        id: 'iv2',
        type: 'fill-blank',
        question: 'Complete: "I ___ a movie yesterday." (see)',
        options: ['see', 'saw', 'seen'],
        correctAnswer: 'saw',
        explanation: '"See" is irregular. Past tense is "saw".'
      },
      {
        id: 'iv3',
        type: 'identify',
        question: 'Which is the past tense of "eat"?',
        options: ['eated', 'ate', 'eaten'],
        correctAnswer: 'ate',
        explanation: '"Eat" is irregular. Past tense is "ate" (not "eated").'
      },
      {
        id: 'iv4',
        type: 'multiple-choice',
        question: 'What is the past tense of "do"?',
        options: ['doed', 'did', 'done'],
        correctAnswer: 'did',
        explanation: '"Do" is irregular. Past tense is "did" (not "doed").'
      },
      {
        id: 'iv5',
        type: 'fill-blank',
        question: 'Complete: "I ___ my homework yesterday." (do)',
        options: ['do', 'did', 'done'],
        correctAnswer: 'did',
        explanation: '"Do" is irregular. Past tense is "did".'
      },
      {
        id: 'iv6',
        type: 'identify',
        question: 'Which sentence uses irregular verb correctly?',
        options: [
          'I goed to school.',
          'I went to school.',
          'I go to school yesterday.'
        ],
        correctAnswer: 'I went to school.',
        explanation: '"Go" is irregular - past tense is "went" (not "goed").'
      }
    ],
    difficulty: 'intermediate',
    icon: '🔄'
  },
  {
    id: 'countable-uncountable',
    title: 'Countable and Uncountable Nouns',
    category: 'Nouns',
    description: 'Nouns you can count vs nouns you can\'t count',
    explanation: 'Countable nouns are things you can count (one apple, two apples). Use "a/an" and make them plural. Uncountable nouns are things you can\'t count (water, rice, information). Don\'t use "a/an" and don\'t make them plural. Use "some" or "much" with uncountable nouns.',
    examples: [
      'Countable: an apple, two apples, three books, many cats',
      'Uncountable: water, rice, information, advice, money',
      'I have an apple. (countable - one)',
      'I have some water. (uncountable - can\'t count)',
      'There are many books. (countable - plural)',
      'There is much information. (uncountable - no plural)',
      'I want a cookie. (countable)',
      'I want some milk. (uncountable)',
      'She has three dogs. (countable)',
      'She has some rice. (uncountable)',
      'We need many chairs. (countable)',
      'We need some furniture. (uncountable)'
    ],
    exercises: [
      {
        id: 'cu1',
        type: 'multiple-choice',
        question: 'Which is a countable noun?',
        options: ['water', 'apple', 'rice'],
        correctAnswer: 'apple',
        explanation: 'Apple is countable - you can count apples (one apple, two apples).'
      },
      {
        id: 'cu2',
        type: 'fill-blank',
        question: 'Complete: "I want ___ water." (uncountable)',
        options: ['a', 'an', 'some'],
        correctAnswer: 'some',
        explanation: 'Use "some" with uncountable nouns like water.'
      },
      {
        id: 'cu3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I have a rice.',
          'I have some rice.',
          'I have rices.'
        ],
        correctAnswer: 'I have some rice.',
        explanation: 'Rice is uncountable - use "some" and no plural form.'
      },
      {
        id: 'cu4',
        type: 'multiple-choice',
        question: 'Which is an uncountable noun?',
        options: ['book', 'water', 'cat'],
        correctAnswer: 'water',
        explanation: 'Water is uncountable - you can\'t count water (not "one water, two waters").'
      },
      {
        id: 'cu5',
        type: 'fill-blank',
        question: 'Complete: "I have ___ apple." (countable)',
        options: ['a', 'some', 'many'],
        correctAnswer: 'a',
        explanation: 'Use "a/an" with countable nouns (one apple).'
      },
      {
        id: 'cu6',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I have many informations.',
          'I have much information.',
          'I have an information.'
        ],
        correctAnswer: 'I have much information.',
        explanation: 'Information is uncountable - use "much" and no plural.'
      }
    ],
    difficulty: 'intermediate',
    icon: '🔢'
  },
  {
    id: 'much-many',
    title: 'Much, Many, A lot of',
    category: 'Quantifiers',
    description: 'Talking about quantities',
    explanation: 'Use "many" with countable nouns (many books, many cats). Use "much" with uncountable nouns (much water, much time). Use "a lot of" with both countable and uncountable nouns (a lot of books, a lot of water). "Much" and "many" are often used in questions and negative sentences.',
    examples: [
      'I have many books. (countable)',
      'I don\'t have much time. (uncountable)',
      'I have a lot of friends. (countable)',
      'I have a lot of water. (uncountable)',
      'How many apples do you want? (countable)',
      'How much water do you need? (uncountable)',
      'There are many students. (countable)',
      'There isn\'t much sugar. (uncountable)',
      'She has a lot of toys. (countable)',
      'He drinks a lot of water. (uncountable)',
      'We don\'t have many cookies. (countable)',
      'We don\'t have much money. (uncountable)'
    ],
    exercises: [
      {
        id: 'mm1',
        type: 'multiple-choice',
        question: 'Complete: "I have ___ books." (countable)',
        options: ['much', 'many', 'a lot'],
        correctAnswer: 'many',
        explanation: 'Use "many" with countable nouns (books).'
      },
      {
        id: 'mm2',
        type: 'fill-blank',
        question: 'Complete: "I don\'t have ___ time." (uncountable)',
        options: ['many', 'much', 'a lot'],
        correctAnswer: 'much',
        explanation: 'Use "much" with uncountable nouns (time).'
      },
      {
        id: 'mm3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I have many water.',
          'I have much water.',
          'I have many waters.'
        ],
        correctAnswer: 'I have much water.',
        explanation: 'Use "much" with uncountable nouns like water.'
      },
      {
        id: 'mm4',
        type: 'multiple-choice',
        question: 'Complete: "I have ___ friends." (countable)',
        options: ['much', 'many', 'a lot'],
        correctAnswer: 'many',
        explanation: 'Use "many" with countable nouns (friends).'
      },
      {
        id: 'mm5',
        type: 'fill-blank',
        question: 'Complete: "I have ___ of toys." (both countable and uncountable)',
        options: ['much', 'many', 'a lot'],
        correctAnswer: 'a lot',
        explanation: '"A lot of" works with both countable and uncountable nouns.'
      },
      {
        id: 'mm6',
        type: 'identify',
        question: 'Which question is correct?',
        options: [
          'How many water do you need?',
          'How much water do you need?',
          'How many waters do you need?'
        ],
        correctAnswer: 'How much water do you need?',
        explanation: 'Use "how much" with uncountable nouns (water).'
      }
    ],
    difficulty: 'intermediate',
    icon: '📊'
  },
  {
    id: 'some-any',
    title: 'Some and Any',
    category: 'Quantifiers',
    description: 'Using some and any correctly',
    explanation: 'Use "some" in positive sentences (I have some books). Use "any" in negative sentences and questions (I don\'t have any books. Do you have any books?). "Some" means "a few" or "a little". "Any" means "one or more" or "none".',
    examples: [
      'I have some books. (positive)',
      'I don\'t have any books. (negative)',
      'Do you have any books? (question)',
      'She wants some water. (positive)',
      'She doesn\'t want any water. (negative)',
      'Do they have any friends? (question)',
      'I need some help. (positive)',
      'I don\'t need any help. (negative)',
      'Is there any milk? (question)',
      'There is some milk. (positive)',
      'There isn\'t any milk. (negative)',
      'Can I have some cookies? (question - polite request)'
    ],
    exercises: [
      {
        id: 'sa1',
        type: 'multiple-choice',
        question: 'Complete: "I have ___ books." (positive)',
        options: ['some', 'any', 'much'],
        correctAnswer: 'some',
        explanation: 'Use "some" in positive sentences.'
      },
      {
        id: 'sa2',
        type: 'fill-blank',
        question: 'Complete: "I don\'t have ___ books." (negative)',
        options: ['some', 'any', 'much'],
        correctAnswer: 'any',
        explanation: 'Use "any" in negative sentences.'
      },
      {
        id: 'sa3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'Do you have some books?',
          'Do you have any books?',
          'Do you have much books?'
        ],
        correctAnswer: 'Do you have any books?',
        explanation: 'Use "any" in questions (except polite requests).'
      },
      {
        id: 'sa4',
        type: 'multiple-choice',
        question: 'Complete: "Can I have ___ water?" (polite request)',
        options: ['some', 'any', 'much'],
        correctAnswer: 'some',
        explanation: 'Use "some" in polite requests (Can I have some...?).'
      },
      {
        id: 'sa5',
        type: 'fill-blank',
        question: 'Complete: "There isn\'t ___ milk." (negative)',
        options: ['some', 'any', 'much'],
        correctAnswer: 'any',
        explanation: 'Use "any" in negative sentences.'
      },
      {
        id: 'sa6',
        type: 'identify',
        question: 'Which sentence uses "some" correctly?',
        options: [
          'I don\'t have some money.',
          'I have some money.',
          'Do you have some money?'
        ],
        correctAnswer: 'I have some money.',
        explanation: 'Use "some" in positive sentences.'
      }
    ],
    difficulty: 'intermediate',
    icon: '📦'
  },
  {
    id: 'too-enough',
    title: 'Too and Enough',
    category: 'Adverbs',
    description: 'Expressing too much or sufficient amount',
    explanation: '"Too" means more than needed or wanted (too hot = hotter than I want). "Enough" means sufficient or adequate (enough money = sufficient money). Use "too" + adjective (too big). Use "adjective + enough" (big enough).',
    examples: [
      'This coffee is too hot. (hotter than I want)',
      'This coffee is hot enough. (sufficiently hot)',
      'I am too tired to go out. (more tired than I want)',
      'I am strong enough to lift it. (sufficiently strong)',
      'The box is too heavy. (heavier than I can handle)',
      'The box is light enough. (sufficiently light)',
      'She is too young to drive. (younger than allowed)',
      'She is old enough to drive. (sufficiently old)',
      'It\'s too cold outside. (colder than comfortable)',
      'It\'s warm enough. (sufficiently warm)',
      'The test is too difficult. (more difficult than I can handle)',
      'The test is easy enough. (sufficiently easy)'
    ],
    exercises: [
      {
        id: 'te1',
        type: 'multiple-choice',
        question: 'Complete: "This coffee is ___ hot." (more than I want)',
        options: ['too', 'enough', 'very'],
        correctAnswer: 'too',
        explanation: '"Too" means more than needed or wanted.'
      },
      {
        id: 'te2',
        type: 'fill-blank',
        question: 'Complete: "I am strong ___ to lift it." (sufficiently)',
        options: ['too', 'enough', 'very'],
        correctAnswer: 'enough',
        explanation: '"Enough" means sufficient - place it after the adjective.'
      },
      {
        id: 'te3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I am too tired to go out.',
          'I am tired too to go out.',
          'I am tired to go out too.'
        ],
        correctAnswer: 'I am too tired to go out.',
        explanation: '"Too" comes before the adjective (too tired).'
      },
      {
        id: 'te4',
        type: 'multiple-choice',
        question: 'Complete: "She is ___ young to drive." (more than allowed)',
        options: ['too', 'enough', 'very'],
        correctAnswer: 'too',
        explanation: '"Too" means more than needed or allowed.'
      },
      {
        id: 'te5',
        type: 'fill-blank',
        question: 'Complete: "The box is light ___ to carry." (sufficiently)',
        options: ['too', 'enough', 'very'],
        correctAnswer: 'enough',
        explanation: '"Enough" comes after the adjective (light enough).'
      },
      {
        id: 'te6',
        type: 'identify',
        question: 'Which sentence shows something is sufficient?',
        options: [
          'It\'s too cold.',
          'It\'s cold enough.',
          'It\'s very cold.'
        ],
        correctAnswer: 'It\'s cold enough.',
        explanation: '"Enough" means sufficient or adequate.'
      }
    ],
    difficulty: 'intermediate',
    icon: '⚖️'
  },
  {
    id: 'so-because',
    title: 'So and Because',
    category: 'Conjunctions',
    description: 'Showing results and reasons',
    explanation: '"Because" shows the reason (why something happens). "So" shows the result (what happens because of something). "Because" comes before the reason. "So" comes before the result. Example: "I was tired because I worked hard" (reason). "I worked hard, so I was tired" (result).',
    examples: [
      'I was tired because I worked hard. (reason)',
      'I worked hard, so I was tired. (result)',
      'She stayed home because it was raining. (reason)',
      'It was raining, so she stayed home. (result)',
      'He was happy because he passed the test. (reason)',
      'He passed the test, so he was happy. (result)',
      'I ate because I was hungry. (reason)',
      'I was hungry, so I ate. (result)',
      'She studied because she wanted good grades. (reason)',
      'She wanted good grades, so she studied. (result)',
      'They left because it was late. (reason)',
      'It was late, so they left. (result)'
    ],
    exercises: [
      {
        id: 'sb1',
        type: 'multiple-choice',
        question: 'Which word shows the reason?',
        options: ['so', 'because', 'and'],
        correctAnswer: 'because',
        explanation: '"Because" shows the reason (why something happens).'
      },
      {
        id: 'sb2',
        type: 'fill-blank',
        question: 'Complete: "I was tired ___ I worked hard." (reason)',
        options: ['so', 'because', 'and'],
        correctAnswer: 'because',
        explanation: '"Because" shows the reason (why I was tired).'
      },
      {
        id: 'sb3',
        type: 'identify',
        question: 'Which sentence shows a result?',
        options: [
          'I was tired because I worked hard.',
          'I worked hard, so I was tired.',
          'I worked hard and I was tired.'
        ],
        correctAnswer: 'I worked hard, so I was tired.',
        explanation: '"So" shows the result (what happened because I worked hard).'
      },
      {
        id: 'sb4',
        type: 'multiple-choice',
        question: 'Complete: "It was raining, ___ I took an umbrella." (result)',
        options: ['so', 'because', 'and'],
        correctAnswer: 'so',
        explanation: '"So" shows the result (what I did because it was raining).'
      },
      {
        id: 'sb5',
        type: 'fill-blank',
        question: 'Complete: "She stayed home ___ it was raining." (reason)',
        options: ['so', 'because', 'and'],
        correctAnswer: 'because',
        explanation: '"Because" shows the reason (why she stayed home).'
      },
      {
        id: 'sb6',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I was happy because I passed the test.',
          'I was happy so I passed the test.',
          'I was happy and I passed the test.'
        ],
        correctAnswer: 'I was happy because I passed the test.',
        explanation: '"Because" shows the reason (why I was happy).'
      }
    ],
    difficulty: 'intermediate',
    icon: '🔗'
  },
  {
    id: 'although-even-though',
    title: 'Although and Even Though',
    category: 'Conjunctions',
    description: 'Showing contrast or opposition',
    explanation: '"Although" and "even though" show contrast - they connect two ideas that seem opposite. They mean "in spite of" or "despite". Example: "Although it was raining, we went outside" (it was raining, but we still went). Both mean the same thing, but "even though" is stronger.',
    examples: [
      'Although it was raining, we went outside.',
      'Even though it was late, I finished my homework.',
      'Although she was tired, she kept working.',
      'Even though he is young, he is very smart.',
      'Although I studied hard, I didn\'t pass.',
      'Even though it was difficult, we succeeded.',
      'Although the movie was long, it was interesting.',
      'Even though she doesn\'t like math, she studies it.',
      'Although he is rich, he is not happy.',
      'Even though it was cold, we went swimming.',
      'Although I was hungry, I didn\'t eat.',
      'Even though she was scared, she tried it.'
    ],
    exercises: [
      {
        id: 'aet1',
        type: 'multiple-choice',
        question: 'Which word shows contrast?',
        options: ['because', 'although', 'so'],
        correctAnswer: 'although',
        explanation: '"Although" shows contrast (opposite ideas).'
      },
      {
        id: 'aet2',
        type: 'fill-blank',
        question: 'Complete: "___ it was raining, we went outside." (contrast)',
        options: ['Because', 'Although', 'So'],
        correctAnswer: 'Although',
        explanation: '"Although" shows contrast (it was raining, but we still went).'
      },
      {
        id: 'aet3',
        type: 'identify',
        question: 'Which sentence shows contrast?',
        options: [
          'I was happy because I passed.',
          'Although I studied, I didn\'t pass.',
          'I studied, so I passed.'
        ],
        correctAnswer: 'Although I studied, I didn\'t pass.',
        explanation: '"Although" shows contrast (I studied, but still didn\'t pass).'
      },
      {
        id: 'aet4',
        type: 'multiple-choice',
        question: 'Which is stronger?',
        options: ['although', 'even though', 'they are the same'],
        correctAnswer: 'even though',
        explanation: '"Even though" is stronger than "although" but means the same.'
      },
      {
        id: 'aet5',
        type: 'fill-blank',
        question: 'Complete: "___ it was difficult, we succeeded." (strong contrast)',
        options: ['Because', 'Even though', 'So'],
        correctAnswer: 'Even though',
        explanation: '"Even though" shows strong contrast.'
      },
      {
        id: 'aet6',
        type: 'identify',
        question: 'Which sentence uses contrast correctly?',
        options: [
          'Although it was sunny, we went outside.',
          'Although it was sunny, so we went outside.',
          'Although it was sunny, because we went outside.'
        ],
        correctAnswer: 'Although it was sunny, we went outside.',
        explanation: '"Although" shows contrast - don\'t use "so" or "because" with it.'
      }
    ],
    difficulty: 'intermediate',
    icon: '🔄'
  },
  {
    id: 'while-during',
    title: 'While and During',
    category: 'Prepositions',
    description: 'Talking about time when something happens',
    explanation: '"While" is used with a subject and verb (while I was studying). "During" is used with a noun (during the class). Both mean "at the same time as". "While" shows two actions happening together. "During" shows when something happens in a period of time.',
    examples: [
      'I studied while my sister was sleeping. (two actions)',
      'I studied during the class. (period of time)',
      'She called while I was eating. (two actions)',
      'She called during dinner. (period of time)',
      'He read while I was writing. (two actions)',
      'He read during the lesson. (period of time)',
      'We talked while walking. (two actions)',
      'We talked during the walk. (period of time)',
      'The phone rang while I was showering. (two actions)',
      'The phone rang during my shower. (period of time)',
      'I fell asleep while watching TV. (two actions)',
      'I fell asleep during the movie. (period of time)'
    ],
    exercises: [
      {
        id: 'wd1',
        type: 'multiple-choice',
        question: 'Complete: "I studied ___ my sister was sleeping."',
        options: ['while', 'during', 'when'],
        correctAnswer: 'while',
        explanation: 'Use "while" with a subject and verb (while + subject + verb).'
      },
      {
        id: 'wd2',
        type: 'fill-blank',
        question: 'Complete: "I studied ___ the class." (period of time)',
        options: ['while', 'during', 'when'],
        correctAnswer: 'during',
        explanation: 'Use "during" with a noun (during + noun).'
      },
      {
        id: 'wd3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I called while the dinner.',
          'I called during the dinner.',
          'I called while during dinner.'
        ],
        correctAnswer: 'I called during the dinner.',
        explanation: 'Use "during" with a noun (the dinner).'
      },
      {
        id: 'wd4',
        type: 'multiple-choice',
        question: 'Complete: "She read ___ I was writing."',
        options: ['while', 'during', 'when'],
        correctAnswer: 'while',
        explanation: 'Use "while" with subject + verb (I was writing).'
      },
      {
        id: 'wd5',
        type: 'fill-blank',
        question: 'Complete: "The phone rang ___ my shower." (period)',
        options: ['while', 'during', 'when'],
        correctAnswer: 'during',
        explanation: 'Use "during" with a noun (my shower).'
      },
      {
        id: 'wd6',
        type: 'identify',
        question: 'Which sentence uses "while" correctly?',
        options: [
          'I studied while the class.',
          'I studied while I was in class.',
          'I studied during I was in class.'
        ],
        correctAnswer: 'I studied while I was in class.',
        explanation: 'Use "while" with subject + verb (I was in class).'
      }
    ],
    difficulty: 'intermediate',
    icon: '⏱️'
  },
  {
    id: 'for-since',
    title: 'For and Since',
    category: 'Prepositions',
    description: 'Talking about how long something has been happening',
    explanation: '"For" shows a period of time (for 5 years, for 2 hours, for a week). "Since" shows when something started (since 2020, since Monday, since I was a child). Use "for" with present perfect to show duration. Use "since" to show the starting point.',
    examples: [
      'I have lived here for 5 years. (period of time)',
      'I have lived here since 2020. (starting point)',
      'She has studied for 2 hours. (period)',
      'She has studied since 3 PM. (starting point)',
      'We have been friends for a long time. (period)',
      'We have been friends since childhood. (starting point)',
      'He has worked here for 10 years. (period)',
      'He has worked here since 2014. (starting point)',
      'I have known her for 3 months. (period)',
      'I have known her since January. (starting point)',
      'They have been married for 20 years. (period)',
      'They have been married since 2004. (starting point)'
    ],
    exercises: [
      {
        id: 'fs1',
        type: 'multiple-choice',
        question: 'Complete: "I have lived here ___ 5 years." (period)',
        options: ['for', 'since', 'during'],
        correctAnswer: 'for',
        explanation: 'Use "for" with a period of time (5 years).'
      },
      {
        id: 'fs2',
        type: 'fill-blank',
        question: 'Complete: "I have lived here ___ 2020." (starting point)',
        options: ['for', 'since', 'during'],
        correctAnswer: 'since',
        explanation: 'Use "since" with a starting point (2020).'
      },
      {
        id: 'fs3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I have studied for 2 hours.',
          'I have studied since 2 hours.',
          'I have studied during 2 hours.'
        ],
        correctAnswer: 'I have studied for 2 hours.',
        explanation: 'Use "for" with a period of time (2 hours).'
      },
      {
        id: 'fs4',
        type: 'multiple-choice',
        question: 'Complete: "She has worked here ___ Monday." (starting point)',
        options: ['for', 'since', 'during'],
        correctAnswer: 'since',
        explanation: 'Use "since" with a starting point (Monday).'
      },
      {
        id: 'fs5',
        type: 'fill-blank',
        question: 'Complete: "We have been friends ___ a long time." (period)',
        options: ['for', 'since', 'during'],
        correctAnswer: 'for',
        explanation: 'Use "for" with a period of time (a long time).'
      },
      {
        id: 'fs6',
        type: 'identify',
        question: 'Which sentence uses "since" correctly?',
        options: [
          'I have known her for January.',
          'I have known her since January.',
          'I have known her during January.'
        ],
        correctAnswer: 'I have known her since January.',
        explanation: 'Use "since" with a starting point (January).'
      }
    ],
    difficulty: 'intermediate',
    icon: '📅'
  },
  {
    id: 'have-has',
    title: 'Have and Has',
    category: 'Verb Forms',
    description: 'Using have and has correctly',
    explanation: 'Use "have" with I, you, we, they (plural subjects). Use "has" with he, she, it (singular subjects). "Have" and "has" can show possession (I have a cat) or be used in perfect tenses (I have finished). Always match "have/has" to the subject!',
    examples: [
      'I have a cat. (I)',
      'You have a dog. (you)',
      'He has a bike. (he)',
      'She has a book. (she)',
      'It has a tail. (it)',
      'We have friends. (we)',
      'They have toys. (they)',
      'I have finished my homework. (perfect tense)',
      'She has eaten lunch. (perfect tense)',
      'They have visited Paris. (perfect tense)',
      'He has been to Japan. (perfect tense)',
      'We have learned English. (perfect tense)'
    ],
    exercises: [
      {
        id: 'hh1',
        type: 'multiple-choice',
        question: 'Complete: "I ___ a cat."',
        options: ['have', 'has', 'had'],
        correctAnswer: 'have',
        explanation: 'Use "have" with "I" (first person).'
      },
      {
        id: 'hh2',
        type: 'fill-blank',
        question: 'Complete: "She ___ a book."',
        options: ['have', 'has', 'had'],
        correctAnswer: 'has',
        explanation: 'Use "has" with "she" (third person singular).'
      },
      {
        id: 'hh3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'They has a dog.',
          'They have a dog.',
          'They have a dogs.'
        ],
        correctAnswer: 'They have a dog.',
        explanation: 'Use "have" with "they" (plural).'
      },
      {
        id: 'hh4',
        type: 'multiple-choice',
        question: 'Complete: "We ___ finished our homework."',
        options: ['have', 'has', 'had'],
        correctAnswer: 'have',
        explanation: 'Use "have" with "we" (plural).'
      },
      {
        id: 'hh5',
        type: 'fill-blank',
        question: 'Complete: "He ___ eaten lunch."',
        options: ['have', 'has', 'had'],
        correctAnswer: 'has',
        explanation: 'Use "has" with "he" (third person singular).'
      },
      {
        id: 'hh6',
        type: 'identify',
        question: 'Which sentence uses "has" correctly?',
        options: [
          'I has a cat.',
          'She has a cat.',
          'They has a cat.'
        ],
        correctAnswer: 'She has a cat.',
        explanation: 'Use "has" with "she" (third person singular).'
      }
    ],
    difficulty: 'intermediate',
    icon: '✅'
  },
  {
    id: 'there-is-are',
    title: 'There is and There are',
    category: 'Sentence Structure',
    description: 'Talking about what exists',
    explanation: 'Use "there is" for one thing (there is a book). Use "there are" for many things (there are books). "There is/are" tells us what exists somewhere. Use "is" with singular nouns. Use "are" with plural nouns.',
    examples: [
      'There is a book on the table. (one thing)',
      'There are books on the table. (many things)',
      'There is a cat in the garden. (one)',
      'There are cats in the garden. (many)',
      'There is some water in the bottle. (uncountable)',
      'There are many students in class. (many)',
      'There is a problem. (one)',
      'There are problems. (many)',
      'There is an apple in the basket. (one)',
      'There are apples in the basket. (many)',
      'There is much information. (uncountable)',
      'There are many books. (many)'
    ],
    exercises: [
      {
        id: 'tia1',
        type: 'multiple-choice',
        question: 'Complete: "___ a book on the table."',
        options: ['There is', 'There are', 'There have'],
        correctAnswer: 'There is',
        explanation: 'Use "there is" for one thing (a book).'
      },
      {
        id: 'tia2',
        type: 'fill-blank',
        question: 'Complete: "___ books on the table." (many)',
        options: ['There is', 'There are', 'There have'],
        correctAnswer: 'There are',
        explanation: 'Use "there are" for many things (books).'
      },
      {
        id: 'tia3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'There is books on the table.',
          'There are books on the table.',
          'There have books on the table.'
        ],
        correctAnswer: 'There are books on the table.',
        explanation: 'Use "there are" with plural nouns (books).'
      },
      {
        id: 'tia4',
        type: 'multiple-choice',
        question: 'Complete: "___ a cat in the garden."',
        options: ['There is', 'There are', 'There have'],
        correctAnswer: 'There is',
        explanation: 'Use "there is" for one thing (a cat).'
      },
      {
        id: 'tia5',
        type: 'fill-blank',
        question: 'Complete: "___ many students in class."',
        options: ['There is', 'There are', 'There have'],
        correctAnswer: 'There are',
        explanation: 'Use "there are" for many things (students).'
      },
      {
        id: 'tia6',
        type: 'identify',
        question: 'Which sentence uses "there is" correctly?',
        options: [
          'There is cats in the garden.',
          'There is a cat in the garden.',
          'There are a cat in the garden.'
        ],
        correctAnswer: 'There is a cat in the garden.',
        explanation: 'Use "there is" with singular nouns (a cat).'
      }
    ],
    difficulty: 'intermediate',
    icon: '📍'
  },
  {
    id: 'passive-voice',
    title: 'Passive Voice',
    category: 'Advanced Grammar',
    description: 'Using passive voice to focus on the action',
    explanation: 'Passive voice is used when the action is more important than who does it. Structure: Object + be + past participle + (by + subject). Example: "The cake was baked by mom" (passive) vs "Mom baked the cake" (active).',
    examples: [
      'Active: The teacher teaches the students. → Passive: The students are taught by the teacher.',
      'Active: They built the house. → Passive: The house was built by them.',
      'Active: She writes books. → Passive: Books are written by her.',
      'The window was broken. (We don\'t know who broke it)',
      'English is spoken worldwide. (Focus on English, not who speaks it)'
    ],
    exercises: [
      {
        id: 'pv1',
        type: 'multiple-choice',
        question: 'Which sentence is in passive voice?',
        options: [
          'The dog chased the cat.',
          'The cat was chased by the dog.',
          'The cat chased the dog.'
        ],
        correctAnswer: 'The cat was chased by the dog.',
        explanation: 'Passive voice: object (cat) + was + past participle (chased) + by + subject (dog).'
      },
      {
        id: 'pv2',
        type: 'fill-blank',
        question: 'Complete in passive: "The letter ___ by Sarah." (write)',
        options: ['writes', 'was written', 'wrote'],
        correctAnswer: 'was written',
        explanation: 'Passive voice uses "be" + past participle: was written.'
      },
      {
        id: 'pv3',
        type: 'identify',
        question: 'Which sentence uses passive voice correctly?',
        options: [
          'The cake was bake by mom.',
          'The cake was baked by mom.',
          'The cake baked by mom.'
        ],
        correctAnswer: 'The cake was baked by mom.',
        explanation: 'Passive voice needs "was" + past participle "baked".'
      }
    ],
    difficulty: 'advanced',
    icon: '🔄'
  },
  {
    id: 'conditionals',
    title: 'Conditional Sentences',
    category: 'Advanced Grammar',
    description: 'Using if clauses to talk about possibilities',
    explanation: 'Conditional sentences use "if" to talk about what might happen. Type 1 (real possibility): If + present, will + verb. Type 2 (unreal): If + past, would + verb. Type 3 (past unreal): If + past perfect, would have + past participle.',
    examples: [
      'Type 1 (real): If it rains, I will stay home.',
      'Type 2 (unreal): If I were rich, I would travel the world.',
      'Type 3 (past): If I had studied, I would have passed the test.',
      'If you practice, you will improve.',
      'If I were you, I would apologize.'
    ],
    exercises: [
      {
        id: 'cond1',
        type: 'multiple-choice',
        question: 'Which conditional is correct?',
        options: [
          'If I will go, I see you.',
          'If I go, I will see you.',
          'If I go, I see you.'
        ],
        correctAnswer: 'If I go, I will see you.',
        explanation: 'Type 1 conditional: If + present tense, will + verb.'
      },
      {
        id: 'cond2',
        type: 'fill-blank',
        question: 'Complete: "If I ___ you, I would help."',
        options: ['am', 'was', 'were'],
        correctAnswer: 'were',
        explanation: 'Type 2 conditional uses "were" for all subjects (even "I").'
      },
      {
        id: 'cond3',
        type: 'identify',
        question: 'Which sentence is a Type 2 conditional?',
        options: [
          'If it rains, I will bring an umbrella.',
          'If it rained, I would bring an umbrella.',
          'If it had rained, I would have brought an umbrella.'
        ],
        correctAnswer: 'If it rained, I would bring an umbrella.',
        explanation: 'Type 2: If + past tense, would + verb (unreal situation).'
      }
    ],
    difficulty: 'advanced',
    icon: '🔀'
  },
  {
    id: 'reported-speech',
    title: 'Reported Speech',
    category: 'Advanced Grammar',
    description: 'Telling what someone else said',
    explanation: 'Reported speech (indirect speech) tells what someone said without using their exact words. We change pronouns, tenses, and time expressions. Example: Direct: "I am happy" → Reported: She said she was happy.',
    examples: [
      'Direct: "I am tired." → Reported: He said he was tired.',
      'Direct: "We will go tomorrow." → Reported: They said they would go the next day.',
      'Direct: "I have finished." → Reported: She said she had finished.',
      'Direct: "Can you help me?" → Reported: He asked if I could help him.',
      'Direct: "Don\'t do that!" → Reported: She told me not to do that.'
    ],
    exercises: [
      {
        id: 'rs1',
        type: 'multiple-choice',
        question: 'Convert to reported speech: "I am studying," she said.',
        options: [
          'She said she is studying.',
          'She said she was studying.',
          'She said she studies.'
        ],
        correctAnswer: 'She said she was studying.',
        explanation: 'Present tense "am" changes to past tense "was" in reported speech.'
      },
      {
        id: 'rs2',
        type: 'fill-blank',
        question: 'Reported speech: "I will come," he said. → He said he ___ come.',
        options: ['will', 'would', 'is'],
        correctAnswer: 'would',
        explanation: '"Will" changes to "would" in reported speech.'
      },
      {
        id: 'rs3',
        type: 'identify',
        question: 'Which reported speech is correct?',
        options: [
          '"I go to school," she said. → She said she goes to school.',
          '"I go to school," she said. → She said she went to school.',
          '"I go to school," she said. → She said she go to school.'
        ],
        correctAnswer: '"I go to school," she said. → She said she went to school.',
        explanation: 'Present tense "go" changes to past tense "went" in reported speech.'
      }
    ],
    difficulty: 'advanced',
    icon: '💬'
  },
  {
    id: 'modal-verbs',
    title: 'Modal Verbs',
    category: 'Advanced Grammar',
    description: 'Using can, could, should, must, might, may',
    explanation: 'Modal verbs show possibility, ability, permission, or obligation. They are followed by the base form of the verb. Can = ability, Could = past ability/polite request, Should = advice, Must = necessity, Might/May = possibility.',
    examples: [
      'I can swim. (ability)',
      'Could you help me? (polite request)',
      'You should study more. (advice)',
      'You must finish your homework. (necessity)',
      'It might rain today. (possibility)',
      'May I go to the bathroom? (permission)'
    ],
    exercises: [
      {
        id: 'mod1',
        type: 'multiple-choice',
        question: 'Which modal shows advice?',
        options: ['can', 'should', 'must'],
        correctAnswer: 'should',
        explanation: '"Should" is used to give advice or recommendations.'
      },
      {
        id: 'mod2',
        type: 'fill-blank',
        question: 'Complete: "You ___ wear a seatbelt in the car." (necessity)',
        options: ['can', 'should', 'must'],
        correctAnswer: 'must',
        explanation: '"Must" shows strong necessity or obligation.'
      },
      {
        id: 'mod3',
        type: 'identify',
        question: 'Which sentence uses a modal correctly?',
        options: [
          'I can to swim.',
          'I can swim.',
          'I can swimming.'
        ],
        correctAnswer: 'I can swim.',
        explanation: 'Modal verbs are followed by the base form of the verb (swim), not "to swim" or "swimming".'
      }
    ],
    difficulty: 'advanced',
    icon: '⚡'
  },
  {
    id: 'gerunds-infinitives',
    title: 'Gerunds and Infinitives',
    category: 'Advanced Grammar',
    description: 'Using -ing forms and to + verb',
    explanation: 'Gerunds are verbs ending in -ing used as nouns (I enjoy reading). Infinitives are "to + verb" forms (I want to read). Some verbs are followed by gerunds, others by infinitives, and some can use both.',
    examples: [
      'I enjoy reading. (gerund after "enjoy")',
      'I want to read. (infinitive after "want")',
      'I like reading. / I like to read. (both work)',
      'She stopped smoking. (gerund)',
      'He decided to leave. (infinitive)',
      'They finished eating. (gerund)'
    ],
    exercises: [
      {
        id: 'gi1',
        type: 'multiple-choice',
        question: 'Which is correct?',
        options: [
          'I enjoy to read.',
          'I enjoy reading.',
          'I enjoy read.'
        ],
        correctAnswer: 'I enjoy reading.',
        explanation: '"Enjoy" is followed by a gerund (-ing form), not an infinitive.'
      },
      {
        id: 'gi2',
        type: 'fill-blank',
        question: 'Complete: "She decided ___ the job." (take)',
        options: ['taking', 'to take', 'take'],
        correctAnswer: 'to take',
        explanation: '"Decide" is followed by an infinitive (to + verb).'
      },
      {
        id: 'gi3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'I stopped to smoke.',
          'I stopped smoking.',
          'I stopped smoke.'
        ],
        correctAnswer: 'I stopped smoking.',
        explanation: '"Stop" + gerund means you stopped the activity. "Stop" + infinitive means you stopped to do something else.'
      }
    ],
    difficulty: 'advanced',
    icon: '📖'
  },
  {
    id: 'relative-clauses',
    title: 'Relative Clauses',
    category: 'Advanced Grammar',
    description: 'Using who, which, that to add information',
    explanation: 'Relative clauses add extra information about a noun. Use "who" for people, "which" for things, "that" for both. The clause comes right after the noun it describes. Example: "The book that I read was interesting."',
    examples: [
      'The girl who lives next door is friendly. (who = person)',
      'The book which I read was good. (which = thing)',
      'The dog that barks is mine. (that = thing)',
      'The teacher who teaches math is kind. (who = person)',
      'The car that I bought is red. (that = thing)'
    ],
    exercises: [
      {
        id: 'rc1',
        type: 'multiple-choice',
        question: 'Which relative pronoun is correct? "The person ___ called is my friend."',
        options: ['which', 'that', 'who'],
        correctAnswer: 'who',
        explanation: 'Use "who" for people.'
      },
      {
        id: 'rc2',
        type: 'fill-blank',
        question: 'Complete: "The house ___ I live is old."',
        options: ['who', 'which', 'that'],
        correctAnswer: 'that',
        explanation: 'Use "that" or "which" for things (houses).'
      },
      {
        id: 'rc3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'The book who I read was good.',
          'The book which I read was good.',
          'The book who I read was good.'
        ],
        correctAnswer: 'The book which I read was good.',
        explanation: 'Use "which" or "that" for things (books), not "who".'
      }
    ],
    difficulty: 'advanced',
    icon: '🔗'
  },
  {
    id: 'complex-sentences',
    title: 'Complex Sentences',
    category: 'Advanced Grammar',
    description: 'Combining sentences with conjunctions',
    explanation: 'Complex sentences have one independent clause and one or more dependent clauses. Use subordinating conjunctions: because, although, while, since, if, when, after, before, until. Example: "I was happy because I passed the test."',
    examples: [
      'I was happy because I passed the test. (because = reason)',
      'Although it rained, we went outside. (although = contrast)',
      'While I was studying, my phone rang. (while = time)',
      'Since you\'re here, let\'s start. (since = reason)',
      'I will call you when I arrive. (when = time)'
    ],
    exercises: [
      {
        id: 'cs1',
        type: 'multiple-choice',
        question: 'Which conjunction shows contrast?',
        options: ['because', 'although', 'when'],
        correctAnswer: 'although',
        explanation: '"Although" shows contrast or opposition between ideas.'
      },
      {
        id: 'cs2',
        type: 'fill-blank',
        question: 'Complete: "I was late ___ I missed the bus."',
        options: ['because', 'although', 'while'],
        correctAnswer: 'because',
        explanation: '"Because" shows the reason for being late.'
      },
      {
        id: 'cs3',
        type: 'identify',
        question: 'Which complex sentence is correct?',
        options: [
          'I was tired because I studied all night.',
          'I was tired because I study all night.',
          'I was tired because I studying all night.'
        ],
        correctAnswer: 'I was tired because I studied all night.',
        explanation: 'Both clauses need correct verb tenses. Past tense "was" and "studied" match.'
      }
    ],
    difficulty: 'advanced',
    icon: '🧩'
  },
  {
    id: 'phrasal-verbs',
    title: 'Phrasal Verbs',
    category: 'Advanced Grammar',
    description: 'Verbs with prepositions that change meaning',
    explanation: 'Phrasal verbs are verbs combined with prepositions or adverbs that create new meanings. Examples: "give up" (quit), "look after" (take care of), "turn on" (activate), "find out" (discover). The meaning is different from the base verb.',
    examples: [
      'I gave up smoking. (gave up = quit)',
      'Can you look after my cat? (look after = take care of)',
      'Please turn on the light. (turn on = activate)',
      'I found out the truth. (found out = discovered)',
      'She ran into her friend. (ran into = met by chance)',
      'We need to figure out the problem. (figure out = solve)'
    ],
    exercises: [
      {
        id: 'phv1',
        type: 'multiple-choice',
        question: 'What does "give up" mean?',
        options: ['to give something', 'to quit', 'to go up'],
        correctAnswer: 'to quit',
        explanation: '"Give up" means to stop trying or quit something.'
      },
      {
        id: 'phv2',
        type: 'fill-blank',
        question: 'Complete: "Can you ___ the light?" (activate)',
        options: ['turn on', 'turn off', 'turn up'],
        correctAnswer: 'turn on',
        explanation: '"Turn on" means to activate or start something.'
      },
      {
        id: 'phv3',
        type: 'identify',
        question: 'Which sentence uses a phrasal verb correctly?',
        options: [
          'I look my keys after.',
          'I look after my keys.',
          'I after look my keys.'
        ],
        correctAnswer: 'I look after my keys.',
        explanation: 'Phrasal verbs keep the verb and preposition together: "look after".'
      }
    ],
    difficulty: 'advanced',
    icon: '🔤'
  },
  {
    id: 'advanced-punctuation',
    title: 'Advanced Punctuation',
    category: 'Advanced Grammar',
    description: 'Using colons, semicolons, and dashes',
    explanation: 'Advanced punctuation helps create better sentences. Colon (:) introduces lists or explanations. Semicolon (;) connects related sentences. Dash (—) adds emphasis or extra information. Example: "I have three pets: a cat, a dog, and a bird."',
    examples: [
      'I have three pets: a cat, a dog, and a bird. (colon introduces list)',
      'She loves reading; he prefers movies. (semicolon connects related ideas)',
      'The weather—it was perfect—made the day great. (dash adds extra info)',
      'Remember this: practice makes perfect. (colon introduces explanation)',
      'I was tired; however, I kept working. (semicolon with transition)'
    ],
    exercises: [
      {
        id: 'ap1',
        type: 'multiple-choice',
        question: 'Which punctuation introduces a list?',
        options: [':', ';', '—'],
        correctAnswer: ':',
        explanation: 'A colon (:) is used to introduce lists or explanations.'
      },
      {
        id: 'ap2',
        type: 'fill-blank',
        question: 'Complete: "I was tired ___ I kept working."',
        options: [':', ';', '—'],
        correctAnswer: ';',
        explanation: 'A semicolon (;) connects two related independent clauses.'
      },
      {
        id: 'ap3',
        type: 'identify',
        question: 'Which sentence uses punctuation correctly?',
        options: [
          'I have three colors: red, blue, and green.',
          'I have three colors; red, blue, and green.',
          'I have three colors—red, blue, and green.'
        ],
        correctAnswer: 'I have three colors: red, blue, and green.',
        explanation: 'Use a colon (:) to introduce a list.'
      }
    ],
    difficulty: 'advanced',
    icon: '📝'
  },
  {
    id: 'idioms-expressions',
    title: 'Idioms and Expressions',
    category: 'Advanced Grammar',
    description: 'Common phrases with special meanings',
    explanation: 'Idioms are phrases whose meanings can\'t be understood from the individual words. They are common expressions in English. Example: "It\'s raining cats and dogs" means it\'s raining very heavily, not that animals are falling from the sky.',
    examples: [
      'It\'s raining cats and dogs. (raining very heavily)',
      'Break a leg! (good luck)',
      'I\'m feeling under the weather. (sick)',
      'That costs an arm and a leg. (very expensive)',
      'Let\'s call it a day. (stop working)',
      'She\'s the apple of my eye. (someone very special)'
    ],
    exercises: [
      {
        id: 'ie1',
        type: 'multiple-choice',
        question: 'What does "break a leg" mean?',
        options: ['to hurt your leg', 'good luck', 'to run fast'],
        correctAnswer: 'good luck',
        explanation: '"Break a leg" is an idiom meaning "good luck" (often said before performances).'
      },
      {
        id: 'ie2',
        type: 'fill-blank',
        question: 'Complete: "I\'m feeling ___ the weather." (sick)',
        options: ['under', 'over', 'above'],
        correctAnswer: 'under',
        explanation: '"Under the weather" is an idiom meaning feeling sick or unwell.'
      },
      {
        id: 'ie3',
        type: 'identify',
        question: 'Which sentence uses an idiom correctly?',
        options: [
          'The car costs an arm and a leg.',
          'The car costs a hand and a foot.',
          'The car costs a leg and an arm.'
        ],
        correctAnswer: 'The car costs an arm and a leg.',
        explanation: '"Costs an arm and a leg" is the correct idiom meaning very expensive.'
      }
    ],
    difficulty: 'advanced',
    icon: '💡'
  },
  {
    id: 'past-perfect',
    title: 'Past Perfect Tense',
    category: 'Verb Tenses',
    description: 'Talking about actions that happened before another past action',
    explanation: 'Past perfect is used to show that one action happened before another action in the past. Structure: had + past participle. Example: "I had finished my homework before she arrived" (finished happened before arrived).',
    examples: [
      'I had finished my homework before she arrived.',
      'She had eaten lunch when I called.',
      'They had left by the time we got there.',
      'He had studied English for 5 years before he moved to the US.',
      'We had seen that movie before we watched it again.',
      'The train had already left when we reached the station.',
      'I had never been to Paris before last year.',
      'She had already read the book when I gave it to her.',
      'They had completed the project before the deadline.',
      'He had lost his keys before he realized it.',
      'We had known each other for years before we became friends.',
      'The sun had set before we finished our walk.'
    ],
    exercises: [
      {
        id: 'ppast1',
        type: 'multiple-choice',
        question: 'Which sentence uses past perfect correctly?',
        options: [
          'I finished my homework before she arrived.',
          'I had finished my homework before she arrived.',
          'I have finished my homework before she arrived.'
        ],
        correctAnswer: 'I had finished my homework before she arrived.',
        explanation: 'Past perfect uses "had" + past participle to show an action before another past action.'
      },
      {
        id: 'ppast2',
        type: 'fill-blank',
        question: 'Complete: "She ___ eaten lunch when I called."',
        options: ['has', 'had', 'have'],
        correctAnswer: 'had',
        explanation: 'Past perfect uses "had" + past participle (had eaten).'
      },
      {
        id: 'ppast3',
        type: 'identify',
        question: 'Which sentence shows the correct order of past events?',
        options: [
          'I arrived after she had left.',
          'I had arrived after she left.',
          'I arrive after she had left.'
        ],
        correctAnswer: 'I arrived after she had left.',
        explanation: 'Past perfect (had left) shows the earlier action; simple past (arrived) shows the later action.'
      },
      {
        id: 'ppast4',
        type: 'multiple-choice',
        question: 'Complete: "They ___ already left when we got there."',
        options: ['have', 'had', 'has'],
        correctAnswer: 'had',
        explanation: 'Past perfect uses "had" to show an action completed before another past action.'
      },
      {
        id: 'ppast5',
        type: 'fill-blank',
        question: 'Complete: "He ___ studied English for 5 years before he moved."',
        options: ['has', 'had', 'have'],
        correctAnswer: 'had',
        explanation: 'Past perfect "had studied" shows the action happened before "moved" (past).'
      },
      {
        id: 'ppast6',
        type: 'identify',
        question: 'When do we use past perfect?',
        options: [
          'For actions happening now.',
          'For actions that happened before another past action.',
          'For actions that will happen.'
        ],
        correctAnswer: 'For actions that happened before another past action.',
        explanation: 'Past perfect shows the earlier of two past actions.'
      }
    ],
    difficulty: 'advanced',
    icon: '⏮️'
  },
  {
    id: 'future-perfect',
    title: 'Future Perfect Tense',
    category: 'Verb Tenses',
    description: 'Talking about actions that will be completed before a future time',
    explanation: 'Future perfect is used to show that an action will be completed before a specific time in the future. Structure: will have + past participle. Example: "I will have finished by 5 PM" (finished before 5 PM).',
    examples: [
      'I will have finished my homework by 5 PM.',
      'She will have arrived by the time you get there.',
      'They will have completed the project by next week.',
      'He will have graduated by next year.',
      'We will have eaten dinner before the movie starts.',
      'The train will have left by the time you arrive.',
      'I will have read the book by tomorrow.',
      'She will have learned English by next month.',
      'They will have moved to a new house by then.',
      'He will have finished his studies by 2025.',
      'We will have saved enough money by next year.',
      'The construction will have been completed by December.'
    ],
    exercises: [
      {
        id: 'fp1',
        type: 'multiple-choice',
        question: 'Which sentence uses future perfect correctly?',
        options: [
          'I will finish my homework by 5 PM.',
          'I will have finished my homework by 5 PM.',
          'I have finished my homework by 5 PM.'
        ],
        correctAnswer: 'I will have finished my homework by 5 PM.',
        explanation: 'Future perfect uses "will have" + past participle to show completion before a future time.'
      },
      {
        id: 'fp2',
        type: 'fill-blank',
        question: 'Complete: "She ___ arrived by the time you get there."',
        options: ['will', 'will have', 'has'],
        correctAnswer: 'will have',
        explanation: 'Future perfect uses "will have" + past participle (will have arrived).'
      },
      {
        id: 'fp3',
        type: 'identify',
        question: 'Which sentence shows future completion?',
        options: [
          'I will finish my homework.',
          'I will have finished my homework by 5 PM.',
          'I finished my homework.'
        ],
        correctAnswer: 'I will have finished my homework by 5 PM.',
        explanation: 'Future perfect shows an action will be completed before a specific future time.'
      },
      {
        id: 'fp4',
        type: 'multiple-choice',
        question: 'Complete: "They ___ completed the project by next week."',
        options: ['will', 'will have', 'have'],
        correctAnswer: 'will have',
        explanation: 'Future perfect uses "will have" + past participle.'
      },
      {
        id: 'fp5',
        type: 'fill-blank',
        question: 'Complete: "He ___ graduated by next year."',
        options: ['will', 'will have', 'has'],
        correctAnswer: 'will have',
        explanation: 'Future perfect "will have graduated" shows completion before next year.'
      },
      {
        id: 'fp6',
        type: 'identify',
        question: 'When do we use future perfect?',
        options: [
          'For actions happening now.',
          'For actions that will be completed before a future time.',
          'For actions that happened in the past.'
        ],
        correctAnswer: 'For actions that will be completed before a future time.',
        explanation: 'Future perfect shows completion before a specific future time or event.'
      }
    ],
    difficulty: 'advanced',
    icon: '🔮'
  },
  {
    id: 'present-perfect-continuous',
    title: 'Present Perfect Continuous',
    category: 'Verb Tenses',
    description: 'Talking about actions that started in the past and continue to now',
    explanation: 'Present perfect continuous shows actions that started in the past and are still happening now, or recently finished actions. Structure: have/has + been + verb + -ing. Example: "I have been studying for 2 hours" (started 2 hours ago, still studying).',
    examples: [
      'I have been studying for 2 hours.',
      'She has been working here since 2020.',
      'They have been waiting for an hour.',
      'He has been learning English for 3 years.',
      'We have been living in this city for 5 years.',
      'It has been raining all day.',
      'I have been reading this book for a week.',
      'She has been teaching for 10 years.',
      'They have been playing soccer since morning.',
      'He has been writing a novel for months.',
      'We have been trying to solve this problem.',
      'The children have been playing outside.'
    ],
    exercises: [
      {
        id: 'ppc1',
        type: 'multiple-choice',
        question: 'Which sentence uses present perfect continuous correctly?',
        options: [
          'I have been study for 2 hours.',
          'I have been studying for 2 hours.',
          'I have studying for 2 hours.'
        ],
        correctAnswer: 'I have been studying for 2 hours.',
        explanation: 'Present perfect continuous uses "have/has been" + verb + -ing.'
      },
      {
        id: 'ppc2',
        type: 'fill-blank',
        question: 'Complete: "She ___ working here since 2020."',
        options: ['has been', 'have been', 'has'],
        correctAnswer: 'has been',
        explanation: 'Present perfect continuous: "has been" + verb + -ing (with "she").'
      },
      {
        id: 'ppc3',
        type: 'identify',
        question: 'Which sentence shows an ongoing action from the past?',
        options: [
          'I study English.',
          'I have been studying English for 3 years.',
          'I studied English.'
        ],
        correctAnswer: 'I have been studying English for 3 years.',
        explanation: 'Present perfect continuous shows an action that started in the past and continues now.'
      },
      {
        id: 'ppc4',
        type: 'multiple-choice',
        question: 'Complete: "They ___ waiting for an hour."',
        options: ['have been', 'has been', 'have'],
        correctAnswer: 'have been',
        explanation: 'Present perfect continuous: "have been" + verb + -ing (with "they").'
      },
      {
        id: 'ppc5',
        type: 'fill-blank',
        question: 'Complete: "He ___ learning English for 3 years."',
        options: ['have been', 'has been', 'has'],
        correctAnswer: 'has been',
        explanation: 'Present perfect continuous "has been learning" shows ongoing action from the past.'
      },
      {
        id: 'ppc6',
        type: 'identify',
        question: 'When do we use present perfect continuous?',
        options: [
          'For actions happening now only.',
          'For actions that started in the past and continue to now.',
          'For actions that will happen.'
        ],
        correctAnswer: 'For actions that started in the past and continue to now.',
        explanation: 'Present perfect continuous emphasizes the duration of an ongoing action.'
      }
    ],
    difficulty: 'advanced',
    icon: '⏳'
  },
  {
    id: 'past-perfect-continuous',
    title: 'Past Perfect Continuous',
    category: 'Verb Tenses',
    description: 'Talking about actions that were ongoing before another past action',
    explanation: 'Past perfect continuous shows actions that were in progress before another past action. Structure: had been + verb + -ing. Example: "I had been studying for 2 hours when she called" (was studying before she called).',
    examples: [
      'I had been studying for 2 hours when she called.',
      'She had been working there for 5 years when she quit.',
      'They had been waiting for an hour when the bus arrived.',
      'He had been learning English for 3 years before he moved.',
      'We had been living there for 10 years when we moved.',
      'It had been raining all day when the sun came out.',
      'I had been reading for hours when I fell asleep.',
      'She had been teaching for 20 years when she retired.',
      'They had been playing soccer when it started raining.',
      'He had been writing a book for months when he finished it.',
      'We had been trying to solve it when we found the answer.',
      'The children had been playing outside when it got dark.'
    ],
    exercises: [
      {
        id: 'ppasc1',
        type: 'multiple-choice',
        question: 'Which sentence uses past perfect continuous correctly?',
        options: [
          'I had been study for 2 hours when she called.',
          'I had been studying for 2 hours when she called.',
          'I had studying for 2 hours when she called.'
        ],
        correctAnswer: 'I had been studying for 2 hours when she called.',
        explanation: 'Past perfect continuous uses "had been" + verb + -ing.'
      },
      {
        id: 'ppasc2',
        type: 'fill-blank',
        question: 'Complete: "She ___ working there for 5 years when she quit."',
        options: ['had been', 'has been', 'had'],
        correctAnswer: 'had been',
        explanation: 'Past perfect continuous: "had been" + verb + -ing (had been working).'
      },
      {
        id: 'ppasc3',
        type: 'identify',
        question: 'Which sentence shows an ongoing past action before another past action?',
        options: [
          'I was studying when she called.',
          'I had been studying for 2 hours when she called.',
          'I studied when she called.'
        ],
        correctAnswer: 'I had been studying for 2 hours when she called.',
        explanation: 'Past perfect continuous shows an action in progress before another past action.'
      },
      {
        id: 'ppasc4',
        type: 'multiple-choice',
        question: 'Complete: "They ___ waiting for an hour when the bus arrived."',
        options: ['had been', 'has been', 'were'],
        correctAnswer: 'had been',
        explanation: 'Past perfect continuous: "had been" + verb + -ing (had been waiting).'
      },
      {
        id: 'ppasc5',
        type: 'fill-blank',
        question: 'Complete: "He ___ learning English for 3 years before he moved."',
        options: ['had been', 'has been', 'was'],
        correctAnswer: 'had been',
        explanation: 'Past perfect continuous "had been learning" shows ongoing action before "moved".'
      },
      {
        id: 'ppasc6',
        type: 'identify',
        question: 'When do we use past perfect continuous?',
        options: [
          'For actions happening now.',
          'For actions that were ongoing before another past action.',
          'For actions that will happen.'
        ],
        correctAnswer: 'For actions that were ongoing before another past action.',
        explanation: 'Past perfect continuous emphasizes the duration of an action before another past event.'
      }
    ],
    difficulty: 'advanced',
    icon: '⏪'
  },
  {
    id: 'subjunctive-mood',
    title: 'Subjunctive Mood',
    category: 'Advanced Grammar',
    description: 'Expressing wishes, suggestions, and hypothetical situations',
    explanation: 'Subjunctive mood is used for wishes, suggestions, demands, and hypothetical situations. It often uses the base form of the verb. Example: "I suggest that he be here" (not "is"), "If I were you" (not "was").',
    examples: [
      'I suggest that he be here on time. (suggestion)',
      'If I were you, I would study harder. (hypothetical)',
      'I wish I were taller. (wish)',
      'It is important that she be present. (demand)',
      'I recommend that he take the test. (recommendation)',
      'If I were rich, I would travel the world. (hypothetical)',
      'I wish it were summer. (wish)',
      'It is necessary that they be informed. (necessity)',
      'I suggest that we go now. (suggestion)',
      'If I were a bird, I would fly. (hypothetical)',
      'I wish I were better at math. (wish)',
      'It is essential that he be there. (essential)'
    ],
    exercises: [
      {
        id: 'subj1',
        type: 'multiple-choice',
        question: 'Which sentence uses subjunctive mood correctly?',
        options: [
          'I suggest that he is here.',
          'I suggest that he be here.',
          'I suggest that he was here.'
        ],
        correctAnswer: 'I suggest that he be here.',
        explanation: 'Subjunctive uses base form "be" (not "is" or "was") after suggestions.'
      },
      {
        id: 'subj2',
        type: 'fill-blank',
        question: 'Complete: "If I ___ you, I would study harder."',
        options: ['was', 'were', 'am'],
        correctAnswer: 'were',
        explanation: 'Subjunctive uses "were" (not "was") in hypothetical "if I were" statements.'
      },
      {
        id: 'subj3',
        type: 'identify',
        question: 'Which sentence shows a wish correctly?',
        options: [
          'I wish I was taller.',
          'I wish I were taller.',
          'I wish I am taller.'
        ],
        correctAnswer: 'I wish I were taller.',
        explanation: 'Subjunctive uses "were" (not "was") in wishes.'
      },
      {
        id: 'subj4',
        type: 'multiple-choice',
        question: 'Complete: "It is important that she ___ present."',
        options: ['is', 'be', 'was'],
        correctAnswer: 'be',
        explanation: 'Subjunctive uses base form "be" after "it is important that".'
      },
      {
        id: 'subj5',
        type: 'fill-blank',
        question: 'Complete: "I recommend that he ___ the test."',
        options: ['takes', 'take', 'took'],
        correctAnswer: 'take',
        explanation: 'Subjunctive uses base form "take" (not "takes" or "took") after recommendations.'
      },
      {
        id: 'subj6',
        type: 'identify',
        question: 'When do we use subjunctive mood?',
        options: [
          'For facts and reality.',
          'For wishes, suggestions, and hypothetical situations.',
          'For actions happening now.'
        ],
        correctAnswer: 'For wishes, suggestions, and hypothetical situations.',
        explanation: 'Subjunctive is used for non-real situations: wishes, suggestions, demands, and hypotheticals.'
      }
    ],
    difficulty: 'advanced',
    icon: '💭'
  },
  {
    id: 'inversion',
    title: 'Inversion',
    category: 'Advanced Grammar',
    description: 'Changing word order for emphasis and formality',
    explanation: 'Inversion means putting the verb before the subject. It\'s used for emphasis, formality, or after negative words. Example: "Never have I seen such beauty" (inversion after "never"), "Not only did she come, but she also helped" (inversion after "not only").',
    examples: [
      'Never have I seen such beauty. (after "never")',
      'Not only did she come, but she also helped. (after "not only")',
      'Rarely do we see such talent. (after "rarely")',
      'Only then did I understand. (after "only")',
      'Seldom have I been so happy. (after "seldom")',
      'Hardly had I arrived when it started raining. (after "hardly")',
      'Little did she know what was coming. (after "little")',
      'No sooner had I left than it started. (after "no sooner")',
      'Not until then did I realize. (after "not until")',
      'So beautiful was the sunset that we stopped. (after "so")',
      'Such was the noise that we couldn\'t sleep. (after "such")',
      'Under no circumstances will I agree. (after negative phrase)'
    ],
    exercises: [
      {
        id: 'inv1',
        type: 'multiple-choice',
        question: 'Which sentence uses inversion correctly?',
        options: [
          'Never I have seen such beauty.',
          'Never have I seen such beauty.',
          'Never I saw such beauty.'
        ],
        correctAnswer: 'Never have I seen such beauty.',
        explanation: 'Inversion: verb (have) comes before subject (I) after "never".'
      },
      {
        id: 'inv2',
        type: 'fill-blank',
        question: 'Complete: "Not only ___ she come, but she also helped."',
        options: ['did', 'does', 'do'],
        correctAnswer: 'did',
        explanation: 'Inversion uses "did" + subject after "not only".'
      },
      {
        id: 'inv3',
        type: 'identify',
        question: 'Which sentence shows correct inversion?',
        options: [
          'Rarely we see such talent.',
          'Rarely do we see such talent.',
          'Rarely we do see such talent.'
        ],
        correctAnswer: 'Rarely do we see such talent.',
        explanation: 'Inversion: auxiliary "do" comes before subject "we" after "rarely".'
      },
      {
        id: 'inv4',
        type: 'multiple-choice',
        question: 'Complete: "Only then ___ I understand."',
        options: ['did', 'do', 'does'],
        correctAnswer: 'did',
        explanation: 'Inversion uses "did" + subject after "only then".'
      },
      {
        id: 'inv5',
        type: 'fill-blank',
        question: 'Complete: "Hardly ___ I arrived when it started raining."',
        options: ['had', 'have', 'has'],
        correctAnswer: 'had',
        explanation: 'Inversion uses "had" + subject after "hardly".'
      },
      {
        id: 'inv6',
        type: 'identify',
        question: 'When do we use inversion?',
        options: [
          'In all sentences.',
          'For emphasis, formality, or after negative words.',
          'Only in questions.'
        ],
        correctAnswer: 'For emphasis, formality, or after negative words.',
        explanation: 'Inversion is used for emphasis, formality, or after negative/limiting words.'
      }
    ],
    difficulty: 'advanced',
    icon: '🔄'
  },
  {
    id: 'ellipsis',
    title: 'Ellipsis',
    category: 'Advanced Grammar',
    description: 'Omitting words that are understood from context',
    explanation: 'Ellipsis means leaving out words that are already understood. It makes sentences shorter and more natural. Example: "She likes pizza, and I do too" (omitting "like pizza" after "do"), "I can help if you want" (omitting "me to help").',
    examples: [
      'She likes pizza, and I do too. (omitting "like pizza")',
      'I can help if you want. (omitting "me to help")',
      'He can swim, and she can too. (omitting "swim")',
      'I will go if you will. (omitting "go")',
      'She is happy, and he is too. (omitting "happy")',
      'I have finished, and they have too. (omitting "finished")',
      'He likes coffee, and I do as well. (omitting "like coffee")',
      'She can come, and he can too. (omitting "come")',
      'I will study, and you should too. (omitting "study")',
      'They are ready, and we are too. (omitting "ready")',
      'I have seen it, and she has too. (omitting "seen it")',
      'He wants to go, and I do too. (omitting "want to go")'
    ],
    exercises: [
      {
        id: 'ell1',
        type: 'multiple-choice',
        question: 'Which sentence uses ellipsis correctly?',
        options: [
          'She likes pizza, and I like pizza too.',
          'She likes pizza, and I do too.',
          'She likes pizza, and I too.'
        ],
        correctAnswer: 'She likes pizza, and I do too.',
        explanation: 'Ellipsis: "do" replaces "like pizza" (understood from context).'
      },
      {
        id: 'ell2',
        type: 'fill-blank',
        question: 'Complete: "He can swim, and she ___ too."',
        options: ['can', 'can swim', 'swims'],
        correctAnswer: 'can',
        explanation: 'Ellipsis: "can" is enough (swim is understood).'
      },
      {
        id: 'ell3',
        type: 'identify',
        question: 'Which sentence shows correct ellipsis?',
        options: [
          'I will go if you will go.',
          'I will go if you will.',
          'I will go if you.'
        ],
        correctAnswer: 'I will go if you will.',
        explanation: 'Ellipsis: "will" is enough (go is understood from context).'
      },
      {
        id: 'ell4',
        type: 'multiple-choice',
        question: 'Complete: "She is happy, and he ___ too."',
        options: ['is', 'is happy', 'happy'],
        correctAnswer: 'is',
        explanation: 'Ellipsis: "is" is enough (happy is understood).'
      },
      {
        id: 'ell5',
        type: 'fill-blank',
        question: 'Complete: "I have finished, and they ___ too."',
        options: ['have', 'have finished', 'finished'],
        correctAnswer: 'have',
        explanation: 'Ellipsis: "have" is enough (finished is understood).'
      },
      {
        id: 'ell6',
        type: 'identify',
        question: 'What is ellipsis?',
        options: [
          'Adding extra words.',
          'Omitting words that are understood from context.',
          'Changing word order.'
        ],
        correctAnswer: 'Omitting words that are understood from context.',
        explanation: 'Ellipsis makes sentences shorter by leaving out words that are already clear.'
      }
    ],
    difficulty: 'advanced',
    icon: '✂️'
  },
  {
    id: 'cleft-sentences',
    title: 'Cleft Sentences',
    category: 'Advanced Grammar',
    description: 'Emphasizing parts of a sentence',
    explanation: 'Cleft sentences split a sentence to emphasize one part. Use "It is/was... that/who" or "What... is/was". Example: "It was John who called" (emphasizes John), "What I need is time" (emphasizes time).',
    examples: [
      'It was John who called. (emphasizes John)',
      'It is time that we need. (emphasizes time)',
      'What I need is time. (emphasizes time)',
      'It was yesterday that she arrived. (emphasizes yesterday)',
      'What she wants is a new car. (emphasizes a new car)',
      'It is English that I study. (emphasizes English)',
      'What matters is your effort. (emphasizes your effort)',
      'It was here that we met. (emphasizes here)',
      'What I like is pizza. (emphasizes pizza)',
      'It is she who helped me. (emphasizes she)',
      'What we need is help. (emphasizes help)',
      'It was because of you that I succeeded. (emphasizes because of you)'
    ],
    exercises: [
      {
        id: 'cs1',
        type: 'multiple-choice',
        question: 'Which sentence emphasizes "John" correctly?',
        options: [
          'John called.',
          'It was John who called.',
          'John it was who called.'
        ],
        correctAnswer: 'It was John who called.',
        explanation: 'Cleft sentence "It was... who" emphasizes John.'
      },
      {
        id: 'cs2',
        type: 'fill-blank',
        question: 'Complete: "___ I need is time." (emphasize time)',
        options: ['What', 'That', 'It'],
        correctAnswer: 'What',
        explanation: 'Cleft sentence "What... is" emphasizes the object (time).'
      },
      {
        id: 'cs3',
        type: 'identify',
        question: 'Which sentence emphasizes "yesterday"?',
        options: [
          'She arrived yesterday.',
          'It was yesterday that she arrived.',
          'Yesterday she arrived.'
        ],
        correctAnswer: 'It was yesterday that she arrived.',
        explanation: 'Cleft sentence "It was... that" emphasizes yesterday.'
      },
      {
        id: 'cs4',
        type: 'multiple-choice',
        question: 'Complete: "___ she wants is a new car." (emphasize a new car)',
        options: ['What', 'That', 'It'],
        correctAnswer: 'What',
        explanation: 'Cleft sentence "What... is" emphasizes a new car.'
      },
      {
        id: 'cs5',
        type: 'fill-blank',
        question: 'Complete: "It is English ___ I study." (emphasize English)',
        options: ['what', 'that', 'which'],
        correctAnswer: 'that',
        explanation: 'Cleft sentence uses "It is... that" to emphasize English.'
      },
      {
        id: 'cs6',
        type: 'identify',
        question: 'What are cleft sentences used for?',
        options: [
          'To make sentences shorter.',
          'To emphasize parts of a sentence.',
          'To ask questions.'
        ],
        correctAnswer: 'To emphasize parts of a sentence.',
        explanation: 'Cleft sentences split sentences to highlight specific information.'
      }
    ],
    difficulty: 'advanced',
    icon: '💡'
  },
  {
    id: 'reduced-relative-clauses',
    title: 'Reduced Relative Clauses',
    category: 'Advanced Grammar',
    description: 'Shortening relative clauses',
    explanation: 'Reduced relative clauses shorten sentences by removing "who/which/that" and the verb "be". Example: "The man who is standing there" → "The man standing there", "The book that was written by him" → "The book written by him".',
    examples: [
      'The man who is standing there → The man standing there.',
      'The book that was written by him → The book written by him.',
      'The students who are studying → The students studying.',
      'The car that is parked outside → The car parked outside.',
      'The problem that was solved → The problem solved.',
      'The girl who is singing → The girl singing.',
      'The house that was built last year → The house built last year.',
      'The people who are waiting → The people waiting.',
      'The letter that was sent yesterday → The letter sent yesterday.',
      'The dog that is barking → The dog barking.',
      'The food that is cooked well → The food cooked well.',
      'The children who are playing → The children playing.'
    ],
    exercises: [
      {
        id: 'rrc1',
        type: 'multiple-choice',
        question: 'Which is the reduced form?',
        options: [
          'The man who is standing there.',
          'The man standing there.',
          'The man who standing there.'
        ],
        correctAnswer: 'The man standing there.',
        explanation: 'Reduced: remove "who is" → "The man standing there".'
      },
      {
        id: 'rrc2',
        type: 'fill-blank',
        question: 'Complete: "The book ___ by him is interesting." (reduced)',
        options: ['that was written', 'written', 'that written'],
        correctAnswer: 'written',
        explanation: 'Reduced: remove "that was" → "The book written by him".'
      },
      {
        id: 'rrc3',
        type: 'identify',
        question: 'Which sentence uses reduced relative clause?',
        options: [
          'The students who are studying.',
          'The students studying.',
          'The students who studying.'
        ],
        correctAnswer: 'The students studying.',
        explanation: 'Reduced: remove "who are" → "The students studying".'
      },
      {
        id: 'rrc4',
        type: 'multiple-choice',
        question: 'Complete: "The car ___ outside is mine." (reduced)',
        options: ['that is parked', 'parked', 'that parked'],
        correctAnswer: 'parked',
        explanation: 'Reduced: remove "that is" → "The car parked outside".'
      },
      {
        id: 'rrc5',
        type: 'fill-blank',
        question: 'Complete: "The problem ___ yesterday was difficult." (reduced)',
        options: ['that was solved', 'solved', 'that solved'],
        correctAnswer: 'solved',
        explanation: 'Reduced: remove "that was" → "The problem solved yesterday".'
      },
      {
        id: 'rrc6',
        type: 'identify',
        question: 'What are reduced relative clauses?',
        options: [
          'Longer relative clauses.',
          'Shortened relative clauses by removing "who/which/that" and "be".',
          'Questions with relative clauses.'
        ],
        correctAnswer: 'Shortened relative clauses by removing "who/which/that" and "be".',
        explanation: 'Reduced relative clauses make sentences shorter and more natural.'
      }
    ],
    difficulty: 'advanced',
    icon: '✂️'
  },
  {
    id: 'participles',
    title: 'Participles (Present and Past)',
    category: 'Advanced Grammar',
    description: 'Using -ing and -ed forms as adjectives',
    explanation: 'Participles can act as adjectives. Present participles (-ing) describe what something does (interesting book = book interests). Past participles (-ed) describe how something is affected (interested student = student is interested).',
    examples: [
      'The book is interesting. (present participle - describes the book)',
      'I am interested in the book. (past participle - describes me)',
      'The movie was boring. (present participle)',
      'I was bored. (past participle)',
      'The news is exciting. (present participle)',
      'I am excited. (past participle)',
      'The story is confusing. (present participle)',
      'I am confused. (past participle)',
      'The work is tiring. (present participle)',
      'I am tired. (past participle)',
      'The game is entertaining. (present participle)',
      'I am entertained. (past participle)'
    ],
    exercises: [
      {
        id: 'part1',
        type: 'multiple-choice',
        question: 'Complete: "The book is ___." (describes the book)',
        options: ['interested', 'interesting', 'interest'],
        correctAnswer: 'interesting',
        explanation: 'Present participle "interesting" describes what the book does (it interests).'
      },
      {
        id: 'part2',
        type: 'fill-blank',
        question: 'Complete: "I am ___ in the book." (describes me)',
        options: ['interesting', 'interested', 'interest'],
        correctAnswer: 'interested',
        explanation: 'Past participle "interested" describes how I am affected (I am interested).'
      },
      {
        id: 'part3',
        type: 'identify',
        question: 'Which sentence is correct?',
        options: [
          'The movie was bored.',
          'The movie was boring.',
          'The movie was bore.'
        ],
        correctAnswer: 'The movie was boring.',
        explanation: 'Present participle "boring" describes the movie (it bores).'
      },
      {
        id: 'part4',
        type: 'multiple-choice',
        question: 'Complete: "I was ___ by the movie."',
        options: ['boring', 'bored', 'bore'],
        correctAnswer: 'bored',
        explanation: 'Past participle "bored" describes how I was affected.'
      },
      {
        id: 'part5',
        type: 'fill-blank',
        question: 'Complete: "The news is ___." (describes the news)',
        options: ['excited', 'exciting', 'excite'],
        correctAnswer: 'exciting',
        explanation: 'Present participle "exciting" describes the news (it excites).'
      },
      {
        id: 'part6',
        type: 'identify',
        question: 'What is the difference between -ing and -ed participles?',
        options: [
          'No difference.',
          '-ing describes what something does; -ed describes how something is affected.',
          '-ing is past; -ed is present.'
        ],
        correctAnswer: '-ing describes what something does; -ed describes how something is affected.',
        explanation: 'Present participles (-ing) describe the thing; past participles (-ed) describe the person affected.'
      }
    ],
    difficulty: 'advanced',
    icon: '📝'
  },
  {
    id: 'infinitive-vs-gerund',
    title: 'Infinitive vs Gerund',
    category: 'Advanced Grammar',
    description: 'Choosing between "to do" and "doing"',
    explanation: 'Some verbs are followed by infinitives (to + verb), some by gerunds (verb + -ing), and some by both with different meanings. Example: "I want to go" (infinitive), "I enjoy reading" (gerund), "I remember meeting him" (gerund - past) vs "Remember to call" (infinitive - future).',
    examples: [
      'I want to go. (infinitive)',
      'I enjoy reading. (gerund)',
      'I remember meeting him. (gerund - past memory)',
      'Remember to call. (infinitive - future action)',
      'I stopped smoking. (gerund - quit smoking)',
      'I stopped to smoke. (infinitive - stopped in order to smoke)',
      'I like to swim. (infinitive - preference)',
      'I like swimming. (gerund - activity)',
      'I forget to lock the door. (infinitive - didn\'t lock)',
      'I forget locking the door. (gerund - can\'t remember locking)',
      'I try to learn. (infinitive - attempt)',
      'I try learning. (gerund - experiment)'
    ],
    exercises: [
      {
        id: 'ivg1',
        type: 'multiple-choice',
        question: 'Complete: "I want ___."',
        options: ['go', 'to go', 'going'],
        correctAnswer: 'to go',
        explanation: '"Want" is followed by infinitive "to go".'
      },
      {
        id: 'ivg2',
        type: 'fill-blank',
        question: 'Complete: "I enjoy ___."',
        options: ['read', 'to read', 'reading'],
        correctAnswer: 'reading',
        explanation: '"Enjoy" is followed by gerund "reading".'
      },
      {
        id: 'ivg3',
        type: 'identify',
        question: 'Which sentence shows a past memory?',
        options: [
          'I remember to meet him.',
          'I remember meeting him.',
          'I remember meet him.'
        ],
        correctAnswer: 'I remember meeting him.',
        explanation: 'Gerund "meeting" shows a past memory (I remember that I met him).'
      },
      {
        id: 'ivg4',
        type: 'multiple-choice',
        question: 'Complete: "Remember ___ me." (future action)',
        options: ['call', 'to call', 'calling'],
        correctAnswer: 'to call',
        explanation: 'Infinitive "to call" shows future action (remember to do it).'
      },
      {
        id: 'ivg5',
        type: 'fill-blank',
        question: 'Complete: "I stopped ___." (quit doing it)',
        options: ['smoke', 'to smoke', 'smoking'],
        correctAnswer: 'smoking',
        explanation: 'Gerund "smoking" means quit the activity.'
      },
      {
        id: 'ivg6',
        type: 'identify',
        question: 'What is the difference between "I stopped smoking" and "I stopped to smoke"?',
        options: [
          'No difference.',
          '"Stopped smoking" = quit; "stopped to smoke" = stopped in order to smoke.',
          'Both mean the same thing.'
        ],
        correctAnswer: '"Stopped smoking" = quit; "stopped to smoke" = stopped in order to smoke.',
        explanation: 'Gerund = quit the activity; infinitive = stopped for the purpose of doing it.'
      }
    ],
    difficulty: 'advanced',
    icon: '🔄'
  },
  {
    id: 'conditional-type-3',
    title: 'Third Conditional',
    category: 'Conditional Sentences',
    description: 'Talking about impossible past situations',
    explanation: 'Third conditional talks about impossible past situations (things that didn\'t happen). Structure: If + past perfect, would have + past participle. Example: "If I had studied, I would have passed" (I didn\'t study, so I didn\'t pass - impossible to change now).',
    examples: [
      'If I had studied, I would have passed. (I didn\'t study, so I didn\'t pass)',
      'If she had come, she would have seen it. (she didn\'t come)',
      'If they had left earlier, they would have arrived on time. (they didn\'t leave earlier)',
      'If he had known, he would have helped. (he didn\'t know)',
      'If we had saved money, we would have bought a car. (we didn\'t save)',
      'If it had rained, I would have stayed home. (it didn\'t rain)',
      'If I had been there, I would have seen it. (I wasn\'t there)',
      'If she had called, I would have answered. (she didn\'t call)',
      'If they had practiced, they would have won. (they didn\'t practice)',
      'If he had listened, he would have understood. (he didn\'t listen)',
      'If we had known, we would have come. (we didn\'t know)',
      'If it had been sunny, we would have gone out. (it wasn\'t sunny)'
    ],
    exercises: [
      {
        id: 'cond31',
        type: 'multiple-choice',
        question: 'Which sentence uses third conditional correctly?',
        options: [
          'If I studied, I would pass.',
          'If I had studied, I would have passed.',
          'If I study, I will pass.'
        ],
        correctAnswer: 'If I had studied, I would have passed.',
        explanation: 'Third conditional: If + past perfect, would have + past participle.'
      },
      {
        id: 'cond32',
        type: 'fill-blank',
        question: 'Complete: "If she ___ come, she would have seen it."',
        options: ['had', 'has', 'have'],
        correctAnswer: 'had',
        explanation: 'Third conditional uses "had" + past participle (had come).'
      },
      {
        id: 'cond33',
        type: 'identify',
        question: 'Which sentence talks about an impossible past situation?',
        options: [
          'If I study, I will pass.',
          'If I studied, I would pass.',
          'If I had studied, I would have passed.'
        ],
        correctAnswer: 'If I had studied, I would have passed.',
        explanation: 'Third conditional talks about impossible past situations (can\'t change now).'
      },
      {
        id: 'cond34',
        type: 'multiple-choice',
        question: 'Complete: "If they ___ left earlier, they would have arrived on time."',
        options: ['had', 'have', 'has'],
        correctAnswer: 'had',
        explanation: 'Third conditional uses "had" + past participle (had left).'
      },
      {
        id: 'cond35',
        type: 'fill-blank',
        question: 'Complete: "If he had known, he ___ helped."',
        options: ['would', 'would have', 'will have'],
        correctAnswer: 'would have',
        explanation: 'Third conditional uses "would have" + past participle (would have helped).'
      },
      {
        id: 'cond36',
        type: 'identify',
        question: 'When do we use third conditional?',
        options: [
          'For possible future situations.',
          'For impossible past situations that can\'t be changed.',
          'For real present situations.'
        ],
        correctAnswer: 'For impossible past situations that can\'t be changed.',
        explanation: 'Third conditional expresses regret about past situations that didn\'t happen.'
      }
    ],
    difficulty: 'advanced',
    icon: '🔄'
  },
  {
    id: 'mixed-conditionals',
    title: 'Mixed Conditionals',
    category: 'Conditional Sentences',
    description: 'Combining different conditional types',
    explanation: 'Mixed conditionals combine different time frames. Example: "If I had studied (past), I would be smarter now (present)" - past condition, present result. Or "If I were rich (present), I would have bought it (past)" - present condition, past result.',
    examples: [
      'If I had studied harder, I would be smarter now. (past condition, present result)',
      'If I were rich, I would have bought that car. (present condition, past result)',
      'If she had learned English, she would be working here now. (past condition, present result)',
      'If I knew the answer, I would have told you yesterday. (present condition, past result)',
      'If they had saved money, they would be traveling now. (past condition, present result)',
      'If I were you, I would have accepted the offer. (present condition, past result)',
      'If he had practiced, he would be playing professionally now. (past condition, present result)',
      'If I understood, I would have explained it earlier. (present condition, past result)',
      'If we had moved, we would be living there now. (past condition, present result)',
      'If I were taller, I would have reached it yesterday. (present condition, past result)',
      'If she had taken the job, she would be earning more now. (past condition, present result)',
      'If I could drive, I would have gone yesterday. (present condition, past result)'
    ],
    exercises: [
      {
        id: 'mixc1',
        type: 'multiple-choice',
        question: 'Which sentence uses mixed conditional correctly?',
        options: [
          'If I had studied, I would have passed.',
          'If I had studied harder, I would be smarter now.',
          'If I study, I will pass.'
        ],
        correctAnswer: 'If I had studied harder, I would be smarter now.',
        explanation: 'Mixed conditional: past condition (had studied) + present result (would be).'
      },
      {
        id: 'mixc2',
        type: 'fill-blank',
        question: 'Complete: "If I were rich, I ___ bought that car." (present condition, past result)',
        options: ['would', 'would have', 'will have'],
        correctAnswer: 'would have',
        explanation: 'Mixed conditional: present condition (were) + past result (would have bought).'
      },
      {
        id: 'mixc3',
        type: 'identify',
        question: 'Which sentence shows past condition with present result?',
        options: [
          'If I study, I will pass.',
          'If I had studied, I would have passed.',
          'If I had studied harder, I would be smarter now.'
        ],
        correctAnswer: 'If I had studied harder, I would be smarter now.',
        explanation: 'Past condition (had studied) affects present result (would be smarter now).'
      },
      {
        id: 'mixc4',
        type: 'multiple-choice',
        question: 'Complete: "If she had learned English, she ___ working here now."',
        options: ['would', 'would be', 'would have'],
        correctAnswer: 'would be',
        explanation: 'Mixed conditional: past condition (had learned) + present result (would be).'
      },
      {
        id: 'mixc5',
        type: 'fill-blank',
        question: 'Complete: "If I knew the answer, I ___ told you yesterday."',
        options: ['would', 'would have', 'will have'],
        correctAnswer: 'would have',
        explanation: 'Mixed conditional: present condition (knew) + past result (would have told).'
      },
      {
        id: 'mixc6',
        type: 'identify',
        question: 'What are mixed conditionals?',
        options: [
          'Conditionals with the same time frame.',
          'Conditionals that combine different time frames (past/present).',
          'Only past conditionals.'
        ],
        correctAnswer: 'Conditionals that combine different time frames (past/present).',
        explanation: 'Mixed conditionals connect past conditions with present results, or present conditions with past results.'
      }
    ],
    difficulty: 'advanced',
    icon: '🔀'
  },
  {
    id: 'wish-if-only',
    title: 'Wish and If Only',
    category: 'Advanced Grammar',
    description: 'Expressing regrets and desires',
    explanation: '"Wish" and "if only" express regrets and desires. Use past tense for present wishes (I wish I were taller), past perfect for past regrets (I wish I had studied), and "would" for future wishes about others (I wish you would come).',
    examples: [
      'I wish I were taller. (present wish - I am not taller)',
      'I wish I had studied harder. (past regret - I didn\'t study)',
      'I wish you would come. (future wish about someone else)',
      'If only I were rich. (present wish)',
      'If only I had known. (past regret)',
      'I wish it were summer. (present wish)',
      'I wish I had taken that job. (past regret)',
      'I wish she would call. (future wish)',
      'If only I could speak French. (present wish)',
      'If only we had left earlier. (past regret)',
      'I wish I were better at math. (present wish)',
      'I wish they would be quiet. (future wish)'
    ],
    exercises: [
      {
        id: 'wio1',
        type: 'multiple-choice',
        question: 'Complete: "I wish I ___ taller." (present wish)',
        options: ['am', 'was', 'were'],
        correctAnswer: 'were',
        explanation: 'Use "were" (not "was") after "wish" for present wishes.'
      },
      {
        id: 'wio2',
        type: 'fill-blank',
        question: 'Complete: "I wish I ___ studied harder." (past regret)',
        options: ['had', 'have', 'has'],
        correctAnswer: 'had',
        explanation: 'Use "had" + past participle for past regrets (had studied).'
      },
      {
        id: 'wio3',
        type: 'identify',
        question: 'Which sentence shows a past regret?',
        options: [
          'I wish I were taller.',
          'I wish I had studied harder.',
          'I wish you would come.'
        ],
        correctAnswer: 'I wish I had studied harder.',
        explanation: 'Past perfect "had studied" shows regret about the past.'
      },
      {
        id: 'wio4',
        type: 'multiple-choice',
        question: 'Complete: "I wish you ___ come." (future wish)',
        options: ['will', 'would', 'could'],
        correctAnswer: 'would',
        explanation: 'Use "would" for future wishes about others (you would come).'
      },
      {
        id: 'wio5',
        type: 'fill-blank',
        question: 'Complete: "If only I ___ known." (past regret)',
        options: ['had', 'have', 'has'],
        correctAnswer: 'had',
        explanation: '"If only" uses "had" + past participle for past regrets (had known).'
      },
      {
        id: 'wio6',
        type: 'identify',
        question: 'What is the difference between "wish" and "if only"?',
        options: [
          'No difference - they mean the same.',
          '"If only" is stronger and more emotional than "wish".',
          '"Wish" is only for past regrets.'
        ],
        correctAnswer: '"If only" is stronger and more emotional than "wish".',
        explanation: 'Both express wishes/regrets, but "if only" is more emphatic and emotional.'
      }
    ],
    difficulty: 'advanced',
    icon: '💭'
  },
  {
    id: 'emphatic-structures',
    title: 'Emphatic Structures',
    category: 'Advanced Grammar',
    description: 'Adding emphasis to sentences',
    explanation: 'Emphatic structures add emphasis. Use "do/does/did" for emphasis (I do like it), "it is/was... that/who" for cleft sentences (It was John who called), or "what... is/was" (What I need is time).',
    examples: [
      'I do like it. (emphasis with "do")',
      'She does want to come. (emphasis with "does")',
      'I did finish my homework. (emphasis with "did")',
      'It was John who called. (cleft sentence)',
      'What I need is time. (cleft sentence)',
      'I really do enjoy it. (emphasis)',
      'She really does care. (emphasis)',
      'I did tell you. (emphasis)',
      'It is time that matters. (cleft)',
      'What matters is your effort. (cleft)',
      'I do understand. (emphasis)',
      'She does know the answer. (emphasis)'
    ],
    exercises: [
      {
        id: 'emp1',
        type: 'multiple-choice',
        question: 'Which sentence adds emphasis?',
        options: [
          'I like it.',
          'I do like it.',
          'I am liking it.'
        ],
        correctAnswer: 'I do like it.',
        explanation: '"Do" adds emphasis to show strong feeling (I really like it).'
      },
      {
        id: 'emp2',
        type: 'fill-blank',
        question: 'Complete: "She ___ want to come." (add emphasis)',
        options: ['does', 'do', 'is'],
        correctAnswer: 'does',
        explanation: '"Does" adds emphasis (she really wants to come).'
      },
      {
        id: 'emp3',
        type: 'identify',
        question: 'Which sentence emphasizes "John"?',
        options: [
          'John called.',
          'It was John who called.',
          'John it was who called.'
        ],
        correctAnswer: 'It was John who called.',
        explanation: 'Cleft sentence "It was... who" emphasizes John.'
      },
      {
        id: 'emp4',
        type: 'multiple-choice',
        question: 'Complete: "I ___ finish my homework." (add emphasis)',
        options: ['did', 'do', 'done'],
        correctAnswer: 'did',
        explanation: '"Did" adds emphasis in past tense (I really finished it).'
      },
      {
        id: 'emp5',
        type: 'fill-blank',
        question: 'Complete: "___ I need is time." (emphasize time)',
        options: ['What', 'That', 'It'],
        correctAnswer: 'What',
        explanation: 'Cleft sentence "What... is" emphasizes time.'
      },
      {
        id: 'emp6',
        type: 'identify',
        question: 'What are emphatic structures used for?',
        options: [
          'To make sentences shorter.',
          'To add emphasis and show strong feelings.',
          'To ask questions.'
        ],
        correctAnswer: 'To add emphasis and show strong feelings.',
        explanation: 'Emphatic structures highlight important information and show strong feelings.'
      }
    ],
    difficulty: 'advanced',
    icon: '💪'
  },
  {
    id: 'fronting',
    title: 'Fronting',
    category: 'Advanced Grammar',
    description: 'Moving elements to the front for emphasis',
    explanation: 'Fronting means moving words or phrases to the beginning of a sentence for emphasis. Example: "Never have I seen such beauty" (fronting "never"), "So beautiful was the sunset" (fronting "so beautiful").',
    examples: [
      'Never have I seen such beauty. (fronting "never")',
      'So beautiful was the sunset. (fronting "so beautiful")',
      'Rarely do we see such talent. (fronting "rarely")',
      'Such was the noise that we couldn\'t sleep. (fronting "such")',
      'Only then did I understand. (fronting "only then")',
      'Hardly had I arrived when it started. (fronting "hardly")',
      'Little did she know. (fronting "little")',
      'So tired was I that I fell asleep. (fronting "so tired")',
      'Not only did she come, but she also helped. (fronting "not only")',
      'Under no circumstances will I agree. (fronting negative phrase)',
      'So fast did he run that he won. (fronting "so fast")',
      'Seldom have I been so happy. (fronting "seldom")'
    ],
    exercises: [
      {
        id: 'front1',
        type: 'multiple-choice',
        question: 'Which sentence uses fronting correctly?',
        options: [
          'I have never seen such beauty.',
          'Never have I seen such beauty.',
          'Never I have seen such beauty.'
        ],
        correctAnswer: 'Never have I seen such beauty.',
        explanation: 'Fronting: "Never" moves to front, then verb (have) before subject (I).'
      },
      {
        id: 'front2',
        type: 'fill-blank',
        question: 'Complete: "___ beautiful was the sunset." (fronting)',
        options: ['So', 'Very', 'Too'],
        correctAnswer: 'So',
        explanation: 'Fronting "so beautiful" to the beginning for emphasis.'
      },
      {
        id: 'front3',
        type: 'identify',
        question: 'Which sentence shows fronting?',
        options: [
          'We rarely see such talent.',
          'Rarely do we see such talent.',
          'Rarely we see such talent.'
        ],
        correctAnswer: 'Rarely do we see such talent.',
        explanation: 'Fronting: "Rarely" moves to front, then auxiliary (do) before subject (we).'
      },
      {
        id: 'front4',
        type: 'multiple-choice',
        question: 'Complete: "___ was the noise that we couldn\'t sleep."',
        options: ['Such', 'So', 'Very'],
        correctAnswer: 'Such',
        explanation: 'Fronting "such" to emphasize the noise.'
      },
      {
        id: 'front5',
        type: 'fill-blank',
        question: 'Complete: "Only then ___ I understand."',
        options: ['did', 'do', 'does'],
        correctAnswer: 'did',
        explanation: 'Fronting "only then" requires inversion: auxiliary (did) before subject (I).'
      },
      {
        id: 'front6',
        type: 'identify',
        question: 'What is fronting?',
        options: [
          'Moving words to the end of a sentence.',
          'Moving words or phrases to the beginning for emphasis.',
          'Removing words from a sentence.'
        ],
        correctAnswer: 'Moving words or phrases to the beginning for emphasis.',
        explanation: 'Fronting emphasizes information by placing it at the start of the sentence.'
      }
    ],
    difficulty: 'advanced',
    icon: '⬆️'
  },
  {
    id: 'discourse-markers',
    title: 'Discourse Markers',
    category: 'Advanced Grammar',
    description: 'Words that organize and connect ideas',
    explanation: 'Discourse markers organize speech and writing. They show relationships between ideas: addition (furthermore, moreover), contrast (however, nevertheless), cause (therefore, consequently), time (meanwhile, subsequently).',
    examples: [
      'I studied hard. Furthermore, I practiced every day. (addition)',
      'It was raining. However, we still went out. (contrast)',
      'She was tired. Therefore, she went to bed. (cause/result)',
      'I finished my work. Meanwhile, she was cooking. (time)',
      'He didn\'t study. Consequently, he failed. (result)',
      'I like pizza. Moreover, I love pasta. (addition)',
      'It was difficult. Nevertheless, we succeeded. (contrast)',
      'She was late. As a result, she missed the meeting. (result)',
      'I was working. Meanwhile, he was sleeping. (time)',
      'He is smart. Furthermore, he is kind. (addition)',
      'It was expensive. However, I bought it. (contrast)',
      'She practiced daily. Therefore, she improved. (result)'
    ],
    exercises: [
      {
        id: 'dm1',
        type: 'multiple-choice',
        question: 'Which discourse marker shows addition?',
        options: ['however', 'furthermore', 'therefore'],
        correctAnswer: 'furthermore',
        explanation: '"Furthermore" adds more information (addition).'
      },
      {
        id: 'dm2',
        type: 'fill-blank',
        question: 'Complete: "It was raining. ___, we still went out." (contrast)',
        options: ['However', 'Therefore', 'Meanwhile'],
        correctAnswer: 'However',
        explanation: '"However" shows contrast (but we still went).'
      },
      {
        id: 'dm3',
        type: 'identify',
        question: 'Which discourse marker shows result?',
        options: [
          'I studied hard. Furthermore, I passed.',
          'I studied hard. Therefore, I passed.',
          'I studied hard. Meanwhile, I passed.'
        ],
        correctAnswer: 'I studied hard. Therefore, I passed.',
        explanation: '"Therefore" shows cause and result (because I studied, I passed).'
      },
      {
        id: 'dm4',
        type: 'multiple-choice',
        question: 'Complete: "I was working. ___, she was cooking." (time)',
        options: ['However', 'Meanwhile', 'Therefore'],
        correctAnswer: 'Meanwhile',
        explanation: '"Meanwhile" shows two things happening at the same time.'
      },
      {
        id: 'dm5',
        type: 'fill-blank',
        question: 'Complete: "He didn\'t study. ___, he failed." (result)',
        options: ['However', 'Consequently', 'Furthermore'],
        correctAnswer: 'Consequently',
        explanation: '"Consequently" shows result (because he didn\'t study, he failed).'
      },
      {
        id: 'dm6',
        type: 'identify',
        question: 'What are discourse markers?',
        options: [
          'Words that only show time.',
          'Words that organize and connect ideas in speech and writing.',
          'Words that ask questions.'
        ],
        correctAnswer: 'Words that organize and connect ideas in speech and writing.',
        explanation: 'Discourse markers help organize ideas and show relationships (addition, contrast, cause, time).'
      }
    ],
    difficulty: 'advanced',
    icon: '🔗'
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

