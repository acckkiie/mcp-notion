export interface UpdatePageInput {
  page_id: string;
  properties?: Record<string, any>;
  archived?: boolean;
  icon?: {
    type: "emoji" | "external" | "file";
    emoji?: string;
    external?: { url: string };
  };
  cover?: {
    type: "external";
    external: { url: string };
  };
  file_path?: string;
}
