import { NextRequest, NextResponse } from "next/server";
import { withHandler } from "@/lib/server/errors";
import { getAuthUser } from "@/lib/server/auth";
import {
  getAboutUs,
  createOrUpdateAboutUs,
  deleteAboutUs,
} from "@/lib/server/services/about-enquiries";
import {
  parseFormDataFields,
  extractFiles,
  extractFilesByPrefix,
} from "@/lib/server/form-data";

export const runtime = "nodejs";

async function handleAboutUsWrite(request: NextRequest) {
  await getAuthUser(request);
  const formData = await request.formData();
  const body = parseFormDataFields(formData);
  const imageFiles = extractFiles(formData, "images");
  const teamMemberImages = extractFilesByPrefix(formData, "teamMemberImage_");

  const result = await createOrUpdateAboutUs(body, imageFiles, teamMemberImages);
  const status = result.message.includes("created") ? 201 : 200;
  return NextResponse.json(result, { status });
}

export async function GET(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await getAboutUs();
    return NextResponse.json(result);
  });
}

export async function POST(request: NextRequest) {
  return withHandler(() => handleAboutUsWrite(request));
}

export async function PUT(request: NextRequest) {
  return withHandler(() => handleAboutUsWrite(request));
}

export async function DELETE(request: NextRequest) {
  return withHandler(async () => {
    await getAuthUser(request);
    const result = await deleteAboutUs();
    return NextResponse.json(result);
  });
}
