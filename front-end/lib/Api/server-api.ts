import "server-only";
import axios from "axios";

const baseURL = process.env.API_URL;
const frontEndURL = process.env.FRONTEND_URL;

if(!baseURL || !frontEndURL){
  throw new Error("API_URL o FRONTEND_URL devono essere configurate nel file env di NEXT");
}

export const serverApi = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    Origin: frontEndURL,
    Referer: `${frontEndURL}`,
  },
  timeout: 3000,
  maxRedirects: 0,
  validateStatus: (status) => (status >= 200 && status < 300) || status === 401,
});
