const autoprefixer = require("autoprefixer");
const copyWebpack = require("copy-webpack-plugin");
const fs = require("fs");
const highlight = require("highlight.js");
const htmlWebpackPlugin = require("html-webpack-plugin");
const markdownIt = require("markdown-it");
const markdownItEmoji = require("markdown-it-emoji");
const miniCssExtract = require("mini-css-extract-plugin");
const path = require("path");
const sass = require("sass");

/**
 * Caminho para o diretório de trabalho atual (current working directory).
 * 
 * No caso, o local de onde o script é executado.
 * 
 * @type {string}
 */
const WORK_DIR = process.cwd();

/**
 * Gera configurações para manifest file de build.
 * 
 * @param {boolean} isProduction 
 * @returns {*}
 */
const manifestOptions = (isProduction) => ({
  basePath: "",
  publicPath: (isProduction) ? "/" : "",
});

/**
 * Retorna um `index` da pasta desejada, relativo ao `WORK_DIR`.
 * 
 * Busca por arquivos com nome `index` e alguma das extensões abaixo, em 
 * ordem de prioridade:
 * - TSX;
 * - JSX;
 * - TS;
 * - JS;
 * 
 * Modifique de acordo com as suas necessidades.
 *  
 * @param {string} folder 
 *     Pasta ou caminho para a mesma, tendo como base a raíz do repositório
 * @returns {string}
 */
const getEntryPointFile = (folder) => {
  const fileList = fs.readdirSync(
    path.resolve(WORK_DIR, folder)
  );

  const extensions = ["jsx", "mjs"];

  for (let extension of extensions) {
    if (fileList.includes(`index.${extension}`)) {
      return `index.${extension}`;
    }
  }

  return `index.js`;
};

/**
 * Retorna configurações do Webpack.
 * 
 * @param {*} env 
 *     Objeto com variáveis do ambiente da aplicação 
 * @param {*} argv 
 *     Objeto com parâmetros passados via CLI ao Webpack
 * @returns {import("webpack").Configuration}
 */
