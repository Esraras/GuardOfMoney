import express from "express";
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all accounts for user
router.get("/", async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(accounts);
  } catch (error) {
    console.error("Get accounts error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create account
router.post("/", async (req, res) => {
  try {
    const { name, type, balance } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const account = await prisma.account.create({
      data: {
        name,
        type,
        balance: balance ? parseFloat(balance) : 0,
        userId: req.userId,
      },
    });

    res.status(201).json(account);
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update account
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, balance } = req.body;

    const account = await prisma.account.findUnique({
      where: { id },
    });

    if (!account || account.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        type: type !== undefined ? type : undefined,
        balance: balance !== undefined ? parseFloat(balance) : undefined,
      },
    });

    res.json(updatedAccount);
  } catch (error) {
    console.error("Update account error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete account
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findUnique({
      where: { id },
    });

    if (!account || account.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if account has transactions
    const transactionCount = await prisma.transaction.count({
      where: { accountId: id },
    });

    if (transactionCount > 0) {
      return res.status(409).json({ 
        error: "Cannot delete account with transactions. Delete transactions first." 
      });
    }

    await prisma.account.delete({
      where: { id },
    });

    res.json({ message: "Account deleted" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get account with transactions
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        transactions: {
          include: { category: true },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!account || account.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(account);
  } catch (error) {
    console.error("Get account error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
