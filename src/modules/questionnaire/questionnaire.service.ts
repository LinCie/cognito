import type { z } from "zod"
import { Service } from "@/structures/service.structure"
import type {
  partialQuestionnaireSchema,
  questionnaireSchema,
} from "./questionnaire.schema"

class QuestionnaireService extends Service {
  getQuestionnaire(id: number) {
    return this.prisma.questionnaire.findUnique({
      where: { id },
      include: { answers: true },
    })
  }

  getQuestionnaires() {
    return this.prisma.questionnaire.findMany()
  }

  createQuestionnaire(
    assignmentId: number,
    data: z.infer<typeof questionnaireSchema>
  ) {
    return this.prisma.questionnaire.create({
      data: { ...data, assignment: { connect: { id: assignmentId } } },
    })
  }

  updateQuestionnaire(
    id: number,
    data: z.infer<typeof partialQuestionnaireSchema>
  ) {
    return this.prisma.questionnaire.update({ where: { id }, data })
  }

  deleteQuestionnaire(id: number) {
    return this.prisma.questionnaire.delete({ where: { id } })
  }
}

export { QuestionnaireService }
