var SVG_PATTERN =   /<\s*svg\s+(.*?)\s*src\s*=\s*[\"\'](.*?\.svg)[\"\']\s*(.*?)\s*(\/>|>\s*<\/\s*svg\s*>)/gi;
var MATH_PATTERN = /<\s*math\s+(.*?)\s*src\s*=\s*[\"\'](.*?\.mml)[\"\']\s*(.*?)\s*(\/>|>\s*<\/\s*math\s*>)/gi;

var fs = require('fs');
var path = require('path');
var SVGO = require('svgo');

var svgo = new SVGO({
  plugins: [
    {
      removeTitle: true
    }
  ]
});

module.exports = function (content) {
  var loader = this;
  // process SVG
  content = content.replace(SVG_PATTERN, function (match, preAttributes, fileName, postAttributes) {
    var filePath = path.join(loader.context, fileName);
    loader.addDependency(filePath);
    var fileContent = fs.readFileSync(filePath, {encoding: 'utf-8'});
    // It's callback, But it's sync
    svgo.optimize(fileContent, function (result) {
      fileContent = result.data;
    });
    return fileContent.replace(/^<svg/i, '<svg ' + preAttributes + ' ' + postAttributes + ' ');
  });
  // process MathML
  content = content.replace(MATH_PATTERN, function (match, preAttributes, fileName, postAttributes) {
    var filePath = path.join(loader.context, fileName);
    loader.addDependency(filePath);
    var fileContent = fs.readFileSync(filePath, {encoding: 'utf-8'});
    return fileContent.replace(/^<math/i, '<math ' + preAttributes + ' ' + postAttributes + ' ');
  });
  return content;
};
