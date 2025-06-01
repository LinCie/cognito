import { Chat, GoogleGenAI } from "@google/genai"
import { GOOGLE_API_KEY } from "@/configs/env.config"
import { Service } from "@/structures/service.structure"
import type { Assignment, User } from "@generated/prisma"
import type { z } from "zod"
import type { promptSchema } from "./ai.schema"

class AiService extends Service {
  public readonly client: GoogleGenAI
  public readonly session: Map<number, Chat>

  constructor() {
    super()
    this.session = new Map()
    this.client = new GoogleGenAI({
      apiKey: GOOGLE_API_KEY,
    })
  }

  public generatePersonality(
    name: string,
    assignments: Assignment[],
    prompt: string,
    asProfessor: boolean
  ) {
    const assignmentsList = assignments.map((a) => JSON.stringify(a)).join(", ")
    const date = new Date().getTime()

    if (asProfessor) {
      return `Anda adalah chatbot dengan kepribadian ramah, sabar, dan pintar. Sekarang waktu adalah ${date}. Tugas Anda adalah membantu 
            dosen bernama ${name} dalam mengecek tugas-tugas berikut: ${assignmentsList}. Dalam response anda, jangan gunakan bold, dan 
            format waktu deadline agar mudah dibaca. Format waktu sekarang agar mudah dibaca juga. Berikut adalah prompt pertama user ${prompt}`
    }

    return `Anda adalah chatbot dengan kepribadian ramah, sabar, dan pintar. Sekarang waktu adalah ${date}. Tugas Anda adalah membantu 
            murid bernama ${name} dalam menyelesaikan tugas-tugas berikut: ${assignmentsList}. Berikan penjelasan yang mudah dipahami, 
            dorong murid untuk berpikir kritis, dan hindari memberikan jawaban langsung jika tidak diminta. Tunjukkan empati dan 
            dukung murid untuk semangat belajar. Dalam response anda, jangan gunakan bold, dan format waktu deadline agar mudah dibaca. 
            Format waktu sekarang agar mudah dibaca juga. Berikut adalah prompt pertama user ${prompt}`
  }

  public createChat(user: User) {
    const chat = this.client.chats.create({
      model: "gemini-2.0-flash-001",
      config: { temperature: 0.5, maxOutputTokens: 1024 },
    })

    this.session.set(user.id, chat)
    return chat
  }

  public async getResponse(data: z.infer<typeof promptSchema>, user: User) {
    if (data.newChat) {
      this.session.delete(user.id)
    }

    let chat = this.session.get(user.id)

    if (chat === undefined) {
      const profile = await this.prisma.profile.findUniqueOrThrow({
        where: { userId: user.id },
      })

      let assignments: Assignment[] = []

      if (data.asProfessor) {
        const professor = await this.prisma.professor.findUniqueOrThrow({
          where: { profileId: profile.id },
          include: { kelas: { include: { assignment: true } } },
        })

        for (const kelas of professor.kelas) {
          assignments = assignments.concat(kelas.assignment)
        }
      } else {
        const student = await this.prisma.student.findUniqueOrThrow({
          where: { profileId: profile.id },
          include: { kelas: { include: { assignment: true } } },
        })

        for (const kelas of student.kelas) {
          assignments = assignments.concat(kelas.assignment)
        }
      }

      chat = this.createChat(user)
      const response = await chat.sendMessage({
        message: this.generatePersonality(
          profile.name,
          assignments,
          data.prompt,
          data.asProfessor ?? false
        ),
      })

      return response.text
    }

    const response = await chat.sendMessage({
      message: data.prompt,
    })

    return response.text
  }
}

export { AiService }
