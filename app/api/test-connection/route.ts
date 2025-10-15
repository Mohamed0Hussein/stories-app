import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("storiesDB");
    const result = await db.collection("stories").insertOne({test:'tree'});
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      status: "connected",
      collections: collections.map(c => c.name),
    });
  } catch (error: any) {
    console.error("MongoDB connection failed:", error);
    return NextResponse.json({ status: "failed", error: error.message });
  }
}
