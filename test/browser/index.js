/// <reference path="../../dist/chromium-pickle.d.ts" />

(function () {
  var assert = {
    equal: function (a, e, msg) {
      if (a != e) {
        throw new Error(msg || 'expect ' + e + ', actual ' + a)
      }
    }
  }
  var write = chromiumPickle.createEmpty()
  write.writeString('女の子.txt')

  var read = chromiumPickle.createFromBuffer(write.toBuffer())
  var it = read.createIterator()
  var result = it.readString()
  console.log(result)
  assert.equal(result, '女の子.txt')
})()
