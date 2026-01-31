import { prisma } from "../lib/prisma";
import type { Request, Response } from "express";

const getAllUser = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id || undefined;

    if (typeof id !== "string" || id.trim() === "") {
      return res.status(404).json({
        success: false,
        error: "Id is required",
      });
    }
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            createdAt: true,
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            post: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch data.",
    });
  }
};

const createUser = async (req: Request, res: Response) => {
  try {
    const { email, username, name, bio, avatar } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: "false",
        message: "Both email and username are required",
      });
    }

    const user = await prisma.user.create({
      data: { email, username, name, bio, avatar },
    });
    res.status(201).json({
      success: "true",
      message: "User created successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);

    if (error.code === "P2002") {
      res.status(409).json({
        success: "false",
        message: "Email or username already exist",
      });
    }

    res.status(500).json({
      success: "false",
      message: "Failed to create user",
    });
    if (error.code === "P2002") {
      res.status(409).json({
        success: "false",
        message: "Email or username already exist",
      });
    }

    res.status(500).json({
      success: "false",
      message: "Failed to create user",
    });
  }
};

export { getAllUser, getUserById, createUser };
