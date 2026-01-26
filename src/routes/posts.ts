import express from "express";
import { Router } from "express";
import { getAllPosts } from "../controller/postController";

const router: Router = Router();

router.get("/", getAllPosts);

export default router;
