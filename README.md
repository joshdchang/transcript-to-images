# Transcript To Images

This program takes a AWS Transcribe JSON file as input, splits it into chunks, and generates images using [Craiyon](https://www.craiyon.com/).

To try it out:
- Add your transcription to the `/transcriptions` directory or use the example one (`jfk.json`)
- Open `index.js` and change the `inputPath` and `outputPath` variables to match the transcipt you are using
- Run `npm install`
- Run `npm run start`

When it's done, the program will output a machine-readable JSON file and open a little web preview that I quickly hacked together.