import type { z } from "zod"
import { Service } from "@/structures/service.structure"
import type { partialPresenceSchema, presenceSchema } from "./presence.schema"
import type { User } from "@generated/prisma"
import {
  UnauthorizedError,
  BadRequestError,
} from "@/structures/error.structure"

class PresenceService extends Service {
  /**
   * Retrieves a single presence session by its ID, including the list of students who attended.
   * @param id The ID of the presence session.
   */
  async getPresence(id: number) {
    return await this.prisma.presence.findUniqueOrThrow({
      where: { id },
      include: { student: { include: { profile: true } } }, // Include student profiles for more details
    })
  }

  /**
   * Retrieves all presence sessions for a given class.
   * @param classId The ID of the class.
   */
  async getPresences(classId: number) {
    return await this.prisma.presence.findMany({
      where: { kelasId: classId },
      orderBy: { deadline: "desc" }, // Show the most recent first
    })
  }

  /**
   * Creates a new presence session for a class.
   * @param classId The ID of the class.
   * @param data The presence data, containing the deadline.
   */
  async createPresence(classId: number, data: z.infer<typeof presenceSchema>) {
    return await this.prisma.presence.create({
      data: {
        deadline: data.deadline,
        kelas: { connect: { id: classId } },
      },
    })
  }

  /**
   * Updates an existing presence session.
   * @param id The ID of the presence session.
   * @param data The data to update.
   */
  async updatePresence(
    id: number,
    data: z.infer<typeof partialPresenceSchema>
  ) {
    return await this.prisma.presence.update({ where: { id }, data })
  }

  /**
   * Deletes a presence session.
   * @param id The ID of the presence session.
   */
  async deletePresence(id: number) {
    return await this.prisma.presence.delete({ where: { id } })
  }

  /**
   * Allows a student to mark themselves as present for a specific session.
   * @param presenceId The ID of the presence session.
   * @param user The authenticated user (student).
   */
  async attendPresence(presenceId: number, user: User) {
    const student = await this.prisma.student.findFirst({
      where: { profile: { userId: user.id } },
    })

    if (!student) {
      throw new UnauthorizedError("User is not a student.")
    }

    const presence = await this.getPresence(presenceId)

    // Check if the deadline has passed
    if (new Date() > new Date(presence.deadline)) {
      throw new BadRequestError("Presence deadline has passed.")
    }

    // Check if student is already present
    if (presence.student.some((s) => s.id === student.id)) {
      throw new BadRequestError("You have already marked yourself as present.")
    }

    // Connect the student to the presence session
    return await this.prisma.presence.update({
      where: { id: presenceId },
      data: {
        student: {
          connect: { id: student.id },
        },
      },
    })
  }

  /**
   * Checks if a user is the professor of a specific class. Throws an error if not.
   * Used for authorization in professor-only routes.
   * @param classId The ID of the class.
   * @param user The authenticated user.
   */
  async isProfessorOfClass(classId: number, user: User) {
    const kelas = await this.prisma.kelas.findUniqueOrThrow({
      where: { id: classId },
      include: { professor: { include: { profile: true } } },
    })

    if (kelas.professor.profile.userId !== user.id) {
      throw new UnauthorizedError("You are not the professor of this class.")
    }
  }

  /**
   * Checks if a user is a student in a specific class. Throws an error if not.
   * Used for authorization in student-only routes.
   * @param classId The ID of the class.
   * @param user The authenticated user.
   */
  async isStudentInClass(classId: number, user: User) {
    const student = await this.prisma.student.findFirst({
      where: { profile: { userId: user.id } },
    })

    if (!student) {
      throw new UnauthorizedError("User is not a registered student.")
    }

    const studentInClass = await this.prisma.kelas.findFirst({
      where: {
        id: classId,
        student: { some: { id: student.id } },
      },
    })

    if (!studentInClass) {
      throw new UnauthorizedError("You are not a student in this class.")
    }
  }
}

export { PresenceService }
