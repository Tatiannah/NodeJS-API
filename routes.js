import { Router } from "express";
import { body, param } from "express-validator";
import Controller from "./Controller.js";

const routes = Router({ strict: true });

// Create Data
routes.post(
    "/create",
    [
        body("nom", "Must not be empty.").trim().not().isEmpty().escape(),
        body("moyenne", "Must not be empty.").trim().not().isEmpty().escape(),
       /* body("author", "Must not be empty.").trim().not().isEmpty().escape(),*/
    ],
    Controller.validation,
    Controller.create
);

// Read Data
routes.get("/posts", Controller.show_posts);
routes.get("/MinMaxMean", Controller.show_moyenne_stats);

routes.get(
    "/post/:id",
    [param("id", "Invalid Student ID.").exists().isNumeric().toInt()],
    Controller.validation,
    Controller.show_posts
);

// Update Data
routes.put(
    "/edit",
    [
        body("numEtudiant", "Invalid post ID").isNumeric().toInt(),
        body("nom", "Must not be empty.")
            .optional()
            .trim()
            .not()
            .isEmpty()
            .escape(),
        body("moyenne", "Must not be empty.")
            .isNumeric()
            .toInt(),
        
    ],
    Controller.validation,
    Controller.edit_post
);

// Delete Data
routes.post(
    "/delete",
    [
        body("numEtudiant", "Please provide a valid Student ID.")
            .exists()
            .isNumeric()
            .toInt(),
    ],
    Controller.validation,
    Controller.delete_post
);

export default routes;