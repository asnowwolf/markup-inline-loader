var should = require('should');
var loader = require('../index');

describe('markup inline loader', function () {
  it('svg', function () {
    loader('<svg class="abc" src="./test/test.svg" width="100px" />').trim().should.equal('<svg class="abc"  width="100px"  ><path></path></svg>');
  });
  it('img', function () {
    loader('<img src="./test/test.svg" />').trim().should.equal('<svg   ><path></path></svg>');
  });
  it('math', function () {
    loader('<math src="./test/test.mml" />').trim().should.equal('<math style="display: block;"></math>');
  });
});
