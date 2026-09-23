"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
// =====================================================
// NOT FOUND (404) ROUTE HANDLER
// =====================================================
const notFoundMiddleware = (req, res) => {
    return res.status(httpStatusCodes_1.HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        requestId: req.id,
    });
};
exports.notFoundMiddleware = notFoundMiddleware;
exports.default = exports.notFoundMiddleware;
//# sourceMappingURL=notFound.middleware.js.map