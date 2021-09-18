'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/chromium-pickle.cjs.min.js')
} else {
  module.exports = require('./dist/chromium-pickle.cjs.js')
}
