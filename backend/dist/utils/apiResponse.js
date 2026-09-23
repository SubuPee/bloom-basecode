"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendPaginated = exports.sendCreated = exports.sendSuccess = void 0;
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
// =====================================================
// STANDARDIZED API RESPONSE ENVELOPE (Consistent Contract)
// =====================================================
const sendSuccess = (res, data = null, message = "Success", statusCode = httpStatusCodes_1.HTTP_STATUS.OK) => {
    const payload = {
        success: true,
        message,
        ...(data !== null && data !== undefined ? { data } : {}),
    };
    return res.status(statusCode).json(payload);
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, data = null, message = "Created successfully") => {
    return (0, exports.sendSuccess)(res, data, message, httpStatusCodes_1.HTTP_STATUS.CREATED);
};
exports.sendCreated = sendCreated;
const sendPaginated = (res, items = [], pagination = {}, message = "Records retrieved successfully") => {
    return res.status(httpStatusCodes_1.HTTP_STATUS.OK).json({
        success: true,
        message,
        data: {
            items,
            pagination: {
                total: pagination.total || 0,
                page: pagination.page || 1,
                limit: pagination.limit || 10,
                totalPages: pagination.totalPages || 1,
            },
        },
    });
};
exports.sendPaginated = sendPaginated;
const sendError = (res, message = "Error", statusCode = httpStatusCodes_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
    const response = {
        success: false,
        message,
    };
    if (errors) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
//# sourceMappingURL=apiResponse.js.map