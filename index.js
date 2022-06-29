
let inputPath = './transcriptions/jfk.json' // path to transcript json file - this can be any AWS Transcribe output!

let outputPath = './outputs/jfk.json' // where the machine readable output will go

// imports
import fs from 'fs'
import open from 'open'
import chunk from './modules/chunk.js'
import getImages from './modules/images.js'
import webPreview from './modules/webPreview.js'

// run modules in sequence
console.time('Runtime')

const transcription = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
const chunks = chunk(transcription)
const prompts = []
for(let chunk of chunks) {
  prompts.push(chunk.map(item => item.alternatives[0].content).join(' '))
}

getImages(prompts).then(images => {
  
  let output = []

  for(let i in images) {
    output[i] = {
      text: chunks[i].map(item => item.alternatives[0].content).join(' '),
      prompt: prompts[i],
      images: images[i],
      chunks: chunks[i],
    }
  }
  fs.writeFileSync(outputPath, JSON.stringify(output))
  fs.writeFileSync('./webPreview.html', webPreview(output))

  console.log('Done!')
  console.timeEnd('Runtime')

  open('./webPreview.html')
})
