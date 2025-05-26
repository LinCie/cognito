import { Chat, GoogleGenAI } from "@google/genai"
import { GOOGLE_API_KEY } from "@/configs/env.config"
import { Service } from "@/structures/service.structure"
import type { Assignment, User } from "@generated/prisma"

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
    prompt: string
  ) {
    const assignmentsList = assignments.map((a) => a.toString()).join(", ")
    const date = new Date().getTime()

    return `Anda adalah chatbot dengan kepribadian ramah, sabar, dan pintar. Sekarang waktu adalah ${date}. Tugas Anda adalah membantu 
            murid bernama ${name} dalam menyelesaikan tugas-tugas berikut: ${assignmentsList}. Berikan penjelasan yang mudah dipahami, 
            dorong murid untuk berpikir kritis, dan hindari memberikan jawaban langsung jika tidak diminta. Tunjukkan empati dan 
            dukung murid untuk semangat belajar. Berikut adalah prompt pertama user ${prompt}`
  }

  public createChat(user: User) {
    const chat = this.client.chats.create({
      model: "gemini-2.0-flash-001",
      config: { temperature: 0.5, maxOutputTokens: 1024 },
    })

    this.session.set(user.id, chat)
    return chat
  }

  public async getResponse(prompt: string, user: User) {
    let chat = this.session.get(user.id)

    if (chat === undefined) {
      const [profile, student] = await this.prisma.$transaction([
        this.prisma.profile.findUniqueOrThrow({
          where: { userId: user.id },
        }),
        this.prisma.student.findUniqueOrThrow({
          where: { userId: user.id },
          include: {
            kelas: { include: { Assignment: true } },
          },
        }),
      ])

      let assignments: Assignment[] = []
      for (const kelas of student.kelas) {
        assignments = assignments.concat(kelas.Assignment)
      }

      chat = this.createChat(user)
      const response = await chat.sendMessage({
        message: this.generatePersonality(profile.name, assignments, prompt),
      })

      return response.text
    }

    const response = await chat.sendMessage({
      message: prompt,
    })

    return response.text
  }
}

export { AiService }
