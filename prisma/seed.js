import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password: await bcrypt.hash("password123", 10),
      role: "USER",
    },
  });

  console.log("✅ Created test user:", testUser.email);

  // Create test account
  const account = await prisma.account.upsert({
    where: { id: testUser.id + "_main" },
    update: {},
    create: {
      id: testUser.id + "_main",
      name: "Main Account",
      type: "BANK",
      balance: 5000,
      userId: testUser.id,
    },
  }).catch(() => 
    prisma.account.create({
      data: {
        name: "Main Account",
        type: "BANK",
        balance: 5000,
        userId: testUser.id,
      },
    })
  );

  console.log("✅ Created test account:", account.name);

  // Create default categories with colors and icons
  const expenseCategories = [
    { name: "Main expenses", color: "#FF6B6B", icon: "📊" },
    { name: "Products", color: "#4ECDC4", icon: "🛍️" },
    { name: "Car", color: "#FFE66D", icon: "🚗" },
    { name: "Self care", color: "#95E1D3", icon: "💆" },
    { name: "Child care", color: "#F38181", icon: "👶" },
    { name: "Household products", color: "#AA96DA", icon: "🏠" },
    { name: "Education", color: "#FCBAD3", icon: "📚" },
    { name: "Leisure", color: "#A8D8EA", icon: "🎮" },
    { name: "Other expenses", color: "#C7CEEA", icon: "📌" },
    { name: "Entertainment", color: "#FFB7B2", icon: "🎬" },
  ];

  for (const cat of expenseCategories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        userId: testUser.id,
      },
    }).catch(() => null);
  }

  // Create income category
  await prisma.category.create({
    data: {
      name: "Income",
      color: "#2ECC71",
      icon: "💰",
      userId: testUser.id,
    },
  }).catch(() => null);

  console.log("✅ Created default categories");

  // Create sample transactions
  const incomeCategory = await prisma.category.findFirst({
    where: { userId: testUser.id, name: "Income" },
  });

  const expenseCategory = await prisma.category.findFirst({
    where: { userId: testUser.id, name: "Main expenses" },
  });

  if (incomeCategory && account) {
    await prisma.transaction.create({
      data: {
        amount: 2000,
        description: "Monthly salary",
        type: "INCOME",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        categoryId: incomeCategory.id,
        accountId: account.id,
        userId: testUser.id,
      },
    }).catch(() => null);
  }

  if (expenseCategory && account) {
    await prisma.transaction.create({
      data: {
        amount: 150,
        description: "Groceries",
        type: "EXPENSE",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        categoryId: expenseCategory.id,
        accountId: account.id,
        userId: testUser.id,
      },
    }).catch(() => null);
  }

  console.log("✅ Created sample transactions");
  console.log("✨ Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });