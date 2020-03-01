import { LitElement, css, html, property } from 'lit-element'
import { defineCustomElement, logger } from './utilities'
import { render } from 'lit-html'
import * as events from './events'

// Import @tensorflow/tfjs or @tensorflow/tfjs-core
import * as tf from '@tensorflow/tfjs'
// import * as tf from '@tensorflow/tfjs-core'

// Adds the WASM backend to the global backend registry.
import '@tensorflow/tfjs-backend-wasm'

// Import model
import * as mobilenet from '@tensorflow-models/mobilenet'

import { setWasmPath } from '@tensorflow/tfjs-backend-wasm'

export * from './events'

export class XImageClassifier extends LitElement {
  @property({ type: String, reflect: true })
  imgUrl = IMG_URL
  @property({ type: String, reflect: true })
  strokeStyle = 'yellow'
  @property({ type: Number, reflect: true })
  lineWidth = 10
  @property({ type: String, reflect: false })
  wasmPath = WASM_PATH
  @property({ type: Boolean, reflect: false })
  isStreaming = false
  @property({ type: Boolean, reflect: false })
  isReadyToPredict = false
  @property({ type: Boolean, reflect: false })
  canPredictVideo = false

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .canvas-flex-container {
        flex: auto;
      }

      #canvas-container {
        display: flex;
      }

      #loading-container {
        position: relative;
      }

      #loading {
        pointer-events: none;
        position: absolute;
        width: 100%;
      }

      canvas {
        background-color: var(--x-image-classifier-canvas-background-color, transparent);
        width: var(--x-image-classifier-canvas-width, 100%);
        height: var(--x-image-classifier-canvas-height, auto);
      }

      video {
        width: var(--x-image-classifier-video-width, 100%);
        height: var(--x-image-classifier-video-height, auto);
      }
    `
  }

  _getPrediction(ctx, image) {
    // Pass in an image or video to the model
    const returnTensors = true // Pass in `true` to get tensors back, rather than values.

    return this.model.classify(image, returnTensors).then(predictions => {

      if (predictions.length > 0) {
        for (let i = 0; i < predictions.length; i++) {
          const { className, probability } = predictions[i]

          logger([ `Object classified: ${className} | probability: ${probability}`])
          this.dispatchEvent(events.XImageClassifierObjectDetected(predictions[i]))
        }

        return [ ctx, image ]
      }

      logger('No Object classified')
      this.dispatchEvent(events.XImageClassifierNoObjectDetected())

      return [ ctx, image ]
    })
  }

  _getImage(url) {
    return new Promise((res, rej) => {
      const image = new Image()
      image.crossOrigin = 'Anonymous'

      this.dispatchEvent(events.XImageClassifierImageLoading())
      this._loadingElement.style.display = 'block'

      image.src = url

      image.addEventListener('error', e => {
        this.dispatchEvent(events.XImageClassifierImageLoadingFailure(e))
      })

      image.addEventListener('load', e => {
        res(image)
      })
    })
  }

  _getUserMediaPromise() {
    return new Promise((res, rej) => {
      const canvas = this._canvasElement
      const video = this._videoElement

      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })
        .then(stream => {
          video.srcObject = stream
          video.play()

          this.dispatchEvent(events.XImageClassifierVideoLoaded())
        })
        .catch(error => {
          this.dispatchEvent(events.XImageClassifierVideoLoadingFailure(error))

          process.env.NODE_ENV !== 'production' && console.error(error)
        })

      video.addEventListener('canplay', (event) => {
        if (!this.isStreaming) {
          res(true)
        }
      }, false)
    })
  }

  _handleDragEnter(event) {
    event.preventDefault()

    this.dispatchEvent(events.XImageClassifierImageDragEnter(event))

    logger([ 'dragenter', event ])
  }

  _handleDragOver(event) {
    event.preventDefault()

    this.dispatchEvent(events.XImageClassifierImageDragOver(event))

    logger([ 'dragover', event ])
  }

  _handleDragLeave(event) {
    event.preventDefault()

    this.dispatchEvent(events.XImageClassifierImageDragLeave(event))

    logger([ 'dragleave', event ])
  }

  _handleImageDropPrediction(event) {
    event.preventDefault()

    this.dispatchEvent(events.XImageClassifierImageDrop(event))

    logger([ 'drop', event ])

    for (let i = 0; i < event.dataTransfer.files.length; i++) {
      let droppedFile = event.dataTransfer.files[i]

      createImageBitmap(droppedFile).then(imageBitmap => {
        this._setupCanvas(this._canvasElement, { image: imageBitmap }).then(ctx => {
          const imageFromCanvas = new Image()

          imageFromCanvas.addEventListener('load', e => {
            this._getPrediction(ctx, imageFromCanvas)
          })

          imageFromCanvas.src = this._canvasElement.toDataURL()
        })
      }).catch(error => {
        this.dispatchEvent(events.XImageClassifierImageLoadingFailure(error))

        process.env.NODE_ENV !== 'production' && console.error(error)
      })
    }
  }

  _handleCanvasStylesForImages(imageWidth) {
    this._canvasElement.style.display = 'initial'

    if (imageWidth > document.documentElement.clientWidth) {
      this._canvasElement.style.width = '100%'
      this._canvasElement.style.height = 'auto'

      return
    }

    this._canvasElement.style.width = 'auto'
    this._canvasElement.style.height = 'auto'
  }

  _handleImageUrlPrediction(canvas, url) {
    return new Promise((res, rej) => {
      this._getImage(url).then(image => {
        this.dispatchEvent(events.XImageClassifierImageLoaded())
        this._loadingElement.style.display = 'none'
        this._setupCanvas(canvas, { image }).then(ctx => {
          this._getPrediction(ctx, image)
        })
      })
    })
  }

  _handleVideoPrediction(canvas, video) {
    this.canPredictVideo = true

    const taskResolution = period => {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          this._setupCanvas(canvas, { video }).then(ctx => {
            this._getPrediction(ctx, video).then(val => {
              if (!this.canPredictVideo) {
                resolve(interval)
              }
            })
          })
        }, period)
      })
    }

    return taskResolution(0).then(interval => {
      clearInterval(interval)
    })
  }

  _setupCanvas(canvas, { image, video }) {
    return new Promise((res, rej) => {
      const ctx = canvas.getContext('2d')

      let media = undefined
      let width = undefined
      let height = undefined

      if (video) {
        // video
        media = video
        width = video.videoWidth
        height = video.videoHeight
      } else {
        // image
        media = image
        width = image.width
        height = image.height

        this._handleCanvasStylesForImages(width)
      }

      // set the canvas to the media width and height
      canvas.width = width
      canvas.height = height

      ctx.drawImage(media, 0, 0, width, height)

      res(ctx)
    })
  }

  clearCanvas() {
    const canvas = this._canvasElement
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  fillCanvas(color = '#000000') {
    const canvas = this._canvasElement
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = color
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  startPredictions() {
    return new Promise((res, rej) => {
      this._handleVideoPrediction(this._canvasElement, this._videoElement)
    }).then(() => {
      this.canPredictVideo
       ? res()
       : rej()
    })
  }

  stopPredictions() {
    return new Promise((res, rej) => {
      this.canPredictVideo = false
      this._canvasElement.style.display = 'none'
      this._videoElement.style.display = 'block'

      res()
    })
  }

  startVideo(event) {
    this.dispatchEvent(events.XImageClassifierVideoLoading())
    this._loadingElement.style.display = 'block'

    if (event) {
      event.preventDefault()
    }

    if (this.isStreaming) {
      return new Promise((res, rej) => {
        res(true)
      })
    }

    return this._getUserMediaPromise().then(isStreaming => {
      this._loadingElement.style.display = 'none'
      this._canvasElement.style.display = isStreaming ? 'none' : 'block'
      this._videoElement.style.display = isStreaming ? 'block' : 'none'

      this.isStreaming = isStreaming

      return isStreaming
    })
  }

  stopVideo(event) {
    if (event) {
      event.preventDefault()
    }

    this._videoElement.style.display = 'none'

    if (!this.isStreaming) {
      return new Promise((res, rej) => {
        res(false)
      })
    }

    return new Promise((res, rej) => {
      const video = this._videoElement
      const stream = video.srcObject

      stream.getTracks().forEach(track => {
        track.stop()
      })

      this.isStreaming = false
      res(false)
    })
  }

  firstUpdated() {
    if (!this.wasmPath) {
      return
    }

    this._canvasElement = this.shadowRoot.getElementById('canvas')
    this._loadingElement = this.shadowRoot.getElementById('loading')
    this._videoElement = this.shadowRoot.getElementById('video')

    setWasmPath(this.wasmPath)
    tf.setBackend('wasm').then(() => {
      return new Promise((res, rej) => {
        // Load the model.
        res(mobilenet.load())
      }).then(mobilenet => {
        this.model = mobilenet

        this.isReadyToPredict = true
        this._handleImageUrlPrediction(this._canvasElement, this.imgUrl)
      })
    })
  }

  updated(changedProperties) {
    changedProperties.forEach((oldVal, propName) => {
      if (this.isReadyToPredict && propName === 'imgUrl') {
        this._handleImageUrlPrediction(this._canvasElement, this.imgUrl)
      }
    })
  }

  render() {
    return this.wasmPath ? html`
      <div id="canvas-container"
        @drop="${this._handleImageDropPrediction}"
        @dragenter="${this._handleDragEnter}"
        @dragover="${this._handleDragOver}"
        @dragleave="${this._handleDragLeave}"
      >
        <div class="canvas-flex-container"></div>
        <div id="loading-container">
          <div id="loading"><slot></slot></div>
          <canvas id="canvas"></canvas>
          <video id="video"></video>
        </div>
        <div class="canvas-flex-container"></div>
      </div>
    ` : ''
  }
}

defineCustomElement('x-image-classifier', XImageClassifier)
