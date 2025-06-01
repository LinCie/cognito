import type { Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { AnswerService } from "./answer.service"
import { answerSchema, partialAnswerSchema } from "./answer.schema"

class AnswerController extends Controller {
  public readonly answerService = new AnswerService()

  constructor() {
    super()

    this.bindRoutes([
      {
        method: "get",
        path: "/",
        handler: this.index,
      },
      {
        method: "get",
        path: "/:id",
        handler: this.show,
      },
      {
        method: "post",
        path: "/",
        handler: this.create,
        schema: answerSchema,
      },
      {
        method: "patch",
        path: "/:id",
        handler: this.update,
        schema: partialAnswerSchema,
      },
      {
        method: "delete",
        path: "/:id",
        handler: this.delete,
      },
    ])
  }

  index(req: Request, res: Response) {
    const answers = this.answerService.getAnswers()
    res.status(200).json(answers)
  }

  show(req: Request, res: Response) {
    const { id } = req.params
    const answer = this.answerService.getAnswer(Number(id))
    res.status(200).json(answer)
  }

  async create(req: Request, res: Response) {
    const { questionnaireId } = req.params
    const data = req.validated
    const user = req.user!
    const answer = await this.answerService.createAnswer(
      Number(questionnaireId),
      data,
      user
    )
    res.status(201).json(answer)
  }

  update(req: Request, res: Response) {
    const { id } = req.params
    const data = req.validated
    const answer = this.answerService.updateAnswer(Number(id), data)
    res.status(200).json(answer)
  }

  delete(req: Request, res: Response) {
    const { id } = req.params
    const answer = this.answerService.deleteAnswer(Number(id))
    res.status(200).json(answer)
  }
}

export { AnswerController }
