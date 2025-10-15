import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("storiesDB");
  const stories = await db.collection("stories").find({}).sort({ uploadedAt: -1 }).toArray();

  return NextResponse.json(stories);
}

export async function POST(request: Request) {
  const body = await request.json();
  const client = await clientPromise;
  const db = client.db("storiesDB");

  const story = {
    img: body.img,
    uploadedAt: new Date(body.uploadedAt),
    endsAt: new Date(body.endsAt),
  };
  const result = await db.collection("stories").insertOne(story);
  return NextResponse.json({ _id: result.insertedId, ...story });
}