module.exports = (env, argv) => {
  // GENERAL
  // --------------------------------------------------------------------

  /** @type {boolean} */
  const isProduction = (argv.mode === "production");

  const assetPaths = ["", "img", "fonts", "media", "data"].map((item) => (
    new htmlWebpackPlugin({
      inject: true,
      filename: (item.trim() !== "") 
        ? `assets/${item}/index.html` 
        : `assets/index.html`,
      templateContent: `<!doctype html><html>
        <head>
          <title>Not Allowed</title>
          <meta http-equiv="refresh" content="0; url=/">
        </head>
      </html>`,
      hash: true,
      minify: {
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        collapseWhitespace: true,
      },
    })
  ));

  /**
   * Lista todos os diretórios usados para a resolução de módulos.
   * 
   * @type {Array<string>}
   */
  const resolvePaths = [
    path.resolve(WORK_DIR, "./src"),
  ];

  // LOADERS
  // --------------------------------------------------------------------

  const cssLoader = {
    loader: "css-loader",
    options: {
      esModule: false, 
      modules: false, 
      importLoaders: 2,
      sourceMap: false,
    },
  };

  const postcssLoader = {
    loader: "postcss-loader",
    options: {
      sourceMap: false,
      postcssOptions: {
        plugins: [
          autoprefixer({
            flexbox: "no-2009",
          }),
        ],
      },
    },
  };

  const sassLoader = {
    loader: "sass-loader",
    options: {
      implementation: sass,
      sourceMap: false,
      sassOptions: {
        precision: 8,
        outputStyle: "compressed",
        sourceComments: false,
        includePaths: [
          path.resolve(WORK_DIR, "src", "styles"),
        ],
        quietDeps: true,
      },
    },
  };

  const styleLoader = (isProduction) 
    ? miniCssExtract.loader 
    : "style-loader";

  // CONFIGURAÇÕES
  // --------------------------------------------------------------------

  /** @type {import("webpack").Configuration} */
  const config = {};

  config.devServer = {
    hot: "true",
    port: 8080,
    historyApiFallback: true,
  };

  config.devtool = false;

  config.entry = {
    index: {
      import: path.resolve(WORK_DIR, "./src", getEntryPointFile("./src")),
      dependOn: "npm.libs", 
    },
    "npm.libs": [
      "preact"
    ],
  };

  config.mode = (isProduction) ? "production" : "development";

  config.module = {
    rules: [
      {
        test: /\.(jsx?|mjs)$/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: true,
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          styleLoader,
          cssLoader,
          postcssLoader,
          sassLoader,
        ],
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[hash:16].[ext]",
            esModule: false,
            outputPath: "assets/img/",
            publicPath: "/assets/img",
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[hash:16].[ext]",
            esModule: false,
            outputPath: "assets/img/",
            publicPath: "/assets/img",
          },
        },
      },
      {
        test: /\.(wav|mp3|mp4|avi|mpg|mpeg|mov|ogg|webm)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[hash:16].[ext]",
            esModule: false,
            outputPath: "assets/media/",
            publicPath: "/assets/media",
          },
        },
      },
      {
        test: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[hash:16].[ext]",
            esModule: false,
            outputPath: "assets/data/",
            publicPath: "/assets/data",
          },
        },
      },
      {
        test: /\.md$/,
        loader: "frontmatter-markdown-loader",
        options: {
          markdownIt: markdownIt({
            html: true,
            xhtmlOut: true,
            langPrefix: "language-",
            highlight: (str, lang) => {
              if (lang && highlight.getLanguage(lang)) {
                try {
                  return (
                    `<pre class="hljs"><code>${highlight.highlight(
                      str, 
                      {
                        language: lang, 
                        ignoreIllegals: true
                      }
                    ).value}</code></pre>`
                  );
                } catch (__) {
                  console.log("Nothing to catch here.");
                }
              }

              return (
                `<pre class="hljs"><code>${markdownIt({
                  html: true,
                  xhtmlOut: true,
                  langPrefix: "language-"
                }).utils.escapeHtml(str)}</code></pre>`
              );
            },
          }).use(markdownItEmoji),
          mode: [
            "html",
            "body",
            "meta",
            "react-component"
          ],
          react: {
            root: "markdown-content"
          }
        },
      },
    ],
  };

  config.optimization = {
    minimize: isProduction,
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        bootstrap: {
          test: /vendor\.(sa|sc|c)ss/,
          name: "npm.vendor",
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: (module) => {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];

            return `npm.${packageName.replace("@", "")}`;
          },
          reuseExistingChunk: true, 
        },
      },
    },
  };

  config.output = {
    pathinfo: false,
    path: path.resolve(WORK_DIR, "build"),
    filename: "[name].[contenthash:8].js",
    publicPath: "/",
    clean: true,
  };

  config.plugins = [
    ...assetPaths, 

    new copyWebpack({
      patterns: [
        {
          from: "public",
          to: "",
          toType: "dir",
          globOptions: {
            dot: true,
            ignore: [
              "**/*.html",
            ],
          },
        },
      ],
    }),

    new htmlWebpackPlugin({
      inject: true,
      filename: "index.html",
      template: path.resolve(WORK_DIR, "public", "index.html"),
      hash: true,
      minify: {
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        collapseWhitespace: true,
      },
    }),

    new miniCssExtract({
      filename: "[name].css", 
    }),
  ];

  config.resolve = {
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
    },
    modules: [
      ...resolvePaths,
      "node_modules",
    ],
    extensions: [
      ".js",
      ".jsx",
      ".mjs",
    ],
    plugins: [],
  };

  config.stats = {
    colors: true,
    hash: false,
    version: false,
    timings: true,
    assets: true,
    chunks: false,
    modules: false,
    reasons: false,
    children: false,
    source: false,
    errors: true,
    errorDetails: true,
    warnings: true,
    publicPath: false,
  };

  config.target = "web";

  return config;
};
