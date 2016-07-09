var PATTERN = /<(svg|img|math)\s+(.*?)src="(.*?)"(.*?)\/?>/gi;

var fs = require('fs');
var path = require('path');

module.exports = function (content) {
  var loader = this;
  content = content.replace(PATTERN, function (match, element, preAttributes, fileName, postAttributes) {
    if (path.extname(fileName).toLowerCase() !== '.svg' && element.toLowerCase() === 'img') {
      return match;
    }
    var filePath = path.join(loader.context, fileName);
    var svg = fs.readFileSync(filePath, {encoding: 'utf-8'});
    loader.addDependency(filePath);
    svg = svg.replace(/<\?xml.*?\?>\s*/, '');
    return svg.replace(/^<svg/, '<svg ' + preAttributes + postAttributes + ' ');
  });
  return content;
};
