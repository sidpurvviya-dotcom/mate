import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.property.count()
  console.log(`Total properties: ${count}`)
  const properties = await prisma.property.findMany({
    select: { title: true, ownerId: true }
  })
  console.log('Listing titles:', JSON.stringify(properties, null, 2))
}

main().catch(console.error).finally(() => prisma.$disconnect())
