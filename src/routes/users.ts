import { Router } from "express";
import { getAllUser, getUserById } from "../controller/userController";

const router: Router = Router();

router.get("/", getAllUser);
router.get("/:id", getUserById);

export default router;
