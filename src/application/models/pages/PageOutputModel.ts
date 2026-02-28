export interface PageOutput {
  object: "page";
  id: string;
  created_time: string;
  last_edited_time: string;
  archived: boolean;
  properties: Record<string, any>;
  parent: any;
  url: string;
  content_saved_to?: string;
}
