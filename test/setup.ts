import { $ } from "bun"
import { afterAll, beforeAll } from "bun:test"
import type { Server } from "http"
import { IncomingMessage, ServerResponse } from "http"
import supertest, { Test } from "supertest"
import type TestAgent from "supertest/lib/agent"
import { PORT } from "@/configs/env.config"
import { app } from "@/server"
import { logger } from "@/utilities/logger.utility"

let server: Server<typeof IncomingMessage, typeof ServerResponse>
let request: TestAgent<Test>

beforeAll(async () => {
  await $`bunx prisma migrate reset --force`

  server = app.listen(PORT, () => {
    logger.info(`Test server is listening on port ${PORT} 🦊`)
  })

  request = supertest(server)
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
})

export { request }