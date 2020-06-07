import express from "express";

const port = 80;

const app = express();

app.use("/", express.static("app"));

app.listen(port, function () {
    console.log("Listening on port " + port);
});
