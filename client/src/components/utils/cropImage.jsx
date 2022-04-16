/**
 * @param {File} image - Image File url
 * @param {Object} pixelCrop - pixelCrop Object provided by react-easy-crop
 * @param {number} rotation - optional rotation parameter
 */
//  https://stackoverflow.com/questions/71533109/custom-crop-method-isnt-working-in-iphone
export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  console.log('imagesrc : ', imageSrc);
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // set each dimensions to double largest dimension to allow for a safe area for the
  // image to rotate in without being clipped by canvas context
  canvas.width = safeArea;
  canvas.height = safeArea;

  // translate canvas context to a central location on image to allow rotating around the center.
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // draw rotated image and store data.
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image with correct offsets for x,y crop values.
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // As Base64 string // return canvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      // resolve(URL.createObjectURL(file))
      resolve(file);
    }, 'image/jpeg');
  });
}

// URL.createObjectURL(new Blob([e.target.files[0]], {type: e.target.files[0].type}))

const createImage = (url) =>
  /*
   * We are going to return a Promise which, when we .then
   * will give us an Image that should be fully loaded
   */
  new Promise((resolve, reject) => {
    /*
     * Create the image that we are going to use to
     * to hold the resource
     */
    const image = new Image();
    /*
     * The Image API deals in even listeners and callbacks
     * we attach a listener for the "load" event which fires
     * when the Image has finished the network request and
     * populated the Image with data
     */
    image.addEventListener('load', () => resolve(image));
    /*
     * You have to manually tell the Promise that you are
     * done dealing with asynchronous stuff and you are ready
     * for it to give anything that attached a callback
     * through .then a realized value.  We do that by calling
     * resolve and passing it the realized value
     */
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    /*
     * Setting the Image.src is what starts the networking process
     * to populate an image.  After you set it, the browser fires
     * a request to get the resource.  We attached a load listener
     * which will be called once the request finishes and we have
     * image data
     */
    image.src = url;
  });

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}
