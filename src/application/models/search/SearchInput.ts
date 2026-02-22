export interface SearchInput {
  query: string;
  filter?: {
    value: "page" | "database";
    property: "object";
  };
  sort?: {
    direction: "ascending" | "descending";
    timestamp: "last_edited_time";
  };
  start_cursor?: string;
  page_size?: number;
}
