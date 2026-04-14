import app from "./src/app.js";
import mongoose from "mongoose";
import config from "./src/configs/config.js";

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`)
})

mongoose.connect(config.MONGO_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch((err) => {
    console.log(err);
    process.exit(1)
  });