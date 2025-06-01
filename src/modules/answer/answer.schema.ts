import { z } from "zod"

const answerSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number(),
      answer: z.number(),
    })
  ),
})

const partialAnswerSchema = answerSchema.partial()

export { answerSchema, partialAnswerSchema }
