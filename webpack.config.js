var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './simple-banner.js',
    mode: 'production',
    devtool: 'source-map',
    output: {
        path: __dirname,
        filename: 'simple-banner.min.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", "minify"]
                    }
                }
            }
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({ Cookies: 'js-cookie/src/js.cookie.js' }),
    ],
};