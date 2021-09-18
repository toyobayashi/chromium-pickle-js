/**
 * Chromium Pickle
 * @packageDocumentation
 */

import { Pickle } from './pickle'
import type { IPickle } from './pickle'

/** @public */
export function createEmpty (): IPickle {
  return new Pickle()
}

/** @public */
export function createFromBuffer (buffer: Uint8Array): IPickle {
  return new Pickle(buffer)
}

export type { IPickle }
export type { IPickleIterator } from './iterator'
