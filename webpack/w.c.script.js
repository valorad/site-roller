const { resolve } = require("path");

require("babel-polyfill");
 
let pages = ['base', 'inner']; // ts file names
let entry = {};

for (let page of pages) {
  entry[page] = [resolve(`./src/ts/${page}.ts`)]
}

entry['base'].unshift('babel-polyfill'); // The global script loads babel-polyfill as well

let config = {

  mode: 'production',

  entry: entry,

  resolve: {
    extensions: ['.ts', '.js']
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /(\.ts)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: "tsconfig.json"
            }
          }
        ]
      }
    ]
  },

  output: {
    filename: '[name].js',
    chunkFilename: '[id].[hash].chunk.js'
  }


};


module.exports = config;