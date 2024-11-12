require("dotenv").config();
const app = require("./src/app");
const port = process.env.PORT || 3000;
const connectToDB = require("./src/utils/db");

connectToDB();

app.listen(port, () => {
  console.log(`Server is running on: http://localhost:${port}`);
});
