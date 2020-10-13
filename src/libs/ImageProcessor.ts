import { Readable } from 'stream'
import assert from 'assert'
import fs from 'fs'
import sharp from 'sharp'
// import axios from 'axios'
// import FormData from 'form-data'

/**
 * @MorfImage
 * "string": local filepath to the image
 * "Buffer": raw buffer of the image
 * "Readable": readable stream of image that can be piped to writable stream
 **/
export type MorfImage = string | Buffer | Readable

export default {
  // async removeBg(apiKey: string, file: Buffer | Readable): Promise<Buffer> {
  //   const form = new FormData()
  //   form.append(`image_file`, file)
  //   form.append('size', 'auto')
  //   const { data } = await axios.post(
  //     `https://api.remove.bg/v1.0/removebg`,
  //     form,
  //     {
  //       headers: {
  //         'X-API-Key': apiKey,
  //         ...form.getHeaders(),
  //       },
  //       responseType: 'arraybuffer',
  //     }
  //   )
  //   return data
  // },

  async resizeImage(
    img: MorfImage,
    size: number | string,
    grayScale?: boolean
  ): Promise<Buffer> {
    const imgBuffer: Buffer = await this.imgToBuffer(img)
    let sharpImg = sharp(imgBuffer)
      .rotate()
      .resize(parseInt(size.toString()))
    if (grayScale) {
      sharpImg = sharpImg.grayscale()
    }
    return await sharpImg.toBuffer()
  },

  async toSquare(img: MorfImage): Promise<Buffer> {
    const imgBuffer: Buffer = await this.imgToBuffer(img)
    const shImg = sharp(imgBuffer)
    const { width, height } = await shImg.metadata()
    assert(
      width && height,
      'width and height need to be available for squaring an image'
    )

    const length = Math.min(width, height)
    const left = Math.max(0, (width || length) / 2 - length / 2)
    const top = Math.max(0, (height || length) / 2 - length / 2)
    return await shImg
      .extract({
        left: Math.floor(left),
        top: Math.floor(top),
        width: length,
        height: length,
      })
      .png()
      .toBuffer()
  },

  async imgToBuffer(img: MorfImage) {
    if (typeof img === 'string') return await fs.promises.readFile(img)
    if (img instanceof Readable) return await this.streamToBuffer(img)
    return img
  },

  bufferToStream(buf: Buffer): Readable {
    const readable = new Readable()
    readable._read = () => {} // _read is required but NOOPing it
    readable.push(buf)
    readable.push(null)
    return readable
  },

  async streamToBuffer(str: Readable): Promise<Buffer> {
    return await new Promise((resolve, reject) => {
      let data: any[] = []
      str
        .on('error', reject)
        .on('data', (chunk) => data.push(chunk))
        .on('end', () => resolve(Buffer.concat(data)))
    })
  },
}
