const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { webpack, ProvidePlugin } = require("webpack");

module.exports = {
  entry: {
    popup: "./src/popup/index.ts",
    background: "./src/background/index.ts",
  },
  module: {
    rules: [{ test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ }], // do not forget to change/install your own TS loader
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      buffer: require.resolve("buffer/"),
      stream: require.resolve("stream-browserify"),
      crypto: require.resolve("crypto-browserify"),
    },
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new HtmlWebpackPlugin({
      template: "src/popup/popup.html",
      filename: "popup.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./src/manifest.json" },
        {from:"./src/popup/popup.css", to:"popup.css"}
        // { from: "./src/icons/icon16.png" },
        // { from: "./src/icons/icon48.png" },
        // { from: "./src/icons/icon128.png" },
      ],
    }),
    new ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  output: { filename: "[name].js", path: path.resolve(__dirname, "dist") }, // chrome will look for files under dist/* folder
};
