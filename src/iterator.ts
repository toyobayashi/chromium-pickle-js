import type { Pickle } from './pickle'

import {
  SIZE_INT32,
  readInt32LE,
  SIZE_UINT32,
  readUInt32LE,
  SIZE_INT64,
  readBigInt64LE,
  SIZE_UINT64,
  readBigUInt64LE,
  SIZE_FLOAT,
  readFloatLE,
  SIZE_DOUBLE,
  readDoubleLE,
  getTextDecoder,
  alignInt
} from './util'

/** @public */
export interface IPickleIterator {
  readBool (): boolean
  readInt (): number
  readUInt32 (): number
  readInt64 (): bigint
  readUInt64 (): bigint
  readFloat (): number
  readDouble (): number
  readString (): string
  readBytes (length: number): Uint8Array
  readBytes<T extends number | bigint> (length: number, method: (this: Uint8Array, offset: number) => T): T
  getReadPayloadOffsetAndAdvance (length: number): number
  advance (size: number): void
}

/**
 * PickleIterator reads data from a Pickle. The Pickle object must remain valid
 * while the PickleIterator object is in use.
 * @public
 */
export class PickleIterator implements IPickleIterator {
  private readonly payload: Uint8Array
  private readonly payloadOffset: number
  private readIndex: number
  private readonly endIndex: number

  public constructor (pickle: Pickle) {
    this.payload = pickle.header
    this.payloadOffset = pickle.headerSize
    this.readIndex = 0
    this.endIndex = pickle.getPayloadSize()
  }

  public readBool (): boolean {
    return this.readInt() !== 0
  }

  public readInt (): number {
    return this.readBytes(SIZE_INT32, readInt32LE)
  }

  public readUInt32 (): number {
    return this.readBytes(SIZE_UINT32, readUInt32LE)
  }

  public readInt64 (): bigint {
    return this.readBytes(SIZE_INT64, readBigInt64LE)
  }

  public readUInt64 (): bigint {
    return this.readBytes(SIZE_UINT64, readBigUInt64LE)
  }

  public readFloat (): number {
    return this.readBytes(SIZE_FLOAT, readFloatLE)
  }

  public readDouble (): number {
    return this.readBytes(SIZE_DOUBLE, readDoubleLE)
  }

  public readString (): string {
    const TextDecoder = getTextDecoder()
    return (new TextDecoder()).decode(this.readBytes(this.readInt()))
  }

  public readBytes (length: number): Uint8Array
  public readBytes<T extends number | bigint> (length: number, method: (this: Uint8Array, offset: number) => T): T
  public readBytes (length: number, method?: (this: Uint8Array, offset: number, length: number) => number | bigint): Uint8Array | number | bigint {
    const readPayloadOffset = this.getReadPayloadOffsetAndAdvance(length)
    if (method != null) {
      return method.call(this.payload, readPayloadOffset, length)
    } else {
      return this.payload.subarray(readPayloadOffset, readPayloadOffset + length)
    }
  }

  public getReadPayloadOffsetAndAdvance (length: number): number {
    if (length > this.endIndex - this.readIndex) {
      this.readIndex = this.endIndex
      throw new Error(`Failed to read data with length of ${length}`)
    }
    const readPayloadOffset = this.payloadOffset + this.readIndex
    this.advance(length)
    return readPayloadOffset
  }

  public advance (size: number): void {
    const alignedSize = alignInt(size, SIZE_UINT32)
    if (this.endIndex - this.readIndex < alignedSize) {
      this.readIndex = this.endIndex
    } else {
      this.readIndex += alignedSize
    }
  }
}
