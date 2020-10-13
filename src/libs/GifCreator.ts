import fs from 'fs'
import path from 'path'
import GIFEncoder from 'gifencoder'
import ImageProcessor from './ImageProcessor'

// import pngFileStream from 'png-file-stream'
const pngFileStream = require('png-file-stream')

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
      const tmpDir = path.join(
        __dirname,
        '..',
        '..',
        'tmp',
        Date.now().toString()
      )

      // create dir
      try {
        await fs.promises.mkdir(tmpDir)
      } finally {
      }

      await Promise.all(
        buffers.map(async (buf, ind) => {
          await fs.promises.writeFile(
            path.join(
              tmpDir,
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
      pngFileStream(path.join(tmpDir, '*.png')).pipe(writeStream)
      const finalGifBuffer = await ImageProcessor.streamToBuffer(writeStream)
      try {
        await fs.promises.rmdir(tmpDir, { recursive: true })
      } finally {
      }
      return finalGifBuffer
    },
  }
}
