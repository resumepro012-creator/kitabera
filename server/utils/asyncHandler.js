// Express 4 does not automatically forward rejected promises from async route
// handlers to the error-handling middleware. Every route is wrapped with this
// so a thrown/rejected error always reaches app.use((error, req, res, next) => ...)
// instead of hanging the request or crashing the process.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
