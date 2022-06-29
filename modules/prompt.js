
// this module takes a chunked transcript and make it into clean(er) prompts for a text-to-image model

console.log('Cleaning...')

import nlp from 'compromise/two'

const trimList = ['Conjunction', 'Preposition', 'Pronoun', 'Auxiliary', 'Copula', 'Determiner', 'Modal']

export default function prompt(chunks) {

  let prompts = []
  for (let chunk of chunks) {
    const chunkString = chunk.map(item => item.alternatives[0].content).join(' ') // concat chunk into string
    const doc = nlp(chunkString) // parse chunk string into nlp object

    // get array of words and their POS tags
    doc.debug()
    const words = doc.out('json')[0].terms

    // trim words that take away from the meaning
    let firstTrim = null
    let lastTrim = null
    for(let i = 0; i < words.length; i++) {
      const word = words[i]
      let trimTagFound = trimList.some(r => word.tags.includes(r))
      if (!trimTagFound && firstTrim === null) {
        firstTrim = i
      }
      if (!trimTagFound) {
        lastTrim = i
      }
    }
    let prompt = ''
    if(firstTrim !== null && lastTrim !== null) {
      for(let i = firstTrim; i <= lastTrim; i++) {
        let word = words[i]
        prompt += word.text + ' '
      }
    }
    prompt = prompt.trim()
    if (!prompt) {
      prompt = chunkString
    }

    prompts.push(prompt)
  }
  
  return prompts
}
