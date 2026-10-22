// src/app/api/profsummit/options/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let divisionFilter = {};
    if (session.user.role === "DIVISION") {
      divisionFilter = { division: session.user.divisionName };
    }

    const divisions = await prisma.profsummitStudent.findMany({
      distinct: ['division'],
      select: { division: true },
      orderBy: { division: 'asc' }
    });

    const campuses = await prisma.profsummitStudent.findMany({
      where: divisionFilter,
      distinct: ['campus', 'division'],
      select: { campus: true, division: true },
      orderBy: { campus: 'asc' }
    });

    return NextResponse.json({
      divisions: divisions.map((d: any) => d.division),
      campuses: campuses
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 });
  }
}