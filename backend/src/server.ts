import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () =>
  console.log(`\n🚀 SubMinder Backend running on port ${PORT}`)
);

process.on("unhandledRejection", (err: Error) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err);
  server.close(() => process.exit(1));
});
