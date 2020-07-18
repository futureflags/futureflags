import { cleanup } from '../db'
import { Collections } from '../schema'

afterEach(async () => {
  await cleanup(Collections.features)
})
