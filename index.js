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
  const strict = options.strict;

  content = content.replace(PATTERN, replacer);
  return content;

  function replacer(matched, tagName, preAttributes, fileName, postAttributes) {
    const isSvgFile = path.extname(fileName).toLowerCase() === '.svg';
    const isImg = tagName.toLowerCase() === 'img';
    const meetStrict = !strict || new RegExp(`[^\w-](data-)?${options.strict}[^\w-]`).test(matched);

    if (!isSvgFile && isImg || !meetStrict) {
      return matched;
    }

    const filePath = loaderUtils.urlToRequest(path.join(loader.context, fileName), '/');
    loader.addDependency(filePath);
    let fileContent = fs.readFileSync(filePath, {encoding: 'utf-8'});
    if (isSvgFile) {
      // It's callback, But it's sync call, So, we needn't use async loader
      svgo.optimize(fileContent, (result) => {
        fileContent = result.data;
      });
    }
    return fileContent.replace(/^<svg/, '<svg ' + preAttributes + postAttributes + ' ');
  }
};
