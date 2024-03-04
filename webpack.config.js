const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.js', // 入口文件
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html', // 指定模板文件
            filename: 'index.html' // 指定生成的文件名
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './public'),
                    to: path.resolve(__dirname, './dist'),
                    globOptions: { ignore: ['**/index.html']}
                },
            ],
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use:['style-loader','css-loader']
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                }
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'images', // 输出目录，相对于 output.path
                            name: '[name].[ext]', // 输出文件名规则
                        },
                    },
                ],
            },
        ]
    }
};
