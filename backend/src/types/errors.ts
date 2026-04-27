export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors: { field: string; message: string }[]) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}
