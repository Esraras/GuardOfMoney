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

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  picture: user.picture,
  provider: user.provider,
});

const sendAuthResponse = (res, statusCode, user, token) => {
  return res.status(statusCode).json({
    user: sanitizeUser(user),
    token,
  });
};

// Register
router.post("/sign-up", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });

    if (existingUser) {
      if (existingUser.provider === "GOOGLE") {
        return res.status(409).json({
          error: "This email is already linked to Google sign-in. Please use Google login.",
        });
      }

      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name?.trim() || null,
      },
    });

    const token = generateToken(user.id);
    return sendAuthResponse(res, 201, user, token);
  } catch (error) {
    console.error("Sign-up error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
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
    return sendAuthResponse(res, 200, user, token);
  } catch (error) {
    console.error("Sign-in error:", error);
    return res.status(500).json({ error: error.message });
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

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google login is not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid Google token");
  }

  const { email, email_verified, name, picture, sub: providerId } = payload;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail || !email_verified) {
    throw new Error("Unverified Google email is not allowed");
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  });
  
  const user =
    existingUser ||
    (await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        picture: picture || null,
        provider: "GOOGLE",
        providerId,
        emailVerified: true,
      },
    }));

  const token = generateToken(user.id);
  return { user, token };
}

// Hata mesajlarını HTTP durum kodlarıyla eşleyen dinamik bir harita (Map)
const ERROR_STATUS_MAP = {
  "Missing Google credential token": 400,
  "Invalid Google token": 401,
  "Unverified Google email is not allowed": 401,
  "Google login is not configured": 500,
};

router.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    const { user, token } = await googleLogin(credential);

    // Sadece istemcinin ihtiyacı olan güvenli alanları dönüyoruz
    return sendAuthResponse(res, 200, user, token);
  } catch (error) {
    ("");
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
      user: sanitizeUser(user),
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
