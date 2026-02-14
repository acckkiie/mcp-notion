export interface RetrieveBlockChildrenInput {
  block_id: string;
  start_cursor?: string;
  page_size?: number;
  save_to_file?: boolean;
}
