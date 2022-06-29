
// PROBABLY NOT NECESSARY, AT LEAST FOR NOW

// this module takes a chunked transcript and make it into clean(er) prompts for a text-to-image model

console.log('Cleaning...')

import nlp from 'compromise/two'

const trimList = ['Adjective', 'Noun', 'Verb']

export default function prompt(chunks) {

  let prompts = []
  for (let chunk of chunks) {
    const chunkString = chunk.map(item => item.alternatives[0].content).join(' ') // concat chunk into string
    const doc = nlp(chunkString) // parse chunk string into nlp object

    // get array of words and their POS tags
    const words = doc.out('json')[0].terms

    // trim words that take away from the meaning
    let firstTrim = null
    let lastTrim = null
    for(let i in words) {
      let trimTagFound = trimList.some(r => words[i].tags.includes(r))
      if (trimTagFound && firstTrim === null) {
        firstTrim = i
      }
      if (trimTagFound) {
        lastTrim = i
      }
    }
    let prompt = ''
    for(let i = firstTrim; i <= lastTrim; i++) {
      prompt += words[i].text + ' '
    }
    prompt = prompt.trim()
    if (!prompt) {
      prompt = chunkString
    }

    prompts.push(prompt)
  }
  
  return prompts
}
