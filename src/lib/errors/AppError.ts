export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly userMessage?: string;

  constructor(message: string, userMessage?: string, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.isOperational = isOperational;
    this.userMessage = userMessage;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, userMessage ?? message);
  }
}

export class PermissionError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(
      message,
      userMessage ?? "You do not have permission to perform this action.",
    );
  }
}

export class CommandError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(
      message,
      userMessage ?? "An error occurred while executing the command.",
    );
  }
}

export class InteractionError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(
      message,
      userMessage ?? "An error occurred while processing the interaction.",
    );
  }
}
