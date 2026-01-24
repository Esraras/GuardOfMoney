import express from "express";
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

// Get all transactions for user
router.get("/", async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
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

    if (!amount || !type || !date || !categoryId || !accountId) {
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
      where: { id: accountId },
    });

    if (!account || account.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized account" });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description: description || null,
        type,
        date: new Date(date),
        categoryId,
        accountId,
        userId: req.userId,
      },
      include: { category: true, account: true },
    });

    // Update account balance
    const newBalance =
      type === "INCOME" 
        ? account.balance + parseFloat(amount)
        : account.balance - parseFloat(amount);

    await prisma.account.update({
      where: { id: accountId },
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

      // Revert from old account
      const oldTransactionAmount = transaction.type === "INCOME" 
        ? oldAccount.balance - transaction.amount
        : oldAccount.balance + transaction.amount;

      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: oldTransactionAmount },
      });

      // Add to new account
      const newAmount = amount || transaction.amount;
      const newAccountAmount = type === "INCOME" 
        ? newAccount.balance + newAmount
        : newAccount.balance - newAmount;

      await prisma.account.update({
        where: { id: accountId },
        data: { balance: newAccountAmount },
      });
    } else if (amount || type) {
      // Update balance in same account
      const account = await prisma.account.findUnique({
        where: { id: transaction.accountId },
      });

      const oldTransactionAmount = transaction.type === "INCOME"
        ? transaction.amount
        : -transaction.amount;

      const newAmount = amount || transaction.amount;
      const newType = type || transaction.type;
      const newTransactionAmount = newType === "INCOME"
        ? newAmount
        : -newAmount;

      const balanceDifference = newTransactionAmount - oldTransactionAmount;
      const newBalance = account.balance + balanceDifference;

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

    const transactionAmount = transaction.type === "INCOME"
      ? transaction.amount
      : -transaction.amount;

    const newBalance = account.balance - transactionAmount;

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
