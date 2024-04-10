import axios from "axios";
import URLS from "../config/urls";

export const login = async (username: string, password: string) => {
  const response = await axios.post(URLS.endpoints.login, {
    usr: username,
    pwd: password,
  });
  return response;
};

export const verifyUser = async (token: string, email: string) => {
  const verifyState = await axios.post(URLS.endpoints.verify_endpoint, { token, email });
  return verifyState;
};

export async function resetToken(email: string) {
  try{
    const resp = await axios.post(URLS.endpoints.expired, { email:email });
    return resp
  } catch(error:any){
    return error
  } 
}
