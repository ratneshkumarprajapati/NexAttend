import { Router } from "express";
import { deviceController } from "../controller/device.controller.js";
import { authMiddleware } from "../../auth/middleware/auth.middleware.js";

const router=Router();

//register
router.post("/register",authMiddleware,deviceController.register)
router.get("/",authMiddleware,deviceController.getMyDevice)

export default router;