const dotenv = require('dotenv').config({path: './.env.local'});
const webpack = require('webpack');

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'bundle.js'
	},
	mode: 'production',
	target: 'node',
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						cacheDirectory: true
					}
				}
			}
		]
	},
	plugins: [
		new webpack.EnvironmentPlugin(dotenv.parsed)
	]
};