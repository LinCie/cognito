import { prisma } from "@/database"

abstract class Service {
  public readonly prisma = prisma
}

export { Service }
