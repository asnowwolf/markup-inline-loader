const PATTERN = /<(svg|img|math)\s+(.*?)src\s*=\s*"(.*?)"(.*?)\/?>/gi;

const fs = require('fs');
const path = require('path');
const SVGO = require('svgo');
const loaderUtils = require('loader-utils');

const SVGOConfiguration = {
  plugins: [
    {
      removeTitle: true,
    },
  ],
};

module.exports = function (content) {
  this.cacheable && this.cacheable();
  const loader = this;
  const options = loaderUtils.getOptions(this) || {};
  const svgo = new SVGO(options.svgo || SVGOConfiguration);

  content = content.replace(PATTERN, replacer);
  return content;

  function replacer(match, element, preAttributes, fileName, postAttributes) {
    const isSvgFile = path.extname(fileName).toLowerCase() === '.svg';
    const isImg = element.toLowerCase() === 'img';

    if (!isSvgFile && isImg) {
      return match;
    }

    const filePath = loaderUtils.urlToRequest(path.join(loader.context, fileName), '/');
    loader.addDependency(filePath);
    let fileContent = fs.readFileSync(filePath, {encoding: 'utf-8'});
    if (isSvgFile) {
      // It's callback, But it's sync
      svgo.optimize(fileContent, function (result) {
        fileContent = result.data;
      });
    }
    return fileContent.replace(/^<svg/, '<svg ' + preAttributes + postAttributes + ' ');
  }
};
