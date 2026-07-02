export type DocumentStatus = "queued" | "ready" | "processing" | "failed"
export interface ParsedText {
  text: string;
  metadata: {
    fileName: string;
    source: string;
    fileType: "pdf" | "txt" | "docx";
    charCount: number;
  };
}