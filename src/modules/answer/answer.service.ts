import { Service } from "@/structures/service.structure"
import type { answerSchema, partialAnswerSchema } from "./answer.schema"
import type { z } from "zod"
import type { User } from "@generated/prisma"

class AnswerService extends Service {
  getAnswer(id: number) {
    return this.prisma.answer.findUniqueOrThrow({ where: { id } })
  }

  getAnswers() {
    return this.prisma.answer.findMany()
  }

  async createAnswer(
    questionnaireId: number,
    data: z.infer<typeof answerSchema>,
    user: User
  ) {
    const student = await this.prisma.student.findFirstOrThrow({
      where: {
        profile: {
          user: {
            id: user.id,
          },
        },
      },
    })

    return this.prisma.answer.create({
      data: {
        ...data,
        student: { connect: student },
        questionnaire: { connect: { id: questionnaireId } },
      },
    })
  }

  updateAnswer(id: number, data: z.infer<typeof partialAnswerSchema>) {
    return this.prisma.answer.update({ where: { id }, data })
  }

  deleteAnswer(id: number) {
    return this.prisma.answer.delete({ where: { id } })
  }
}

export { AnswerService }
