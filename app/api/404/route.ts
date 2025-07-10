import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

export async function PUT(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}

export async function DELETE(request: NextRequest) {
  return NextResponse.redirect(new URL("/", request.url));
}
