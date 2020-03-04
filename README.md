# \<x-image-classifier>

## About

Classifying images with TensorFlow.js.

## Installation

```bash
npm i git+https://github.com/kherrick/x-image-classifier.git#semver:^1.2.0
```

## Usage

```html
<x-image-classifier
  imgurl="https://avatars3.githubusercontent.com/u/3065761"
  wasmpath="node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm"
>
  loading...
</x-image-classifier>
<script
  type="module"
  src="node_modules/x-image-classifier/dist/XImageClassifier.js"
>
</script>
```
