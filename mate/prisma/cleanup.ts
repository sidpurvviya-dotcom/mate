import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up fake data...')
  
  // 1. Delete all properties (since only the 6 fake ones exist)
  const propCount = await prisma.property.deleteMany()
  console.log(`✅ Removed ${propCount.count} fake properties.`)

  // 2. Delete demo users by email
  const demoEmails = [
    'riya.sharma@example.com',
    'arjun.mehta@example.com',
    'demo.seeker@example.com'
  ]
  
  const userCount = await prisma.user.deleteMany({
    where: {
      email: { in: demoEmails }
    }
  })
  console.log(`✅ Removed ${userCount.count} demo users.`)
  
  console.log('✨ Database is now clean!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
