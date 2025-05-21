const Joi = require('joi');

const createPostSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title cannot exceed 100 characters',
            'any.required': 'Title is required'
        }),
    content: Joi.string()
        .min(10)
        .required()
        .messages({
            'string.min': 'Content must be at least 10 characters long',
            'any.required': 'Content is required'
        })
});

const updatePostSchema = Joi.object({
    title: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'Title must be at least 3 characters long',
            'string.max': 'Title cannot exceed 100 characters'
        }),
    content: Joi.string()
        .min(10)
        .messages({
            'string.min': 'Content must be at least 10 characters long'
        })
}).min(1).messages({
    'object.min': 'At least one field (title or content) must be provided for update'
});

const querySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.min': 'Page must be at least 1'
        }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(5)
        .messages({
            'number.base': 'Limit must be a number',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 50'
        })
});

module.exports = {
    createPostSchema,
    updatePostSchema,
    querySchema
}; 