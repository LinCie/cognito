import type { Request, Response } from "express"
import path from "path"
import multer from "multer"
import { Controller } from "@/structures/controller.structure"
import { BadRequestError } from "@/structures/error.structure"
import { UploadService } from "./upload.service"

class UploadController extends Controller {
  public readonly uploadService = new UploadService()
  private upload = multer({ dest: path.resolve("uploads") })

  constructor() {
    super()

    this.bindRoutes([
      {
        method: "post",
        path: "/",
        handler: this.index,
        middlewares: [this.upload.single("file")],
      },
    ])
  }

  async index(req: Request, res: Response) {
    const file = req.file
    if (!file) throw new BadRequestError("File is required")

    const bunFile = Bun.file(file.path) as File

    const result = await this.uploadService.uploadFile(bunFile)
    res.status(200).send(result)
  }
}

export { UploadController }
