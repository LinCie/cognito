import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { faker } from "@faker-js/faker"
import * as argon2 from "argon2"
import { request } from "test/setup"
import { prisma } from "@/database"

const fakeUser = {
  username: "123456789",
  password: "Fakepassword1234??",
}

describe("Auth Route", () => {
  describe("Signup Route", () => {
    beforeEach(async () => {
      await prisma.user.deleteMany()
    })

    test("should return 201 on successful signup", async () => {
      const res = await request
        .post("/auth/signup")
        .set("Content-Type", "application/json")
        .send(fakeUser)

      expect(res.status).toBe(201)
    })

    test("should set header on successful signup", async () => {
      const res = await request
        .post("/auth/signup")
        .set("Content-Type", "application/json")
        .send(fakeUser)

      expect(res.headers["set-cookie"]).toBeDefined()
    })

    test("should return 409 if username is already taken", async () => {
      const hash = await argon2.hash(fakeUser.password)
      await prisma.user.create({ data: { username: fakeUser.username, hash } })

      const res = await request
        .post("/auth/signup")
        .set("Content-Type", "application/json")
        .send(fakeUser)

      expect(res.status).toBe(409)
    })

    test("should return 400 during bad request", async () => {
      const badUsers = [
        // Empty username and password
        { username: "", password: "" },

        // Missing username, valid-looking password
        {
          username: "",
          password: faker.internet.password(),
        },

        // Valid username, empty password
        { username: faker.internet.username(), password: "" },

        // Valid username, whitespace password
        { username: faker.internet.username(), password: "           " },

        // Valid username, password too short
        {
          username: faker.internet.username(),
          password: faker.string.alpha({ length: 2 }),
        },

        // Valid username, only numbers
        {
          username: faker.internet.username(),
          password: faker.string.numeric(4),
        },

        // Valid username, missing number/symbol
        {
          username: faker.internet.username(),
          password: faker.string.alpha({ length: 8, casing: "mixed" }),
        },
      ]

      for (const user of badUsers) {
        const res = await request
          .post("/auth/signup")
          .set("Content-Type", "application/json")
          .send(user)

        expect(res.status).toBe(400)
      }
    })
  })

  describe("Signin Route", () => {
    beforeEach(async () => {
      const hash = await argon2.hash(fakeUser.password)
      await prisma.user.create({ data: { username: fakeUser.username, hash } })
    })

    afterEach(async () => {
      await prisma.user.deleteMany()
    })

    test("should return 200 on successful signin", async () => {
      const res = await request
        .post("/auth/signin")
        .set("Content-Type", "application/json")
        .send(fakeUser)

      expect(res.status).toBe(200)
    })

    test("should set header on successful signin", async () => {
      const res = await request
        .post("/auth/signin")
        .set("Content-Type", "application/json")
        .send(fakeUser)

      expect(res.headers["set-cookie"]).toBeDefined()
    })

    test("should return 400 if password mismatch", async () => {
      const res = await request
        .post("/auth/signin")
        .set("Content-Type", "application/json")
        .send({
          username: fakeUser.username,
          password: faker.string.alpha({ length: 4 }),
        })

      expect(res.status).toBe(400)
    })

    test("should return 404 if user does not exist", async () => {
      const res = await request
        .post("/auth/signin")
        .set("Content-Type", "application/json")
        .send({
          username: faker.internet.username(),
          password: faker.internet.password(),
        })

      expect(res.status).toBe(404)
    })
  })
})
