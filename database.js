import mysql from "mysql2";

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "etudiant",
});

export default connection.promise();