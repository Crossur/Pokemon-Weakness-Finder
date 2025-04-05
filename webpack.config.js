const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
// const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "bundle.js",
    publicPath: "./",
  },
  devServer: {
    static: path.resolve(__dirname, "docs"),
    hot: true,
    historyApiFallback: true,
    port: 8080,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
            ],
            // plugins: ['react-refresh/babel'],
          },
        },
      },
      {
        test: /\.css$/, 
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              url: false, 
            },
          },
          'postcss-loader',
        ],
      },
      // {
      //   test: /.(png|jpg|gif|svg)$/,
      //   type: "asset/resource",
      // },
    ],
  },
  resolve: {
    fallback: {
      buffer: require.resolve("buffer/"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename:"index.html",
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    // new ReactRefreshWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/styles', to: 'styles' }, 
        { from: 'src/assets', to: 'assets' },
      ],
    }),
  ],
  devtool: "eval-source-map",
};