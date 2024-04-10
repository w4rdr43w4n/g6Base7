
import { db } from "@/app/lib/db";
import { NextResponse, NextRequest } from "next/server";

async function handler(req: Request) {
  try {
    const { token, email } = await req.json();
    const getDbToken = await db.user.findUnique({
      where: {
        email: email,
      },
      select: {
        token: true,
        expirationTime: true,
        isVerified: true,
      },
    });
    if (getDbToken?.isVerified)
      return Response.json({ token: token }, { status: 200 });
    const now = new Date();
    if (getDbToken?.token === token) {
      if (getDbToken && getDbToken.expirationTime)
        if (now > getDbToken.expirationTime) {
          return Response.json({ error: "Token Expired" }, { status: 226 });
        } else {
          await db.user.update({
            where: {
              email: email,
            },
            data: {
              emailVerified: now,
              isVerified: true,
            },
          });
          return Response.json({ token: token }, { status: 200 });
        }
    } else {
      return Response.json(
        { message: "Somthing went wrong, user not verified" },
        { status: 226 }
      );
    }
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export { handler as GET, handler as POST };
