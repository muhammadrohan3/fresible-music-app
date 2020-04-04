const path = require("path");
const miniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const pathToFile = "./public/assets";

module.exports = {
  mode: "production",
  entry: {
    clientAuth: pathToFile + "/js/src/clientAuth.js",
    client: pathToFile + "/js/src/client.js",
    admin: pathToFile + "/js/src/admin.js"
  },
  output: {
    path: path.join(__dirname + "/public/assets", "dist"),
    filename: "[name].bundle.js",
    publicPath: "/dist/"
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.s?css$/,
        use: [
          miniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require("autoprefixer")({
                  overrideBrowserslist: ["> 1%", "last 2 versions"]
                }),
                require("cssnano")()
              ]
            }
          },
          {
            loader: "sass-loader",
            options: {
              implementation: require("node-sass")
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|svg|gif)/,
        use: "file-loader"
      }
    ]
  },

  plugins: [
    new miniCssExtractPlugin({
      filename: "bundle.css"
    }),
    new webpack.ProvidePlugin({
      $: require.resolve("jquery"),
      jQuery: "jquery"
    })
  ],

  devServer: {
    contentBase: path.join(__dirname, "/public/views/assets"),
    compress: true,
    port: 9000,
    proxy: {
      "/hi": "localhost:7777"
    }
  }
};
