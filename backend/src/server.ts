process.on("uncaughtException", (err: Error) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 8000;
<<<<<<< HEAD
// 👇 AJOUT CRUCIAL : On définit l'hôte (0.0.0.0 par défaut pour Docker/CI)
const HOST = process.env.HOST || "0.0.0.0";

// 👇 MODIFICATION : On passe HOST en 2ème argument
=======
const HOST = process.env.HOST || "0.0.0.0";
>>>>>>> 6228ca4b87c2eff6fafe9086e510d84da414bcfb
const server = app.listen(PORT, HOST, () =>
  console.log(`\n🚀 SubMinder Backend running on port ${PORT} and host ${HOST}`)
);

process.on("unhandledRejection", (err: Error) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err);
  server.close(() => process.exit(1));
});
