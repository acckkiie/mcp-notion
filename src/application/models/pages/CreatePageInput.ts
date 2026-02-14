export interface CreatePageInput {
  parent: {
    type: "page_id" | "database_id" | "workspace";
    page_id?: string;
    database_id?: string;
  };
  properties?: Record<string, any>;
  children?: any[];
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
