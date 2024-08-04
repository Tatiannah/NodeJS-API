import { validationResult, matchedData } from "express-validator";
import DB from "./database.js";

const validation_result = validationResult.withDefaults({
    formatter: (error) => error.msg,
});

class Controller {
    static validation = (req, res, next) => {
        const errors = validation_result(req).mapped();
        if (Object.keys(errors).length) {
            return res.status(422).json({
                ok: 0,
                status: 422,
                errors,
            });
        }
        next();
    };

    static create = async (req, res, next) => {
        const { numEtudiant,nom, moyenne } = matchedData(req);
        try {
            const [result] = await DB.execute(
                "INSERT INTO `etudiant` (`numEtudiant`,`nom`,`moyenne`,`observation`) VALUES (?,?,?,CASE WHEN ? < 5 THEN 'exclu' WHEN ? <10 AND ? >=5 THEN 'redoublant' WHEN ? >= 10 THEN 'admis' END)",
                [parseInt(numEtudiant),nom,parseInt(moyenne),moyenne,moyenne,moyenne,moyenne]
            );
            res.status(201).json({
                ok: 1,
                status: 201,
                message: "Student has been created successfully",
                post_id: result.insertId,
            });
        } catch (e) {
            next(e);
        }
    };

    static show_moyenne_stats = async (req, res, next) => {
        try {
            // Requête pour obtenir le maximum, la moyenne et le minimum des moyennes
            const sql = "SELECT MAX(moyenne) AS maximum, AVG(moyenne) AS moyenne, MIN(moyenne) AS minimum FROM `etudiant`";
    
            const [rows] = await DB.query(sql);
    
            // Vérifier si des données ont été renvoyées
            if (rows.length === 0) {
                return res.status(404).send("Aucune donnée de moyenne trouvée.");
            }
    
            // Extraire les valeurs maximum, moyenne et minimum
            const { maximum, moyenne, minimum } = rows[0];
    
            // Formater le texte brut
            const textResponse = `Statistiques des moyennes :\nMaximum: ${maximum}/20\nMoyenne de la classe: ${Math.round(moyenne)} (${moyenne})/20\nMinimum: ${minimum}/20 `;
    
            // Envoyer la réponse en tant que texte brut
            res.status(200).send(textResponse);
        } catch (e) {
            next(e);
        }
    };
    

    static show_posts = async (req, res, next) => {
        try {
            let sql = "SELECT * FROM `etudiant`  ORDER BY numEtudiant ASC";
            if (req.params.id) {
                sql = `SELECT * FROM etudiant WHERE numEtudiant=${req.params.id}`;
            }
            const [row] = await DB.query(sql);
            if (row.length === 0 && req.params.id) {
                return res.status(404).json({
                    ok: 0,
                    status: 404,
                    message: "Invalid Student ID.",
                });
            }
            const post = req.params.id ? { post: row[0] } : { posts: row };
            res.status(200).json({
                ok: 1,
                status: 200,
                ...post,
            });
        } catch (e) {
            next(e);
        }
    };

    static edit_post = async (req, res, next) => {
        try {
            const data = matchedData(req);
            const [row] = await DB.query("SELECT * FROM `etudiant` WHERE `numEtudiant`=?", [
                data.numEtudiant,
            ]);

            if (row.length !== 1) {
                return res.json({
                    ok: 0,
                    statu: 404,
                    message: "Invalid Student ID.",
                });
            }
            const post = row[0];
            console.log(row[0])
            //const date = new Date().toISOString();
            const nom = data.nom || post.nom;
            const moyenne = data.moyenne || post.moyenne;

            await DB.execute(
                "UPDATE `etudiant` SET `nom`=?, `moyenne`=?,`observation`= CASE WHEN ? < 5 THEN 'exclu' WHEN ? <10 AND ? >=5 THEN 'redoublant' WHEN ? >= 10 THEN 'admis' END  WHERE `numEtudiant`=?",
                [nom,moyenne,moyenne,moyenne,moyenne,moyenne,data.numEtudiant]
            );
            res.json({
                ok: 1,
                status: 200,
                message: "Post Updated Successfully",
            });
        } catch (e) {
            next(e);
        }
    };

    static delete_post = async (req, res, next) => {
        try {
            const [result] = await DB.execute(
                "DELETE FROM `etudiant` WHERE `numEtudiant`=?",
                [req.body.numEtudiant]
            );
            
            if (result.affectedRows) {
                return res.json({
                    ok: 1,
                    status: 200,
                    message: "Student has been deleted successfully.",
                });
            }
            res.status(404).json({
                ok: 0,
                status: 404,
                message: "Invalid Student ID.",
            });
        } catch (e) {
            next(e);
        }
    };
}

export default Controller;