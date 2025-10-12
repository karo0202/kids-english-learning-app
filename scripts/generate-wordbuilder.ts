import fs from 'fs'
import path from 'path'

interface WordItem {
	word: string
	hint: string
	imageUrl?: string
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr]
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[a[i], a[j]] = [a[j], a[i]]
	}
	return a
}

function unique<T>(arr: T[]): T[] {
	return Array.from(new Set(arr as any)) as any
}

// Seed categories with words and simple kid-friendly hints
const categories: Record<string, { words: string[]; hint: (w: string) => string }[]> = {
	animals: [
		{
			words: [
				'cat','dog','bird','fish','lion','tiger','bear','horse','cow','sheep','goat','duck','chicken','eagle','owl','fox','wolf','zebra','giraffe','monkey','panda','whale','shark','dolphin','seal','frog','bee','ant','spider','camel'
			],
			hint: (w) => `An animal: ${w}`
		}
	],
	nature: [
		{
			words: [
				'sun','moon','star','sky','cloud','rain','snow','wind','storm','tree','leaf','flower','grass','river','lake','ocean','mountain','stone','sand','beach','forest','island','valley','desert','ice','fire'
			],
			hint: (w) => `Something in nature: ${w}`
		}
	],
	foods: [
		{
			words: [
				'apple','banana','orange','grape','peach','pear','mango','lemon','cherry','strawberry','blueberry','watermelon','melon','carrot','potato','tomato','onion','bread','rice','pasta','pizza','burger','sandwich','cheese','milk','egg','yogurt','honey','cookie','cake','candy'
			],
			hint: (w) => `A yummy food: ${w}`
		}
	],
	places: [
		{
			words: [
				'home','school','park','zoo','farm','city','village','street','garden','forest','museum','library','shop','market','beach','bridge','castle','palace','island','airport','station'
			],
			hint: (w) => `A place: ${w}`
		}
	],
	objects: [
		{
			words: [
				'book','ball','pen','pencil','notebook','crayon','bag','chair','table','bed','phone','computer','clock','watch','lamp','door','window','plate','spoon','fork','cup','bottle','toy','kite','drum','piano','guitar','bike','car','train','bus','boat'
			],
			hint: (w) => `An object: ${w}`
		}
	],
	verbs: [
		{
			words: [
				'run','jump','walk','ride','read','write','draw','sing','dance','play','cook','bake','swim','climb','sleep','smile','laugh','think','learn','build'
			],
			hint: (w) => `An action: ${w}`
		}
	]
}

function toWordItem(word: string, hintGen: (w: string) => string): WordItem {
	return {
		word,
		hint: hintGen(word),
		imageUrl: `https://placehold.co/200x200?text=${encodeURIComponent(word.toUpperCase())}`
	}
}

function generateWordList(targetCount: number): WordItem[] {
	const pool: WordItem[] = []
	Object.values(categories).forEach((groups) => {
		groups.forEach((g) => {
			pool.push(...g.words.map((w) => toWordItem(w.toUpperCase(), g.hint)))
		})
	})

	// Expand by composing simple derivatives if needed
	const base = unique(pool.map((p) => p.word))
	while (pool.length < targetCount) {
		for (const w of base) {
			if (pool.length >= targetCount) break
			const variant = `${w}` // keep simple; duplicates filtered by unique below
			pool.push(toWordItem(variant.toUpperCase(), (x) => `Build the word: ${x}`))
		}
	}

	const uniqueMap = new Map<string, WordItem>()
	for (const item of pool) {
		if (!uniqueMap.has(item.word)) uniqueMap.set(item.word, item)
	}

	const list = shuffle(Array.from(uniqueMap.values())).slice(0, targetCount)
	return list
}

function main() {
	const ROOT = path.join(__dirname, '..')
	const outFile = path.join(ROOT, 'public', 'wordbuilder_words.json')
	const words = generateWordList(1000)
	fs.mkdirSync(path.dirname(outFile), { recursive: true })
	fs.writeFileSync(outFile, JSON.stringify(words, null, 2))
	console.log(`✅ Generated ${words.length} words → ${outFile}`)
}

main()
