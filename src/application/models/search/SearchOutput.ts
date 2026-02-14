export interface SearchOutput {
  object: "list";
  results: any[];
  next_cursor: string | null;
  has_more: boolean;
  content_saved_to?: string;
}
