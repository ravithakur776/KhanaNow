export const sendResponse = (res, statusCode, message, data, pagination) => {
    return res.status(statusCode).json({
        success: statusCode >= 200 && statusCode < 300,
        statusCode,
        message,
        data: data !== undefined ? data : null,
        ...(pagination && { pagination }),
    });
};
