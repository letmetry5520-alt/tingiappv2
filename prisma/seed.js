const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial admin user...');
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tingiapp.com' },
    update: {
      password: hashedPassword,
      role: 'Admin'
    },
    create: {
      email: 'admin@tingiapp.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'Admin',
    },
  });

  console.log(`Admin seeded! Email: ${admin.email} | Password: admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
