import type { NextFunction, Request, Response } from "express"
import { Controller } from "@/structures/controller.structure"
import { ProfileService } from "./profile.service"
import { partialProfileSchema, profileSchema } from "./profile.schema"

class ProfileController extends Controller {
  public readonly profileService: ProfileService

  constructor() {
    super()
    this.profileService = new ProfileService()

    this.bindRoutes([
      { method: "get", path: "/me", handler: this.me },
      { method: "get", path: "/:id", handler: this.show },
      {
        method: "post",
        path: "/",
        handler: this.create,
        schema: profileSchema,
      },
      {
        method: "patch",
        path: "/:id",
        handler: this.update,
        schema: partialProfileSchema,
        middlewares: [this.hasAccessMiddleware],
      },
      {
        method: "delete",
        path: "/:id",
        handler: this.destroy,
        middlewares: [this.hasAccessMiddleware],
      },
    ])
  }
  async me(req: Request, res: Response) {
    const user = req.user!
    const profile = await this.profileService.getSelf(user.id)
    const response = {
      profile: { ...profile },
      user: { ...user, hash: "" },
    }

    res.status(200).send(response)
  }

  async show(req: Request, res: Response) {
    const { id } = req.params
    const profile = await this.profileService.getProfile(Number(id))

    res.status(200).send(profile)
  }

  async create(req: Request, res: Response) {
    const user = req.user!
    const profile = await this.profileService.createProfile(req.validated, user)

    res.status(201).send(profile)
  }

  async update(req: Request, res: Response) {
    const { id } = req.params
    const profile = await this.profileService.updateProfile(
      req.validated,
      Number(id)
    )

    res.status(200).send(profile)
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params
    await this.profileService.deleteProfile(Number(id))

    res.status(204).send()
  }

  async hasAccessMiddleware(req: Request, res: Response, next: NextFunction) {
    const user = req.user!
    const { id } = req.params

    await this.profileService.hasAccess(Number(id), user)

    next()
  }
}

export { ProfileController }
