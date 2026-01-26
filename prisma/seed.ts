import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
    await prisma.comment.deleteMany();

    console.log("Cleared existing data 🗑️");

    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: "admin@blog.coms",
          username: "admin",
          name: "Admin User",
          bio: "System Administrator",
          avatar: "https://i.pravatar.cc/150?img=1",
          role: "ADMIN",
        },
      }),

      prisma.user.create({
        data: {
          email: "john@blog.com",
          username: "johndoe",
          name: "John Doe",
          bio: "Senior Developer And Tech Writer",
          avatar: "https://i.pravatar.cc/150?img=2",
          role: "AUTHOR",
        },
      }),

      prisma.user.create({
        data: {
          email: "jane@blog.com",
          username: "janedoe",
          name: "Jane Doe",
          bio: "Frontend Specialist And UI/UX designer",
          avatar: "https://i.pravatar.cc/150?img=3",
          role: "AUTHOR",
        },
      }),

      prisma.user.create({
        data: {
          email: "reader@blog.com",
          username: "reader123",
          name: "Regular Reader",
          bio: "Enthusiastic Blog Reader",
          avatar: "https://i.pravatar.cc/150?img=4",
          role: "USER",
        },
      }),
    ]);

    console.log(`Created ${users.length} users`);

    const posts = await Promise.all([
      prisma.post.create({
        data: {
          title: "Getting Started With Typescript",
          slug: "getting-started-with-typescripts",
          content: "Typescript is a strongly typed programming language...",
          excerpt: "Learn How to Start Typescript In 2026",
          featured: true,
          image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
          authorId: users[1].id,
          tags: ["typescript", "programming", "web-dev"],
          views: 1250,
          status: "PUBLISHED",
          publishedAt: new Date("2024-01-15"),
        },
      }),

      prisma.post.create({
        data: {
          title: "Building REST API With Express",
          slug: "building-rest-api-wit-express",
          content:
            "Express.js is a minimal and flexible node.js web application framework...",
          excerpt: "Complete guide to build REST API  With Express",
          image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
          authorId: users[2].id,
          tags: ["express.js", "node.js", "api", "backend"],
          views: 980,
          status: "PUBLISHED",
          publishedAt: new Date("2024-01-10"),
        },
      }),

      prisma.post.create({
        data: {
          title: "Database Design Best Practices",
          slug: "database-design-best-practice",
          content:
            "Good database design is crucial for application performance...",
          excerpt: "Learn database design pattern and best practices",
          image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
          authorId: users[1].id,
          tags: ["database", "postgressql", "prisma"],
          views: 750,
          status: "PUBLISHED",
          publishedAt: new Date("2024-01-05"),
        },
      }),

      prisma.post.create({
        data: {
          title: "Draft: Advance Prisma Feature",
          slug: "advance-prism-feature",
          content: "This is a draft article about advanced prisma features...",
          excerpt: "Coming soon: Advance Prisma techniques",
          authorId: users[2].id,
          status: "DRAFT",
        },
      }),
    ]);

    console.log(`Created ${posts.length} posts`);

    const comments = await Promise.all([
      prisma.comment.create({
        data: {
          content: "Great article!! Very helpful for beginners",
          authorId: users[3].id,
          postId: posts[0].id,
          status: "APPROVED",
        },
      }),

      prisma.comment.create({
        data: {
          content:
            "Thanks for the detailed examples. Can you add more about decorators?",
          authorId: users[3].id,
          postId: posts[0].id,
          status: "APPROVED",
        },
      }),

      prisma.comment.create({
        data: {
          content: "Express is the best framework for Node.js APIs",
          authorId: users[0].id,
          postId: posts[1].id,
          status: "APPROVED",
        },
      }),

      prisma.comment.create({
        data: {
          content: "Nice post! When will part 2 be available?",
          authorId: users[3].id,
          postId: posts[2].id,
          status: "PENDING",
        },
      }),

      prisma.comment.create({
        data: {
          content: "Prisma has really improved my development workflow.",
          authorId: users[1].id,
          postId: posts[3].id,
          status: "APPROVED",
        },
      }),

      prisma.comment.create({
        data: {
          content: "How does it compare to typeORM in your experience?",
          authorId: users[2].id,
          postId: posts[3].id,
          status: "APPROVED",
        },
      }),
    ]);
    console.log(`Created ${comments.length} comments`);

    const threadedReplies = await Promise.all([
      prisma.comment.create({
        data: {
          content: "I agree! The typescript example is essentially clears",
          authorId: users[2].id,
          postId: posts[0].id,
          parentId: comments[0].id,
          status: "APPROVED",
        },
      }),

      prisma.comment.create({
        data: {
          content: "Seconding this! A decorators tutorial will be amazing",
          authorId: users[0].id,
          postId: posts[0].id,
          parentId: comments[1].id,
          status: "APPROVED",
        },
      }),

      prisma.comment.create({
        data: {
          content:
            "I actually wrote about decorator last week. Check my profile.",
          authorId: users[1].id,
          postId: posts[0].id,
          parentId: comments[1].id,
          status: "APPROVED",
        },
      }),

      prisma.comment.create({
        data: {
          content:
            "Have you tried Fastify? i find it performs better for JSON APIs.",
          authorId: users[2].id,
          postId: posts[1].id,
          parentId: comments[2].id,
          status: "APPROVED",
        },
      }),

      prisma.comment.create({
        data: {
          content:
            "Fastify is great, but Express have a better Middleware ecosystem.",
          authorId: users[3].id,
          postId: posts[1].id,
          parentId: comments[2].id,
          status: "APPROVED",
        },
      }),

      prisma.comment.create({
        data: {
          content: "TypeORM is good, but prisma has better type safe IMO",
          authorId: users[1].id,
          postId: posts[3].id,
          parentId: comments[5].id,
          status: "APPROVED",
        },
      }),

      prisma.comment.create({
        data: {
          content: "Prisma Studio UI is a game-changer too!",
          authorId: users[0].id,
          postId: posts[3].id,
          parentId: comments[5].id,
          status: "APPROVED",
        },
      }),
    ]);

    console.log(`Created ${threadedReplies.length} threaded replies.`);

    const deepReplies = await Promise.all([
      prisma.comment.create({
        data: {
          content:
            "Actually, I think both have their strength. It depends on the project.",
          authorId: users[3].id,
          postId: posts[1].id,
          parentId: threadedReplies[3].id,
          status: "APPROVED",
        },
      }),
    ]);
  } catch (error) {
    console.error("Error seeding database", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
