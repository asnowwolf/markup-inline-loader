const should = require('should');
const loader = require('../index');

function load(content, strict = '') {
  return loader.call({
    cacheable: () => {
    },
    addDependency: () => {
    },
    context: __dirname,
    query: {
      strict: strict,
    },
  }, content);
}

const basicSvgPath = '<path d="M960 440.384H704v-128c0-35.312-28.656-64-64-64H384c-35.344 0-64 28.688-64 64v128H192v-64H64v64c-35.344 0-64 28.688-64 64v704c0 35.376 28.656 64 64 64h896c35.344 0 64-28.624 64-64v-704c0-35.312-28.656-64-64-64zm-512-64h128v64H448v-64zm448 768H128v-576h768v576zm-384-128c106.032 0 192-85.938 192-192s-85.968-192-192-192-192 85.938-192 192 85.968 192 192 192zm0-256c35.344 0 64 28.624 64 64s-28.656 64-64 64-64-28.624-64-64 28.656-64 64-64z"/>';

const basicSvgContent = `<svg    viewBox="0 0 1024 1404.416" xmlns="http://www.w3.org/2000/svg">${basicSvgPath}</svg>`;

const complexSvgContent = '<svg    width="18" height="19" viewBox="0 0 18 19" xmlns="http://www.w3.org/2000/svg"><desc>A complex svg for test &apos;svgo&apos;</desc><path d="M9 9c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 3c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" stroke-width="2" fill="none" fill-rule="evenodd" stroke-linecap="round" opacity=".7" stroke-linejoin="round"/></svg>';

describe('markup inline loader', () => {
  it('should inline svg[src$=.svg]', () => {
    load('<svg src="./basic.svg" />').trim().should.equal(basicSvgContent);
  });
  it('should inline img[src$=.svg]', () => {
    load('<img src="./basic.svg" />').trim().should.equal(basicSvgContent);
  });
  it('should keep other attributes', () => {
    load('<svg class="abc" src="./basic.svg" fill="red"/>').trim().should.equal(`<svg class="abc"  fill="red"  viewBox="0 0 1024 1404.416" xmlns="http://www.w3.org/2000/svg">${basicSvgPath}</svg>`);
  });
  it('should ignore spaces', () => {
    load('<img src = "./basic.svg" />').trim().should.equal(basicSvgContent);
  });
  it('should auto svgo', () => {
    load('<img src="./complex.svg" />').trim().should.eql(complexSvgContent);
  });
  it('should only apply to elements which have specific attribute', () => {
    load('<img src="./basic.svg" />', 'markup-inline').trim().should.equal('<img src="./basic.svg" />');
    load('<img src="./basic.svg" markup-inline/>', 'markup-inline').trim().should.equal(`<svg  markup-inline  viewBox="0 0 1024 1404.416" xmlns="http://www.w3.org/2000/svg">${basicSvgPath}</svg>`);
    load('<img src="./basic.svg" data-markup-inline/>', 'markup-inline').trim().should.equal(`<svg  data-markup-inline  viewBox="0 0 1024 1404.416" xmlns="http://www.w3.org/2000/svg">${basicSvgPath}</svg>`);
  });
  it('should ignore other images', () => {
    load('<img src="./test.jpg" />').trim().should.equal('<img src="./test.jpg" />');
  });
  it('should inline math[src]', () => {
    load('<math src="./test.mml" />').trim().should.equal('<math style="display: block;"></math>');
  });
});
