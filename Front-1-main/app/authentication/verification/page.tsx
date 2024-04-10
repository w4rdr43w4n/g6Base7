"use client";
import { useEffect, useState } from "react";
import { verifyUser } from "@/app/lib/Auth";
import Notify from "@/components/Management/notification";
import URLS from "@/app/config/urls";

const VerifyPage: React.FC = () => {
  const [token, setToken] = useState<string | null>("");
  const [email, setEmail] = useState<string | null>("");
  const [isNotif, setIsNotif] = useState(false);
  const [urls, setUrls] = useState<any>([]);
  const [verifyMessage, setVerifyMessage] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const email = params.get("email");
    setToken(urlToken);
    setEmail(email);
  }, [token]);
  useEffect(() => {
    if (token && email) {
      verifyUser(token, email).then((verifyState) => {
        if (verifyState.status === 200) {
          setVerifyMessage("Verification done successfully");
          setIsNotif(true);
        } else if (verifyState.status === 226) {
          setUrls([
            {
              name: "Resend",
              link: URLS.endpoints.expired,
              data: { email: email },
            },
          ]);
          setVerifyMessage("Token Expired!");
          setIsNotif(true);
        } else {
          setVerifyMessage("Something went wrong, please try again later");
          setIsNotif(true);
        }
      });
    }
  }, [token, email]);
  return (
    <>
      {isNotif && (
        <Notify
          message={verifyMessage}
          actionUrls={urls}
          dur={30}
          display={setIsNotif}
        />
      )}
      <div className="layout">
        <p>Verification Processing...</p>
      </div>
    </>
  );
};
export default VerifyPage;
