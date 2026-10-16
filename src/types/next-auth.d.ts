// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "DISTRICT" | "DIVISION";
      divisionName: string | null;
      username: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: "DISTRICT" | "DIVISION";
    divisionName: string | null;
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "DISTRICT" | "DIVISION";
    divisionName: string | null;
    username: string;
  }
}