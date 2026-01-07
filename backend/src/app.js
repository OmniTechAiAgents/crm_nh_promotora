const express = require("express");
const app = express();
app.use(express.json());

const authRoutes = require("./routes/AuthRoutes");

app.use('/auth', authRoutes);

app.listen(3000, () => {
    console.log("rodando....")
})