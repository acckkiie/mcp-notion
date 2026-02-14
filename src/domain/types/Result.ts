/**
 * Result type for error handling
 * Represents either a successful result with a value or a failure with an error
 */
export type Result<T, E> = Success<T> | Failure<E>;

/**
 * Success result containing a value
 */
export class Success<T> {
  readonly kind = "success" as const;

  constructor(public readonly value: T) {}

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is never {
    return false;
  }
}

/**
 * Failure result containing an error
 */
export class Failure<E> {
  readonly kind = "failure" as const;

  constructor(public readonly error: E) {}

  isSuccess(): this is never {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }
}

/**
 * Helper function to create a successful result
 */
export function success<T>(value: T): Success<T> {
  return new Success(value);
}

/**
 * Helper function to create a failure result
 */
export function failure<E>(error: E): Failure<E> {
  return new Failure(error);
}
