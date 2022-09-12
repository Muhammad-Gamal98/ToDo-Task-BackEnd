require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

mongoose.connect(process.env.DATABASE).then(() => {
  console.log("Data Base Connected");
});
// .catch(() => {
//   process.exit(1);
// });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Lisiting on port ${port}`);
});
