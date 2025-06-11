import { Client, Account, Databases, ID, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

const account = new Account(client);
const databases = new Databases(client);

const deleteSession = async () => {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
};

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID as string;
const STUDENTS_COLLECTION_ID = process.env
  .NEXT_PUBLIC_STUDENTS_COLLECTION_ID as string;

export {
  client,
  account,
  databases,
  ID,
  deleteSession,
  Query,
  DATABASE_ID,
  STUDENTS_COLLECTION_ID,
};
