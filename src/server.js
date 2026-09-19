
require("dotenv").config({ override: true });

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 ZereQueue server running on port ${PORT}`);
});