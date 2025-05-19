import { Service } from "@/structures/service.structure"
import { kelasSchema, partialKelasSchema } from "./kelas.schema"
import type { z } from "zod"
import type { User } from "@generated/prisma"
import { UnauthorizedError } from "@/structures/error.structure"

class KelasService extends Service {
  async create(data: z.infer<typeof kelasSchema>, user: User) {
    return await this.prisma.kelas.create({
      data: { ...data, Professor: { connect: { id: user.id } } },
    })
  }

  async getAll() {
    return await this.prisma.kelas.findMany()
  }

  async getOne(id: number) {
    return await this.prisma.kelas.findUniqueOrThrow({ where: { id } })
  }

  async update(id: number, data: z.infer<typeof partialKelasSchema>) {
    return await this.prisma.kelas.update({ where: { id }, data })
  }

  async delete(id: number) {
    return await this.prisma.kelas.delete({ where: { id } })
  }

  async isProfessor(id: number, user: User) {
    const kelas = await this.getOne(id)
    if (kelas.professorId !== user.id) {
      throw new UnauthorizedError("You're not the professor of this kelas")
    }
  }
}

export { KelasService }
