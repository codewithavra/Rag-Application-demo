/**
 * Node Imports
 */

import mamoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { readFile } from "node:fs/promises";

/**
 * Other Imports
 */
import type { ParsedText } from "../types";

/**
 * @description user can give .pdf .txt .docx
 * @description for .pdf we can use pdf-parse
 * @description for .docx we can use mamoth
 */

export const fileParser = async (
  fileName: string,
  source: string,
  fileType: "pdf" | "txt" | "docx",
): Promise<ParsedText> => {
  let text = "";
  switch (fileType) {
    case "pdf": {
      const result = new PDFParse(source);
      text = (await result.getText()).text;
      break;
    }
    case "txt": {
      text = await readFile(source, { encoding: "utf-8" });
      break;
    }
    case "docx": {
      const result = await mamoth.extractRawText({ path: source });
      text = result.value;
      break;
    }
    default: {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  }
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    text,
    metadata: {
      fileName,
      fileType,
      source,
      charCount: text.length,
    },
  };
};
