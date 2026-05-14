import express from "express";
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

const toNumber = (value) =>
  value && typeof value.toNumber === "function"
    ? value.toNumber()
    : Number(value || 0);

// Get all transactions for user
router.get("/", async (req, res) => {
  try {
    const { month, year } = req.query;
    const where = { userId: req.userId };

    if (month !== undefined && year !== undefined) {
      const monthNumber = Number(month);
      const yearNumber = Number(year);
      if (!Number.isNaN(monthNumber) && !Number.isNaN(yearNumber)) {
        const startDate = new Date(yearNumber, monthNumber - 1, 1);
        const endDate = new Date(yearNumber, monthNumber, 0, 23, 59, 59, 999);
        where.date = { gte: startDate, lte: endDate };
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
    });

    res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post("/", async (req, res) => {
  try {
    const { amount, description, type, date, categoryId, accountId } = req.body;

    let selectedAccountId = accountId;
    if (!selectedAccountId) {
      const defaultAccount = await prisma.account.findFirst({
        where: { userId: req.userId },
      });
      if (defaultAccount) {
        selectedAccountId = defaultAccount.id;
      } else {
        const createdAccount = await prisma.account.create({
          data: {
            name: "Main Account",
            type: "BANK",
            balance: 0,
            userId: req.userId,
          },
        });
        selectedAccountId = createdAccount.id;
      }
    }

    if (!amount || !type || !date || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify category belongs to user
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized category" });
    }

    // Verify account belongs to user
    const account = await prisma.account.findUnique({
      where: { id: selectedAccountId },
    });

    if (!account || account.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized account" });
    }

    const parsedAmount = toNumber(amount);

    const transaction = await prisma.transaction.create({
      data: {
        amount: parsedAmount,
        description: description || null,
        type,
        date: new Date(date),
        categoryId,
        accountId: selectedAccountId,
        userId: req.userId,
      },
      include: { category: true, account: true },
    });

    // Update account balance
    const newBalance = toNumber(account.balance) + parsedAmount;

    await prisma.account.update({
      where: { id: selectedAccountId },
      data: { balance: newBalance },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update transaction
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, type, date, categoryId, accountId } = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // If account is being changed, update both old and new account balances
    if (accountId && accountId !== transaction.accountId) {
      const oldAccount = await prisma.account.findUnique({
        where: { id: transaction.accountId },
      });

      const newAccount = await prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!newAccount || newAccount.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized account" });
      }

      const oldAccountBalance = toNumber(oldAccount.balance) - toNumber(transaction.amount);
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: oldAccountBalance },
      });

      const newAmount = amount !== undefined ? toNumber(amount) : toNumber(transaction.amount);
      const newAccountBalance = toNumber(newAccount.balance) + newAmount;

      await prisma.account.update({
        where: { id: accountId },
        data: { balance: newAccountBalance },
      });
    } else if (amount !== undefined || type !== undefined) {
      // Update balance in same account
      const account = await prisma.account.findUnique({
        where: { id: transaction.accountId },
      });

      const oldTransactionAmount = toNumber(transaction.amount);
      const newAmount = amount !== undefined ? toNumber(amount) : toNumber(transaction.amount);
      const balanceDifference = newAmount - oldTransactionAmount;
      const newBalance = toNumber(account.balance) + balanceDifference;

      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: newBalance },
      });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        description: description !== undefined ? description : undefined,
        type: type !== undefined ? type : undefined,
        date: date !== undefined ? new Date(date) : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        accountId: accountId !== undefined ? accountId : undefined,
      },
      include: { category: true, account: true },
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete transaction
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction || transaction.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update account balance before deleting
    const account = await prisma.account.findUnique({
      where: { id: transaction.accountId },
    });

    const transactionAmount = toNumber(transaction.amount);
    const newBalance = toNumber(account.balance) - transactionAmount;

    await prisma.account.update({
      where: { id: transaction.accountId },
      data: { balance: newBalance },
    });

    await prisma.transaction.delete({
      where: { id },
    });

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get transactions by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const transactions = await prisma.transaction.findMany({
      where: { categoryId, userId: req.userId },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    res.json(transactions);
  } catch (error) {
    console.error("Get category transactions error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
