import { Router } from "express";
import { adminMiddleware, authMiddleware } from "../../auth/middleware/auth.middleware.js";
import { userController } from "../controller/user.controller.js";


const router = Router();

router.post(
  "/bulk-students",
  authMiddleware,
  adminMiddleware,
  userController.bulkCreateStudents
);
router.post("/", userController.create);
router.get("/", userController.getAll);
router.get("/:id", userController.getOne);
router.put("/:id", userController.update);
router.delete("/:id", userController.delete);

export default router;
