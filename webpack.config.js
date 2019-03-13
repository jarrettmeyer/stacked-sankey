const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/app.ts",
    output: {
        filename: "app.[hash:8].js",
        path: path.join(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ["ts-loader"]
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: "data", to: "data" }
        ]),
        new HtmlWebpackPlugin({
            filename: "index.html"
        })
    ],
    resolve: {
        extensions: [".js", ".ts"]
    }
};
