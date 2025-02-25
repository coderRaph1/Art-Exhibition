const errorHandler = (err, req, res, next) => {
  console.error(err)

  // Default status and message
  const status = err.status || err.statusCode || 500
  const message = err.msg || 'Internal Server Error'

  // In development, send more detailed error information
  if (process.env.NODE_ENV === 'development') {
    res.status(status).json({
      message,
      stack: err.stack,
    })
  } else {
    // In production, send only the error message
    res.status(status).json({ message })
  }
}

const notFound = (req, res, next) => {
  res.status(404).json({ message: 'Not Found' })
}

module.exports = { errorHandler, notFound }
