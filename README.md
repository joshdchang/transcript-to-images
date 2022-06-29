# Transcript To Images

This program takes a AWS Transcribe JSON file as input, splits it into chunks, and generates images using [Craiyon](https://www.craiyon.com/).

To try it out:
- Add your transcription to the `/transcriptions` directory or use the demo one (`jfk.json`)
- Open `index.js` and change the `inputPath` and `outputPath` variables to match the transcript you are using or leave as is for the demo
- Run `npm install`
- Run `npm run start`

When it's done, the program will output a machine-readable JSON file and open a little web preview that I hacked together.