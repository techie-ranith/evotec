import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

type RequestPart = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join('; ');
      res.status(400).json({ message });
      return;
    }

    if (part === 'body') {
      req.body = result.data;
    } else if (part === 'query') {
      (req as Request & { validatedQuery?: unknown }).validatedQuery = result.data;
    } else {
      req.params = result.data as typeof req.params;
    }

    next();
  };
}
