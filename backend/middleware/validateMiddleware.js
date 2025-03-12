const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors) {
      res.status(400).json({ message: error.errors.map(err => err.message) });
    } else {
      res.status(400).json({ message: error.message || "Validation Error" });
    }
  }
};

module.exports = validate;
