export interface QueryDatabaseInput {
  database_id: string;
  filter?: any;
  sorts?: any[];
  start_cursor?: string;
  page_size?: number;
  save_to_file?: boolean;
}
