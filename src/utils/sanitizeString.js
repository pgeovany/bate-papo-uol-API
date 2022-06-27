import { stripHtml } from "string-strip-html";

// strips HTML and trims the string
function sanitizeString(str) {
  return stripHtml(str).result;
}

export default sanitizeString;
