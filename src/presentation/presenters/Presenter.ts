import type { Result } from "../../domain/types/index.js";
import { EXTRACT_NONE } from "../constants/index.js";

/**
 * Presenter
 * Handles MCP response generation
 */
export class Presenter {
  /**
   * Generate success response
   */
  static successResponse(data: any, extract?: string[]): any {
    let responseData = data;

    // Handle special "none" value - return all fields
    const effectiveExtract =
      extract && extract.length === 1 && extract[0] === EXTRACT_NONE ? undefined : extract;

    // extract 処理
    if (effectiveExtract && effectiveExtract.length > 0) {
      responseData = Presenter.extractFields(responseData, effectiveExtract);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(responseData, null, 2),
        },
      ],
    };
  }

  /**
   * Generate error response
   */
  static errorResponse(error: Error): any {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }

  /**
   * Convert Result to MCP response
   */
  static fromResult<T>(result: Result<T, Error>, extract?: string[]): any {
    if (result.isSuccess()) {
      return Presenter.successResponse(result.value, extract);
    }
    return Presenter.errorResponse(result.error);
  }

  /**
   * Extract specified fields from response data
   */
  private static extractFields(data: any, extract: string[]): any {
    if (Array.isArray(data)) {
      return data.map((item) => Presenter.extractFieldsFromObject(item, extract));
    }
    return Presenter.extractFieldsFromObject(data, extract);
  }

  /**
   * Extract fields from a single object (supports dot notation)
   */
  private static extractFieldsFromObject(obj: any, extract: string[]): any {
    const result: any = {};

    for (const field of extract) {
      if (field.includes(".")) {
        // Nested fields (e.g., "properties.title")
        const parts = field.split(".");
        let current = obj;
        let resultCurrent = result;

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current || !current[part]) break;

          if (!resultCurrent[part]) resultCurrent[part] = {};
          resultCurrent = resultCurrent[part];
          current = current[part];
        }

        const lastPart = parts[parts.length - 1];
        if (current && current[lastPart] !== undefined) {
          resultCurrent[lastPart] = current[lastPart];
        }
      } else {
        // Top-level field
        if (obj[field] !== undefined) {
          result[field] = obj[field];
        }
      }
    }

    return result;
  }
}
