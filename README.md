# NavigationTreeComponent

Материал взят:
```
https://maxfarseer.gitbooks.io/redux-course-ru/content/index.html
```

### package.json
```
{
  "name": "redux-ru-tutorial",
  "version": "1.0.0",
  "description": "Redux RU tutorial",
  "main": "index.js",
  "scripts": {
    "start": "node server.js"
  },
  "author": "Maxim Patsianskiy",
  "license": "MIT"
}
```

```
npm i webpack webpack-dev-middleware webpack-hot-middleware --save-dev
```

### webpack.config.js
```
var path = require('path')
var webpack = require('webpack')

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
    'babel-polyfill',
    './src/index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        loaders: ['react-hot', 'babel-loader'], //добавили loader 'react-hot'
        include: [
          path.resolve(__dirname, "src"),
        ],
        test: /\.js$/,
        plugins: ['transform-runtime'],
      }
    ]
  }
}
```

### Server
```
npm i express --save-dev
```

#### server.js
```
var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')
var config = require('./webpack.config')

var app = new (require('express'))()
var port = 3000

var compiler = webpack(config)
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
app.use(webpackHotMiddleware(compiler))

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
  }
})
```

#### index.html
```HTML
<!DOCTYPE html>
<html>
  <head>
    <title>Redux [RU]Tutorial</title>
  </head>
  <body>
    <div id="root">
    </div>
    <script src="/static/bundle.js"></script>
  </body>
</html>
```

* npm install babel-core babel-loader --save-dev
* npm install babel-preset-es2015 --save-dev
* npm install babel-preset-react --save-dev
* npm install babel-preset-stage-0 --save-dev
* npm install babel-polyfill --save
* npm install babel-runtime --save
* npm install babel-plugin-transform-runtime --save-dev

#### .babelrc
```
{
  "presets": ["es2015", "stage-0", "react"] //поддержка ES2015, ES7 и JSX
}
```

* npm i react react-dom --save

* src/index.js
```
import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from './containers/App'


render(
  <App />,
  document.getElementById('root')
)
```

```
npm install react-hot-loader --save-dev
```

* npm i babel-eslint eslint eslint-plugin-react --save-dev

#### .eslintrc
```
{
  "extends": "eslint:recommended",
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "node": true
  },
  "plugins": [
    "react"
  ],
  "rules": {
    "no-debugger": 0,
    "no-console": 0,
    "new-cap": 0,
    "strict": 0,
    "no-underscore-dangle": 0,
    "no-use-before-define": 0,
    "eol-last": 0,
    "quotes": [2, "single"],
    "jsx-quotes": [1, "prefer-single"],
    "react/jsx-no-undef": 1,
    "react/jsx-uses-react": 1,
    "react/jsx-uses-vars": 1
  }
}
```

* npm i eslint-loader --save-dev

* npm i --save react-hot-loader

-- webpack.config.js
```javascript
***
module: {
    preLoaders: [ //добавили ESlint в preloaders
      {
        test: /\.js$/,
        loaders: ['eslint'],
        include: [
          path.resolve(__dirname, "src"),
        ],
      }
    ],
    loaders: [ //все остальное осталось не тронутым
      {
        loaders: ['react-hot', 'babel-loader'],
        include: [
          path.resolve(__dirname, "src"),
        ],
        test: /\.js$/,
        plugins: ['transform-runtime'],
      }
    ]
  }
***
```
* npm install npm-install-webpack-plugin --save-dev

#### .npmrc
```
save=true
save-exact=true
```
#### webpack.config.ru
```
...
//добавьте новую зависимость в начале конфига
var NpmInstallPlugin = require('npm-install-webpack-plugin');
...
//добавьте плагин в секцию плагинов
plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new NpmInstallPlugin() // <--
  ],
...
```
