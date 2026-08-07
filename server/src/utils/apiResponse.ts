import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  pagination?: PaginationMeta
): Response => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    message,
    data: data !== undefined ? data : null,
    ...(pagination && { pagination }),
  });
};
