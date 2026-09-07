const bcrypt = require("bcryptjs");

(async () => {
  const users = [
    { role: "System Admin", password: "Admin@1234" },
    { role: "Municipal Admin - Abebe", password: "Abebe@123" },
    { role: "Municipal Admin - Aster", password: "Aster@123" },
    { role: "Municipal Admin - Dawit", password: "Dawit@123" },
    { role: "Municipal Admin - Tigist", password: "Tigist@123" },
    { role: "Collector", password: "Collect@123" }
  ];

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`${user.role}`);
    console.log(`Password : ${user.password}`);
    console.log(`Hash     : ${hash}`);
    console.log("------------------------------------------------");
  }
})();