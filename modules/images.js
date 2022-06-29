
import fetch from 'node-fetch'

// utils
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// request the backend of the Craiyon website to create images for the given prompt
async function getImagesForSinglePrompt(prompt) {
  try {
    const res = await fetch("https://backend.craiyon.com/generate", {
      "credentials": "omit",
      "headers": {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:101.0) Gecko/20100101 Firefox/101.0",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.5",
        "Content-Type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site"
      },
      "referrer": "https://www.craiyon.com/",
      "body": JSON.stringify({ prompt }),
      "method": "POST",
      "mode": "cors"
    })
    const images = (await res.json()).images
    console.log('Success:', prompt)
    return images
  } catch (e) {
    console.log(e)
    console.log('Trying again:', prompt)
    return await getImagesForSinglePrompt(prompt)
  }
}

// queue the given prompts with a delay between requests
export default async function getImagesForMultiplePrompts(prompts, delay = 1000) {

  let results = []

  for(let prompt of prompts) {
    console.log('Initiating request for prompt: ' + prompt)
    results.push(getImagesForSinglePrompt(prompt))
    await sleep(delay)
  }

  return await Promise.all(results)
}
