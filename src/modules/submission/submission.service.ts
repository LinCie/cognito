import { Service } from "@/structures/service.structure"
import type { submissionSchema } from "./submission.schema"
import type { z } from "zod"
import type { User } from "@generated/prisma"

class SubmissionService extends Service {
  getSubmission(id: number) {
    return this.prisma.submission.findUniqueOrThrow({
      where: { id },
    })
  }

  getSubmissions(assignmentId: number) {
    return this.prisma.submission.findMany({
      where: { assignmentId },
    })
  }

  async createSubmission(
    assignmentId: number,
    user: User,
    data: z.infer<typeof submissionSchema>
  ) {
    const profile = await this.prisma.profile.findUniqueOrThrow({
      where: { userId: user.id },
    })

    const student = await this.prisma.student.findUniqueOrThrow({
      where: { profileId: profile.id },
    })

    return this.prisma.submission.create({
      data: {
        ...data,
        student: { connect: { id: student.id } },
        assignment: { connect: { id: assignmentId } },
      },
      include: { student: true },
    })
  }

  updateSubmission(id: number, data: z.infer<typeof submissionSchema>) {
    return this.prisma.submission.update({
      where: { id },
      data,
    })
  }

  deleteSubmission(id: number) {
    return this.prisma.submission.delete({
      where: { id },
    })
  }
}

export { SubmissionService }
