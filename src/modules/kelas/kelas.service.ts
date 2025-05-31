import { Service } from "@/structures/service.structure"
import { kelasSchema, partialKelasSchema } from "./kelas.schema"
import type { z } from "zod"
import type { User } from "@generated/prisma"
import { UnauthorizedError } from "@/structures/error.structure"

class KelasService extends Service {
  async create(data: z.infer<typeof kelasSchema>, user: User) {
    const profile = await this.prisma.profile.findUniqueOrThrow({
      where: { userId: user.id },
    })

    const professor = await this.prisma.professor.findUniqueOrThrow({
      where: { profileId: profile.id },
    })

    return this.prisma.kelas.create({
      data: { ...data, professor: { connect: professor } },
    })
  }

  async getAll(as: string, user: User) {
    const profile = await this.prisma.profile.findUniqueOrThrow({
      where: { userId: user.id },
    })

    switch (as) {
      case "student": {
        const student = await this.prisma.student.findUniqueOrThrow({
          where: { profileId: profile.id },
        })
        return this.prisma.kelas.findMany({
          where: { student: { some: { id: student.id } } },
        })
      }

      case "professor": {
        const professor = await this.prisma.professor.findUniqueOrThrow({
          where: { profileId: profile.id },
        })
        return this.prisma.kelas.findMany({
          where: { professorId: professor.id },
        })
      }

      default:
        return this.prisma.kelas.findMany()
    }
  }

  getOne(id: number) {
    return this.prisma.kelas.findUniqueOrThrow({
      where: { id },
      include: {
        assignment: true,
        post: true,
        student: { include: { profile: true } },
        professor: { include: { profile: true } },
      },
    })
  }

  update(id: number, data: z.infer<typeof partialKelasSchema>) {
    return this.prisma.kelas.update({ where: { id }, data })
  }

  delete(id: number) {
    return this.prisma.kelas.delete({ where: { id } })
  }

  join(id: number, studentId: number) {
    return this.prisma.kelas.update({
      where: { id },
      data: { student: { connect: { id: studentId } } },
    })
  }

  async isProfessor(id: number, user: User) {
    const kelas = await this.prisma.kelas.findUniqueOrThrow({
      where: { id },
      include: {
        professor: { include: { profile: { include: { user: true } } } },
      },
    })
    if (kelas.professor.profile.user.id !== user.id) {
      throw new UnauthorizedError("You're not the professor of this kelas")
    }
  }
}

export { KelasService }
