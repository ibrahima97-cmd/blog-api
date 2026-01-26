import { Router } from "express";
import { getAllUser } from "../controller/userController";

const router = Router();

router.get("/", getAllUser);

export default router;
