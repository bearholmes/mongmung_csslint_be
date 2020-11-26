const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  entry: './app.js',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js',
    publicPath: 'dist/public/'
  },
  optimization: {
    /* minimize: false */
    minimizer: [new TerserPlugin({
      cache: true,
      parallel: true,
      sourceMap: true,
      terserOptions: {
        mangle: false
      }
    })]
  },
  module: {
    rules: [
      {
        test: '/\.js$/',
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: '/\.(png|svg|jpg|gif|ico)$/',
        use: ['file-loader?name=[name].[ext]']
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin()
  ]
}