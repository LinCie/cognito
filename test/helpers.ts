import { faker } from "@faker-js/faker"
import * as argon2 from "argon2"
import { prisma } from "@/database"
import { AuthService } from "@/modules/auth"

type SessionData = {
  cookie: string[]
  user: { username: string; password: string }
}

/**
 * Creates a new user with random credentials, generates a session token,
 * persists the session, and returns the cookie header and credentials.
 */
async function generateSession(): Promise<SessionData> {
  // 1. Generate random credentials
  const username = faker.internet.username()
  const password = faker.internet.password({ length: 12 })

  // 2. Create user in DB
  const hash = await argon2.hash(password)
  const user = await prisma.user.create({ data: { username, hash } })

  // 3. Create a session via AuthService
  const authService = new AuthService()
  const token = authService.generateSessionToken()
  const session = await authService.createSession(token, user.id)

  // 4. Build cookie header
  const cookie = [
    `session=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${session.expiresAt.toUTCString()}`,
  ]

  return { cookie, user: { username, password } }
}

export { generateSession }
export type { SessionData }
