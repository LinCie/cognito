import { beforeAll, beforeEach, describe, expect, test } from "bun:test"
import { faker } from "@faker-js/faker"
import * as argon2 from "argon2"
import { prisma } from "@/database"
import { generateSession, type SessionData } from "test/helpers"
import { request } from "test/setup"

let cookie: string[]
let sessionUser: { email: string; password: string }

// Sample payloads
const validStudent = {
  name: faker.person.firstName(),
  studentNumber: faker.string.alphanumeric(8),
  major: faker.word.sample(),
  class: faker.word.sample(),
}
const partialUpdate = { major: "UpdatedMajor" }

beforeAll(async () => {
  // Reset DB and start server
  await prisma.session.deleteMany()
  await prisma.student.deleteMany()
  await prisma.user.deleteMany()

  // Generate a session manually
  const sessionData: SessionData = await generateSession()
  cookie = sessionData.cookie
  sessionUser = sessionData.user
})

describe("/students routes", () => {
  beforeEach(async () => {
    // Clear students between tests
    await prisma.student.deleteMany()
  })

  describe("GET /students", () => {
    test("should return empty array when no students", async () => {
      const res = await request.get("/students").set("Cookie", cookie)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body).toHaveLength(0)
    })

    test("should paginate students correctly", async () => {
      // create 15 students directly
      for (let i = 0; i < 15; i++) {
        await prisma.student.create({
          data: {
            ...validStudent,
            user: { connect: { email: sessionUser.email } },
          },
        })
      }

      // default page=1 show=10
      const res1 = await request.get("/students").set("Cookie", cookie)
      expect(res1.status).toBe(200)
      expect(res1.body).toHaveLength(10)

      // page=2 show=5
      const res2 = await request
        .get("/students?page=2&show=5")
        .set("Cookie", cookie)
      expect(res2.status).toBe(200)
      expect(res2.body).toHaveLength(5)
    })
  })

  describe("GET /students/:id", () => {
    test("should return 404 for non-existent student", async () => {
      const res = await request.get("/students/9999").set("Cookie", cookie)
      expect(res.status).toBe(404)
    })

    test("should return student by id", async () => {
      const created = await prisma.student.create({
        data: {
          ...validStudent,
          user: { connect: { email: sessionUser.email } },
        },
      })

      const res = await request
        .get(`/students/${created.id}`)
        .set("Cookie", cookie)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        id: created.id,
        name: validStudent.name,
        studentNumber: validStudent.studentNumber,
        major: validStudent.major,
        class: validStudent.class,
      })
    })
  })

  describe("POST /students", () => {
    test("should return 201 and create student with valid data", async () => {
      const res = await request
        .post("/students")
        .set("Cookie", cookie)
        .send(validStudent)

      expect(res.status).toBe(201)
      expect(res.body).toMatchObject(validStudent)
      expect(res.body).toHaveProperty("id")
    })

    test("should return 400 for invalid payload", async () => {
      const res = await request.post("/students").set("Cookie", cookie).send({})

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty("errors")
    })

    test("should return 401 when not authenticated", async () => {
      const res = await request.post("/students").send(validStudent)

      expect(res.status).toBe(401)
    })
  })

  describe("PATCH /students/:id", () => {
    let studentId: number

    beforeEach(async () => {
      const created = await prisma.student.create({
        data: {
          ...validStudent,
          user: { connect: { email: sessionUser.email } },
        },
      })
      studentId = created.id
    })

    test("should return 200 and update student", async () => {
      const res = await request
        .patch(`/students/${studentId}`)
        .set("Cookie", cookie)
        .send(partialUpdate)

      expect(res.status).toBe(200)
      expect(res.body).toMatchObject(partialUpdate)
    })

    test("should return 404 for non-existent id", async () => {
      const res = await request
        .patch("/students/9999")
        .set("Cookie", cookie)
        .send(partialUpdate)

      expect(res.status).toBe(404)
    })

    test("should return 403 when user has no access", async () => {
      const other = await prisma.user.create({
        data: {
          email: "other@example.com",
          hash: await argon2.hash(sessionUser.password),
        },
      })
      const otherStudent = await prisma.student.create({
        data: { ...validStudent, user: { connect: { id: other.id } } },
      })

      const res = await request
        .patch(`/students/${otherStudent.id}`)
        .set("Cookie", cookie)
        .send(partialUpdate)

      expect(res.status).toBe(403)
    })
  })

  describe("DELETE /students/:id", () => {
    let studentId: number

    beforeEach(async () => {
      const created = await prisma.student.create({
        data: {
          ...validStudent,
          user: { connect: { email: sessionUser.email } },
        },
      })
      studentId = created.id
    })

    test("should return 204 and delete student", async () => {
      const res = await request
        .delete(`/students/${studentId}`)
        .set("Cookie", cookie)

      expect(res.status).toBe(204)
      const found = await prisma.student.findUnique({
        where: { id: studentId },
      })
      expect(found).toBeNull()
    })

    test("should return 404 for non-existent id", async () => {
      const res = await request.delete("/students/9999").set("Cookie", cookie)

      expect(res.status).toBe(404)
    })

    test("should return 403 when user has no access", async () => {
      const other = await prisma.user.create({
        data: {
          email: "other2@example.com",
          hash: await argon2.hash(sessionUser.password),
        },
      })
      const otherStudent = await prisma.student.create({
        data: { ...validStudent, user: { connect: { id: other.id } } },
      })

      const res = await request
        .delete(`/students/${otherStudent.id}`)
        .set("Cookie", cookie)

      expect(res.status).toBe(403)
    })
  })
})
