
console.log('Chunking...')

// this module breaks an AWS transcript into reasonable-sized chunks based on punctionation and word timing

const defaultConfig = {
  sectionOnPunctuation: true,
  minSectionSize: 2,

  minChunkSize: 3,
  maxChunkSize: 15,
  softMaxChunkSize: 10,

  globalThresholdWeight: 0.15,
  globalDeviations: 0.15,

  sectionThresholdWeight: 0.15,
  sectionDeviations: 0.25,
}

// utils
const sum = arr => arr.reduce((a, b) => a + b, 0)
const mean = arr => sum(arr) / arr.length
const stdDev = arr => {
  const sqDiff = arr.map(x => Math.pow(x - mean(arr), 2))
  return Math.sqrt(sum(sqDiff) / (arr.length - 1))
}

export default function(transcript, config) {

  config = { ...defaultConfig, ...config }
  const { items } = transcript.results

  // split items into sections based on punctuation
  let sections = []
  let section = { items: [] }
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type === 'pronunciation') {
      section.items.push(item)
    } else if (config.sectionOnPunctuation && section.items.length >= config.minSectionSize) {
      sections.push(section)
      section = { items: [] }
    }
  }
  if (section.items.length) {
    sections.push(section)
  }

  // calculate spaces between words
  let globalSpaces = []
  for (let section of sections) {

    // make array of spaces for each word in this section
    section.spaces = []
    for (let i = 1; i < section.items.length; i++) {

      const currentItem = section.items[i]
      const previousItem = section.items[i - 1]

      currentItem.space = currentItem.start_time - previousItem.end_time
      section.spaces.push(currentItem.space)
    }

    globalSpaces.push(...section.spaces) // add to global spaces array for the whole transcript (not just this section)

  }

  // simple statistics for the whole transcript
  const globalMean = mean(globalSpaces)
  const globalStdDev = stdDev(globalSpaces)

  // split sections into chunks based on spaces
  let chunks = []
  let chunk = []
  for (let section of sections) {

    const sectionMean = mean(section.spaces)
    const sectionStdDev = stdDev(section.spaces)

    console.log((sectionMean + sectionStdDev * config.sectionDeviations) * config.sectionThresholdWeight)

    for (let i = 0; i < section.items.length; i++) {
      const item = section.items[i]
      console.log('Item:', item.alternatives[0].content, item.space)

      if (
        (chunk.length === config.maxChunkSize) ||
        (chunk.length > config.softMaxChunkSize && item.space > 0) ||
        (
          item.space > 0 &&
          chunk.length >= config.minChunkSize &&
          item.space > (globalMean + globalStdDev * config.globalDeviations) * config.globalThresholdWeight &&
          item.space > (sectionMean + sectionStdDev * config.sectionDeviations) * config.sectionThresholdWeight &&
          i <= section.items.length - config.minChunkSize
        )
      ) {
        chunks.push(chunk)
        chunk = []
      }
      chunk.push(item)
    }
    chunks.push(chunk)
    chunk = []
  }

  console.log((globalMean + globalStdDev * config.globalDeviations) * config.globalThresholdWeight)

  // log chunks
  for(let chunk of chunks) {
    console.log('Chunk:', chunk.map(item => item.alternatives[0].content).join(' '))
  }

  return chunks

}
