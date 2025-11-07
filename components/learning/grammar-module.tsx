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
  },
  {
    id: 'articles',
    title: 'Articles (a, an, the)',
    category: 'Parts of Speech',
    description: 'Using a, an, and the correctly',
    explanation: 'Articles are words that come before nouns. Use "a" before words starting with a consonant sound, "an" before words starting with a vowel sound, and "the" when talking about a specific thing.',
    examples: [
      'I see a cat. (any cat)',
      'I see an apple. (any apple)',
      'I see the cat. (a specific cat we know)',
      'A dog is friendly. An elephant is big. The sun is bright.'
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
    explanation: 'The subject and verb in a sentence must agree. If the subject is singular (one), the verb is singular. If the subject is plural (more than one), the verb is plural.',
    examples: [
      'The cat runs. (singular)',
      'The cats run. (plural)',
      'She plays. (singular)',
      'They play. (plural)',
      'He is happy. (singular)',
      'We are happy. (plural)'
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
    explanation: 'Contractions are shortened forms of words. We combine two words and use an apostrophe (\') to show where letters are removed. For example: "I am" becomes "I\'m", "do not" becomes "don\'t".',
    examples: [
      'I am = I\'m',
      'You are = You\'re',
      'He is = He\'s',
      'We are = We\'re',
      'Do not = Don\'t',
      'Cannot = Can\'t',
      'Will not = Won\'t',
      'It is = It\'s'
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
    explanation: 'Possessives show that something belongs to someone. Add an apostrophe and "s" (\'s) to show ownership. For example: "the cat\'s toy" means the toy belongs to the cat.',
    examples: [
      'The dog\'s bone (the bone belongs to the dog)',
      'Sarah\'s book (the book belongs to Sarah)',
      'The teacher\'s desk (the desk belongs to the teacher)',
      'My friend\'s house (the house belongs to my friend)'
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
    explanation: 'We use comparatives to compare two things (add -er or use "more"). We use superlatives to compare three or more things (add -est or use "most"). For short words, add -er/-est. For long words, use more/most.',
    examples: [
      'Big → Bigger (comparative) → Biggest (superlative)',
      'Happy → Happier → Happiest',
      'Beautiful → More beautiful → Most beautiful',
      'Fast → Faster → Fastest',
      'Good → Better → Best',
      'Bad → Worse → Worst'
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
    explanation: 'Question words help us ask questions. Who asks about people, what asks about things, where asks about places, when asks about time, why asks about reasons, and how asks about ways or methods.',
    examples: [
      'Who is your teacher? (person)',
      'What is your name? (thing)',
      'Where do you live? (place)',
      'When is your birthday? (time)',
      'Why are you happy? (reason)',
      'How do you get to school? (way/method)'
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
    explanation: 'Prepositions show when or where something happens. For time: "in" for months/years, "on" for days/dates, "at" for specific times. For place: "in" for inside, "on" for surfaces, "at" for specific locations.',
    examples: [
      'Time: in January, on Monday, at 3 o\'clock',
      'Place: in the box, on the table, at school',
      'I go to school in the morning.',
      'My birthday is on Friday.',
      'The book is on the shelf.',
      'We meet at the park.'
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
    explanation: 'Here are some important grammar rules: Start sentences with capital letters. End sentences with punctuation. Use "I" not "i". Use "a" before consonant sounds, "an" before vowel sounds. Add "s" to make most nouns plural. Use "is" for one thing, "are" for many things.',
    examples: [
      'Always start sentences with a capital letter.',
      'Use "I" with a capital letter, not "i".',
      'Add "s" to make plurals: cat → cats',
      'Use "is" for one: The cat is sleeping.',
      'Use "are" for many: The cats are sleeping.',
      'Use "a" before consonants: a dog, a cat',
      'Use "an" before vowels: an apple, an egg'
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
      }
    ],
    difficulty: 'beginner',
    icon: '📚'
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

