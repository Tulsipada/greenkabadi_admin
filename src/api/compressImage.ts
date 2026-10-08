const MAX_BYTES = 700 * 1024

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image'))
    }
    img.src = url
  })
}

function renderJpeg(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Could not prepare the image'))
  ctx.drawImage(img, 0, 0, width, height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not prepare the image'))),
      'image/jpeg',
      quality,
    )
  })
}

/** Shrink photos so nginx accepts them (default body limit is about 1 MB). */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw { status: 0, message: 'Choose an image file' }
  }
  if (file.size <= MAX_BYTES) return file

  const img = await loadImage(file)
  let width = img.naturalWidth || img.width
  let height = img.naturalHeight || img.height
  const longest = Math.max(width, height)
  if (longest > 1600) {
    const scale = 1600 / longest
    width = Math.max(1, Math.round(width * scale))
    height = Math.max(1, Math.round(height * scale))
  }

  let quality = 0.82
  let blob = await renderJpeg(img, width, height, quality)
  for (let i = 0; i < 8 && blob.size > MAX_BYTES; i++) {
    if (quality > 0.5) quality -= 0.1
    else {
      width = Math.max(1, Math.round(width * 0.75))
      height = Math.max(1, Math.round(height * 0.75))
    }
    blob = await renderJpeg(img, width, height, quality)
  }

  if (blob.size > MAX_BYTES) {
    throw { status: 413, message: 'Image is too large. Choose a smaller photo.' }
  }

  const base = file.name.replace(/\.[^.]+$/, '') || 'category'
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' })
}
