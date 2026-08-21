const readline = require('readline');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.info('=== CampusPlus Admin Account Provisioning ===');
  console.info('This script creates or updates the single admin account in the database.\n');

  let username = await prompt('Enter Admin Username (min 4 characters): ');
  while (!username || username.length < 4) {
    console.warn('⚠️ Username must be at least 4 characters long.');
    username = await prompt('Enter Admin Username: ');
  }

  let password = await prompt('Enter Admin Password (min 8 chars, at least 1 number): ');
  const passwordRegex = /^(?=.*\d).{8,}$/;
  while (!password || !passwordRegex.test(password)) {
    console.warn('⚠️ Password must be at least 8 characters long and contain at least 1 number.');
    password = await prompt('Enter Admin Password: ');
  }

  console.info('\nHashing password with bcrypt (cost factor 12)...');
  const passwordHash = await bcrypt.hash(password, 12);

  const existingAdmin = await prisma.admin.findUnique({
    where: { username },
  });

  if (existingAdmin) {
    const confirm = await prompt(`Admin "${username}" already exists. Update password? (y/n): `);
    if (confirm.toLowerCase() === 'y') {
      await prisma.admin.update({
        where: { username },
        data: { passwordHash },
      });
      console.info(`✅ Admin "${username}" updated successfully.`);
    } else {
      console.info('Operation cancelled.');
    }
  } else {
    const admin = await prisma.admin.create({
      data: {
        username,
        passwordHash,
      },
    });
    console.info(`✅ Admin "${admin.username}" created successfully (ID: ${admin.id}).`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Admin provisioning failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
