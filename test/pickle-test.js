var assert = require('assert')
var Pickle = require('..')

var describe = global.describe
var it = global.it

describe('Pickle', function () {
  it('supports multi-byte characters', function () {
    var write = Pickle.createEmpty()
    write.writeString('女の子.txt')

    var read = Pickle.createFromBuffer(write.toBuffer())
    const it = read.createIterator()
    assert.equal(it.readString(), '女の子.txt')
  })
})
