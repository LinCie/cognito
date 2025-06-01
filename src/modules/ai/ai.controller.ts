import type { Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { AiService } from "./ai.service"
import { promptSchema } from "./ai.schema"

class AiController extends Controller {
  public readonly aiService: AiService

  constructor() {
    super()
    this.aiService = new AiService()

    this.bindRoutes([
      { method: "post", path: "/", handler: this.index, schema: promptSchema },
    ])
  }

  async index(req: Request, res: Response) {
    const response = await this.aiService.getResponse(req.validated, req.user!)
    res.status(200).send({ response })
  }
}

export { AiController }
