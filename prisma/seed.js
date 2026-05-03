// Plain JS seed — run with: node prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding NestMatch database...')

  // Clear existing data
  await prisma.message.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.oTP.deleteMany()
  await prisma.property.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 12)

  // Demo Owner: Riya Sharma
  const owner1 = await prisma.user.create({
    data: {
      email: 'riya.sharma@example.com',
      passwordHash,
      name: 'Riya Sharma',
      role: 'owner',
      emailVerified: true,
      phone: '+919876543210',
      bio: 'Property owner in Bangalore. I have 3 verified flats available for working professionals. Always available on weekends for property visits.',
    },
  })

  // Demo Owner 2: Arjun Mehta
  const owner2 = await prisma.user.create({
    data: {
      email: 'arjun.mehta@example.com',
      passwordHash,
      name: 'Arjun Mehta',
      role: 'owner',
      emailVerified: true,
      phone: '+919871234560',
      bio: 'Experienced landlord in Mumbai. Clean properties with all amenities. Prefer working professionals or students.',
    },
  })

  // Demo Seeker: Priya Patel
  const seeker = await prisma.user.create({
    data: {
      email: 'demo.seeker@example.com',
      passwordHash,
      name: 'Priya Patel',
      role: 'seeker',
      emailVerified: true,
      phone: '+919988776655',
      bio: 'IT professional looking for a comfortable room near Whitefield. Non-smoker, early bird, love cooking.',
      budget: 18000,
      smokingOk: false,
      petsOk: true,
      workSchedule: 'morning',
      lifestyle: 'early_bird',
      cleanlinessLevel: 4,
      preferredCity: 'Bangalore',
      preferredArea: 'Whitefield',
    },
  })

  const properties = [
    {
      ownerId: owner1.id,
      title: '2BHK Furnished Flat in Koramangala',
      description: 'Beautifully furnished 2BHK apartment in the heart of Koramangala. Surrounded by restaurants, cafes, and tech hubs. Perfect for working professionals who want a premium living experience.',
      address: '5th Cross, 7th Block, Koramangala',
      city: 'Bangalore',
      area: 'Koramangala',
      lat: 12.9352,
      lng: 77.6245,
      rent: 22000,
      deposit: 44000,
      bedrooms: 2,
      bathrooms: 2,
      furnished: true,
      smokingAllowed: false,
      petsAllowed: false,
      genderPreference: 'any',
      amenities: JSON.stringify(['WiFi', 'AC', 'Washing Machine', 'Gym', 'Parking', 'Power Backup', 'Security']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      ]),
    },
    {
      ownerId: owner1.id,
      title: 'Cozy 1BHK near Indiranagar Metro',
      description: 'Perfect bachelor pad near Indiranagar metro station. Walk to 100 Feet Road and all amenities. The kitchen is fully equipped and the bedroom has ample storage.',
      address: 'HAL 2nd Stage, Indiranagar',
      city: 'Bangalore',
      area: 'Indiranagar',
      lat: 12.9784,
      lng: 77.6408,
      rent: 14000,
      deposit: 28000,
      bedrooms: 1,
      bathrooms: 1,
      furnished: true,
      smokingAllowed: false,
      petsAllowed: true,
      genderPreference: 'any',
      amenities: JSON.stringify(['WiFi', 'AC', 'Refrigerator', 'Microwave', 'Power Backup']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      ]),
    },
    {
      ownerId: owner1.id,
      title: '3BHK Premium Apartment in Whitefield',
      description: 'Spacious 3BHK apartment in a gated community near ITPL. Ideal for a group of IT professionals. The complex has excellent amenities including a swimming pool and clubhouse.',
      address: 'Prestige Shantiniketan, Whitefield',
      city: 'Bangalore',
      area: 'Whitefield',
      lat: 12.9698,
      lng: 77.7499,
      rent: 32000,
      deposit: 64000,
      bedrooms: 3,
      bathrooms: 2,
      furnished: true,
      smokingAllowed: false,
      petsAllowed: true,
      genderPreference: 'any',
      amenities: JSON.stringify(['WiFi', 'AC', 'Swimming Pool', 'Gym', 'Clubhouse', 'Parking', 'Power Backup', 'Security', 'Garden']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
      ]),
    },
    {
      ownerId: owner2.id,
      title: '1BHK Sea-Facing in Bandra West',
      description: 'Rare opportunity! 1BHK with partial sea view in prime Bandra West location. Steps away from Bandstand and Carter Road. Ground floor parking included.',
      address: 'Bandstand Area, Bandra West',
      city: 'Mumbai',
      area: 'Bandra',
      lat: 19.0596,
      lng: 72.8295,
      rent: 45000,
      deposit: 90000,
      bedrooms: 1,
      bathrooms: 1,
      furnished: true,
      smokingAllowed: false,
      petsAllowed: false,
      genderPreference: 'any',
      amenities: JSON.stringify(['WiFi', 'AC', 'Parking', 'Lift', 'Security', 'Power Backup']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      ]),
    },
    {
      ownerId: owner2.id,
      title: '2BHK Semi-Furnished in Powai',
      description: 'Well-maintained 2BHK apartment in Powai near Hiranandani. Best suited for professionals working in the Powai tech belt. On the 7th floor with good city views.',
      address: 'Hiranandani Gardens, Powai',
      city: 'Mumbai',
      area: 'Powai',
      lat: 19.1197,
      lng: 72.9051,
      rent: 35000,
      deposit: 70000,
      bedrooms: 2,
      bathrooms: 2,
      furnished: false,
      smokingAllowed: false,
      petsAllowed: false,
      genderPreference: 'any',
      amenities: JSON.stringify(['Parking', 'Gym', 'Swimming Pool', 'Security', 'Power Backup', 'Lift']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1551361415-69c87624334f?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      ]),
    },
    {
      ownerId: owner2.id,
      title: 'Studio Apartment in Andheri East',
      description: 'Compact and well-designed studio apartment near Andheri Metro. Perfect for single professionals. 24/7 security and power backup.',
      address: 'JB Nagar, Andheri East',
      city: 'Mumbai',
      area: 'Andheri',
      lat: 19.1136,
      lng: 72.8697,
      rent: 18000,
      deposit: 36000,
      bedrooms: 1,
      bathrooms: 1,
      furnished: true,
      smokingAllowed: false,
      petsAllowed: false,
      genderPreference: 'any',
      amenities: JSON.stringify(['WiFi', 'AC', 'Lift', 'Security', 'Power Backup']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
      ]),
    },
    {
      ownerId: owner1.id,
      title: 'Spacious 2BHK in HSR Layout',
      description: 'Large 2BHK apartment in the peaceful HSR Layout. Close to Agara Lake and multiple tech parks. Society has active sports and cultural events.',
      address: 'Sector 2, HSR Layout',
      city: 'Bangalore',
      area: 'HSR Layout',
      lat: 12.9121,
      lng: 77.6446,
      rent: 19000,
      deposit: 38000,
      bedrooms: 2,
      bathrooms: 1,
      furnished: false,
      smokingAllowed: false,
      petsAllowed: true,
      genderPreference: 'any',
      amenities: JSON.stringify(['Parking', 'Power Backup', 'Security', 'Lift', 'Garden']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
        'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
      ]),
    },
    {
      ownerId: owner2.id,
      title: '3BHK Independent House in Pune',
      description: 'Beautiful independent house with a garden in Baner. Close to Balewadi and Hinjewadi IT Park. Perfect for a family or group of professionals who want privacy and space.',
      address: 'Baner Road, Baner',
      city: 'Pune',
      area: 'Baner',
      lat: 18.5592,
      lng: 73.7896,
      rent: 28000,
      deposit: 56000,
      bedrooms: 3,
      bathrooms: 3,
      furnished: true,
      smokingAllowed: true,
      petsAllowed: true,
      genderPreference: 'any',
      amenities: JSON.stringify(['WiFi', 'AC', 'Garden', 'Parking', 'Power Backup']),
      photos: JSON.stringify([
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
      ]),
    },
  ]

  for (const p of properties) {
    await prisma.property.create({ data: p })
  }

  console.log('✅ Seeded successfully!')
  console.log('')
  console.log('📧 Demo accounts:')
  console.log('  Seeker → demo.seeker@example.com / password123')
  console.log('  Owner  → riya.sharma@example.com / password123')
  console.log('  Owner2 → arjun.mehta@example.com / password123')
  console.log('')
  console.log('🏠 Created ' + properties.length + ' property listings')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
