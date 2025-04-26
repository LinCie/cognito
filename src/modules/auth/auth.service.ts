import type { Response } from "express"
import type { z } from "zod"
import * as argon2 from "argon2"

import crypto from "node:crypto"
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"

import type { User, Session } from "@generated/prisma"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

import { Service } from "@/structures/service.structure"
import { NODE_ENV } from "@/configs/env.config"
import { UniqueConstraintError } from "@/structures/error.structure"
import type { userSchema } from "./auth.schema"

type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null }

class AuthService extends Service {
  constructor() {
    super()
  }

  generateSessionToken(): string {
    const bytes = new Uint8Array(20)
    crypto.getRandomValues(bytes)
    const token = encodeBase32LowerCaseNoPadding(bytes)
    return token
  }

  async createSession(token: string, userId: number): Promise<Session> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    )
    const session: Session = {
      id: sessionId,
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    }
    await this.prisma.session.create({
      data: session,
    })
    return session
  }

  async validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(
      sha256(new TextEncoder().encode(token))
    )
    const result = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    })
    if (result === null) {
      return { session: null, user: null }
    }
    const { user, ...session } = result
    if (Date.now() >= session.expiresAt.getTime()) {
      await this.prisma.session.delete({ where: { id: sessionId } })
      return { session: null, user: null }
    }
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
      session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      await this.prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          expiresAt: session.expiresAt,
        },
      })
    }
    return { session, user }
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.prisma.session.delete({ where: { id: sessionId } })
  }

  async invalidateAllSessions(userId: number): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId: userId,
      },
    })
  }

  setSessionTokenCookie(
    response: Response,
    token: string,
    expiresAt: Date
  ): void {
    response.cookie("session", token, {
      httpOnly: true,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
      secure: NODE_ENV === "production",
    })
  }

  deleteSessionTokenCookie(response: Response): void {
    response.cookie("session", "", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
      secure: NODE_ENV === "production",
    })
  }

  async signup(body: z.infer<typeof userSchema>) {
    try {
      const hash = await argon2.hash(body.password)
      const user = await this.prisma.user.create({
        data: { hash, email: body.email },
      })

      const token = this.generateSessionToken()
      await this.createSession(token, user.id)
      return token
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new UniqueConstraintError(
            "There is a unique constraint violation, a new user cannot be created with this email"
          )
        }
      }
      throw error
    }
  }

  async signin(body: z.infer<typeof userSchema>) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email: body.email },
    })

    if (await argon2.verify(user.hash, body.password)) {
      const token = this.generateSessionToken()
      await this.createSession(token, user.id)
      return token
    }

    return
  }
}

export type { SessionValidationResult }
export { AuthService }
