import { Service } from "@/structures/service.structure"
import type {
  assignmentSchema,
  partialAssignmentSchema,
} from "./assignment.schema"
import type { z } from "zod"
import type { User } from "@generated/prisma"
import { UnauthorizedError } from "@/structures/error.structure"

class AssignmentService extends Service {
  public async findOne(id: number) {
    return await this.prisma.assignment.findUniqueOrThrow({ where: { id } })
  }

  public async findMany() {
    return await this.prisma.assignment.findMany()
  }

  public async create(data: z.infer<typeof assignmentSchema>) {
    const assignment = { ...data, kelasId: undefined }

    return await this.prisma.assignment.create({
      data: { ...assignment, kelas: { connect: { id: data.kelasId } } },
    })
  }

  public async update(
    id: number,
    data: z.infer<typeof partialAssignmentSchema>
  ) {
    return await this.prisma.assignment.update({ where: { id }, data })
  }

  public async delete(id: number) {
    return await this.prisma.assignment.delete({ where: { id } })
  }

  public async isProfessor(id: number, user: User) {
    const kelas = await this.prisma.kelas.findUniqueOrThrow({
      where: { id },
      include: { Professor: true },
    })
    if (kelas.Professor.userId !== user.id) {
      throw new UnauthorizedError("You're not the professor of this class")
    }
  }
}

export { AssignmentService }
