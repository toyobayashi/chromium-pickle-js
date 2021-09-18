module.exports = {
  output: {
    name: 'chromium-pickle'
    // doc: false
  },
  rollupGlobals: {
  },
  bundleOnly: [
    'umd',
    'cjs',
    'esm-browser',
    { type: 'esm-bundler', minify: false }
  ],
  library: 'chromiumPickle',
  bundleDefine: {
    __VERSION__: JSON.stringify(require('./package.json').version)
  }
}
