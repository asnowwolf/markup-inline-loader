var PATTERN = /<(svg|img|math)\s+(.*?)src="(.*?)"(.*?)\/?>/gi;

var fs = require('fs');
module.exports = function (content) {
  // this.cacheable();
  content = content.replace(PATTERN, function (match, element, preAttributes, fileName, postAttributes) {
    var svg = fs.readFileSync(fileName, {encoding: 'utf-8'});
    return svg.replace(/^<svg/, '<svg ' + preAttributes + postAttributes + ' ');
  });
  return content;
};

