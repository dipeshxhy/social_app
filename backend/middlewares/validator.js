// middleware/validate.js
import APIError from '../utils/apiError.js';

const validate = (schema) => (req, res, next) => {
  const results = schema.safeParse(req.body);
  if (!results.success) {
    let errors = results.error.flatten().fieldErrors;
    errors = Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [field, messages.join(', ')]),
    );

    return res.status(400).json({
      success: false,
      msg: 'Validation failed',
      errors,
    });
  }
  req.body = results.data;
  next();
};

export default validate;
