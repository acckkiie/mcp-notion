export interface DatabaseOutput {
  object: "database";
  id: string;
  created_time: string;
  last_edited_time: string;
  title: any[];
  properties: Record<string, any>;
  content_saved_to?: string;
}
