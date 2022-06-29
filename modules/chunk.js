
console.log('Chunking...')

// this module breaks an AWS transcript into reasonable-sized chunks based on punctionation and word timing

const defaultConfig = {
  sectionOnPunctuation: true,
  minSectionSize: 4,

  minChunkSize: 4,
  maxChunkSize: 15,
  softMaxChunkSize: 10, // threshold at which chunks are split if there is any space at all

  globalMeanThreshold: 0.15, // percent of average space length that a space must be above
  globalQuantileThreshold: 0.60, // above what quantile of global spaces that a space must be

  sectionMeanThreshold: 0.30, // percent of average space length of its section that a space must be above
  sectionQuantileThreshold: 0.70, // above what quantile of section spaces that a space must be
}

// utils
const asc = arr => arr.sort((a, b) => a - b)
const sum = arr => arr.reduce((a, b) => a + b, 0)
const mean = arr => sum(arr) / arr.length
const quantile = (arr, q) => {
  const sorted = asc(arr)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base])
  } else {
    return sorted[base]
  }
}

export default function(transcript, config) {

  config = { ...defaultConfig, ...config }
  const { items } = transcript.results

  // split items into sections based on punctuation
  let sections = []
  let section = { items: [] }
  for (let item of items) {

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

  // calculate and analyze spaces between words
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
  const globalQuantile = quantile(globalSpaces, config.globalQuantileThreshold)

  // split sections into chunks based on spaces
  let chunks = []
  let chunk = []
  for (let section of sections) {

    const sectionMean = mean(section.spaces)
    const sectionQuantile = quantile(section.spaces, config.sectionQuantileThreshold)

    for (let item of section.items) {
      if (
        chunk.length === config.maxChunkSize ||
        (chunk.length > config.softMaxChunkSize && item.space > 0) ||
        (
          item.space > 0 &&
          chunk.length >= config.minChunkSize &&
          item.space > globalMean * config.globalMeanThreshold &&
          item.space > sectionMean * config.sectionMeanThreshold &&
          item.space > globalQuantile &&
          item.space > sectionQuantile
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

  // log chunks
  for(let chunk of chunks) {
    console.log('Chunk:', chunk.map(item => item.alternatives[0].content).join(' '))
  }

  return chunks
}