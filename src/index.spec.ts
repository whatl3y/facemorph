import assert from 'assert'
import fs from 'fs'
import path from 'path'
import Morf from '.'

const morf = Morf()

describe('morf', function() {
  const imagesPath = path.join(__dirname, '..', 'images')
  const face1ImgPath = path.join(imagesPath, 'face1.png')
  const face2ImgPath = path.join(imagesPath, 'face2.png')

  describe('#createGif', function() {
    it(`should create a valid GIF buffer without error`, async function() {
      const morf = Morf(20)
      this.timeout(20000)
      const gifBuffer: Buffer = await morf.createGif(
        [face1ImgPath, face2ImgPath, face1ImgPath],
        40
      )
      // await fs.promises.writeFile(
      //   path.join(__dirname, '..', 'tmp', `test.gif`),
      //   gifBuffer
      // )
    })
  })

  describe('#createFrames', function() {
    it(`should error if there's only one image provided to create animation`, async function() {
      this.timeout(5000)

      try {
        await morf.createFrames([face1ImgPath])
        assert.fail('should error before this line')
      } catch (err) {
        assert.strictEqual(true, err instanceof Error)
        assert.strictEqual(
          'should have at least one pair of images to morph',
          err.message
        )
      }
    })

    it('should create a set of warped image frames', async function() {
      this.timeout(5000)

      const buffers: Buffer[][] = await morf.createFrames([
        face1ImgPath,
        face2ImgPath,
        face1ImgPath,
      ])
      // await Promise.all(
      //   buffers[0].map(async (buf: Buffer, ind: number) => {
      //     await fs.promises.writeFile(
      //       path.join(__dirname, '..', 'tmp', `test1_${ind}.png`),
      //       buf
      //     )
      //   })
      // )
      // await Promise.all(
      //   buffers[1].map(async (buf: Buffer, ind: number) => {
      //     await fs.promises.writeFile(
      //       path.join(__dirname, '..', 'tmp', `test2_${ind}.png`),
      //       buf
      //     )
      //   })
      // )
      assert.strictEqual(2, buffers.length)
      assert.strictEqual(true, buffers[0][0] instanceof Buffer)
      assert.strictEqual(true, buffers[1][0] instanceof Buffer)
    })
  })
})
