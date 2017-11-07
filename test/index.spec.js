const should = require('should');
const loader = require('../index');

function load(content, strict) {
  const options = {
    cacheable: () => {
    },
    addDependency: () => {
    },
    context: __dirname,
  };
  if (strict) {
    options.query = { strict: strict };
  }
  return loader.call(options, content);
}

const basicSvgPath = '<path d="M960 440.384H704v-128c0-35.312-28.656-64-64-64H384c-35.344 0-64 28.688-64 64v128H192v-64H64v64c-35.344 0-64 28.688-64 64v704c0 35.376 28.656 64 64 64h896c35.344 0 64-28.624 64-64v-704c0-35.312-28.656-64-64-64zm-512-64h128v64H448v-64zm448 768H128v-576h768v576zm-384-128c106.032 0 192-85.938 192-192s-85.968-192-192-192-192 85.938-192 192 85.968 192 192 192zm0-256c35.344 0 64 28.624 64 64s-28.656 64-64 64-64-28.624-64-64 28.656-64 64-64z"/>';

const basicSvgContent = `<svg markup-inline    viewBox="0 0 1024 1404.416" xmlns="http://www.w3.org/2000/svg">${basicSvgPath}</svg>`;

const complexSvgContent = '<svg markup-inline    width="18" height="19" viewBox="0 0 18 19" xmlns="http://www.w3.org/2000/svg"><desc>A complex svg for test &apos;svgo&apos;</desc><path d="M9 9c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 3c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" opacity=".7" stroke-linejoin="round"/></svg>';

describe('markup inline loader', () => {
  it('should inline svg[src$=.svg]', () => {
    load('<svg markup-inline src="./basic.svg" />').trim().should.equal(basicSvgContent);
  });
  it('should inline img[src$=.svg]', () => {
    load('<img markup-inline src="./basic.svg" />').trim().should.equal(basicSvgContent);
  });
  it('should inline img+img[src$=.svg]', () => {
    load('<img /><img markup-inline src="./basic.svg" />').trim()
      .should.equal('<img />' + basicSvgContent);
  });
  it('should inline img[src$=.svg] in multi-line', () => {
    load('<img markup-inline\n src="./basic.svg" /><div>Test</div>').trim().replace(/\n/g, '').should.equal(basicSvgContent + '<div>Test</div>');
  });
  it('should inline math[src]', () => {
    load('<math markup-inline src="./test.mml" />').trim().should.equal('<math markup-inline    style="display: block;"></math>');
  });
  it('should ignore elements without markup-inline attribute', () => {
    load('<svg src="./basic.svg" />').trim().should.equal('<svg src="./basic.svg" />');
  });
  it('should ignore other images', () => {
    load('<img src="./test.jpg" />').trim().should.equal('<img src="./test.jpg" />');
  });
  it('should keep other attributes', () => {
    load('<svg markup-inline class="abc" src="./basic.svg" fill="red"/>').trim().should.equal(`<svg markup-inline class="abc"  fill="red"  viewBox="0 0 1024 1404.416" xmlns="http://www.w3.org/2000/svg">${basicSvgPath}</svg>`);
  });
  it('should ignore spaces', () => {
    load('<img markup-inline src = "./basic.svg" />').trim().should.equal(basicSvgContent);
  });
  it('should auto svgo', () => {
    load('<img markup-inline src="./complex.svg" />').trim().should.eql(complexSvgContent);
  });
  it('should be allowed to customize strict selector', () => {
    load('<img src="./basic.svg" my-strict/>', 'my-strict').trim().should.equal(`<svg  my-strict  viewBox="0 0 1024 1404.416" xmlns="http://www.w3.org/2000/svg">${basicSvgPath}</svg>`);
    load('<img src="./basic.svg" data-my-strict/>', 'my-strict').trim().should.equal(`<svg  data-my-strict  viewBox="0 0 1024 1404.416" xmlns="http://www.w3.org/2000/svg">${basicSvgPath}</svg>`);
  });
});
