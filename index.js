const PATTERN = /<(svg|img|math)\s+(.*?)src="(.*?)"(.*?)\/?>/gi;

const fs = require('fs');
const path = require('path');
const SVGO = require('svgo');
const asyncReplace = require('async-replace');

const svgo = new SVGO({
  plugins: [
    {
      removeTitle: true
    }
  ]
});

module.exports = function(content) {
  this.cacheable && this.cacheable();
  const callback = this.async();
  const loader = this;
  const loaderUtils = require('loader-utils');
  const options = loaderUtils.getOptions(this) || {};

  let replacer = function(match, element, preAttributes, fileName, postAttributes, offset, string, done) {
    const isSvgFile = path.extname(fileName).toLowerCase() === '.svg';
    const isImg = element.toLowerCase() === 'img';

    if (!isSvgFile && isImg) {
      done(null, match);
    } else {
      const filePath = loaderUtils.urlToRequest(fileName, options.root);
      loader.resolve(loader.context, filePath, function(err, resolvedFilePath) {
        if (err) done(err);

        loader.addDependency(resolvedFilePath);
        let fileContent = fs.readFileSync(resolvedFilePath, {encoding: 'utf-8'});
        if (isSvgFile) {
          // It's callback, But it's sync
          svgo.optimize(fileContent, function(result) {
            fileContent = result.data;
          });
        }
        let replacedContent = fileContent.replace(/^<svg/, '<svg ' + preAttributes + postAttributes + ' ')
        done(null, replacedContent);
      });
    }
  };

  asyncReplace(content, PATTERN, replacer, function(err, result) {
    callback(err, result);
  });
};
