import { Service } from "@/structures/service.structure"
import type {
  assignmentSchema,
  partialAssignmentSchema,
} from "./assignment.schema"
import type { z } from "zod"
import type { User } from "@generated/prisma"
import { UnauthorizedError } from "@/structures/error.structure"

class AssignmentService extends Service {
  public async getAssignment(id: number) {
    return await this.prisma.assignment.findUniqueOrThrow({
      where: { id },
      include: { submission: { include: { student: true } } },
    })
  }

  public async getAssignments(classId: number) {
    return await this.prisma.assignment.findMany({
      where: { kelasId: classId },
    })
  }

  public async createAssignment(
    classId: number,
    data: z.infer<typeof assignmentSchema>
  ) {
    const assignment = { ...data, date: new Date() }

    return await this.prisma.assignment.create({
      data: { ...assignment, kelas: { connect: { id: classId } } },
    })
  }

  public async updateAssignment(
    id: number,
    data: z.infer<typeof partialAssignmentSchema>
  ) {
    return await this.prisma.assignment.update({ where: { id }, data })
  }

  public async deleteAssignment(id: number) {
    return await this.prisma.assignment.delete({ where: { id } })
  }

  public async hasAccess(id: number, user: User) {
    const kelas = await this.prisma.kelas.findUniqueOrThrow({
      where: { id },
      include: { professor: { include: { profile: true } } },
    })

    if (kelas.professor.profile.userId !== user.id) {
      throw new UnauthorizedError("You're not the professor of this class")
    }
  }
}

export { AssignmentService }
