# facemorph

Create animated gifs that morph faces between each other.

<img src="https://user-images.githubusercontent.com/13718950/95856421-fc237580-0d27-11eb-9e0c-12330660ccf5.gif" width="357">

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

### constructor

```js
import Facemorph from 'facemorph'

// `frames` is the number of frames between each face morph in the GIF
const facemorph = Facemorph((frames: number = 20))
```

### facemorph.createGif

Create a GIF with morphed faces between all provided images.

```js
// images: MorfImages[] - Array of at least 2 images that can be a string, Readable stream, or raw Buffer
// delayMs: number = 20 - The delay between each frame
// repeat: number = 0 - Whether to repeat the GIF animation or not. -1: no repeat, 0 repeat
await facemorph.createGif(images /* [, delayMs, repeat] */) // : Promise<Buffer>
```

### facemorph.createFrames

Create an array of Buffers that are images of all the frames to be used
to create an animated GIF of morphed faces. This is used inside of `createGif`,
but could be used as a standalone if you want to take all the frames and do what
you'd like with them

```js
// images: MorfImages[] - Array of at least 2 images that can be a string, Readable stream, or raw Buffer
await facemorph.createFrames(images) // : Promise<Buffer[][]>
```

### facemorph.setFrames

Reset the number of frames between each face morph.

```js
facemorph.setFrames(10) // : number
```
