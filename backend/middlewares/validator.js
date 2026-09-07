// middleware/validate.js
import APIError from '../utils/apiError.js';

const validate = (schema, source = 'body') => (req, res, next) => {
  const data = source === 'params' ? req.params : req.body;
  const results = schema.safeParse(data);
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
  if (source === 'params') {
    req.params = results.data;
  } else {
    req.body = results.data;
  }
  next();
};

export const validateParams = (schema) => validate(schema, 'params');

export default validate;
