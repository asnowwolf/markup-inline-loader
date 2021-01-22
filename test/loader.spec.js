const fs = require('fs');
const path = require('path');
/**
 * @jest-environment node
 */
const compiler = require('./compiler.js');

function readJs(filename) {
  return fs.readFileSync(path.join(__dirname, filename), 'utf8').trim();
}

describe('markup inline loader', () => {
  it('should inline svg[src$=.svg]', async () => {
    const stats = await compiler('./examples/basic.html');
    const output = stats.toJson({source: true}).modules[0].source;
    expect(output).toBe(readJs('./examples/basic.js.gen'));
  });
  it('should inline img[src$=.svg]', async () => {
    const stats = await compiler('./examples/img.html');
    const output = stats.toJson({source: true}).modules[0].source;
    expect(output).toBe(readJs('./examples/img.js.gen'));
  });
  it('should inline img[src$=.svg] in multi-line', async () => {
    const stats = await compiler('./examples/img-multiline.html');
    const output = stats.toJson({source: true}).modules[0].source;
    expect(output).toBe(readJs('./examples/img-multiline.js.gen'));
  });
  it('should inline math[src]', async () => {
    const stats = await compiler('./examples/math-ml.html');
    const output = stats.toJson({source: true}).modules[0].source;
    expect(output).toBe(readJs('./examples/math-ml.js.gen'));
  });
  it('should ignore elements without markup-inline attribute', async () => {
    const stats = await compiler('./examples/basic-no-inline.html');
    const output = stats.toJson({source: true}).modules[0].source;
    expect(output).toBe(readJs('./examples/basic-no-inline.js.gen'));
  });
  it('should ignore other images', async () => {
    const stats = await compiler('./examples/non-svg-img.html');
    const output = stats.toJson({source: true}).modules[0].source;
    expect(output).toBe(readJs('./examples/non-svg-img.js.gen'));
  });
  it('should keep other attributes', async () => {
    const stats = await compiler('./examples/svg-with-attributes.html');
    const output = stats.toJson({source: true}).modules[0].source;
    expect(output).toBe(readJs('./examples/svg-with-attributes.js.gen'));
  });
  it('should auto svgo', async () => {
    const stats = await compiler('./examples/auto-svgo.html', {svgo: {plugins: [{removeTitle: false}]}});
    const output = stats.toJson({source: true}).modules[0].source;
    expect(output).toBe(readJs('./examples/auto-svgo.js.gen'));
  });
  it('should be allowed to customize strict selector', async () => {
    const stats = await compiler('./examples/custom-strict-selector.html', {strict: '[my-strict]'});
    const output = stats.toJson({source: true}).modules[0].source;
    expect(output).toBe(readJs('./examples/custom-strict-selector.js.gen'));
  });
});
