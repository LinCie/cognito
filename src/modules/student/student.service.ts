import type { User } from "@generated/prisma"
import { Service } from "@/structures/service.structure"
import type { z } from "zod"
import type { partialStudentSchema, studentSchema } from "./student.schema"
import { UnauthorizedError } from "@/structures/error.structure"

class StudentService extends Service {
  getStudent(id: number) {
    return this.prisma.student.findUniqueOrThrow({ where: { id } })
  }

  getStudents(page: number, show: number) {
    return this.prisma.student.findMany({ skip: (page - 1) * show, take: show })
  }

  async createStudent(data: z.infer<typeof studentSchema>, user: User) {
    const profile = await this.prisma.profile.findUniqueOrThrow({
      where: { userId: user.id },
    })

    return this.prisma.student.create({
      data: { profile: { connect: profile }, ...data },
    })
  }

  updateStudent(data: z.infer<typeof partialStudentSchema>, id: number) {
    return this.prisma.student.update({ where: { id }, data })
  }

  deleteStudent(id: number) {
    return this.prisma.student.delete({ where: { id } })
  }

  async hasAccess(id: number, user: User) {
    const student = await this.prisma.student.findUniqueOrThrow({
      where: { id },
      include: { profile: { include: { user: true } } },
    })

    if (student.profile.user.id !== user.id) {
      throw new UnauthorizedError("You're not the owner of this student")
    }
  }
}

export { StudentService }
