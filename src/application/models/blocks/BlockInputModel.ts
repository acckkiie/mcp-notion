import type { RichTextInput } from "./RichTextInputModel.js";

export interface BlockInput {
  type:
    | "paragraph"
    | "heading_1"
    | "heading_2"
    | "heading_3"
    | "to_do"
    | "bulleted_list_item"
    | "numbered_list_item";
  paragraph?: {
    rich_text: RichTextInput[];
    color?: string;
  };
  heading_1?: {
    rich_text: RichTextInput[];
    color?: string;
  };
  heading_2?: {
    rich_text: RichTextInput[];
    color?: string;
  };
  heading_3?: {
    rich_text: RichTextInput[];
    color?: string;
  };
  to_do?: {
    rich_text: RichTextInput[];
    checked?: boolean;
    color?: string;
  };
  bulleted_list_item?: {
    rich_text: RichTextInput[];
    color?: string;
  };
  numbered_list_item?: {
    rich_text: RichTextInput[];
    color?: string;
  };
}
