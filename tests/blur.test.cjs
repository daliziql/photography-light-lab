const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const start = html.indexOf('function blurPixels(');
const end = html.indexOf('const depthBlurCache=', start);
assert.ok(start >= 0 && end > start, 'Blur implementation must be present');
const blurPixels = runInNewContext(html.slice(start, end) + '\nblurPixels');
const makeImage = (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) });

// A deliberately slow, direct convolution is an independent reference for the
// optimized sliding-window implementation, including transparent image borders.
function reference(image, sigma) {
  const { width, height } = image;
  const variance = sigma ** 2 / 3;
  const radius = Math.floor((Math.sqrt(12 * variance + 1) - 1) / 2);
  const edge = (variance - radius * (radius + 1) / 3) * (2 * radius + 1) /
    (2 * ((radius + 1) ** 2 - variance));
  const weights = Array.from({ length: 2 * radius + 3 }, (_, i) =>
    (i === 0 || i === 2 * radius + 2 ? edge : 1) / (2 * radius + 1 + 2 * edge));
  let pixels = Float64Array.from(image.data, (v, i) => i % 4 === 3 ? v : v * image.data[i - i % 4 + 3] / 255);
  for (let pass = 0; pass < 6; pass++) {
    const next = new Float64Array(pixels.length);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      weights.forEach((weight, i) => {
        const dx = x + (pass % 2 ? 0 : i - radius - 1);
        const dy = y + (pass % 2 ? i - radius - 1 : 0);
        if (dx < 0 || dy < 0 || dx >= width || dy >= height) return;
        for (let k = 0; k < 4; k++) next[(y * width + x) * 4 + k] += pixels[(dy * width + dx) * 4 + k] * weight;
      });
    }
    pixels = next;
  }
  return Uint8ClampedArray.from(pixels, (v, i) => {
    const alpha = pixels[i - i % 4 + 3];
    return i % 4 === 3 ? alpha : Math.round(alpha) ? v * 255 / alpha : 0;
  });
}

test('zero blur preserves every pixel and does not allocate a replacement', () => {
  const image = makeImage(2, 1);
  image.data.set([20, 50, 90, 255, 77, 33, 11, 0]);
  const before = image.data.slice();
  assert.equal(blurPixels(image, 0), image);
  assert.deepEqual(image.data, before);
});

test('blur matches direct convolution, including tiny images and wide radii', () => {
  for (const [w, h] of [[1, 1], [1, 9], [8, 1], [9, 7]]) {
    for (const sigma of [0.15, 0.5, 1.1, 3.5, 11.5]) {
      const image = makeImage(w, h);
      image.data.forEach((_, i, data) => { data[i] = (i * 71 + 19) % 256; });
      const expected = reference(image, sigma);
      blurPixels(image, sigma);
      assert.ok(image.data.every((v, i) => Math.abs(v - expected[i]) <= 1), `${w}x${h}, sigma ${sigma}`);
    }
  }
});

test('transparent colors cannot tint the blur or create a dark halo', () => {
  const image = makeImage(31, 31);
  for (let i = 0; i < image.data.length; i += 4) image.data.set([0, 255, 0, 0], i);
  for (let y = 12; y <= 18; y++) for (let x = 12; x <= 18; x++) image.data.set([240, 60, 20, 255], (y * 31 + x) * 4);
  blurPixels(image, 2);
  let translucent = 0;
  for (let i = 0; i < image.data.length; i += 4) {
    if (!image.data[i + 3]) continue;
    assert.deepEqual([...image.data.slice(i, i + 3)], [240, 60, 20]);
    if (image.data[i + 3] < 255) translucent++;
  }
  assert.ok(translucent > 49, 'The color should spread beyond the original square');
});

test('larger blur spreads an edge further, with distinct results at all aperture stops', () => {
  let previous = 0;
  const signatures = new Set();
  for (let i = 8; i >= 0; i--) {
    const n = Math.SQRT2 ** (i + 1), sigma = (2500 * 10000 / (n * 15000 * 4950)) * 40 / 2;
    const image = makeImage(101, 1);
    // Keep this horizontal edge opaque through the vertical passes.
    const tall = makeImage(101, 101);
    for (let y = 0; y < 101; y++) for (let x = 50; x < 101; x++) tall.data.set([255, 255, 255, 255], (y * 101 + x) * 4);
    blurPixels(tall, sigma);
    image.data.set(tall.data.slice(50 * 101 * 4, 51 * 101 * 4));
    const spread = Array.from({ length: 50 }, (_, x) => image.data[x * 4 + 3]).reduce((a, b) => a + b, 0);
    assert.ok(spread > previous, `f/${n}: ${spread} must exceed ${previous}`);
    previous = spread;
    signatures.add(Buffer.from(image.data).toString('base64'));
  }
  assert.equal(signatures.size, 9);
});
