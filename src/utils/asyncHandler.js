const asyncHandler = (requestHandler) => async (req, res, next) => {
    try {
        await requestHandler(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
export { asyncHandler }
//to creatwe a wrapper whihc can be reused to connect/talk to the db
// const asyncHandler = (requestHandler) =>
// (req, res, next) => {
// Promise. resolve(requestHandler(req, res, next)).
// catch((err) => next(err))
// }