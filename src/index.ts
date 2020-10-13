import assert from 'assert'
import { createCanvas, ImageData, loadImage } from 'canvas'
import FacialRecognition from './libs/FacialRecognition'
import GifCreator from './libs/GifCreator'
import ImageProcessor, { FacemorphImage } from './libs/ImageProcessor'

// import ImgWarper from './libs/ImgWarper'
const ImgWarper = require('./libs/ImgWarper')

interface IFacemorphee {
  original: FacemorphImage
  buffer: Buffer
  detections: any
  width: number
  height: number
}

export default function Facemorph(frames: number = 20) {
  return {
    frames,

    setFrames(f: number) {
      return (this.frames = f)
    },

    async createGif(
      imgs: FacemorphImage[],
      gifDelayMs: number = 100
    ): Promise<Buffer> {
      const allFrames = await this.createFrames(imgs)
      const frames = allFrames
        .map((buffers, i) => {
          if (i === 0) return buffers.slice(0, buffers.length - 2)
          return buffers.slice(1)
        })
        .flat(1)
      const { width } = await ImageProcessor.sizeOf(frames[0])
      assert(width, 'width should be retrievable')
      const gifer = GifCreator(width, width, gifDelayMs)
      return await gifer.create(...frames)
    },

    async createFrames(imgs: FacemorphImage[]): Promise<Buffer[][]> {
      const cleanedImgs: Buffer[] = await this.makeImagesConsistent(imgs)
      const imagePairs: IFacemorphee[][] = (
        await Promise.all(
          cleanedImgs.map(
            async (img: FacemorphImage): Promise<IFacemorphee> => {
              const { width, height } = await ImageProcessor.sizeOf(img)
              assert(width && height, 'width and height should be retrievable')
              const buffer = await ImageProcessor.imgToBuffer(img)
              return {
                original: img,
                buffer,
                detections: (
                  await FacialRecognition.drawFaceOutlines(buffer)
                )[0],
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

      const gifImageDataFrames: ImageData[][] = await Promise.all(
        imagePairs.map(async ([img1, img2]: IFacemorphee[]) => {
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

      return await this.getBuffersFromFrames(
        gifImageDataFrames,
        imagePairs[0][0].width,
        imagePairs[0][0].height
      )
    },

    async makeImagesConsistent(imgs: FacemorphImage[]): Promise<Buffer[]> {
      const [ref, ...rest] = imgs
      const refSm: Buffer = await ImageProcessor.resizeImage(ref, 500)
      const refSq: Buffer = await ImageProcessor.toSquare(refSm)
      const reference: Buffer = await ImageProcessor.putOnWhiteBg(refSq)
      const { width } = await ImageProcessor.sizeOf(reference)
      assert(width, 'width should be retrievable for img')
      const restBuffers = await Promise.all(
        rest.map(async (img) => {
          const smBuff = await ImageProcessor.resizeImage(img, 500)
          const sqBuff = await ImageProcessor.toSquare(smBuff)
          const whBuff = await ImageProcessor.putOnWhiteBg(sqBuff)
          return await ImageProcessor.resizeImage(whBuff, width)
        })
      )
      return [reference, ...restBuffers]
    },

    async getBuffersFromFrames(
      imageDataFrames: ImageData[][],
      width: number = 400,
      height: number = 400
    ): Promise<Buffer[][]> {
      return await Promise.all(
        imageDataFrames.map(async (frames: ImageData[]) => {
          return await Promise.all(
            frames.map(
              async (frame: ImageData): Promise<Buffer> => {
                const canv = createCanvas(width, height)
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

    async getPointDefiners(i1: IFacemorphee, i2: IFacemorphee) {
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
