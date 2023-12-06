const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

//Alternative method:
//Using Try Catch Block instead of PROMISE

// const asyncHandler1 = () => {}
// const asyncHandler2 = (func) => {()=>{}}
// const asyncHandler3 = (func) => {async()=>{}}

// Using try Catch
// const asyncHandler = (fn) = async (req, res, next)=>{
//     try {

//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
