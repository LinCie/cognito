import type { z } from "zod"
import type { User } from "@generated/prisma"
import { Service } from "@/structures/service.structure"
import type { partialProfileSchema, profileSchema } from "./profile.schema"
import { UnauthorizedError } from "@/structures/error.structure"

class ProfileService extends Service {
  getSelf(userId: number) {
    return this.prisma.profile.findUniqueOrThrow({
      where: { userId },
      include: { student: true, professor: true },
    })
  }

  getProfile(id: number) {
    return this.prisma.profile.findUniqueOrThrow({
      where: { id },
    })
  }

  createProfile(data: z.infer<typeof profileSchema>, user: User) {
    return this.prisma.profile.create({
      data: { ...data, user: { connect: { id: user.id } } },
    })
  }

  updateProfile(data: z.infer<typeof partialProfileSchema>, id: number) {
    return this.prisma.profile.update({ where: { id }, data })
  }

  deleteProfile(id: number) {
    return this.prisma.profile.delete({ where: { id } })
  }

  async hasAccess(id: number, user: User) {
    const profile = await this.prisma.profile.findUniqueOrThrow({
      where: { id },
    })

    if (profile.userId !== user.id) {
      throw new UnauthorizedError("You're not the owner of this profile")
    }
  }
}

export { ProfileService }
