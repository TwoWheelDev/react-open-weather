const path = require('path');

module.exports = {
  entry: './src/js/index.ts',
  output: {
    path: path.resolve(__dirname, './lib'),
    filename: 'ReactWeather.js',
    library: {
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
};
