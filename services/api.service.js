const StatusCodes = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

const successResponse = (res, status, data, msg) => {
    res.status(status).json({ success: true, data, msg });
};

const failureResponse = (res, status, data, msg) => {
    res.status(status).json({ success: false, data, msg });
};

const notFound = (res, msg = 'Resource not found!') => {
    res.status(StatusCodes.NOT_FOUND).json({ success: false, data: {}, msg });
};

const unauthorized = (res, msg = 'Unauthorized access!') => {
    res.status(StatusCodes.UNAUTHORIZED).json({ success: false, data: {}, msg });
};

const parameterMissing = (res, msg = 'Parameter missing') => {
    res.status(StatusCodes.BAD_REQUEST).json({ success: false, data: {}, msg });
};

const errorResponse = (res, error, msg = 'Something went wrong at server') => {
    if (error.kind === 'ObjectId') {
        return failureResponse(res, StatusCodes.BAD_REQUEST, {}, 'Malformed Url or Data not proper');
    }

    if (error.code === 11000) {
        return failureResponse(res, StatusCodes.BAD_REQUEST, {}, 'Duplicate entries not allowed');
    }

    failureResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, {}, msg);
};

module.exports = {
    StatusCodes,
    successResponse,
    failureResponse,
    notFound,
    unauthorized,
    parameterMissing,
    errorResponse
};
