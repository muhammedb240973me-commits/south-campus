// src/app/api/students/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const campus = searchParams.get("campus");
  const isCalled = searchParams.get("isCalled");
  const profsummitStatus = searchParams.get("profsummitStatus");
  
  // NEW: Check if this is an export request
  const isExport = searchParams.get("export") === "true";
  
  let division = searchParams.get("division");
  if (session.user.role === "DIVISION") {
    division = session.user.divisionName;
  }

  const where: any = {};
  if (division) where.division = division;
  if (campus) where.campus = { contains: campus, mode: "insensitive" };
  if (isCalled === "true") where.isCalled = true;
  if (isCalled === "false") where.isCalled = false;
  if (profsummitStatus) where.profsummitStatus = profsummitStatus;

  try {
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        // If it's an export, skip pagination and fetch everything matching the filter
        ...(isExport ? {} : { skip: (page - 1) * limit, take: limit }),
        orderBy: { name: "asc" },
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      data: students,
      meta: { total, page, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, isCalled, isRegistered, profsummitStatus } = body;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...(isCalled !== undefined && { isCalled }),
        ...(isRegistered !== undefined && { isRegistered }),
        ...(profsummitStatus !== undefined && { profsummitStatus }),
        updatedBy: session.user.username,
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}