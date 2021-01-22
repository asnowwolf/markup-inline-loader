const PATTERN = /<(svg|img|math)\s+([^>]*?)src\s*=\s*"([^>]*?)"([^>]*?)\/?>/gi;

const fs = require('fs');
const path = require('path');
const SVGO = require('svgo');
const loaderUtils = require('loader-utils');

const SVGOConfiguration = {
  plugins: [
    {removeTitle: true},
  ],
};

module.exports = async function loader(source) {
  this.cacheable && this.cacheable();
  const callback = this.async();
  const result = await replace(source, this);
  callback(null, result);
};

async function replace(source, loader) {
  const options = loaderUtils.getOptions(loader);
  const svgo = new SVGO(options.svgo || SVGOConfiguration);
  const strict = (options.strict || '[markup-inline]').replace(/\[(data-)?([\w-]+)]/, '$2');

  const result = [];
  const tokens = source.matchAll(PATTERN);
  let prevPos = 0;
  for (const token of tokens) {
    const [matched, tagName, preAttributes, fileName, postAttributes] = token;
    const {index} = token;
    const isSvgFile = path.extname(fileName).toLowerCase() === '.svg';
    const isImg = tagName.toLowerCase() === 'img';
    const meetStrict = new RegExp(`\\b(data-)?${strict}\\b`).test(preAttributes + ' ' + postAttributes);

    if (isImg && !isSvgFile || !meetStrict) {
      continue;
    }

    const filePath = loaderUtils.urlToRequest(path.join(loader.context, fileName), '/');
    loader.addDependency(filePath);
    let fileContent = fs.readFileSync(filePath, 'utf8');
    if (isSvgFile) {
      // It's callback, But it's sync call, So, we needn't use async loader
      fileContent = (await svgo.optimize(fileContent)).data;
    }
    if (index !== prevPos) {
      result.push(source.slice(prevPos, index));
    }
    result.push(fileContent.replace(/^<(svg|math)/, '<$1 ' + preAttributes + postAttributes + ' '));
    prevPos = index + matched.length;
  }
  result.push(source.slice(prevPos));
  return result.join('');
}
