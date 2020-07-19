import { cleanup } from '../db'
import { Collections } from '../schema'

afterEach(async () => {
  await Promise.all([cleanup(Collections.features), cleanup(Collections.flags)])
})
