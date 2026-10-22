// src/app/api/template/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

const DEFAULT_MESSAGE = `Hi {name},
⏳ *ഇനിയൊരു ദിവസം കൂടി മാത്രം*

🔥 *PROFSUMMIT 2026* തൊട്ടടുത്തെത്തിയിരിക്കുന്നു

🔹 50+ സെഷനുകൾ
🔹 Industry Experts-മായി സംവദിക്കാം
🔹 യാത്ര, ഭക്ഷണം, താമസം, സെഷനുകൾ തുടങ്ങി എല്ലാം തികച്ചും സൗജന്യം

🚌 *നാളെ (വെള്ളി) വൈകിട്ട്* ക്യാമ്പസുകളിൽ നിന്ന് PROFSUMMIT ബസുകൾ പുറപ്പെടുന്നു.

📢 സീറ്റുകൾ ഉടൻ ഉറപ്പാക്കൂ

🌐 Let's Profsummit – profsummit.in

📞 *Enquiries:*
{ameer name} - {ameer number}
{bus coordinator name} - {bus coordinator number}

© Campus Syndicate
SSF Kozhikode South`;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let template = await prisma.messageTemplate.findUnique({ where: { id: "default" } });
    
    if (!template) {
      template = await prisma.messageTemplate.create({
        data: { id: "default", content: DEFAULT_MESSAGE }
      });
    }
    return NextResponse.json({ content: template.content });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { content } = await req.json();
    const template = await prisma.messageTemplate.upsert({
      where: { id: "default" },
      update: { content },
      create: { id: "default", content },
    });
    return NextResponse.json({ content: template.content });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }
}