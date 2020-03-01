export const X_IMAGE_CLASSIFIER_IMAGE_DRAG_ENTER = 'x-image-classifier-image-drag-enter'
export const X_IMAGE_CLASSIFIER_IMAGE_DRAG_LEAVE = 'x-image-classifier-image-drag-leave'
export const X_IMAGE_CLASSIFIER_IMAGE_DRAG_OVER = 'x-image-classifier-image-drag-over'
export const X_IMAGE_CLASSIFIER_IMAGE_DROP = 'x-image-classifier-image-drop'
export const X_IMAGE_CLASSIFIER_IMAGE_LOADING = 'x-image-classifier-image-loading'
export const X_IMAGE_CLASSIFIER_IMAGE_LOADING_FAILURE = 'x-image-classifier-image-loading-failure'
export const X_IMAGE_CLASSIFIER_IMAGE_LOADED = 'x-image-classifier-image-loaded'
export const X_IMAGE_CLASSIFIER_VIDEO_LOADING = 'x-image-classifier-video-loading'
export const X_IMAGE_CLASSIFIER_VIDEO_LOADED = 'x-image-classifier-video-loaded'
export const X_IMAGE_CLASSIFIER_VIDEO_LOADING_FAILURE = 'x-image-classifier-video-loading-failure'
export const X_IMAGE_CLASSIFIER_OBJECT_CLASSIFIED = 'x-image-classifier-object-classified'
export const X_IMAGE_CLASSIFIER_NO_OBJECT_CLASSIFIED = 'x-image-classifier-no-object-classified'
export const X_IMAGE_CLASSIFIER_READY_TO_PREDICT = 'x-image-classifier-ready-to-predict'

export const XImageClassifierImageDragEnter = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_IMAGE_DRAG_ENTER, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierImageDragLeave = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_IMAGE_DRAG_LEAVE, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierImageDragOver = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_IMAGE_DRAG_OVER, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierImageDrop = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_IMAGE_DROP, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierImageLoading = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_IMAGE_LOADING, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierImageLoadingFailure = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_IMAGE_LOADING_FAILURE, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierImageLoaded = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_IMAGE_LOADED, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierVideoLoading = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_VIDEO_LOADING, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierVideoLoaded = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_VIDEO_LOADED, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierVideoLoadingFailure = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_VIDEO_LOADING_FAILURE, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierObjectDetected = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_OBJECT_CLASSIFIED, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierNoObjectDetected = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_NO_OBJECT_CLASSIFIED, {
    bubbles: true,
    composed: true,
    detail: val
  })

export const XImageClassifierReadyToPredict = val =>
  new CustomEvent(X_IMAGE_CLASSIFIER_READY_TO_PREDICT, {
    bubbles: true,
    composed: true,
    detail: val
  })
