import assert from 'assert'
import fs from 'fs'
import path from 'path'
import minimist from 'minimist'
import Facemorph from '../index'

const argv = minimist(process.argv.slice(2))
const images = argv.i || argv.images
const frames = argv.f || argv.frames || 20
const delay = argv.d || argv.delay || 40

assert(images, 'images should be provided')
;(async function createGif() {
  try {
    const facemorph = Facemorph(frames)
    const gifBuffer: Buffer = await facemorph.createGif(
      images instanceof Array ? images : [images],
      delay
    )
    const newFile = path.join(__dirname, `facemorph_${Date.now()}.gif`)
    await fs.promises.writeFile(newFile, gifBuffer)
    console.log(`Your new gif: ${newFile}`)
  } catch (err) {
    console.error(`Error creating facemorph gif`, err)
  } finally {
    process.exit()
  }
})()
