import { options } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
export default async function Page() {
  const session = getServerSession(options);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }
  return (
    <>
      <h3>Dashboard Page</h3>
    </>
  );
}
