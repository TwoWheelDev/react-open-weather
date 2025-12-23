const path = require('path');

module.exports = {
  mode: 'development',

  entry: {
    main: path.resolve(__dirname, 'src/js/index.ts'),
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    publicPath: '/',
    clean: true,
  },

  devtool: 'source-map',

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

  devServer: {
    port: 5000,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
  },
};
