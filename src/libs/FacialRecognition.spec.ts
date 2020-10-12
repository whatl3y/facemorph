import assert from 'assert'
// import fs from 'fs'
import path from 'path'
import FacialRecognition from './FacialRecognition'

describe('FacialRecognition', function() {
  const imagesPath = path.join(__dirname, '..', '..', 'images')
  const imgPath = path.join(imagesPath, 'familypic.png')

  describe('#drawFaceOutlines', function() {
    it(`should get and draw facial detections on a source image`, async function() {
      this.timeout(5000)

      // detections: [
      //   {
      //     detection: FaceDetection {
      //       _imageDims: Dimensions { _width: 200, _height: 200 },
      //       _score: 0.9984129071235657,
      //       _classScore: 0.9984129071235657,
      //       _className: '',
      //       _box: Box {
      //         _x: 63.03645968437195,
      //         _y: 49.69329535961151,
      //         _width: 69.07597184181213,
      //         _height: 76.01962387561798
      //       },
      //     },
      //     {
      //       landmarks: FaceLandmarks68 {
      //         _imgDims: Dimensions { _width: 131, _height: 184 },
      //         _shift: Point { _x: 79.749556183815, _y: 112.61080999444 },
      //         _positions: [Point { _x: 73.79089318588376, _y: 190.0500247008609 }, ...]
      //       }
      //     }
      //   },
      //   ...
      // ]
      const [detections, newBuffer] = await FacialRecognition.drawFaceOutlines(
        imgPath
      )
      // await fs.promises.writeFile(path.join(imagesPath, 'new.jpeg'), newBuffer)

      assert.strictEqual(5, detections.length)
      assert.strictEqual(860, detections[0].detection._imageDims._width)
      assert.strictEqual(460, detections[0].detection._imageDims._height)
      assert.strictEqual(true, detections[0].landmarks._positions.length > 0)
      assert.strictEqual(true, newBuffer instanceof Buffer)
    })
  })
})
