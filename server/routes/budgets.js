import express from "express";
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

const toNumber = (value) =>
  value && typeof value.toNumber === "function"
    ? value.toNumber()
    : Number(value || 0);

// Get budgets for user
router.get("/", async (req, res) => {
  try {
    const { month, year, categoryId } = req.query;
    const where = { userId: req.userId };

    if (month !== undefined) {
      const monthNum = Number(month);
      if (!Number.isNaN(monthNum)) where.month = monthNum;
    }
    if (year !== undefined) {
      const yearNum = Number(year);
      if (!Number.isNaN(yearNum)) where.year = yearNum;
    }
    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: { category: true },
      orderBy: [{ year: "desc" }, { month: "desc" }, { categoryId: "asc" }],
    });

    res.json(budgets);
  } catch (error) {
    console.error("Get budgets error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update budget entry
router.post("/", async (req, res) => {
  try {
    const { amount, month, year, categoryId } = req.body;
    const parsedAmount = toNumber(amount);
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (
      parsedAmount === undefined ||
      Number.isNaN(parsedAmount) ||
      Number.isNaN(parsedMonth) ||
      Number.isNaN(parsedYear) ||
      !categoryId
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized category" });
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: req.userId,
        categoryId,
        month: parsedMonth,
        year: parsedYear,
      },
    });

    let budget;
    if (existingBudget) {
      budget = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { amount: parsedAmount },
        include: { category: true },
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          amount: parsedAmount,
          month: parsedMonth,
          year: parsedYear,
          categoryId,
          userId: req.userId,
        },
        include: { category: true },
      });
    }

    res.status(existingBudget ? 200 : 201).json(budget);
  } catch (error) {
    console.error("Create or update budget error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update budget by id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, month, year, categoryId } = req.body;

    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget || budget.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category || category.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized category" });
      }
    }

    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        amount: amount !== undefined ? toNumber(amount) : undefined,
        month: month !== undefined ? Number(month) : undefined,
        year: year !== undefined ? Number(year) : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
      },
      include: { category: true },
    });

    res.json(updatedBudget);
  } catch (error) {
    console.error("Update budget error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete budget
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!budget || budget.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.budget.delete({
      where: { id },
    });

    res.json({ message: "Budget deleted" });
  } catch (error) {
    console.error("Delete budget error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
