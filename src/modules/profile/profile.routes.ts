import { Router } from "express";
import { profileController } from "./profile.controller.js";

const router = Router();

router.post("/create", profileController.create);
router.get("/:userId", profileController.getByUserId); 
router.put("/:userId", profileController.update);

export default router;
