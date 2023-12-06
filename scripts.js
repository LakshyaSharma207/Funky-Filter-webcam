const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      console.log(localMediaStream);
    
//  DEPRECIATION : 
//       The following has been depreceated by major browsers as of Chrome and Firefox.
//       video.src = window.URL.createObjectURL(localMediaStream);
//       Please refer to these:
//       Deprecated  - https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
//       Newer Syntax - https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
      
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(err => {
      console.error(`please allow camera permissions!!`, err);
    });
}

let appliedFilters = [];

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // mess with them
    appliedFilters.forEach(filter => {
    switch (filter) {
        case 'red':
          // Apply red filter logic
          pixels = redEffect(pixels);
          break;
    
        case 'rgb':
          // Apply RGB filter logic
          pixels = rgbSplit(pixels);
          break;
    
        case 'grayscale':
          // Apply black&white filter logic
          pixels = grayscaleEffect(pixels);
          break;
        
        case 'pixel':
          // Apply pixel filter logic
          pixels = pixelateEffect(pixels);
          break;
        
        default:
            break;
      }
    });
    // put them back
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  // played the sound
  snap.currentTime = 0;
  snap.play();

  // take the data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
  strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // RED
    pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
    pixels.data[i - 550] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

function grayscaleEffect(pixels) {
    for (let i = 0; i < pixels.data.length; i+=4) {
        const avg = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;
        // Set red, green, and blue to the average value
        pixels.data[i] = avg;     // RED
        pixels.data[i + 1] = avg; // GREEN
        pixels.data[i + 2] = avg; // BLUE
    }
    return pixels;
}

function pixelateEffect(pixels, pixelSize = 5) {
    for (let y = 0; y < pixels.height; y += pixelSize) {
        for (let x = 0; x < pixels.width; x += pixelSize) {
            const pixelIndex = (y * pixels.width + x) * 4;
            const pixelColor = {
                r: pixels.data[pixelIndex],
                g: pixels.data[pixelIndex + 1],
                b: pixels.data[pixelIndex + 2],
            };

            for (let i = 0; i < pixelSize; i++) {
                for (let j = 0; j < pixelSize; j++) {
                    const index = ((y + i) * pixels.width + (x + j)) * 4;
                    pixels.data[index] = pixelColor.r;
                    pixels.data[index + 1] = pixelColor.g;
                    pixels.data[index + 2] = pixelColor.b;
                }
            }
        }
    }

    return pixels;
}


getVideo();

video.addEventListener('canplay', paintToCanvas);

const filters = document.querySelectorAll('[data-filter');
filters.forEach(filter => filter.addEventListener('click', function() {
    let filtername = this.dataset.filter;
    if(!appliedFilters.includes(filtername)) {
        appliedFilters.push(filtername);
    }
    if(filtername == 'reset') {
        appliedFilters.length = 0;
    }
    paintToCanvas();
}));

