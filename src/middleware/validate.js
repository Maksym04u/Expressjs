const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }));
            return res.status(400).json({ errors });
        }

        next();
    };
};

const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }));
            return res.status(400).json({ errors });
        }

        // Replace query with validated values
        req.query = value;
        next();
    };
};

module.exports = {
    validate,
    validateQuery
}; 