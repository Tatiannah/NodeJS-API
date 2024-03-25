import express from "express";
import routes from "./routes.js";
import cors from "cors";

const corsOptions = {
    origin:'*', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
};

const app = express();
const PORT = 3000;
app.use(cors(corsOptions)); 
app.use(express.json());
app.use(routes);

// Error Handling
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
    });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));