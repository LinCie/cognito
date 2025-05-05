import type { Request, Response } from "express"
import { SESSION_EXPIRY_MS } from "@/configs/shared.config"
import { Controller } from "@/structures/controller.structure"
import { BadRequestError } from "@/structures/error.structure"
import { userSchema } from "./auth.schema"
import { AuthService } from "./auth.service"

class AuthController extends Controller {
  public readonly authService: AuthService

  constructor() {
    super()
    this.authService = new AuthService()

    this.bindRoutes([
      { method: "post", path: "/signup", handler: this.signup },
      { method: "post", path: "/signin", handler: this.signin },
      { method: "delete", path: "/signout", handler: this.signout },
    ])
  }

  async signup(req: Request, res: Response) {
    const validated = userSchema.safeParse(req.body)
    if (!validated.success) {
      throw new BadRequestError("Invalid email and/or password")
    }

    const token = await this.authService.signup(validated.data)
    this.authService.setSessionTokenCookie(res, token, SESSION_EXPIRY_MS)

    res.status(201).send()
  }

  async signin(req: Request, res: Response) {
    const validated = userSchema.safeParse(req.body)
    if (!validated.success) {
      throw new BadRequestError("Invalid email and/or password")
    }

    const token = await this.authService.signin(validated.data)
    if (token) {
      this.authService.setSessionTokenCookie(res, token, SESSION_EXPIRY_MS)
      res.status(200).send()
    }
  }

  async signout(req: Request, res: Response) {
    this.authService.deleteSessionTokenCookie(res)
    res.status(204).send()
  }
}

export { AuthController }
