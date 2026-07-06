import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import { generateToken, verifyToken } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const toNumber = (value) =>
  value && typeof value.toNumber === "function"
    ? value.toNumber()
    : Number(value || 0);

// Register
router.post("/sign-up", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = user.password
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Google ID Token'ı doğrular ve kullanıcıyı kaydeder/günceller.
 * @param {string} credential
 * @returns {Promise<{user: Object, token: string}>}
 */
export async function googleLogin(credential) {
  if (!credential) {
    throw new Error("Missing Google credential token");
  }

  // 1. Google Token Doğrulama
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid Google token");
  }

  const { email, email_verified, name, picture, sub: providerId } = payload;

  if (!email || !email_verified) {
    throw new Error("Unverified Google email is not allowed");
  }

  // 2. Veritabanında Kullanıcı Kontrolü
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Zaten kayıtlı kullanıcı varsa bilgilerini güncelleme, sadece token döndür
    const token = generateToken(user.id);
    return { user, token };
  }

  // İlk girişte yeni kullanıcı oluştur (password olmadan)
  user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      picture: picture || null,
      provider: "GOOGLE",
      providerId,
      emailVerified: true,
    },
  });

  // 3. JWT/Session Token Üretimi
  const token = generateToken(user.id);

  return { user, token };
}

// Hata mesajlarını HTTP durum kodlarıyla eşleyen dinamik bir harita (Map)
const ERROR_STATUS_MAP = {
  "Missing Google credential token": 400,
  "Invalid Google token": 401,
  "Unverified Google email is not allowed": 401,
};

router.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    const { user, token } = await googleLogin(credential);

    // Sadece istemcinin ihtiyacı olan güvenli alanları dönüyoruz
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        provider: user.provider,
      },
      token,
    });
  } catch (error) {
    console.error("❌ Google login error:", error.message);

    // Tanımlı bir hata ise uygun HTTP kodunu dön, yoksa 500 (Internal Server Error) fırlat
    const statusCode = ERROR_STATUS_MAP[error.message] || 500;

    return res.status(statusCode).json({
      error:
        error.message || "An unexpected error occurred during Google login.",
    });
  }
});

// Get current user
router.get("/current", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { accounts: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const balance = user.accounts.reduce(
      (sum, account) => sum + toNumber(account.balance),
      0,
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      balance,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.delete("/sign-out", async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
