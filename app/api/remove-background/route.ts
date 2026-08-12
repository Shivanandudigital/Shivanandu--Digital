import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 30 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(request: Request) {
  const apiKey = process.env.PHOTOROOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "PhotoRoom API key is not configured." }, { status: 503 });
  }

  try {
    const incomingForm = await request.formData();
    const image = incomingForm.get("image_file");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Please upload an image." }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(image.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP, HEIC, or HEIF images are supported." }, { status: 415 });
    }
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "The image must be smaller than 30 MB." }, { status: 413 });
    }

    const photoRoomForm = new FormData();
    photoRoomForm.append("image_file", image, image.name || "passport-photo.jpg");

    const response = await fetch("https://sdk.photoroom.com/v1/segment", {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: photoRoomForm,
      cache: "no-store",
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("PhotoRoom background removal failed:", response.status, details);
      const message =
        response.status === 401 || response.status === 403
          ? "PhotoRoom API key is invalid or inactive."
          : response.status === 402 || response.status === 429
            ? "PhotoRoom free calls or account quota have been exhausted."
            : "PhotoRoom could not process this image.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const result = await response.arrayBuffer();
    return new NextResponse(result, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": "no-store, private",
      },
    });
  } catch (error) {
    console.error("PhotoRoom server route failed:", error);
    return NextResponse.json({ error: "Background removal service is temporarily unavailable." }, { status: 500 });
  }
}
