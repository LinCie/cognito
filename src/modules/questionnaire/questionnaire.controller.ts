import type { Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { QuestionnaireService } from "./questionnaire.service"
import {
  partialQuestionnaireSchema,
  questionnaireSchema,
} from "./questionnaire.schema"

class QuestionnaireController extends Controller {
  public readonly questionnaireService = new QuestionnaireService()

  constructor() {
    super()

    this.bindRoutes([
      { method: "get", path: "/", handler: this.index },
      { method: "get", path: "/:id", handler: this.show },
      {
        method: "post",
        path: "/",
        handler: this.create,
        schema: questionnaireSchema,
      },
      {
        method: "patch",
        path: "/:id",
        handler: this.update,
        schema: partialQuestionnaireSchema,
      },
      { method: "delete", path: "/:id", handler: this.delete },
    ])
  }

  async index(req: Request, res: Response) {
    const questionnaires = await this.questionnaireService.getQuestionnaires()
    res.status(200).json(questionnaires)
  }

  async show(req: Request, res: Response) {
    const { id } = req.params
    const questionnaire = await this.questionnaireService.getQuestionnaire(
      Number(id)
    )
    res.status(200).json(questionnaire)
  }

  async create(req: Request, res: Response) {
    const { assignmentId } = req.params
    const data = req.validated
    const questionnaire = await this.questionnaireService.createQuestionnaire(
      Number(assignmentId),
      data
    )
    res.status(201).json(questionnaire)
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const data = req.validated
    const questionnaire = await this.questionnaireService.updateQuestionnaire(
      Number(id),
      data
    )
    res.status(200).json(questionnaire)
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params
    const questionnaire = await this.questionnaireService.deleteQuestionnaire(
      Number(id)
    )
    res.status(200).json(questionnaire)
  }
}

export { QuestionnaireController }
