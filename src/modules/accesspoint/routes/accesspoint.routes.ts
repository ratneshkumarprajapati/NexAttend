
import { Router } from "express";
import { accessPointController } from "../controller/accesspoint.controller.js";

const router = Router();

router.post("/", accessPointController.create);
router.get("/", accessPointController.getAll);
router.get("/:id", accessPointController.getById);
router.put("/:id", accessPointController.update);
router.delete("/:id", accessPointController.delete);

export default router;