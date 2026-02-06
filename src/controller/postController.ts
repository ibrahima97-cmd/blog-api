import { response, type Request, type Response } from "express";
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

const getFeaturedPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      where: { featured: true, status: "PUBLISHED" },
      include: {
        author: {
          select: {
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 5,
    });

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching featured post:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch featured posts",
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim() === "")
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            bio: true,
            avatar: true,
          },
        },
        comments: {
          where: {
            status: "APPROVED",
          },
          include: {
            author: {
              select: {
                username: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        succuss: false,
        error: "Id not found",
      });
    }

    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post by id:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch post",
    });
  }
};

const getPostBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    if (typeof slug !== "string")
      return res.status(400).json({
        success: false,
        error: "Slug is required",
      });
    const posts = await prisma.post.findMany({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            bio: true,
            avatar: true,
          },
        },
        comments: {
          where: { status: "APPROVED" },
          include: {
            author: {
              select: {
                username: true,
                name: true,
                avatar: true,
              },
            },
          },

          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!posts) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching post:", error);

    res.status(500).json({
      success: true,
      error: "Failed to fetch post",
    });
  }
};

const createPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      authorId,
      excerpt,
      tags,
      image,
      status = "DRAFT",
    } = req.body;

    //Validate information
    if (!title || !content || !authorId) {
      return res.status(400).json({
        success: false,
        error: "Tittle, content, authorId are required",
      });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        authorId,
        excerpt,
        image,
        tags: tags || [],
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error: any) {
    console.error("Error creating post:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        error: "Post with this slug already exist",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create post",
    });
  }
};

const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, tags, image, status, featured } = req.body;

    if (typeof id !== "string" || id.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Id is required",
      });
    }
    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        excerpt,
        tags,
        image,
        status,
        featured,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error: any) {
    console.error("Error updating post:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Post net found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update post",
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string" || id.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Id is required",
      });
    }

    const post = await prisma.post.delete({
      where: { id },
    });

    res.status(204).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting post:", error);

    if (error.code === "P2") {
      res.status(404).json({
        success: true,
        error: "Post not found",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to delete post",
    });
  }
};

export {
  getAllPosts,
  getPublishedPosts,
  getFeaturedPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
};
