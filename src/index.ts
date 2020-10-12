import assert from 'assert'
import fs from 'fs'
import imageSize from 'image-size'
import { createCanvas, createImageData, ImageData, loadImage } from 'canvas'
import FacialRecognition from './libs/FacialRecognition'

// import ImgWarper from './libs/ImgWarper'
const ImgWarper = require('./libs/ImgWarper')

const sizeOf = imageSize as any

type MorfImage = Buffer | string

interface IMorfImage {
  original: MorfImage
  buffer: Buffer
  detections: any
  width: number
  height: number
}

export default function Morf(frames: number = 20) {
  return {
    frames,

    setFrames(f: number) {
      return (this.frames = f)
    },

    async create(...imgs: MorfImage[]): Promise<Buffer[][]> {
      const imagePairs: IMorfImage[][] = (
        await Promise.all(
          imgs.map(
            async (img: MorfImage): Promise<IMorfImage> => {
              const { width, height } = sizeOf(img)
              return {
                original: img,
                buffer:
                  typeof img === 'string'
                    ? await fs.promises.readFile(img)
                    : img,
                detections: (await FacialRecognition.drawFaceOutlines(img))[0],
                width,
                height,
              }
            }
          )
        )
      ).reduce((imgArrays: any[][], img: any, ind: number, ary: any[]) => {
        if (imgs[ind + 1]) imgArrays.push([img, ary[ind + 1]])
        return imgArrays
      }, [])

      assert(
        imagePairs.length > 0,
        'should have at least one pair of images to morph'
      )

      const gifFrames: ImageData[][] = await Promise.all(
        imagePairs.map(async ([img1, img2]: IMorfImage[]) => {
          assert.strictEqual(
            1,
            img1.detections.length,
            'image should only detect one face'
          )
          assert.strictEqual(
            1,
            img2.detections.length,
            'image should only detect one face'
          )

          const [point1, point2] = await this.getPointDefiners(img1, img2)
          const animator = new ImgWarper.Animator(point1, point2)
          animator.generate(this.frames)
          return animator.frames
        })
      )

      return await Promise.all(
        gifFrames.map(async (frames: ImageData[]) => {
          return await Promise.all(
            frames.map(
              async (frame: ImageData): Promise<Buffer> => {
                const canv = createCanvas(
                  imagePairs[0][0].width,
                  imagePairs[0][0].height
                )
                canv.getContext('2d').putImageData(frame, 0, 0)
                return await new Promise((resolve, reject) => {
                  canv.toBuffer((err: null | Error, buffer: Buffer) => {
                    if (err) return reject(err)
                    resolve(buffer)
                  })
                })
              }
            )
          )
        })
      )
    },

    async getPointDefiners(i1: IMorfImage, i2: IMorfImage) {
      const img1Points = i1.detections[0].landmarks._positions.map(
        ({ _x, _y }: any) => new ImgWarper.Point(_x, _y)
      )
      const img2Points = i2.detections[0].landmarks._positions.map(
        ({ _x, _y }: any) => new ImgWarper.Point(_x, _y)
      )

      // image 1 info
      const canv1 = createCanvas(i1.width, i2.height)
      const ctx1 = canv1.getContext('2d')
      const img1 = await loadImage(i1.buffer)
      ctx1.drawImage(img1, 0, 0)

      // image 2 info
      const canv2 = createCanvas(i2.width, i2.height)
      const ctx2 = canv2.getContext('2d')
      const img2 = await loadImage(i2.buffer)
      ctx2.drawImage(img2, 0, 0)

      const pointDefiner1 = {
        imgData: ctx1.getImageData(0, 0, i1.width, i1.height),
        oriPoints: img1Points,
      }
      const pointDefiner2 = {
        imgData: ctx2.getImageData(0, 0, i2.width, i2.height),
        oriPoints: img2Points,
      }
      return [pointDefiner1, pointDefiner2]
    },
  }
}
