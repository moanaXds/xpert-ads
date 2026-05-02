import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// MongoDB Connection
if (!MONGODB_URI || MONGODB_URI.includes("localhost")) {
  console.error("\n❌ DATABASE CONNECTION ERROR:");
  console.error("The app is trying to connect to a local MongoDB (127.0.0.1), which is not available in this environment.");
  console.error("Please add your 'MONGODB_URI' from MongoDB Atlas to the Secrets panel in the AI Studio sidebar.\n");
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ Successfully connected to remote MongoDB"))
    .catch(err => {
      console.error("❌ MongoDB connection error:", err.message);
    });
}

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "" },
  bio: { type: String, default: "" },
  platform: { type: String, default: "" },
  category: { type: String, default: "" },
  credits: { type: Number, default: 80 },
  totalPromotions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

// Post Schema
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['video', 'image'], required: true },
  communityId: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  creditsEarnedFromLikes: { type: Number, default: 0 },
  creditsEarnedFromComments: { type: Number, default: 0 },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

postSchema.index({ communityId: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ communityId: 1, createdAt: -1 });
postSchema.index({ viewedBy: 1 });

const Post = mongoose.model("Post", postSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['earn', 'spend'], required: true },
  reason: { type: String, required: true }, // e.g., 'post_ad', 'content_view', 'like_received', 'comment_received'
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// Post Reaction Schema (Like/Dislike)
const reactionSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'dislike'], required: true },
  createdAt: { type: Date, default: Date.now }
});
reactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

const Reaction = mongoose.model("Reaction", reactionSchema);

// Comment Schema (Supports nesting)
const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  content: { type: String, required: true },
  likesCount: { type: Number, default: 0 },
  repliesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model("Comment", commentSchema);

// Comment Reaction Schema
const commentReactionSchema = new mongoose.Schema({
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});
commentReactionSchema.index({ commentId: 1, userId: 1 }, { unique: true });

