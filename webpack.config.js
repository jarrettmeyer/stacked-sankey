const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: "./src/app.ts",
    output: {
        filename: "app.[hash:8].js"
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
        new HtmlWebpackPlugin({
            filename: "index.html"
        })
    ],
    resolve: {
        extensions: [".js", ".ts"]
    }
};
