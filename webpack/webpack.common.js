const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const glob = require('glob');
const dotenv = require('dotenv').config();

const projectRoot = process.cwd();

const getPageFiles = page => {
  const files = glob.sync(`./src/pages/${page}/index.{ts,tsx,js,jsx}`);
  if (files.length > 1) {
    throw new Error(`Multiple index files found in ${page} folder`);
  }
  return files.length ? {[`${page}/${page}`]: `./${files[0]}`} : {};
};

const injectionScripts = () => {
  const files = glob.sync('./src/scripts/*.{ts,mts,js,mjs}');
  return files.reduce((acc, filePath) => {
    const fileName = path.basename(filePath, path.extname(filePath));
    acc[`scripts/${fileName}`] = `./${filePath}`;
    return acc;
  }, {});
};

const generateHtmlPlugins = () => {
  const pages = ['popup', 'options'];
  return pages
    .map(page => {
      const entryFile = glob.sync(`./src/pages/${page}/index.{ts,tsx,js,jsx}`)[0];
      if (entryFile) {
        return new HtmlWebpackPlugin({
          template: './src/pages/index.html',
          filename: `${page}/index.html`,
          chunks: ['vendors', `${page}/${page}`],
          scriptLoading: 'blocking',
          showErrors: true,
        });
      }
    })
    .filter(Boolean);
};

module.exports = {
  entry: {
    ...getPageFiles('popup'),
    ...getPageFiles('options'),
    ...injectionScripts(),
    background: './src/background.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(projectRoot, './build'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|mts|tsx|js|mjs|jsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(s[ac]ss|css)$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader', 'postcss-loader'],
      },
      {
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopyPlugin({
      patterns: [{from: 'public', to: './'}],
    }),
    ...generateHtmlPlugins(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed),
    }),
  ],
};
