var PATTERN = /<(svg|img|math)\s+(.*?)src="(.*?)"(.*?)\/?>/gi;

var fs = require('fs');
var path = require('path');

module.exports = function (content) {
  this.cacheable();
  var folder = path.dirname(this.resourcePath);
  content = content.replace(PATTERN, function (match, element, preAttributes, fileName, postAttributes) {
    console.log(path.extname(fileName));
    if (path.extname(fileName).toLowerCase() !== '.svg' && element.toLowerCase() === 'img') {
      return match;
    }
    var svg = fs.readFileSync(path.join(folder, fileName), {encoding: 'utf-8'});
    return svg.replace(/^<svg/, '<svg ' + preAttributes + postAttributes + ' ');
  });
  return content;
};
