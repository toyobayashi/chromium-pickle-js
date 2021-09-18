declare function require (id: string): any
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __webpack_public_path__: any
// eslint-disable-next-line @typescript-eslint/naming-convention
declare function __non_webpack_require__ (id: string): any
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __TSGO_FORMAT__: string

// sizeof(T).
export const SIZE_INT32 = 4
export const SIZE_UINT32 = 4
export const SIZE_INT64 = 8
export const SIZE_UINT64 = 8
export const SIZE_FLOAT = 4
export const SIZE_DOUBLE = 8

/** The allocation granularity of the payload. */
export const PAYLOAD_UNIT = 64

/** Largest JS number. */
export const CAPACITY_READ_ONLY = 9007199254740992

/**
 * Aligns 'i' by rounding it up to the next multiple of 'alignment'.
 */
export const alignInt = function (i: number, alignment: number): number {
  return i + (alignment - (i % alignment)) % alignment
}

export function readInt32LE (this: Uint8Array, offset = 0): number {
  const dataView = new DataView(this.buffer)
  return dataView.getInt32(offset, true)
}

export function readUInt32LE (this: Uint8Array, offset = 0): number {
  const dataView = new DataView(this.buffer)
  return dataView.getUint32(offset, true)
}

export function readFloatLE (this: Uint8Array, offset = 0): number {
  const dataView = new DataView(this.buffer)
  return dataView.getFloat32(offset, true)
}

export function readDoubleLE (this: Uint8Array, offset = 0): number {
  const dataView = new DataView(this.buffer)
  return dataView.getFloat64(offset, true)
}

export function readBigInt64LE (this: Uint8Array, offset = 0): bigint {
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    throw new RangeError('int64 buffer is too short')
  }

  const val = this[offset + 4] +
    this[offset + 5] * 2 ** 8 +
    this[offset + 6] * 2 ** 16 +
    (last << 24) // Overflow
  return (BigInt(val) << BigInt(32)) +
    BigInt(first +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 24)
}

export function readBigUInt64LE (this: Uint8Array, offset = 0): bigint {
  const first = this[offset]
  const last = this[offset + 7]
  if (first === undefined || last === undefined) {
    throw new RangeError('uint64 buffer is too short')
  }

  const lo = first +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    this[++offset] * 2 ** 24

  const hi = this[++offset] +
    this[++offset] * 2 ** 8 +
    this[++offset] * 2 ** 16 +
    last * 2 ** 24

  return BigInt(lo) + (BigInt(hi) << BigInt(32))
}

export function writeInt32LE (this: Uint8Array, data: number, offset = 0): number {
  const dataView = new DataView(this.buffer)
  dataView.setInt32(offset, data, true)
  return SIZE_INT32
}

export function writeUInt32LE (this: Uint8Array, data: number, offset = 0): number {
  const dataView = new DataView(this.buffer)
  dataView.setUint32(offset, data, true)
  return SIZE_UINT32
}

export function writeFloatLE (this: Uint8Array, data: number, offset = 0): number {
  const dataView = new DataView(this.buffer)
  dataView.setFloat32(offset, data, true)
  return SIZE_FLOAT
}

export function writeDoubleLE (this: Uint8Array, data: number, offset = 0): number {
  const dataView = new DataView(this.buffer)
  dataView.setFloat64(offset, data, true)
  return SIZE_DOUBLE
}

export function writeBigInt64LE (this: Uint8Array, value: bigint, offset = 0): number {
  return _writeBigUInt64LE(this, value, offset, BigInt(-1) << BigInt(63), (BigInt(1) << BigInt(63)) - BigInt(1))
}

export function writeBigUInt64LE (this: Uint8Array, value: bigint, offset = 0): number {
  return _writeBigUInt64LE(this, value, offset, BigInt(0), (BigInt(1) << BigInt(64)) - BigInt(1))
}

function _writeBigUInt64LE (buf: Uint8Array, value: bigint, offset: number, min: bigint, max: bigint): number {
  if (value < min || value > max) {
    throw new RangeError('(u)int64 range error')
  }
  let lo = Number(value & BigInt(0xffffffff))
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  lo = lo >> 8
  buf[offset++] = lo
  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff))
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  hi = hi >> 8
  buf[offset++] = hi
  return offset
}

function nodeRequire (id: string): any {
  if (typeof __webpack_public_path__ !== 'undefined') {
    return __non_webpack_require__(id)
  } else {
    return require(id)
  }
}

let _TextEncoder: typeof TextEncoder
let _TextDecoder: typeof TextDecoder

export function getTextEncoder (): typeof TextEncoder {
  if (__TSGO_FORMAT__ === 'esm-browser') {
    return window.TextEncoder
  } else {
    if (!_TextEncoder) {
      _TextEncoder = (() => {
        if (typeof window !== 'undefined') {
          return window.TextEncoder
        }

        try {
          return nodeRequire('util').TextEncoder
        } catch (_) {
          return globalThis.TextEncoder
        }
      })()
    }
    return _TextEncoder
  }
}

export function getTextDecoder (): typeof TextDecoder {
  if (__TSGO_FORMAT__ === 'esm-browser') {
    return window.TextDecoder
  } else {
    if (!_TextDecoder) {
      _TextDecoder = (() => {
        if (typeof window !== 'undefined') {
          return window.TextDecoder
        }

        try {
          return nodeRequire('util').TextDecoder
        } catch (_) {
          return globalThis.TextDecoder
        }
      })()
    }
    return _TextDecoder
  }
}
