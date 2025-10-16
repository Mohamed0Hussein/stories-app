import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("storiesDB");

  const now = new Date();
  const stories = await db
    .collection("stories")
    .find({ expiresAt: { $gt: now } })
    .sort({ uploadedAt: -1 })
    .toArray();

  return NextResponse.json(stories);
}

export async function POST(request: Request) {
  const body = await request.json();
  const client = await clientPromise;
  const db = client.db("storiesDB");

  const uploadedAt = new Date(body.uploadedAt);
  const expiresAt = new Date(uploadedAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  const story = {
    img: body.img,
    uploadedAt,
    expiresAt,
  };
  const result = await db.collection("stories").insertOne(story);

  await db.collection("stories").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  return NextResponse.json({ _id: result.insertedId, ...story });
}

export async function DELETE(request: Request) {
  const client = await clientPromise;
  const db = client.db("storiesDB");
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "Missing story id" }, { status: 400 });
  }

  const result = await db.collection("stories").deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 1) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }
}
