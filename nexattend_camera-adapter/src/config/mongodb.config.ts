import { MongoClient, type Collection, type Db, type Document } from "mongodb";
import type { AppConfig } from "./app.config.js";
import { logger } from "../utils/logger.js";

type MongoConfig = AppConfig["mongodb"];

let client: MongoClient | null = null;
let database: Db | null = null;
let connecting: Promise<Db> | null = null;

export async function getMongoDatabase(config: MongoConfig): Promise<Db> {
  if (!config.uri) {
    throw new Error("MONGODB_URI or FACE_MONGODB_URI is required for MongoDB storage");
  }

  if (database) return database;
  if (connecting) return connecting;

  connecting = connect(config);

  try {
    database = await connecting;
    return database;
  } finally {
    connecting = null;
  }
}

export async function getMongoCollection<T extends Document>(
  config: MongoConfig,
  collectionName: string,
): Promise<Collection<T>> {
  const db = await getMongoDatabase(config);
  return db.collection<T>(collectionName);
}

export async function closeMongoConnection(): Promise<void> {
  await client?.close();
  client = null;
  database = null;
  connecting = null;
}

function connect(config: MongoConfig): Promise<Db> {
  client = new MongoClient(config.uri);

  return client.connect().then((connectedClient) => {
    logger.info("MongoDB connection ready", {
      context: "MongoDB",
      database: config.database,
    });

    return connectedClient.db(config.database);
  });
}
