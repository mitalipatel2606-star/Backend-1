const asyncHandler = (requestHandler) => async (req, res, next) => {
    try {
        return await requestHandler(req, res, next)
    } catch (error) {
        next(error)
    }
}
export { asyncHandler }
//to creatwe a wrapper whihc can be reused to connect/talk to the db
// const asyncHandler = (requestHandler) =>
// (req, res, next) => {
// Promise. resolve(requestHandler(req, res, next)).
// catch((err) => next(err))
// }
