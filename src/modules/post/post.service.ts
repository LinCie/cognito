import type { z } from "zod"
import { Service } from "@/structures/service.structure"
import type { partialPostSchema, postSchema } from "./post.schema"
import type { User } from "@generated/prisma"
import { UnauthorizedError } from "@/structures/error.structure"

class PostService extends Service {
  async getPost(id: number) {
    return await this.prisma.post.findUniqueOrThrow({ where: { id } })
  }

  async getPosts(classId: number) {
    return await this.prisma.post.findMany({ where: { kelasId: classId } })
  }

  async createPost(classId: number, data: z.infer<typeof postSchema>) {
    const post = {
      ...data,
      date: new Date(),
    }

    return await this.prisma.post.create({
      data: { ...post, kelas: { connect: { id: classId } } },
    })
  }

  async updatePost(id: number, data: z.infer<typeof partialPostSchema>) {
    return await this.prisma.post.update({ where: { id }, data })
  }

  async deletePost(id: number) {
    return await this.prisma.post.delete({ where: { id } })
  }

  async hasAccess(id: number, user: User) {
    const kelas = await this.prisma.kelas.findUniqueOrThrow({
      where: { id },
      include: { professor: { include: { profile: true } } },
    })

    if (kelas.professor.profile.userId !== user.id) {
      throw new UnauthorizedError("You're not the professor of this kelas")
    }
  }
}

export { PostService }
