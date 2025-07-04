const bcrypt = require("bcrypt");

(async () => {
    const hash = await bcrypt.hash("aryan1234", 10);
    console.log("Pass:", hash);
})();



