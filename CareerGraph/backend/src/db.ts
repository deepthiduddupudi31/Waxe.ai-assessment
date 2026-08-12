import neo4j from "neo4j-driver";
import "dotenv/config";

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME || "cognodb";
const password = process.env.COGNODB_PASSWORD;

if (!uri || !password) {
  console.warn(
    "CognoDB environment variables are missing. API will report database unavailable."
  );
}

export const driver =
  uri && password
    ? neo4j.driver(uri, neo4j.auth.basic(username, password))
    : null;

export async function verifyDatabase() {
  if (!driver) return false;
  const session = driver.session();
  try {
    await session.run("RETURN 1 AS ok");
    console.log("CognoDB database connected.");
    return true;
  } catch {
    return false;
  } finally {
    await session.close();
  }
}
