import { Router } from "express";
import {
  createUser,
  getAllUser,
  getUserById,
} from "../controller/userController";

const router: Router = Router();

router.get("/", getAllUser);
router.get("/:id", getUserById);
router.get("/", createUser);

export default router;
