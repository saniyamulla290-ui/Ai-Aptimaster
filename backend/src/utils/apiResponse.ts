import { Response } from 'express';

interface ApiResponseOptions {
    res: Response;
    statusCode?: number;
    success?: boolean;
    message?: string;
    data?: any;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        pages?: number;
    };
}

export const sendResponse = ({
    res,
    statusCode = 200,
    success = true,
    message = '',
    data = null,
    meta,
}: ApiResponseOptions): Response => {
    const response: any = { success, message };

    if (data !== null) response.data = data;
    if (meta) response.meta = meta;

    return res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    statusCode: number = 500,
    message: string = 'Internal Server Error',
    errors?: any
): Response => {
    const response: any = {
        success: false,
        message,
    };

    if (errors) response.errors = errors;

    return res.status(statusCode).json(response);
};
