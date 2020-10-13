import fs from 'fs'
import path from 'path'
import GIFEncoder from 'gifencoder'
import ImageProcessor from './ImageProcessor'

// import pngFileStream from 'png-file-stream'
const pngFileStream = require('png-file-stream')

const repoTmpDir = path.join(__dirname, '..', '..', 'tmp')

export default function GifCreator(
  width: number,
  height: number,
  delay: number = 100,
  repeat: number = -1,
  quality: number = 10
) {
  return {
    encoder: new GIFEncoder(width, height),

    async create(...buffers: Buffer[]): Promise<Buffer> {
      const instTmpDir = path.join(repoTmpDir, Date.now().toString())

      // create dir
      await createDirIgnoreErrors(repoTmpDir)
      await createDirIgnoreErrors(instTmpDir)

      await Promise.all(
        buffers.map(async (buf, ind) => {
          await fs.promises.writeFile(
            path.join(
              instTmpDir,
              `img${(ind + 1).toString().padStart(5, '0')}.png`
            ),
            buf
          )
        })
      )
      const writeStream = this.encoder.createWriteStream({
        repeat,
        delay,
        quality,
      })
      pngFileStream(path.join(instTmpDir, '*.png')).pipe(writeStream)
      const finalGifBuffer = await ImageProcessor.streamToBuffer(writeStream)
      await rmDirIgnoreErrors(instTmpDir)

      return finalGifBuffer
    },
  }
}

async function createDirIgnoreErrors(dir: string) {
  try {
    await fs.promises.mkdir(dir)
  } catch (err) {}
}

async function rmDirIgnoreErrors(dir: string) {
  try {
    await fs.promises.rmdir(dir, { recursive: true })
  } catch (err) {}
}
