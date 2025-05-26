import type { z } from "zod"
import type { User } from "@generated/prisma"
import { prisma } from "@/database"
import { Service } from "@/structures/service.structure"
import { UnauthorizedError } from "@/structures/error.structure"
import { professorSchema, partialProfessorSchema } from "./professor.schema"

export class ProfessorService extends Service {
  constructor() {
    super()
  }

  async getProfessor(id: number) {
    return await prisma.professor.findUniqueOrThrow({ where: { id } })
  }

  async getProfessors() {
    return await prisma.professor.findMany()
  }

  async createProfessor(data: z.infer<typeof professorSchema>, user: User) {
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { userId: user.id },
    })

    return await prisma.professor.create({
      data: { ...data, profile: { connect: profile } },
    })
  }

  async updateProfessor(
    id: number,
    data: z.infer<typeof partialProfessorSchema>
  ) {
    return await prisma.professor.update({ where: { id }, data })
  }

  async deleteProfessor(id: number) {
    return await prisma.professor.delete({ where: { id } })
  }

  async isProfessor(id: number, user: User) {
    const professor = await this.prisma.professor.findUniqueOrThrow({
      where: { id },
      include: { profile: { include: { user: true } } },
    })

    if (professor.profile.user.id !== user.id) {
      throw new UnauthorizedError("You're not the professor")
    }
  }
}
