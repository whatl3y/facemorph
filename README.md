# facemorph

Create animated gifs that morph faces between each other.

<img src="https://user-images.githubusercontent.com/13718950/95853602-afd63680-0d23-11eb-8a0d-83533834e04e.gif" width="357">

**Assumptions/Limitations**

- Each image in the created GIF must contain exactly one face. If no faces or more than one are detected, an error will be thrown indicating such.
- There needs to be at least two images provided to be morphed.
- Faces are detected using the face detection model provided in [face-api.js](https://github.com/justadudewhohacks/face-api.js/). Human faces work best, where animal faces might or might not work.
- For best results, use images with white (or light) backgrounds.

## Simple Usage

```js
import Facemorph from 'facemorph'

const facemorph = Facemorph()
const gifBuffer = await facemorph.createGif([
  '/path/to/img/with/face.png', // file system path of image
  rawImgBuffer, // Buffer of image data
  streamOfImg, // Readable stream containing raw image data
  // more images...
])
await fs.promises.writeFile(`my.gif`, gifBuffer)
```

## API

TODO
