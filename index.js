const express = require("express");
const mongoose = require("mongoose");
const projectRouter = require("./routes/ProjectRoutes.js");

const app = express();
app.use(express.json()); // Make sure it comes back as json

//TODO - Replace you Connection String here
// mongoose
//   .connect(
//     "mongodb+srv://dhruvatreja:dhruvshubhrA1@cluster0.4a8oloa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   )
//   .then((success) => {
//     console.log("Success Mongodb connection");
//   })
//   .catch((err) => {
//     console.log("Error Mongodb connection");
//     console.log(err);
//   });

app.use(projectRouter);

app.listen(8081, () => {
  console.log("Server is running...");
});
