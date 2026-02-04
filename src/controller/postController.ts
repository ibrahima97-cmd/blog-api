import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const { status, author, tags, search, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (status) where.status = status;
    if (author) where.authorId = Number(author);
    if (tags) where.tags = { has: tags };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: Number(limit),
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      success: true,
      count: posts.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      success: false,
      error: "Fail to fetch posts",
    });
  }
};

const getPublishedPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      include: {
        author: {
          select: {
            username: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching published post:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch published post",
    });
  }
};

export { getAllPosts, getPublishedPosts };
