'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Mascot } from '@/components/ui/mascot'
import { 
  Puzzle, ArrowLeft, Star, Trophy, RefreshCw, CheckCircle, 
  X, Volume2, VolumeX, Shuffle, Lightbulb, Target
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { audioManager } from '@/lib/audio-manager'
import { progressManager } from '@/lib/progress'
import { challengeManager } from '@/lib/challenges'

type PuzzleType = 'word' | 'sentence' | 'picture' | 'word-picture' | 'jigsaw'

interface WordPuzzle {
  word: string
  hint: string
  scrambled: string[]
}

interface SentencePuzzle {
  sentence: string
  words: string[]
  scrambled: string[]
}

interface PicturePuzzle {
  word: string
  image: string
  /** Optional high-res image URL for sharp display on retina/mobile; falls back to emoji */
  imageUrl?: string
  options: string[]
  correct: number
}

interface JigsawPuzzle {
  id: string
  image: string
  pieces: number
  category: string
}

/** Fisher-Yates shuffle - ensures uniform random order (unlike sort(() => Math.random() - 0.5)) */
function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Word + picture puzzles: each piece has an image part and one letter; assemble to spell the word (e.g. bug, pig, duck, cat) */
interface WordPicturePuzzle {
  word: string
  emoji: string
  hint: string
}

const WORD_PICTURE_PUZZLES: WordPicturePuzzle[] = [
  { word: 'bug', emoji: '🐞', hint: 'A little red insect with spots' },
  { word: 'pig', emoji: '🐷', hint: 'A pink animal that says oink!' },
  { word: 'duck', emoji: '🦆', hint: 'Likes water and says quack' },
  { word: 'cat', emoji: '🐱', hint: 'A furry pet that says meow' },
  { word: 'dog', emoji: '🐶', hint: 'A loyal friend that barks' },
  { word: 'sun', emoji: '☀️', hint: 'Shines in the sky during the day' },
  { word: 'car', emoji: '🚗', hint: 'Takes you places on four wheels' },
  { word: 'ball', emoji: '⚽', hint: 'You can kick or throw it' },
  { word: 'bear', emoji: '🐻', hint: 'A big furry animal that likes honey' },
  { word: 'fish', emoji: '🐟', hint: 'Swims in the sea' },
  { word: 'bird', emoji: '🐦', hint: 'Has wings and can fly' },
  { word: 'moon', emoji: '🌙', hint: 'Shines at night in the sky' },
  { word: 'star', emoji: '⭐', hint: 'Twinkles in the night sky' },
  { word: 'book', emoji: '📖', hint: 'You read it for stories' },
  { word: 'hand', emoji: '✋', hint: 'You have five fingers on each one' },
  { word: 'frog', emoji: '🐸', hint: 'Green animal that hops and says ribbit' },
  { word: 'lion', emoji: '🦁', hint: 'King of the jungle with a mane' },
  { word: 'cake', emoji: '🎂', hint: 'Sweet treat for birthdays' },
  { word: 'rain', emoji: '🌧️', hint: 'Water that falls from clouds' },
  { word: 'tree', emoji: '🌳', hint: 'Has leaves and branches' },
  { word: 'boat', emoji: '⛵', hint: 'Floats on water' },
  { word: 'bell', emoji: '🔔', hint: 'Makes a ding or ring sound' },
  { word: 'milk', emoji: '🥛', hint: 'White drink good for your bones' },
  { word: 'hat', emoji: '🧢', hint: 'You wear it on your head' },
  { word: 'key', emoji: '🔑', hint: 'Opens a lock' },
  { word: 'nest', emoji: '🪺', hint: 'Where birds lay eggs' },
  { word: 'foot', emoji: '🦶', hint: 'You have two; you walk on them' },
  { word: 'fire', emoji: '🔥', hint: 'Hot and bright' },
  { word: 'leaf', emoji: '🍃', hint: 'Grows on trees; green or autumn colors' },
]

const WORD_PUZZLES: WordPuzzle[] = [
  // 3-letter
  { word: 'CAT', hint: 'A furry pet that says meow', scrambled: ['C', 'A', 'T'] },
  { word: 'DOG', hint: 'A loyal friend that barks', scrambled: ['D', 'O', 'G'] },
  { word: 'SUN', hint: 'Shines in the sky during the day', scrambled: ['S', 'U', 'N'] },
  { word: 'PIG', hint: 'A pink animal that says oink', scrambled: ['P', 'I', 'G'] },
  { word: 'CAR', hint: 'Takes you places on four wheels', scrambled: ['C', 'A', 'R'] },
  { word: 'HAT', hint: 'You wear it on your head', scrambled: ['H', 'A', 'T'] },
  { word: 'BED', hint: 'You sleep in it at night', scrambled: ['B', 'E', 'D'] },
  { word: 'RED', hint: 'Color of an apple', scrambled: ['R', 'E', 'D'] },
  { word: 'ICE', hint: 'Frozen water', scrambled: ['I', 'C', 'E'] },
  { word: 'EGG', hint: 'Chickens lay it; you eat it for breakfast', scrambled: ['E', 'G', 'G'] },
  // 4-letter
  { word: 'FISH', hint: 'Swims in the sea and has fins', scrambled: ['F', 'I', 'S', 'H'] },
  { word: 'MOON', hint: 'Shines at night in the sky', scrambled: ['M', 'O', 'O', 'N'] },
  { word: 'RAIN', hint: 'Water that falls from clouds', scrambled: ['R', 'A', 'I', 'N'] },
  { word: 'TREE', hint: 'Has leaves and branches', scrambled: ['T', 'R', 'E', 'E'] },
  { word: 'BOOK', hint: 'You read it for stories', scrambled: ['B', 'O', 'O', 'K'] },
  { word: 'BALL', hint: 'You can kick or throw it', scrambled: ['B', 'A', 'L', 'L'] },
  { word: 'BEAR', hint: 'Big furry animal that likes honey', scrambled: ['B', 'E', 'A', 'R'] },
  { word: 'BIRD', hint: 'Has wings and can fly', scrambled: ['B', 'I', 'R', 'D'] },
  { word: 'DUCK', hint: 'Says quack and likes water', scrambled: ['D', 'U', 'C', 'K'] },
  { word: 'STAR', hint: 'Twinkles in the night sky', scrambled: ['S', 'T', 'A', 'R'] },
  { word: 'JUMP', hint: 'Move up quickly off the ground', scrambled: ['J', 'U', 'M', 'P'] },
  { word: 'NOSE', hint: 'You smell and breathe with it', scrambled: ['N', 'O', 'S', 'E'] },
  { word: 'KITE', hint: 'Flies in the sky on a string', scrambled: ['K', 'I', 'T', 'E'] },
  { word: 'LION', hint: 'King of the jungle, has a mane', scrambled: ['L', 'I', 'O', 'N'] },
  { word: 'MILK', hint: 'White drink that is good for bones', scrambled: ['M', 'I', 'L', 'K'] },
  { word: 'CAKE', hint: 'Sweet treat for birthdays', scrambled: ['C', 'A', 'K', 'E'] },
  { word: 'HAND', hint: 'You have five fingers on it', scrambled: ['H', 'A', 'N', 'D'] },
  { word: 'SHOE', hint: 'You wear it on your foot', scrambled: ['S', 'H', 'O', 'E'] },
  { word: 'WIND', hint: 'Moves the leaves and kites', scrambled: ['W', 'I', 'N', 'D'] },
  { word: 'FROG', hint: 'Green animal that hops and says ribbit', scrambled: ['F', 'R', 'O', 'G'] },
  // 5-letter
  { word: 'APPLE', hint: 'A red or green fruit', scrambled: ['A', 'P', 'P', 'L', 'E'] },
  { word: 'HOUSE', hint: 'Where we live with our family', scrambled: ['H', 'O', 'U', 'S', 'E'] },
  { word: 'WATER', hint: 'We drink it to stay healthy', scrambled: ['W', 'A', 'T', 'E', 'R'] },
  { word: 'TIGER', hint: 'Big cat with orange and black stripes', scrambled: ['T', 'I', 'G', 'E', 'R'] },
  { word: 'HAPPY', hint: 'How you feel when something is fun', scrambled: ['H', 'A', 'P', 'P', 'Y'] },
  { word: 'MUSIC', hint: 'Songs and sounds we listen to', scrambled: ['M', 'U', 'S', 'I', 'C'] },
  { word: 'TABLE', hint: 'We put food and books on it', scrambled: ['T', 'A', 'B', 'L', 'E'] },
  { word: 'CLOUD', hint: 'White or gray in the sky', scrambled: ['C', 'L', 'O', 'U', 'D'] },
  { word: 'SPOON', hint: 'You use it to eat soup', scrambled: ['S', 'P', 'O', 'O', 'N'] },
  { word: 'PIZZA', hint: 'Round food with cheese and sauce', scrambled: ['P', 'I', 'Z', 'Z', 'A'] },
  { word: 'SNAKE', hint: 'Long animal that slithers', scrambled: ['S', 'N', 'A', 'K', 'E'] },
  { word: 'WHALE', hint: 'Very big animal that lives in the ocean', scrambled: ['W', 'H', 'A', 'L', 'E'] },
  { word: 'GRASS', hint: 'Green and grows on the ground', scrambled: ['G', 'R', 'A', 'S', 'S'] },
  { word: 'RABBIT', hint: 'Fluffy animal with long ears that hops', scrambled: ['R', 'A', 'B', 'B', 'I', 'T'] },
  // 6-letter
  { word: 'BANANA', hint: 'A long yellow fruit', scrambled: ['B', 'A', 'N', 'A', 'N', 'A'] },
  { word: 'ORANGE', hint: 'A round orange fruit', scrambled: ['O', 'R', 'A', 'N', 'G', 'E'] },
  { word: 'MONKEY', hint: 'Animal that climbs trees and likes bananas', scrambled: ['M', 'O', 'N', 'K', 'E', 'Y'] },
  { word: 'TURTLE', hint: 'Has a shell and moves slowly', scrambled: ['T', 'U', 'R', 'T', 'L', 'E'] },
  { word: 'BUTTER', hint: 'Yellow spread for bread', scrambled: ['B', 'U', 'T', 'T', 'E', 'R'] },
  { word: 'PURPLE', hint: 'Color of grapes and violets', scrambled: ['P', 'U', 'R', 'P', 'L', 'E'] },
  { word: 'FRIEND', hint: 'Someone you like to play with', scrambled: ['F', 'R', 'I', 'E', 'N', 'D'] },
  { word: 'PENCIL', hint: 'You write and draw with it', scrambled: ['P', 'E', 'N', 'C', 'I', 'L'] },
  { word: 'GARDEN', hint: 'Where flowers and vegetables grow', scrambled: ['G', 'A', 'R', 'D', 'E', 'N'] },
  { word: 'SUMMER', hint: 'Hot season when we play outside', scrambled: ['S', 'U', 'M', 'M', 'E', 'R'] },
  // 7-letter
  { word: 'GIRAFFE', hint: 'Tall animal with a long neck', scrambled: ['G', 'I', 'R', 'A', 'F', 'F', 'E'] },
  { word: 'ELEPHANT', hint: 'Very big gray animal with a trunk', scrambled: ['E', 'L', 'E', 'P', 'H', 'A', 'N', 'T'] },
  { word: 'CHICKEN', hint: 'Bird that lays eggs and says cluck', scrambled: ['C', 'H', 'I', 'C', 'K', 'E', 'N'] },
  // 7–9 letter
  { word: 'BREAKFAST', hint: 'First meal of the day', scrambled: ['B', 'R', 'E', 'A', 'K', 'F', 'A', 'S', 'T'] },
  { word: 'UMBRELLA', hint: 'Keeps you dry in the rain', scrambled: ['U', 'M', 'B', 'R', 'E', 'L', 'L', 'A'] },
  { word: 'VIOLIN', hint: 'Musical instrument you play with a bow', scrambled: ['V', 'I', 'O', 'L', 'I', 'N'] },
  { word: 'QUEEN', hint: 'A royal lady who wears a crown', scrambled: ['Q', 'U', 'E', 'E', 'N'] },
  { word: 'XRAY', hint: 'Shows your bones at the doctor', scrambled: ['X', 'R', 'A', 'Y'] },
  { word: 'YELLOW', hint: 'Color of the sun and bananas', scrambled: ['Y', 'E', 'L', 'L', 'O', 'W'] },
  { word: 'ZEBRA', hint: 'Animal with black and white stripes', scrambled: ['Z', 'E', 'B', 'R', 'A'] },
]

const SENTENCE_PUZZLES: SentencePuzzle[] = [
  // ——— Original set ———
  { sentence: 'I love apples', words: ['I', 'love', 'apples'], scrambled: ['apples', 'I', 'love'] },
  { sentence: 'The cat is sleeping', words: ['The', 'cat', 'is', 'sleeping'], scrambled: ['sleeping', 'The', 'cat', 'is'] },
  { sentence: 'We play in the park', words: ['We', 'play', 'in', 'the', 'park'], scrambled: ['park', 'We', 'play', 'in', 'the'] },
  { sentence: 'My dog is happy', words: ['My', 'dog', 'is', 'happy'], scrambled: ['happy', 'My', 'dog', 'is'] },
  { sentence: 'The sun is bright', words: ['The', 'sun', 'is', 'bright'], scrambled: ['bright', 'The', 'sun', 'is'] },
  { sentence: 'I can read books', words: ['I', 'can', 'read', 'books'], scrambled: ['books', 'I', 'can', 'read'] },
  { sentence: 'Birds fly in the sky', words: ['Birds', 'fly', 'in', 'the', 'sky'], scrambled: ['sky', 'Birds', 'fly', 'in', 'the'] },
  { sentence: 'Fish swim in water', words: ['Fish', 'swim', 'in', 'water'], scrambled: ['water', 'Fish', 'swim', 'in'] },
  { sentence: 'The ball is red', words: ['The', 'ball', 'is', 'red'], scrambled: ['red', 'The', 'ball', 'is'] },
  { sentence: 'I see a big tree', words: ['I', 'see', 'a', 'big', 'tree'], scrambled: ['tree', 'I', 'see', 'a', 'big'] },
  { sentence: 'She has a blue hat', words: ['She', 'has', 'a', 'blue', 'hat'], scrambled: ['hat', 'She', 'has', 'a', 'blue'] },
  { sentence: 'We like to run', words: ['We', 'like', 'to', 'run'], scrambled: ['run', 'We', 'like', 'to'] },
  { sentence: 'The moon is round', words: ['The', 'moon', 'is', 'round'], scrambled: ['round', 'The', 'moon', 'is'] },
  { sentence: 'He has a new bike', words: ['He', 'has', 'a', 'new', 'bike'], scrambled: ['bike', 'He', 'has', 'a', 'new'] },
  { sentence: 'They eat lunch at noon', words: ['They', 'eat', 'lunch', 'at', 'noon'], scrambled: ['noon', 'They', 'eat', 'lunch', 'at'] },
  // ——— Premium: feelings & me ———
  { sentence: 'I am happy today', words: ['I', 'am', 'happy', 'today'], scrambled: ['today', 'I', 'am', 'happy'] },
  { sentence: 'She is kind and nice', words: ['She', 'is', 'kind', 'and', 'nice'], scrambled: ['nice', 'She', 'is', 'kind', 'and'] },
  { sentence: 'We are best friends', words: ['We', 'are', 'best', 'friends'], scrambled: ['friends', 'We', 'are', 'best'] },
  { sentence: 'He is very brave', words: ['He', 'is', 'very', 'brave'], scrambled: ['brave', 'He', 'is', 'very'] },
  { sentence: 'My sister likes to draw', words: ['My', 'sister', 'likes', 'to', 'draw'], scrambled: ['draw', 'My', 'sister', 'likes', 'to'] },
  { sentence: 'I feel proud of my work', words: ['I', 'feel', 'proud', 'of', 'my', 'work'], scrambled: ['work', 'I', 'feel', 'proud', 'of', 'my'] },
  // ——— Premium: daily life ———
  { sentence: 'I brush my teeth every day', words: ['I', 'brush', 'my', 'teeth', 'every', 'day'], scrambled: ['day', 'I', 'brush', 'my', 'teeth', 'every'] },
  { sentence: 'We eat breakfast in the morning', words: ['We', 'eat', 'breakfast', 'in', 'the', 'morning'], scrambled: ['morning', 'We', 'eat', 'breakfast', 'in', 'the'] },
  { sentence: 'Mom reads a story at night', words: ['Mom', 'reads', 'a', 'story', 'at', 'night'], scrambled: ['night', 'Mom', 'reads', 'a', 'story', 'at'] },
  { sentence: 'Dad cooks dinner for us', words: ['Dad', 'cooks', 'dinner', 'for', 'us'], scrambled: ['us', 'Dad', 'cooks', 'dinner', 'for'] },
  { sentence: 'I go to bed early', words: ['I', 'go', 'to', 'bed', 'early'], scrambled: ['early', 'I', 'go', 'to', 'bed'] },
  { sentence: 'We clean our room together', words: ['We', 'clean', 'our', 'room', 'together'], scrambled: ['together', 'We', 'clean', 'our', 'room'] },
  // ——— Premium: nature & weather ———
  { sentence: 'The flower is pretty', words: ['The', 'flower', 'is', 'pretty'], scrambled: ['pretty', 'The', 'flower', 'is'] },
  { sentence: 'Leaves fall in autumn', words: ['Leaves', 'fall', 'in', 'autumn'], scrambled: ['autumn', 'Leaves', 'fall', 'in'] },
  { sentence: 'The rain makes puddles', words: ['The', 'rain', 'makes', 'puddles'], scrambled: ['puddles', 'The', 'rain', 'makes'] },
  { sentence: 'Snow is cold and white', words: ['Snow', 'is', 'cold', 'and', 'white'], scrambled: ['white', 'Snow', 'is', 'cold', 'and'] },
  { sentence: 'The wind blows the leaves', words: ['The', 'wind', 'blows', 'the', 'leaves'], scrambled: ['leaves', 'The', 'wind', 'blows', 'the'] },
  { sentence: 'Stars twinkle at night', words: ['Stars', 'twinkle', 'at', 'night'], scrambled: ['night', 'Stars', 'twinkle', 'at'] },
  { sentence: 'A rainbow has many colors', words: ['A', 'rainbow', 'has', 'many', 'colors'], scrambled: ['colors', 'A', 'rainbow', 'has', 'many'] },
  { sentence: 'The bee likes the flower', words: ['The', 'bee', 'likes', 'the', 'flower'], scrambled: ['flower', 'The', 'bee', 'likes', 'the'] },
  // ——— Premium: animals ———
  { sentence: 'The lion is big and strong', words: ['The', 'lion', 'is', 'big', 'and', 'strong'], scrambled: ['strong', 'The', 'lion', 'is', 'big', 'and'] },
  { sentence: 'A bird has wings to fly', words: ['A', 'bird', 'has', 'wings', 'to', 'fly'], scrambled: ['fly', 'A', 'bird', 'has', 'wings', 'to'] },
  { sentence: 'The rabbit hops in the grass', words: ['The', 'rabbit', 'hops', 'in', 'the', 'grass'], scrambled: ['grass', 'The', 'rabbit', 'hops', 'in', 'the'] },
  { sentence: 'Elephants have long trunks', words: ['Elephants', 'have', 'long', 'trunks'], scrambled: ['trunks', 'Elephants', 'have', 'long'] },
  { sentence: 'The duck swims in the pond', words: ['The', 'duck', 'swims', 'in', 'the', 'pond'], scrambled: ['pond', 'The', 'duck', 'swims', 'in', 'the'] },
  { sentence: 'A frog can jump very high', words: ['A', 'frog', 'can', 'jump', 'very', 'high'], scrambled: ['high', 'A', 'frog', 'can', 'jump', 'very'] },
  { sentence: 'The horse runs fast', words: ['The', 'horse', 'runs', 'fast'], scrambled: ['fast', 'The', 'horse', 'runs'] },
  { sentence: 'Bears like to eat honey', words: ['Bears', 'like', 'to', 'eat', 'honey'], scrambled: ['honey', 'Bears', 'like', 'to', 'eat'] },
  // ——— Premium: school & learning ———
  { sentence: 'I go to school every day', words: ['I', 'go', 'to', 'school', 'every', 'day'], scrambled: ['day', 'I', 'go', 'to', 'school', 'every'] },
  { sentence: 'We learn new words in class', words: ['We', 'learn', 'new', 'words', 'in', 'class'], scrambled: ['class', 'We', 'learn', 'new', 'words', 'in'] },
  { sentence: 'The teacher is very kind', words: ['The', 'teacher', 'is', 'very', 'kind'], scrambled: ['kind', 'The', 'teacher', 'is', 'very'] },
  { sentence: 'I write with a pencil', words: ['I', 'write', 'with', 'a', 'pencil'], scrambled: ['pencil', 'I', 'write', 'with', 'a'] },
  { sentence: 'We sing a song together', words: ['We', 'sing', 'a', 'song', 'together'], scrambled: ['together', 'We', 'sing', 'a', 'song'] },
  { sentence: 'Reading books is fun', words: ['Reading', 'books', 'is', 'fun'], scrambled: ['fun', 'Reading', 'books', 'is'] },
  // ——— Premium: food & play ———
  { sentence: 'I like pizza and juice', words: ['I', 'like', 'pizza', 'and', 'juice'], scrambled: ['juice', 'I', 'like', 'pizza', 'and'] },
  { sentence: 'We have milk for breakfast', words: ['We', 'have', 'milk', 'for', 'breakfast'], scrambled: ['breakfast', 'We', 'have', 'milk', 'for'] },
  { sentence: 'Fruits are good for you', words: ['Fruits', 'are', 'good', 'for', 'you'], scrambled: ['you', 'Fruits', 'are', 'good', 'for'] },
  { sentence: 'Let us play a game', words: ['Let', 'us', 'play', 'a', 'game'], scrambled: ['game', 'Let', 'us', 'play', 'a'] },
  { sentence: 'The toy is under the table', words: ['The', 'toy', 'is', 'under', 'the', 'table'], scrambled: ['table', 'The', 'toy', 'is', 'under', 'the'] },
  { sentence: 'I build a tower with blocks', words: ['I', 'build', 'a', 'tower', 'with', 'blocks'], scrambled: ['blocks', 'I', 'build', 'a', 'tower', 'with'] },
  // ——— Premium: family & home ———
  { sentence: 'This is my family', words: ['This', 'is', 'my', 'family'], scrambled: ['family', 'This', 'is', 'my'] },
  { sentence: 'Grandma tells good stories', words: ['Grandma', 'tells', 'good', 'stories'], scrambled: ['stories', 'Grandma', 'tells', 'good'] },
  { sentence: 'My brother plays in the garden', words: ['My', 'brother', 'plays', 'in', 'the', 'garden'], scrambled: ['garden', 'My', 'brother', 'plays', 'in', 'the'] },
  { sentence: 'We live in a big house', words: ['We', 'live', 'in', 'a', 'big', 'house'], scrambled: ['house', 'We', 'live', 'in', 'a', 'big'] },
  { sentence: 'The kitchen is very clean', words: ['The', 'kitchen', 'is', 'very', 'clean'], scrambled: ['clean', 'The', 'kitchen', 'is', 'very'] },
  // ——— Premium: actions & verbs ———
  { sentence: 'The dog runs in the park', words: ['The', 'dog', 'runs', 'in', 'the', 'park'], scrambled: ['park', 'The', 'dog', 'runs', 'in', 'the'] },
  { sentence: 'She jumps over the rope', words: ['She', 'jumps', 'over', 'the', 'rope'], scrambled: ['rope', 'She', 'jumps', 'over', 'the'] },
  { sentence: 'They swim in the pool', words: ['They', 'swim', 'in', 'the', 'pool'], scrambled: ['pool', 'They', 'swim', 'in', 'the'] },
  { sentence: 'I draw a picture of a cat', words: ['I', 'draw', 'a', 'picture', 'of', 'a', 'cat'], scrambled: ['cat', 'I', 'draw', 'a', 'picture', 'of', 'a'] },
  { sentence: 'We ride our bikes to the park', words: ['We', 'ride', 'our', 'bikes', 'to', 'the', 'park'], scrambled: ['park', 'We', 'ride', 'our', 'bikes', 'to', 'the'] },
  { sentence: 'The baby is sleeping in the crib', words: ['The', 'baby', 'is', 'sleeping', 'in', 'the', 'crib'], scrambled: ['crib', 'The', 'baby', 'is', 'sleeping', 'in', 'the'] },
  // ——— Premium: simple statements ———
  { sentence: 'This is my book', words: ['This', 'is', 'my', 'book'], scrambled: ['book', 'This', 'is', 'my'] },
  { sentence: 'That is a big dog', words: ['That', 'is', 'a', 'big', 'dog'], scrambled: ['dog', 'That', 'is', 'a', 'big'] },
  { sentence: 'Here is your coat', words: ['Here', 'is', 'your', 'coat'], scrambled: ['coat', 'Here', 'is', 'your'] },
  { sentence: 'There are five apples', words: ['There', 'are', 'five', 'apples'], scrambled: ['apples', 'There', 'are', 'five'] },
  { sentence: 'I want to help you', words: ['I', 'want', 'to', 'help', 'you'], scrambled: ['you', 'I', 'want', 'to', 'help'] },
  { sentence: 'Can you see the bird', words: ['Can', 'you', 'see', 'the', 'bird'], scrambled: ['bird', 'Can', 'you', 'see', 'the'] },
  { sentence: 'Please pass the salt', words: ['Please', 'pass', 'the', 'salt'], scrambled: ['salt', 'Please', 'pass', 'the'] },
  { sentence: 'Thank you for the gift', words: ['Thank', 'you', 'for', 'the', 'gift'], scrambled: ['gift', 'Thank', 'you', 'for', 'the'] },
]

// High-res image URLs (800px) for sharp display on retina smartphones; fallback to emoji
const PICTURE_PUZZLES: PicturePuzzle[] = [
  { word: 'APPLE', image: '🍎', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=85&fit=crop', options: ['APPLE', 'ORANGE', 'BANANA', 'GRAPE'], correct: 0 },
  { word: 'CAT', image: '🐱', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=85&fit=crop', options: ['DOG', 'CAT', 'BIRD', 'FISH'], correct: 1 },
  { word: 'DOG', image: '🐶', imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&q=85&fit=crop', options: ['CAT', 'DOG', 'RABBIT', 'MOUSE'], correct: 1 },
  { word: 'SUN', image: '☀️', imageUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=85&fit=crop', options: ['MOON', 'STAR', 'SUN', 'CLOUD'], correct: 2 },
  { word: 'TREE', image: '🌳', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=85&fit=crop', options: ['FLOWER', 'TREE', 'GRASS', 'LEAF'], correct: 1 },
  { word: 'CAR', image: '🚗', imageUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=85&fit=crop', options: ['BUS', 'CAR', 'BIKE', 'PLANE'], correct: 1 },
  { word: 'BOOK', image: '📚', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=85&fit=crop', options: ['PEN', 'BOOK', 'PAPER', 'PENCIL'], correct: 1 },
  { word: 'BALL', image: '⚽', imageUrl: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&q=85&fit=crop', options: ['BALL', 'TOY', 'DOLL', 'BLOCK'], correct: 0 },
  { word: 'FISH', image: '🐟', imageUrl: 'https://images.unsplash.com/photo-1753644350123-9cb32be6e0b5?w=800&q=85&fit=crop', options: ['CAT', 'FISH', 'BIRD', 'DOG'], correct: 1 },
  { word: 'MOON', image: '🌙', imageUrl: 'https://images.unsplash.com/photo-1486845918423-c82bbda48d29?w=800&q=85&fit=crop', options: ['SUN', 'STAR', 'MOON', 'CLOUD'], correct: 2 },
  { word: 'BIRD', image: '🐦', imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&q=85&fit=crop', options: ['BIRD', 'FISH', 'CAT', 'DOG'], correct: 0 },
  { word: 'HOUSE', image: '🏠', imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=85&fit=crop', options: ['CAR', 'TREE', 'HOUSE', 'BALL'], correct: 2 },
]

export default function PuzzleModule() {
  const router = useRouter()
  const [puzzleType, setPuzzleType] = useState<PuzzleType | null>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [showHint, setShowHint] = useState(false)
  const [muted, setMuted] = useState(false)

  // Word Puzzle State
  const [wordPuzzleIndex, setWordPuzzleIndex] = useState(0)
  const [selectedLetters, setSelectedLetters] = useState<string[]>([])
  const [availableLetters, setAvailableLetters] = useState<string[]>([])

  // Sentence Puzzle State
  const [sentencePuzzleIndex, setSentencePuzzleIndex] = useState(0)
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])

  // Picture Puzzle State
  const [picturePuzzleIndex, setPicturePuzzleIndex] = useState(0)
  const [selectedPictureAnswer, setSelectedPictureAnswer] = useState<number | null>(null)
  const [pictureImageError, setPictureImageError] = useState(false)

  // Word-Picture (letter pieces) state: order[i] = letter index at slot i
  const [wordPictureIndex, setWordPictureIndex] = useState(0)
  const [pieceOrder, setPieceOrder] = useState<number[]>([])
  const [draggedSlot, setDraggedSlot] = useState<number | null>(null)
  const [tappedSlot, setTappedSlot] = useState<number | null>(null)

  // Game state
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [completedPuzzles, setCompletedPuzzles] = useState(0)

  useEffect(() => {
    if (puzzleType === 'picture') setPictureImageError(false)
  }, [puzzleType, picturePuzzleIndex])

  useEffect(() => {
    if (puzzleType === 'word' && WORD_PUZZLES[wordPuzzleIndex]) {
      const puzzle = WORD_PUZZLES[wordPuzzleIndex]
      setAvailableLetters(shuffleArray([...puzzle.scrambled]))
      setSelectedLetters([])
      setShowHint(false)
    }
  }, [puzzleType, wordPuzzleIndex])

  useEffect(() => {
    if (puzzleType === 'sentence' && SENTENCE_PUZZLES[sentencePuzzleIndex]) {
      const puzzle = SENTENCE_PUZZLES[sentencePuzzleIndex]
      setAvailableWords(shuffleArray([...puzzle.scrambled]))
      setSelectedWords([])
      setShowHint(false)
    }
  }, [puzzleType, sentencePuzzleIndex])

  useEffect(() => {
    if (puzzleType === 'word-picture' && WORD_PICTURE_PUZZLES[wordPictureIndex]) {
      const puzzle = WORD_PICTURE_PUZZLES[wordPictureIndex]
      const indices = Array.from({ length: puzzle.word.length }, (_, i) => i)
      let order = shuffleArray(indices)
      // Never show puzzle already solved: reshuffle until order is not correct
      while (order.every((letterIndex, slot) => letterIndex === slot) && order.length > 1) {
        order = shuffleArray(indices)
      }
      setPieceOrder(order)
      setShowHint(false)
    }
  }, [puzzleType, wordPictureIndex])

  const handleLetterClick = (letter: string, index: number) => {
    if (puzzleType !== 'word') return
    setAvailableLetters(prev => prev.filter((_, i) => i !== index))
    setSelectedLetters(prev => [...prev, letter])
  }

  const handleLetterRemove = (letter: string, index: number) => {
    if (puzzleType !== 'word') return
    setSelectedLetters(prev => prev.filter((_, i) => i !== index))
    setAvailableLetters(prev => shuffleArray([...prev, letter]))
  }

  const handleWordClick = (word: string, index: number) => {
    if (puzzleType !== 'sentence') return
    setAvailableWords(prev => prev.filter((_, i) => i !== index))
    setSelectedWords(prev => [...prev, word])
  }

  const handleWordRemove = (word: string, index: number) => {
    if (puzzleType !== 'sentence') return
    setSelectedWords(prev => prev.filter((_, i) => i !== index))
    setAvailableWords(prev => shuffleArray([...prev, word]))
  }

  // Word puzzle: check after state updates (setState is async, so we validate in effect)
  useEffect(() => {
    if (puzzleType !== 'word' || showFeedback) return
    const puzzle = WORD_PUZZLES[wordPuzzleIndex]
    if (!puzzle) return
    const currentWord = selectedLetters.join('')
    if (currentWord.length === puzzle.word.length && currentWord === puzzle.word) {
      handleCorrect()
    }
  }, [puzzleType, wordPuzzleIndex, selectedLetters, showFeedback])

  // Sentence puzzle: check after state updates
  useEffect(() => {
    if (puzzleType !== 'sentence' || showFeedback) return
    const puzzle = SENTENCE_PUZZLES[sentencePuzzleIndex]
    if (!puzzle) return
    if (selectedWords.length === puzzle.words.length) {
      const currentSentence = selectedWords.join(' ')
      if (currentSentence.toLowerCase() === puzzle.sentence.toLowerCase()) {
        handleCorrect()
      }
    }
  }, [puzzleType, sentencePuzzleIndex, selectedWords, showFeedback])

  const handlePictureAnswer = (index: number) => {
    if (puzzleType !== 'picture') return
    
    setSelectedPictureAnswer(index)
    const puzzle = PICTURE_PUZZLES[picturePuzzleIndex]
    
    if (index === puzzle.correct) {
      handleCorrect()
    } else {
      handleIncorrect()
    }
  }

  const handleCorrect = () => {
    setIsCorrect(true)
    setShowFeedback(true)
    setScore(prev => prev + 10)
    setCompletedPuzzles(prev => prev + 1)
    
    try {
      audioManager.playSuccess()
      progressManager.addScore(10, 5)
      progressManager.addModuleProgress('puzzle', 1)
      challengeManager.updateChallengeProgress('puzzle', 1)
    } catch (error) {
      console.error('Error updating progress:', error)
    }

    setTimeout(() => {
      nextPuzzle()
    }, 1500)
  }

  const handleIncorrect = () => {
    setIsCorrect(false)
    setShowFeedback(true)
    
    try {
      audioManager.playError()
    } catch (error) {
      console.error('Error playing sound:', error)
    }

    setTimeout(() => {
      setShowFeedback(false)
      setIsCorrect(null)
      if (puzzleType === 'picture') {
        setSelectedPictureAnswer(null)
      }
    }, 1500)
  }

  const nextPuzzle = () => {
    setShowFeedback(false)
    setIsCorrect(null)
    setShowHint(false)
    
    if (puzzleType === 'word') {
      const nextIndex = (wordPuzzleIndex + 1) % WORD_PUZZLES.length
      setWordPuzzleIndex(nextIndex)
      if (nextIndex === 0) setLevel(prev => prev + 1)
    } else if (puzzleType === 'sentence') {
      const nextIndex = (sentencePuzzleIndex + 1) % SENTENCE_PUZZLES.length
      setSentencePuzzleIndex(nextIndex)
      if (nextIndex === 0) setLevel(prev => prev + 1)
    } else if (puzzleType === 'picture') {
      const nextIndex = (picturePuzzleIndex + 1) % PICTURE_PUZZLES.length
      setPicturePuzzleIndex(nextIndex)
      setSelectedPictureAnswer(null)
      setPictureImageError(false)
      if (nextIndex === 0) setLevel(prev => prev + 1)
    } else if (puzzleType === 'word-picture') {
      setPieceOrder([]) // clear so stale "solved" order doesn't trigger checkWordPictureCorrect and skip the next puzzle
      setTappedSlot(null)
      const nextIndex = (wordPictureIndex + 1) % WORD_PICTURE_PUZZLES.length
      setWordPictureIndex(nextIndex)
      if (nextIndex === 0) setLevel(prev => prev + 1)
    }
  }

  const resetPuzzle = () => {
    setShowFeedback(false)
    setIsCorrect(null)
    setShowHint(false)
    
    if (puzzleType === 'word') {
      const puzzle = WORD_PUZZLES[wordPuzzleIndex]
      setAvailableLetters(shuffleArray([...puzzle.scrambled]))
      setSelectedLetters([])
    } else if (puzzleType === 'sentence') {
      const puzzle = SENTENCE_PUZZLES[sentencePuzzleIndex]
      setAvailableWords(shuffleArray([...puzzle.scrambled]))
      setSelectedWords([])
    } else if (puzzleType === 'picture') {
      setSelectedPictureAnswer(null)
    } else if (puzzleType === 'word-picture') {
      const puzzle = WORD_PICTURE_PUZZLES[wordPictureIndex]
      const indices = Array.from({ length: puzzle.word.length }, (_, i) => i)
      let order = shuffleArray(indices)
      while (order.every((letterIndex, slot) => letterIndex === slot) && order.length > 1) {
        order = shuffleArray(indices)
      }
      setPieceOrder(order)
      setTappedSlot(null)
    }
  }

  const checkWordPictureCorrect = useCallback(() => {
    const puzzle = WORD_PICTURE_PUZZLES[wordPictureIndex]
    if (puzzleType !== 'word-picture' || !puzzle || pieceOrder.length !== puzzle.word.length) return
    const correct = pieceOrder.every((letterIndex, slot) => letterIndex === slot)
    if (correct && !showFeedback) handleCorrect()
  }, [puzzleType, wordPictureIndex, pieceOrder, showFeedback])

  useEffect(() => {
    checkWordPictureCorrect()
  }, [pieceOrder, checkWordPictureCorrect])

  const handlePieceDragStart = (slotIndex: number) => {
    setDraggedSlot(slotIndex)
  }
  const handlePieceDragOver = (e: React.DragEvent) => e.preventDefault()
  const handlePieceDrop = (targetSlot: number) => {
    if (draggedSlot === null || draggedSlot === targetSlot) return
    setPieceOrder(prev => {
      const next = [...prev]
      ;[next[draggedSlot!], next[targetSlot]] = [next[targetSlot], next[draggedSlot!]]
      return next
    })
    setDraggedSlot(null)
  }

  const handlePieceClick = (slotIndex: number) => {
    if (tappedSlot === null) {
      setTappedSlot(slotIndex)
      return
    }
    if (tappedSlot === slotIndex) {
      setTappedSlot(null)
      return
    }
    setPieceOrder(prev => {
      const next = [...prev]
      ;[next[tappedSlot], next[slotIndex]] = [next[slotIndex], next[tappedSlot]]
      return next
    })
    setTappedSlot(null)
  }

  const speakWord = (word: string) => {
    if (!muted) {
      try {
        audioManager.speak(word)
      } catch (error) {
        console.error('Error speaking:', error)
      }
    }
  }

  const puzzleTypes = [
    {
      id: 'word-picture' as PuzzleType,
      name: 'Word Picture Puzzle',
      description: 'Put the pieces in order to spell the word!',
      icon: <Puzzle className="w-8 h-8" />,
      color: 'from-[#8eca40] to-[#00aeef]'
    },
    {
      id: 'word' as PuzzleType,
      name: 'Word Puzzle',
      description: 'Arrange letters to form words',
      icon: <Target className="w-8 h-8" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'sentence' as PuzzleType,
      name: 'Sentence Puzzle',
      description: 'Arrange words to form sentences',
      icon: <Target className="w-8 h-8" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 'picture' as PuzzleType,
      name: 'Picture Match',
      description: 'Match pictures with words',
      icon: <Lightbulb className="w-8 h-8" />,
      color: 'from-purple-400 to-pink-500'
    }
  ]

  if (!puzzleType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/learning')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning
            </Button>
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg"
              >
                <Puzzle className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Puzzle Games
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Solve puzzles and learn English!
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {puzzleTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="card-kid cursor-pointer group relative overflow-hidden h-full"
                  onClick={() => setPuzzleType(type.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <CardContent className="p-6 text-center relative">
                    <motion.div
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg text-white`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {type.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      {type.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentWordPuzzle = WORD_PUZZLES[wordPuzzleIndex]
  const currentSentencePuzzle = SENTENCE_PUZZLES[sentencePuzzleIndex]
  const currentPicturePuzzle = PICTURE_PUZZLES[picturePuzzleIndex]
  const currentWordPicturePuzzle = WORD_PICTURE_PUZZLES[wordPictureIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-indigo-900 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setPuzzleType(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full shadow-md">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-800 dark:text-white">{score}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-full shadow-md">
              <Trophy className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-gray-800 dark:text-white">Level {level}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMuted(!muted)}
              className="rounded-full"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Word Puzzle */}
        {puzzleType === 'word' && currentWordPuzzle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="card-kid">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Word Puzzle
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {wordPuzzleIndex + 1} of {WORD_PUZZLES.length}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHint(!showHint)}
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Hint
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetPuzzle}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl p-4"
                  >
                    <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                      💡 Hint: {currentWordPuzzle.hint}
                    </p>
                  </motion.div>
                )}

                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Spell the word ({currentWordPuzzle.word.length} letters)
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 min-h-[120px] flex items-center justify-center border-4 border-dashed border-purple-300 dark:border-purple-700">
                    {selectedLetters.length > 0 ? (
                      <div className="flex gap-3 flex-wrap justify-center">
                        {selectedLetters.map((letter, index) => (
                          <motion.button
                            key={`${letter}-${index}`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLetterRemove(letter, index)}
                            className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 text-white text-2xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                          >
                            {letter}
                          </motion.button>
                        ))}
                        {Array.from({ length: currentWordPuzzle.word.length - selectedLetters.length }).map((_, i) => (
                          <span key={`empty-${i}`} className="w-16 h-16 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-600 flex items-center justify-center text-gray-300 dark:text-gray-500 text-2xl" aria-hidden>
                            ?
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-3 flex-wrap justify-center">
                        {Array.from({ length: currentWordPuzzle.word.length }).map((_, i) => (
                          <span key={`slot-${i}`} className="w-16 h-16 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-600 flex items-center justify-center text-gray-300 dark:text-gray-500 text-xl" aria-hidden>
                            _
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                    Available Letters
                  </p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {availableLetters.map((letter, index) => (
                      <motion.button
                        key={`${letter}-${index}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLetterClick(letter, index)}
                        className="w-16 h-16 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-2xl font-bold rounded-xl shadow-md hover:shadow-lg border-2 border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
                      >
                        {letter}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`text-center p-4 rounded-xl ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {isCorrect ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-6 h-6" />
                          <span className="font-bold text-lg">Excellent! +10 points</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-6 h-6" />
                          <span className="font-bold text-lg">Try again!</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sentence Puzzle */}
        {puzzleType === 'sentence' && currentSentencePuzzle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="card-kid">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Sentence Puzzle
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetPuzzle}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 min-h-[120px] flex items-center justify-center border-4 border-dashed border-green-300 dark:border-green-700">
                    {selectedWords.length > 0 ? (
                      <div className="flex gap-3 flex-wrap justify-center">
                        {selectedWords.map((word, index) => (
                          <motion.button
                            key={`${word}-${index}`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleWordRemove(word, index)}
                            className="px-6 py-3 bg-gradient-to-br from-green-400 to-emerald-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                          >
                            {word}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500 text-lg">
                        Arrange the words below to form a sentence
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                    Available Words
                  </p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    {availableWords.map((word, index) => (
                      <motion.button
                        key={`${word}-${index}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleWordClick(word, index)}
                        className="px-6 py-3 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-lg font-semibold rounded-xl shadow-md hover:shadow-lg border-2 border-green-200 dark:border-green-800 transition-all cursor-pointer"
                      >
                        {word}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`text-center p-4 rounded-xl ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {isCorrect ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-6 h-6" />
                          <span className="font-bold text-lg">Excellent! +10 points</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-6 h-6" />
                          <span className="font-bold text-lg">Try again!</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Picture Puzzle */}
        {puzzleType === 'picture' && currentPicturePuzzle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="card-kid">
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Picture Match
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mb-6 flex justify-center items-center min-h-[200px] sm:min-h-[260px]"
                  >
                    {currentPicturePuzzle.imageUrl && !pictureImageError ? (
                      <img
                        src={currentPicturePuzzle.imageUrl}
                        alt={currentPicturePuzzle.word}
                        className="w-full max-w-[280px] sm:max-w-[320px] h-auto object-contain rounded-2xl shadow-lg"
                        width={800}
                        height={800}
                        loading="eager"
                        decoding="async"
                        onError={() => setPictureImageError(true)}
                      />
                    ) : (
                      <span className="text-9xl block" style={{ fontSize: 'min(8rem, 22vw)' }}>
                        {currentPicturePuzzle.image}
                      </span>
                    )}
                  </motion.div>
                  <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
                    What word matches this picture?
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {currentPicturePuzzle.options.map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePictureAnswer(index)}
                      disabled={selectedPictureAnswer !== null}
                      className={`p-6 rounded-2xl text-lg font-bold shadow-lg transition-all ${
                        selectedPictureAnswer === index
                          ? index === currentPicturePuzzle.correct
                            ? 'bg-green-400 text-white'
                            : 'bg-red-400 text-white'
                          : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-900/30 border-2 border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`text-center p-4 rounded-xl ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {isCorrect ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-6 h-6" />
                          <span className="font-bold text-lg">Excellent! +10 points</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-6 h-6" />
                          <span className="font-bold text-lg">Try again! The correct answer is: {currentPicturePuzzle.word}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Word Picture Puzzle - pieces with image + letter, drag to reorder */}
        {puzzleType === 'word-picture' && currentWordPicturePuzzle && pieceOrder.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="card-kid overflow-hidden border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      Word Picture Puzzle
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {wordPictureIndex + 1} of {WORD_PICTURE_PUZZLES.length}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)}>
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Hint
                    </Button>
                    <Button variant="outline" size="sm" onClick={resetPuzzle}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4"
                  >
                    <p className="text-amber-800 dark:text-amber-200 font-semibold">
                      💡 {currentWordPicturePuzzle.hint}
                    </p>
                  </motion.div>
                )}

                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                  Drag pieces to reorder, or tap one piece then another to swap. Spell the word!
                </p>

                {/* Striped background area + puzzle pieces - responsive for portrait */}
                <div
                  className="relative rounded-2xl overflow-hidden min-h-[200px] p-4 sm:p-6"
                  style={{
                    background: 'repeating-linear-gradient(135deg, #e8f5e9 0px, #e8f5e9 12px, #fff 12px, #fff 24px)',
                  }}
                >
                  <div className="flex flex-wrap justify-center items-end gap-3 sm:gap-4">
                    {pieceOrder.map((letterIndex, slotIndex) => {
                      const letter = currentWordPicturePuzzle.word[letterIndex]
                      return (
                        <motion.div
                          key={`${slotIndex}-${letterIndex}`}
                          draggable
                          onDragStart={() => handlePieceDragStart(slotIndex)}
                          onDragOver={handlePieceDragOver}
                          onDrop={() => handlePieceDrop(slotIndex)}
                          onDragEnd={() => setDraggedSlot(null)}
                          onClick={() => handlePieceClick(slotIndex)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: slotIndex * 0.05 }}
                          className={`
                            flex flex-col rounded-xl border-2 border-amber-200 dark:border-amber-800
                            bg-white dark:bg-slate-800 shadow-lg cursor-grab active:cursor-grabbing touch-manipulation
                            w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36
                            ${draggedSlot === slotIndex ? 'opacity-60 scale-95 ring-2 ring-[#00aeef]' : ''}
                            ${tappedSlot === slotIndex ? 'ring-2 ring-[#00aeef] ring-offset-2 scale-105' : ''}
                            hover:shadow-xl hover:scale-[1.02]
                          `}
                        >
                          <div className="flex-1 flex items-center justify-center p-1 text-4xl sm:text-5xl md:text-6xl">
                            {currentWordPicturePuzzle.emoji}
                          </div>
                          <div className="h-8 sm:h-10 flex items-center justify-center border-t-2 border-amber-200 dark:border-amber-700 bg-amber-50/80 dark:bg-slate-700/80 rounded-b-lg">
                            <span className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white lowercase">
                              {letter}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakWord(currentWordPicturePuzzle.word)}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Hear the word
                  </Button>
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`text-center p-4 rounded-xl ${
                        isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {isCorrect ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-6 h-6" />
                          <span className="font-bold text-lg">Excellent! +10 points</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <X className="w-6 h-6" />
                          <span className="font-bold text-lg">Try again!</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

