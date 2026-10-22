// src/app/api/profsummit/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// Inside src/app/api/profsummit/route.ts

// Replace the GET function entirely:
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const search = searchParams.get("search");
  const campus = searchParams.get("campus");
  
  let division = searchParams.get("division");
  if (session.user.role === "DIVISION") {
    division = session.user.divisionName;
  }

  const where: any = {};
  if (division) where.division = division;
  if (campus) where.campus = campus;
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { mobile: { contains: search, mode: "insensitive" } },
      { campus: { contains: search, mode: "insensitive" } },
      { division: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [students, total] = await Promise.all([
      prisma.profsummitStudent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.profsummitStudent.count({ where }),
    ]);

    return NextResponse.json({ 
      data: students,
      meta: { total, page, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// ... Keep your existing PATCH function below

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, isMessageSent } = await req.json();
    const updatedStudent = await prisma.profsummitStudent.update({
      where: { id },
      data: { isMessageSent },
    });
    return NextResponse.json(updatedStudent);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}