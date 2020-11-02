import assert from 'assert'
import fs from 'fs'
import path from 'path'
import minimist from 'minimist'
import Facemorph from '../index'

const argv = minimist(process.argv.slice(2))
const dir = argv.d || argv.dir
const images = argv.i || argv.images
const frames = argv.f || argv.frames || 20
const delay = argv.delay || 40

assert(images || dir, '-i, --images or -d, --dir should be provided')
;(async function createGif() {
  try {
    const facemorph = Facemorph(frames)
    let gifBuffer: Buffer
    if (dir) {
      let files = await fs.promises.readdir(dir)
      // TODO Adding all files in reverse to the array to allow for
      // reversing the animation but should this be configurable?
      files = files.concat(files.reverse().slice(1, -1))
      gifBuffer = await facemorph.createGif(
        files.map((f) => path.join(dir, f)),
        delay
      )
    } else {
      gifBuffer = await facemorph.createGif(
        images instanceof Array ? images : [images],
        delay
      )
    }

    const newFile = path.join(__dirname, `facemorph_${Date.now()}.gif`)
    await fs.promises.writeFile(newFile, gifBuffer)
    console.log(`Your new gif: ${newFile}`)
  } catch (err) {
    console.error(`Error creating facemorph gif`, err)
  } finally {
    process.exit()
  }
})()
