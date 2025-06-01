import { z } from "zod"

const questionnaireSchema = z.object({
  questions: z.array(
    z.object({
      id: z.number(),
      question: z
        .string()
        .min(2, "Question must be at least 2 characters long")
        .max(100, "Question must not exceed 100 characters long"),
      options: z.array(z.string()),
      correct: z.number(),
    })
  ),
})

const partialQuestionnaireSchema = questionnaireSchema.partial()

export { questionnaireSchema, partialQuestionnaireSchema }
