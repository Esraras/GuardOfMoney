import express from "express";
import { PrismaClient } from '@prisma/client';
const router = express.Router();
const prisma = new PrismaClient();

// Get all categories (shared across users)
router.get("/", async (req, res) => {
  try {
    const { month, year } = req.query;

    const include = {};
    if (month !== undefined && year !== undefined) {
      include.budgets = {
        where: {
          month: Number(month),
          year: Number(year),
        },
      };
    }

    const categories = await prisma.category.findMany({
      include,
      orderBy: { name: "asc" },
    });

    const sortedCategories = categories.sort((a, b) => {
      const aIsOther = /diğer/i.test(a.name);
      const bIsOther = /diğer/i.test(b.name);

      if (aIsOther && !bIsOther) return 1;
      if (!aIsOther && bIsOther) return -1;
      return a.name.localeCompare(b.name);
    });

    res.json(sortedCategories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create category
router.post("/", async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        color,
        icon: icon || null,
        userId: req.userId,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Category already exists" });
    }
    console.error("Create category error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update category
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        color: color !== undefined ? color : undefined,
        icon: icon !== undefined ? icon : undefined,
      },
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
