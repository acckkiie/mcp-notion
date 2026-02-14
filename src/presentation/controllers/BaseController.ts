import type { Result } from "../../domain/types/index.js";
import { Presenter } from "../presenters/index.js";

/**
 * Base Controller
 * Provides common functionality for extract parameter handling
 */
export abstract class BaseController {
  /**
   * Handle tool call with extract support
   * @param args Arguments containing potential extract parameter
   * @param handler Function that executes the actual interactor logic
   * @returns MCP response
   */
  protected async handleWithExtract<T, E extends Error>(
    args: any,
    handler: (args: any) => Promise<Result<T, E>>,
  ): Promise<any> {
    // Extract extract parameter
    const extract = args.extract;
    delete args.extract;

    // Execute handler
    const result = await handler(args);
    return Presenter.fromResult(result, extract);
  }

  /**
   * Get available tools for this controller
   */
  abstract getTools(): any[];

  /**
   * Handle tool call
   */
  abstract handleToolCall(name: string, args: any): Promise<any>;
}
