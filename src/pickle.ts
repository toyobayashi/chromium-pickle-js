import {
  writeInt32LE,
  writeUInt32LE,
  writeBigInt64LE,
  writeBigUInt64LE,
  writeFloatLE,
  writeDoubleLE,
  getTextEncoder,
  alignInt,
  CAPACITY_READ_ONLY,
  PAYLOAD_UNIT,
  SIZE_DOUBLE,
  SIZE_FLOAT,
  SIZE_INT32,
  SIZE_INT64,
  SIZE_UINT32,
  SIZE_UINT64
} from './util'

import { PickleIterator } from './iterator'
import type { IPickleIterator } from './iterator'

/** @public */
export interface IPickle {
  header: Uint8Array
  headerSize: number
  initEmpty (): void
  initFromBuffer (buffer: Uint8Array): void
  createIterator (): IPickleIterator
  toBuffer (): Uint8Array
  writeBool (value: boolean): boolean
  writeInt (value: number): boolean
  writeUInt32 (value: number): boolean
  writeInt64 (value: bigint | number): boolean
  writeUInt64 (value: bigint | number): boolean
  writeFloat (value: number): boolean
  writeDouble (value: number): boolean
  writeString (value: string): boolean
  setPayloadSize (payloadSize: number): number
  getPayloadSize (): number
  writeBytes (data: Uint8Array, length: number): boolean
  writeBytes<T extends number | bigint> (data: T, length: number, method: (data: T, offset?: number) => number): boolean
  resize (newCapacity: number): void
}

/**
 * This class provides facilities for basic binary value packing and unpacking.
 *
 * The Pickle class supports appending primitive values (ints, strings, etc.)
 * to a pickle instance.  The Pickle instance grows its internal memory buffer
 * dynamically to hold the sequence of primitive values.   The internal memory
 * buffer is exposed as the "data" of the Pickle.  This "data" can be passed
 * to a Pickle object to initialize it for reading.
 *
 * When reading from a Pickle object, it is important for the consumer to know
 * what value types to read and in what order to read them as the Pickle does
 * not keep track of the type of data written to it.
 *
 * The Pickle's data has a header which contains the size of the Pickle's
 * payload.  It can optionally support additional space in the header.  That
 * space is controlled by the header_size parameter passed to the Pickle
 * constructor.
 */
export class Pickle implements IPickle {
  public header!: Uint8Array
  public headerSize!: number
  private capacityAfterHeader!: number
  private writeOffset!: number

  public constructor (buffer?: Uint8Array) {
    if (buffer) {
      this.initFromBuffer(buffer)
    } else {
      this.initEmpty()
    }
  }

  public initEmpty (): void {
    this.header = new Uint8Array(0)
    this.headerSize = SIZE_UINT32
    this.capacityAfterHeader = 0
    this.writeOffset = 0
    this.resize(PAYLOAD_UNIT)
    this.setPayloadSize(0)
  }

  public initFromBuffer (buffer: Uint8Array): void {
    this.header = buffer
    this.headerSize = buffer.length - this.getPayloadSize()
    this.capacityAfterHeader = CAPACITY_READ_ONLY
    this.writeOffset = 0
    if (this.headerSize > buffer.length) {
      this.headerSize = 0
    }
    if (this.headerSize !== alignInt(this.headerSize, SIZE_UINT32)) {
      this.headerSize = 0
    }
    if (this.headerSize === 0) {
      this.header = new Uint8Array(0)
    }
  }

  public createIterator (): PickleIterator {
    return new PickleIterator(this)
  }

  public toBuffer (): Uint8Array {
    return this.header.subarray(0, this.headerSize + this.getPayloadSize())
  }

  public writeBool (value: boolean): boolean {
    return this.writeInt(value ? 1 : 0)
  }

  public writeInt (value: number): boolean {
    return this.writeBytes(value, SIZE_INT32, writeInt32LE)
  }

  public writeUInt32 (value: number): boolean {
    return this.writeBytes(value, SIZE_UINT32, writeUInt32LE)
  }

  public writeInt64 (value: bigint | number): boolean {
    if (typeof value === 'number') {
      value = BigInt(value)
    }
    return this.writeBytes(value, SIZE_INT64, writeBigInt64LE)
  }

  public writeUInt64 (value: bigint | number): boolean {
    if (typeof value === 'number') {
      value = BigInt(value)
    }
    return this.writeBytes(value, SIZE_UINT64, writeBigUInt64LE)
  }

  public writeFloat (value: number): boolean {
    return this.writeBytes(value, SIZE_FLOAT, writeFloatLE)
  }

  public writeDouble (value: number): boolean {
    return this.writeBytes(value, SIZE_DOUBLE, writeDoubleLE)
  }

  public writeString (value: string): boolean {
    const TextEncoder = getTextEncoder()
    const buffer = (new TextEncoder()).encode(value)
    const length = buffer.byteLength
    if (!this.writeInt(length)) {
      return false
    }
    return this.writeBytes(buffer, length)
  }

  public setPayloadSize (payloadSize: number): number {
    const dataView = new DataView(this.header.buffer)
    dataView.setUint32(0, payloadSize, true)
    return 2
  }

  public getPayloadSize (): number {
    const dataView = new DataView(this.header.buffer)
    return dataView.getUint32(0, true)
  }

  public writeBytes (data: Uint8Array, length: number): boolean
  public writeBytes<T extends number | bigint> (data: T, length: number, method: (data: T, offset?: number) => number): boolean
  public writeBytes (data: number | bigint | Uint8Array, length: number, method?: (data: number | bigint, offset?: number) => number): boolean {
    const dataLength = alignInt(length, SIZE_UINT32)
    const newSize = this.writeOffset + dataLength
    if (newSize > this.capacityAfterHeader) {
      this.resize(Math.max(this.capacityAfterHeader * 2, newSize))
    }
    if (method != null) {
      method.call(this.header, data as number, this.headerSize + this.writeOffset)
    } else {
      this.header.set((data as Uint8Array), this.headerSize + this.writeOffset)
      // this.header.write(data, this.headerSize + this.writeOffset, length)
    }
    const endOffset = this.headerSize + this.writeOffset + length
    this.header.fill(0, endOffset, endOffset + dataLength - length)
    this.setPayloadSize(newSize)
    this.writeOffset = newSize
    return true
  }

  public resize (newCapacity: number): void {
    newCapacity = alignInt(newCapacity, PAYLOAD_UNIT)
    const header = new Uint8Array(this.header.length + newCapacity)
    header.set(this.header, 0)
    this.header = header
    this.capacityAfterHeader = newCapacity
  }
}
