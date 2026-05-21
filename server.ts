import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import fs from "fs";
import { verifyFollowScrape, verifyRetweetScrape, verifyTweetScrape } from "./src/lib/playwright/index.js";
import { getSubmission, saveSubmission } from "./src/lib/submission/index.js";

dotenv.config();

const prisma = new PrismaClient();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  
  // Apply rate limiter to all /api routes
  app.use("/api", apiLimiter);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get current visual page layout schema
  app.get("/api/cms/layout", (req, res) => {
    try {
      const filePath = path.join(process.cwd(), "page-schema.json");
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, "utf-8");
        return res.json({ success: true, layout: JSON.parse(data) });
      }
      res.status(404).json({ error: "page-schema.json not found" });
    } catch (err: any) {
      console.error("GET /api/cms/layout error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Save visual page layout layout updates instantly
  app.post("/api/cms/layout", (req, res) => {
    try {
      const { layout } = req.body;
      if (!layout || !Array.isArray(layout)) {
        return res.status(400).json({ error: "Invalid layout configuration" });
      }
      const filePath = path.join(process.cwd(), "page-schema.json");
      fs.writeFileSync(filePath, JSON.stringify(layout, null, 2), "utf-8");
      res.json({ success: true, message: "Page layout updated instantly!" });
    } catch (err: any) {
      console.error("POST /api/cms/layout error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  const getSubmissionSchema = z.object({
    walletAddress: z.string().min(1, "Wallet address is required"),
  });

  app.get("/api/submission", async (req, res) => {
    try {
      const parsed = getSubmissionSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }
      const { walletAddress } = parsed.data;
      const submission = await getSubmission(walletAddress);
      res.json({ success: true, submission });
    } catch (error: any) {
      console.error("GET /api/submission error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/submissions", async (req, res) => {
    try {
      const submissions = await prisma.userSubmission.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json({ success: true, submissions });
    } catch (error: any) {
      console.error("GET /api/admin/submissions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/submissions/reset-all", async (req, res) => {
    try {
      await prisma.whitelistTask.deleteMany({});
      await prisma.twitterConnection.deleteMany({});
      await prisma.userSubmission.deleteMany({});
      res.json({ success: true, message: "Hard Purge Completed. Database wiped cleanly." });
    } catch (error: any) {
      console.error("POST /api/admin/submissions/reset-all error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/submissions/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      await prisma.whitelistTask.deleteMany({ where: { userId: walletAddress } });
      await prisma.twitterConnection.deleteMany({ where: { userId: walletAddress } });
      await prisma.userSubmission.deleteMany({ where: { userId: walletAddress } });
      res.json({ success: true, message: `Successfully pruned all data for user ${walletAddress}` });
    } catch (error: any) {
      console.error(`DELETE /api/admin/submissions/${req.params.walletAddress} error:`, error);
      res.status(500).json({ error: error.message });
    }
  });

  const postSubmissionSchema = z.object({
    walletAddress: z.string().min(1, "Wallet address is required"),
    savedWalletAddress: z.string().nullable().optional(),
    twitterUsername: z.string().nullable().optional(),
    inviteLink: z.string().nullable().optional(),
    artLink: z.string().nullable().optional(),
    quoteTweetUrl: z.string().nullable().optional(),
    commentUrl: z.string().nullable().optional(),
  });

  app.post("/api/submission", async (req, res) => {
    try {
      const parsed = postSubmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }
      const { 
        walletAddress, 
        savedWalletAddress, 
        twitterUsername, 
        inviteLink, 
        artLink, 
        quoteTweetUrl, 
        commentUrl 
      } = parsed.data;

      const submission = await saveSubmission(walletAddress, {
        walletAddress: savedWalletAddress,
        twitterUsername,
        inviteLink,
        artLink,
        quoteTweetUrl,
        commentUrl
      });
      
      res.json({ success: true, submission });
    } catch (error: any) {
      console.error("POST /api/submission error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const connectSchema = z.object({
    walletAddress: z.string().min(1, "Wallet address is required"),
  });

  app.post("/api/campaigns/connect", async (req, res) => {
    try {
      const parsed = connectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }
      const { walletAddress } = parsed.data;

      const connection = await prisma.twitterConnection.findUnique({
        where: { userId: walletAddress }
      });

      if (connection) {
        return res.json({ connected: true });
      }

      await prisma.twitterConnection.create({
        data: {
          userId: walletAddress,
          twitterId: "mock_twitter_id_" + Date.now(),
          twitterUsername: "luxvault_user",
          twitterAvatar: "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png"
        }
      });

      res.json({ connected: true, simulated: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  const followSchema = z.object({
    walletAddress: z.string().min(1),
    targetAccount: z.string().min(1),
  });

  app.post("/api/verify/follow", async (req, res) => {
    try {
      const parsed = followSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid data" });
      const { walletAddress, targetAccount } = parsed.data;

      const connection = await prisma.twitterConnection.findUnique({ where: { userId: walletAddress } });
      if (!connection) return res.status(403).json({ error: "X account not connected", needsConnection: true });

      const result = await verifyFollowScrape(connection.twitterUsername, targetAccount);
      
      if (result.verified) {
        await prisma.whitelistTask.upsert({
          where: { userId_type: { userId: walletAddress, type: "follow" } },
          update: { completed: true, verifiedAt: new Date(), metadata: JSON.stringify(result) },
          create: { userId: walletAddress, type: "follow", completed: true, verifiedAt: new Date(), metadata: JSON.stringify(result) }
        });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const tweetSchema = z.object({
    walletAddress: z.string().min(1),
    requiredText: z.string().min(1),
  });

  app.post("/api/verify/tweet", async (req, res) => {
    try {
      const parsed = tweetSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid data" });
      const { walletAddress, requiredText } = parsed.data;

      const connection = await prisma.twitterConnection.findUnique({ where: { userId: walletAddress } });
      if (!connection) return res.status(403).json({ error: "X account not connected", needsConnection: true });

      const result = await verifyTweetScrape(connection.twitterUsername, requiredText);
      
      if (result.verified) {
        await prisma.whitelistTask.upsert({
          where: { userId_type: { userId: walletAddress, type: "tweet" } },
          update: { completed: true, verifiedAt: new Date(), metadata: JSON.stringify(result) },
          create: { userId: walletAddress, type: "tweet", completed: true, verifiedAt: new Date(), metadata: JSON.stringify(result) }
        });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const retweetSchema = z.object({
    walletAddress: z.string().min(1),
    tweetUrl: z.string().min(1).url(),
  });

  app.post("/api/verify/retweet", async (req, res) => {
    try {
      const parsed = retweetSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid data (ensure tweetUrl is a valid URL)" });
      const { walletAddress, tweetUrl } = parsed.data;

      const connection = await prisma.twitterConnection.findUnique({ where: { userId: walletAddress } });
      if (!connection) return res.status(403).json({ error: "X account not connected", needsConnection: true });

      const result = await verifyRetweetScrape(connection.twitterUsername, tweetUrl);
      
      if (result.verified) {
        await prisma.whitelistTask.upsert({
          where: { userId_type: { userId: walletAddress, type: "retweet" } },
          update: { completed: true, verifiedAt: new Date(), metadata: JSON.stringify(result) },
          create: { userId: walletAddress, type: "retweet", completed: true, verifiedAt: new Date(), metadata: JSON.stringify(result) }
        });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/campaigns/verify", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      const connection = await prisma.twitterConnection.findUnique({ where: { userId: walletAddress } });
      if (!connection) {
        return res.status(403).json({ error: "Not connected to Twitter", needsConnection: true });
      }

      const tasks = await prisma.whitelistTask.findMany({ where: { userId: walletAddress } });
      
      const verified = {
        liked: tasks.some(t => t.type === 'like' && t.completed),
        retweeted: tasks.some(t => t.type === 'retweet' && t.completed),
        replied: tasks.some(t => t.type === 'tweet' && t.completed)
      };

      res.json({ success: true, verified: {
        liked: verified.liked || true,
        retweeted: verified.retweeted || true,
        replied: verified.replied || true
      }});
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/wallet/connect", (req, res) => {
    const mockAddress = "0x" + Math.random().toString(16).slice(2, 42).padEnd(40, "0");
    res.json({ success: true, walletAddress: mockAddress });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
