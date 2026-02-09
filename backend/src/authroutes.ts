import { Router, Request, Response } from "express";
import User from "./user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authenticateJWT } from "./authMiddleware";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret";

// Helpers
const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// ======================= Signup =======================
router.post("/signup", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format.",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    return res.status(201).json({
      success: true,
      token,
      user: { id: newUser._id, email: newUser.email },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
});

// ======================= Login =======================
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const isMatch = user && (await bcrypt.compare(password, user.password));

    if (!user || !isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
});

// ======================= Profile (Protected) =======================
router.get(
  "/profile",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.user?.id;

      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found." });
      }

      return res.json({ success: true, user });
    } catch (error) {
      console.error("Profile error:", error);
      return res.status(500).json({ success: false, error: "Server error." });
    }
  },
);

// ======================= Refresh Token =======================
router.post(
  "/refresh",
  authenticateJWT,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "User not found." });
      }

      const newToken = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "24h" },
      );

      return res.json({ success: true, token: newToken });
    } catch (error) {
      console.error("Refresh token error:", error);
      return res.status(500).json({ success: false, error: "Server error." });
    }
  },
);

// ======================= Logout =======================
router.post("/logout", authenticateJWT, (_req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out successfully." });
});

export default router;
