/**
 * Global Error Handler Middleware
 * 
 * Catches all errors from controllers/services and returns
 * consistent error responses to the client
 */

const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error('❌ Unhandled Error:', {
    message: err.message,
    status: err.statusCode || 500,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Determine status code
  const statusCode = err.statusCode || (err.status) || 500;

  // Handle database errors
  let message = err.message || 'Internal Server Error';
  
  if (err.code === 'ER_DUP_ENTRY') {
    message = 'Duplicate entry: Record already exists';
  } else if (err.code === 'ER_NO_REFERENCED_ROW') {
    message = 'Foreign key constraint violation';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    message = 'Referenced record not found';
  } else if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    message = 'Database connection lost';
  } else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
    message = 'Database connection error';
  } else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_EARLY_EOF') {
    message = 'Database connection closed early';
  }

  // Format response
  const response = {
    success: false,
    message: message,
    timestamp: new Date().toISOString()
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.originalError = err.code || err.name;
  }

  // Send response
  res.status(statusCode).json(response);
};

module.exports = errorHandler;
