export interface BlockOutput {
  object: "block";
  id: string;
  type: string;
  created_time: string;
  last_edited_time: string;
  has_children: boolean;
  archived: boolean;
  in_trash: boolean;
  content_saved_to?: string;
  [key: string]: any;
}
