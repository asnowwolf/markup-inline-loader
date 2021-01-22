import path from 'path';
import webpack from 'webpack';
import {createFsFromVolume, Volume} from 'memfs';

module.exports = (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: [
            'html-loader',
            {
              loader: path.resolve(__dirname, '../src/loader.js'),
              options,
            },
          ],
        },
        {
          test: /\.jpg$/,
          use: 'file-loader',
        },
        {
          test: /\.svg$/,
          use: 'file-loader',
        },
      ],
    },
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(stats.toJson().errors);

      resolve(stats);
    });
  });
};