const CommentReaction = mongoose.model("CommentReaction", commentReactionSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  type: { type: String, enum: ['like', 'comment'], required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(cookieParser());

  // --- API Routes ---

  // Middleware: Auth Check
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  const optionalAuthenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return next();
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      next();
    }
  };

  // Auth: Sign Up
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { fullName, username, email, password } = req.body;
      
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: "Email or Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ fullName, username, email, password: hashedPassword });
      await user.save();

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      
      res.status(201).json({ user: { id: user._id, fullName, username, email } });
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
      res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
      
      res.json({ 
        user: { 
          id: user._id, 
          fullName: user.fullName, 
          username: user.username, 
          email: user.email,
          credits: user.credits,
          profileImage: user.profileImage,
          bio: user.bio,
          platform: user.platform,
          category: user.category,
          totalPromotions: user.totalPromotions
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Login error" });
    }
  });

  // Auth: Logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  // User: Get Profile
  app.get("/api/user/profile", authenticate, async (req: any, res) => {
    try {
      const user = await User.findById(req.userId).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile" });
    }
  });

  // Notifications: Get all
  app.get("/api/notifications", authenticate, async (req: any, res) => {
    try {
      const notifications = await Notification.find({ recipientUserId: req.userId })
        .populate("senderUserId", "username profileImage")
        .populate("postId", "title")
        .sort({ createdAt: -1 })
        .limit(50);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });

  // Notifications: Mark as read
  app.patch("/api/notifications/read", authenticate, async (req: any, res) => {
    try {
      await Notification.updateMany(
        { recipientUserId: req.userId, isRead: false },
        { $set: { isRead: true } }
      );
      res.json({ message: "Notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Error marking notifications as read" });
    }
  });

  // User: Promote (Deduct 10 credits)
  app.post("/api/user/promote", authenticate, async (req: any, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = await User.findById(req.userId).session(session);
      if (!user || user.credits < 10) {
        await session.abortTransaction();
        return res.status(403).json({ message: "Insufficient credits (10 required)" });
      }

      user.credits -= 10;
      user.totalPromotions += 1;
      await user.save({ session });

      await new Transaction({
        userId: req.userId,
        amount: 10,
        type: 'spend',
        reason: 'promotion',
      }).save({ session });

      await session.commitTransaction();
      res.json({ message: "Promotion successful", credits: user.credits, totalPromotions: user.totalPromotions });
    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({ message: "Promotion error" });
    } finally {
      session.endSession();
    }
  });

  // User: Update Profile Image (Base64)
  app.post("/api/user/profile-image", authenticate, async (req: any, res) => {
    try {
      const { image } = req.body; // Base64 string
      if (!image) return res.status(400).json({ message: "No image provided" });
      
      const user = await User.findByIdAndUpdate(req.userId, { profileImage: image }, { new: true }).select("-password");
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error updating profile image" });
    }
  });

  // User: Update Profile
  app.put("/api/user/profile", authenticate, async (req: any, res) => {
    try {
      const updates = req.body;
      const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Update error" });
    }
  });

  // Public: Get User Profile by Username
  app.get("/api/u/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username }).select("fullName username profileImage bio platform category credits totalPromotions createdAt");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile" });
    }
  });

  // Posts: Get Posts by specific User (Username)
  app.get("/api/posts/user/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const { page = 1, limit = 12 } = req.query;
      
      const user = await User.findOne({ username }).select("_id");
      if (!user) return res.status(404).json({ message: "User not found" });

      const posts = await Post.find({ creator: user._id })
        .populate("creator", "fullName username profileImage")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Post.countDocuments({ creator: user._id });

      res.json({
        posts,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalPosts: total
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user posts" });
    }
  });

  // Posts: Create Post
  app.post("/api/posts", authenticate, async (req: any, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { title, description, fileUrl, fileType, communityId } = req.body;
      
      // Credit logic: check balance
      const cost = fileType === 'video' ? 20 : 10;
      const user = await User.findById(req.userId).session(session);
      
      if (!user || user.credits < cost) {
        await session.abortTransaction();
        return res.status(403).json({ message: `Insufficient credits. Need ${cost} but have ${user?.credits || 0}` });
      }

      // Deduct credits
      user.credits -= cost;
      await user.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        userId: req.userId,
        amount: cost,
        type: 'spend',
        reason: 'post_ad'
      });
      await transaction.save({ session });

      const post = new Post({
        title,
        description,
        fileUrl,
        fileType,
        communityId,
        creator: req.userId
      });
      await post.save({ session });
      
      await session.commitTransaction();
      res.status(201).json(post);
    } catch (error) {
      await session.abortTransaction();
      console.error("Ad creation error:", error);
      res.status(500).json({ message: "Error creating post" });
    } finally {
      session.endSession();
    }
  });

  // Credits: Award for viewing content
  app.post("/api/posts/:id/view", authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { durationMet } = req.body; // Boolean from client-side verification (70% for video, 3s for image)
      
      if (!durationMet) {
        return res.status(400).json({ message: "Engagement criteria not met" });
      }

      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      // Rule: cannot earn from own content
      if (post.creator.toString() === req.userId) {
        // Increment view count anyway
        await Post.findByIdAndUpdate(id, { 
          $inc: { views: 1 },
          $addToSet: { viewedBy: req.userId }
        });
        return res.json({ message: "Views incremented (no credits for own content)" });
      }

      // Check for repeated views (e.g., within the last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentView = await Transaction.findOne({
        userId: req.userId,
        postId: id,
        reason: 'content_view',
        createdAt: { $gte: oneHourAgo }
      });

      if (recentView) {
        await Post.findByIdAndUpdate(id, { 
          $inc: { views: 1 },
          $addToSet: { viewedBy: req.userId }
        });
        return res.json({ message: "Views incremented (repeated view within an hour - no credits)" });
      }

      // Check daily cap (50 credits)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const dailyEarned = await Transaction.aggregate([
        { $match: { 
          userId: new mongoose.Types.ObjectId(req.userId), 
          reason: 'content_view', 
          createdAt: { $gte: startOfDay } 
        } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const currentDailyTotal = dailyEarned[0]?.total || 0;
      const rewardWeight = post.fileType === 'video' ? 2 : 1;

      if (currentDailyTotal + rewardWeight > 50) {
        await Post.findByIdAndUpdate(id, { 
          $inc: { views: 1 },
          $addToSet: { viewedBy: req.userId } 
        });
        return res.json({ message: "Views incremented (daily cap reached)" });
      }

      // Atomic award
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        await User.findByIdAndUpdate(req.userId, { $inc: { credits: rewardWeight } }, { session });
        await new Transaction({
          userId: req.userId,
          amount: rewardWeight,
          type: 'earn',
          reason: 'content_view',
          postId: id
        }).save({ session });
        await Post.findByIdAndUpdate(id, { 
          $inc: { views: 1 },
          $addToSet: { viewedBy: req.userId }
        }, { session });
        
        await session.commitTransaction();
        res.json({ message: `Successfully earned ${rewardWeight} credits`, balanceEarned: rewardWeight });
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    } catch (error) {
      res.status(500).json({ message: "Error awarding credits" });
    }
  });

  // Posts: React (Like/Dislike)
  app.post("/api/posts/:id/react", authenticate, async (req: any, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { type } = req.body; // 'like' or 'dislike'
      
      if (!['like', 'dislike'].includes(type)) {
        return res.status(400).json({ message: "Invalid reaction type" });
      }

      const post = await Post.findById(id).session(session);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const existingReaction = await Reaction.findOne({ postId: id, userId: req.userId }).session(session);

      if (existingReaction) {
        if (existingReaction.type === type) {
          // Toggle off: Remove reaction
          await Reaction.deleteOne({ _id: existingReaction._id }).session(session);
          await Post.updateOne({ _id: id }, { $inc: { [type === 'like' ? 'likes' : 'dislikes']: -1 } }).session(session);
        } else {
          // Switch reaction: e.g., Like -> Dislike
          const oldType = existingReaction.type;
          existingReaction.type = type;
          await existingReaction.save({ session });
          await Post.updateOne(
            { _id: id }, 
            { $inc: { 
              [type === 'like' ? 'likes' : 'dislikes']: 1,
              [oldType === 'like' ? 'likes' : 'dislikes']: -1
            } }
          ).session(session);
          
          // Credit handling for switch to Like
          if (type === 'like' && post.creditsEarnedFromLikes < 20) {
            await User.updateOne({ _id: post.creator }, { $inc: { credits: 1 } }).session(session);
            await Post.updateOne({ _id: id }, { $inc: { creditsEarnedFromLikes: 1 } }).session(session);
            await new Transaction({
              userId: post.creator as any,
              amount: 1,
              type: 'earn',
              reason: 'like_received',
              postId: id
            }).save({ session });
          }
        }
      } else {
        // New reaction
        await new Reaction({ postId: id, userId: req.userId, type }).save({ session });
        await Post.updateOne({ _id: id }, { $inc: { [type === 'like' ? 'likes' : 'dislikes']: 1 } }).session(session);

        // Create Notification for Like
        if (type === 'like' && post.creator.toString() !== req.userId) {
          await new Notification({
            recipientUserId: post.creator,
            senderUserId: req.userId,
            postId: id,
            type: 'like'
          }).save({ session });
        }

        // Credit logic for new Like
        if (type === 'like' && post.creditsEarnedFromLikes < 20) {
          await User.updateOne({ _id: post.creator }, { $inc: { credits: 1 } }).session(session);
          await Post.updateOne({ _id: id }, { $inc: { creditsEarnedFromLikes: 1 } }).session(session);
          await new Transaction({
            userId: post.creator as any,
            amount: 1,
            type: 'earn',
            reason: 'like_received',
            postId: id
          }).save({ session });
        }
      }

      await session.commitTransaction();
      const updatedPost = await Post.findById(id).select('likes dislikes');
      res.json(updatedPost);
    } catch (error) {
      await session.abortTransaction();
      console.error("Reaction error:", error);
      res.status(500).json({ message: "Reaction error" });
    } finally {
      session.endSession();
    }
  });

  // Posts: Share
  app.post("/api/posts/:id/share", async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Post.findByIdAndUpdate(id, { $inc: { sharesCount: 1 } }, { new: true });
      res.json({ sharesCount: post?.sharesCount || 0 });
    } catch (error) {
      res.status(500).json({ message: "Share error" });
    }
  });

  // Comments: Add Comment/Reply
  app.post("/api/posts/:id/comments", authenticate, async (req: any, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { content, parentCommentId } = req.body;
      
      if (!content || content.length < 1) return res.status(400).json({ message: "Empty comment" });

      const post = await Post.findById(id).session(session);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const comment = new Comment({
        postId: id,
        userId: req.userId,
        content,
        parentCommentId: parentCommentId || null
      });
      await comment.save({ session });

      // Create Notification for Comment
      if (post.creator.toString() !== req.userId) {
        await new Notification({
          recipientUserId: post.creator,
          senderUserId: req.userId,
          postId: id,
          type: 'comment'
        }).save({ session });
      }

      // Update counts
      await Post.updateOne({ _id: id }, { $inc: { commentsCount: 1 } }).session(session);
      if (parentCommentId) {
        await Comment.updateOne({ _id: parentCommentId }, { $inc: { repliesCount: 1 } }).session(session);
      }

      // Credit logic for parent post creator
      if (post.creditsEarnedFromComments < 30) {
        await User.updateOne({ _id: post.creator }, { $inc: { credits: 2 } }).session(session);
        await Post.updateOne({ _id: id }, { $inc: { creditsEarnedFromComments: 2 } }).session(session);
        await new Transaction({
          userId: post.creator as any,
          amount: 2,
          type: 'earn',
          reason: 'comment_received',
          postId: id
        }).save({ session });
      }

      await session.commitTransaction();
      res.status(201).json(comment);
    } catch (error) {
      await session.abortTransaction();
      console.error("Comment error:", error);
      res.status(500).json({ message: "Comment error" });
    } finally {
      session.endSession();
    }
  });

  // Comments: Get Comments for Post
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const { parentId } = req.query; // If specified, fetch replies for this parent
      
      const query: any = { postId: id, parentCommentId: parentId || null };
      const comments = await Comment.find(query)
        .populate("userId", "fullName username profileImage")
        .sort({ createdAt: -1 });

      // If fetching top-level comments and user wants replies, we could potentially join them
      // but standard practice is separate calls or nested populate. 
      // For this specific fix, let's allow fetching replies efficiently.
      
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching comments" });
    }
  });

  // Comments: Like/Unlike Comment
  app.post("/api/comments/:id/react", authenticate, async (req: any, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const existingReaction = await CommentReaction.findOne({ commentId: id, userId: req.userId }).session(session);

      if (existingReaction) {
        await CommentReaction.deleteOne({ _id: existingReaction._id }).session(session);
        await Comment.updateOne({ _id: id }, { $inc: { likesCount: -1 } }).session(session);
        await session.commitTransaction();
        return res.json({ liked: false });
      } else {
        await new CommentReaction({ commentId: id, userId: req.userId }).save({ session });
        await Comment.updateOne({ _id: id }, { $inc: { likesCount: 1 } }).session(session);
        await session.commitTransaction();
        return res.json({ liked: true });
      }
    } catch (error) {
      await session.abortTransaction();
      res.status(500).json({ message: "Comment reaction error" });
    } finally {
      session.endSession();
    }
  });

  // Credits: Get Transaction History
  app.get("/api/user/transactions", authenticate, async (req: any, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const transactions = await Transaction.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
      
      const total = await Transaction.countDocuments({ userId: req.userId });

      res.json({
        transactions,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalTransactions: total
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching transactions" });
    }
  });

  // Posts: Get Posts by Community
  app.get("/api/posts/community/:communityId", optionalAuthenticate, async (req: any, res) => {
    try {
      const { communityId } = req.params;
      const { page = 1, limit = 12, sort = 'newest', type = 'all', status = 'all' } = req.query;
      
      const query: any = { communityId };
      
      // Filter by type
      if (type === 'video' || type === 'image') {
        query.fileType = type;
      }
      
      // Filter by seen/unseen (requires auth)
      if (req.userId) {
        if (status === 'seen') {
          query.viewedBy = req.userId;
        } else if (status === 'unseen') {
          query.viewedBy = { $ne: req.userId };
        }
      }

      // Sorting
      let sortQuery: any = { createdAt: -1 };
      if (sort === 'oldest') {
        sortQuery = { createdAt: 1 };
      } else if (sort === 'hottest') {
        sortQuery = { views: -1, likes: -1, commentsCount: -1 };
      }

      const posts = await Post.find(query)
        .populate("creator", "fullName username profileImage")
        .sort(sortQuery)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Post.countDocuments(query);

      res.json({
        posts,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalPosts: total
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  });

  // Posts: Get All Posts
  app.get("/api/posts", async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      const posts = await Post.find()
        .populate("creator", "fullName username profileImage")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Post.countDocuments();

      res.json({
        posts,
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalPosts: total
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  });

  // Posts: Get Single Post
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Post.findById(id).populate("creator", "fullName username profileImage bio");
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Error fetching post" });
    }
  });

  // Search: Posts and Users
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') return res.json({ posts: [], users: [] });

      const searchRegex = new RegExp(q, 'i');

      const posts = await Post.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      })
      .populate("creator", "username profileImage")
      .limit(10);

      const users = await User.find({
        $or: [
          { username: searchRegex },
          { fullName: searchRegex }
        ]
      })
      .select("username fullName profileImage")
      .limit(10);

      res.json({ posts, users });
    } catch (error) {
      res.status(500).json({ message: "Search error" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
