import express from "express";
import AuthRouters from "./routes/AuthRoutes.js";

const app = express();
app.use(express.json());

app.use('/auth', AuthRouters);

app.listen(3000, () => {
    console.log("rodando....")
})