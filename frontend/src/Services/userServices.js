import {BaseUrl} from "../config";
export const testing = async ()=>{
  const response = await fetch(`${BaseUrl}/`);
  if (!response.ok) throw new Error(`Server responded with ${response.status}`);
  return response.json();
}