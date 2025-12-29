const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Auth validations
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['admin', 'project_manager', 'member']).withMessage('Invalid role'),
    validate
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

const forgotPasswordValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    validate
];

const resetPasswordValidation = [
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
];

// Task validations
const createTaskValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Task title is required')
        .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('description')
        .optional()
        .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
    body('type')
        .optional()
        .isIn(['task', 'bug', 'story', 'epic', 'subtask']).withMessage('Invalid task type'),
    body('status')
        .optional()
        .isIn(['todo', 'doing', 'review', 'done']).withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['lowest', 'low', 'medium', 'high', 'highest']).withMessage('Invalid priority'),
    body('storyPoints')
        .optional()
        .isIn([0, 1, 2, 3, 5, 8, 13, 21]).withMessage('Invalid story points'),
    validate
];

// Project validations
const createProjectValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Project name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required'),
    body('key')
        .optional()
        .isLength({ max: 10 }).withMessage('Project key cannot exceed 10 characters')
        .matches(/^[A-Z0-9]+$/).withMessage('Project key must be uppercase alphanumeric'),
    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    createTaskValidation,
    createProjectValidation
};
