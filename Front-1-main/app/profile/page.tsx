import { options } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import KEYS from "../config/config";
import React from "react";

export default function Page() {
  /*const resp = await Import('ward','wardrawan535@gmail.com','out')
  console.log(resp)*/
  const session = getServerSession(options);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/profile");
  }



  return (
    <>
      <h1>Profile</h1>
    </>
  );
}
