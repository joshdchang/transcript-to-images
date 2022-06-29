
// this is a quick and dirty solution to show what the results of the process look like

export default function webPreview(chunks) {
  let html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Web Preview</title>
      </head>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 16px;
        }
      </style>
      <body>
  `

  for (let chunk of chunks) {
    html += `<h2>${chunk.text}</h2><br>`
    html += `<div>`
    for (let image of chunk.images) {
      html += `<img src="data:image/png;base64,${image}" />`
    }
    html += `</div><br><br>`
  }

  html += `</body></html>`

  return html
}