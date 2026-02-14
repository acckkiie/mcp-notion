import type { BlockInput } from "./BlockInput.js";

export interface AppendBlockChildrenInput {
  block_id: string;
  children: BlockInput[];
  file_path?: string;
}
