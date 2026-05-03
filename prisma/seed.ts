import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Clearing Mate database for fresh start...')

  // Only clear transactional data, leave user accounts if they exist
  // Or if you want a TOTAL clear, keep these lines:
  await prisma.message.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.oTP.deleteMany()
  await prisma.property.deleteMany()
  
  // We keep the user table as is, so the user doesn't lose their own account
  // during a re-seed unless they specifically want to.

  console.log('✅ Database cleared. Ready for new listings!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
