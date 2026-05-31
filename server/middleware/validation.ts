import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger;'

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation failed', {
        url: req.originalUrl,
        errors
      });

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

// Common validation schemas
export const schemas = {
  // User schemas
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    role: Joi.string().valid('admin', 'manager', 'employee', 'viewer').required(),
    department_id: Joi.number().optional()
  }),

  updateUser: Joi.object({
    email: Joi.string().email(),
    first_name: Joi.string(),
    last_name: Joi.string(),
    role: Joi.string().valid('admin', 'manager', 'employee', 'viewer'),
    department_id: Joi.number(),
    is_active: Joi.boolean()
  }),

  // Department schemas
  department: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().alphanum().required(),
    description: Joi.string().allow('', null),
    manager_id: Joi.number(),
    parent_department_id: Joi.number(),
    budget: Joi.number().min(0)
  }),

  // Employee schemas
  employee: Joi.object({
    user_id: Joi.number().required(),
    employee_code: Joi.string().required(),
    phone: Joi.string(),
    address: Joi.string(),
    hire_date: Joi.date().required(),
    employment_type: Joi.string().valid('full-time', 'part-time', 'contract', 'intern'),
    salary: Joi.number().min(0),
    position: Joi.string(),
    manager_id: Joi.number()
  }),

  // Project schemas
  project: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    description: Joi.string().allow('', null),
    client_name: Joi.string(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref('start_date')),
    budget: Joi.number().min(0),
    status: Joi.string().valid('planning', 'active', 'on-hold', 'completed', 'cancelled'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    department_id: Joi.number(),
    manager_id: Joi.number()
  }),

  // Financial transaction schemas
  transaction: Joi.object({
    transaction_type: Joi.string().valid('income', 'expense').required(),
    category: Joi.string().required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().allow('', null),
    project_id: Joi.number(),
    department_id: Joi.number(),
    transaction_date: Joi.date().required(),
    notes: Joi.string().allow('', null)
  }),

  // Attendance schemas
  attendance: Joi.object({
    employee_id: Joi.number().required(),
    date: Joi.date().required(),
    check_in: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    check_out: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    status: Joi.string().valid('present', 'absent', 'late', 'half-day', 'leave', 'holiday'),
    notes: Joi.string().allow('', null)
  }),

  // Leave request schemas
  leaveRequest: Joi.object({
    employee_id: Joi.number().required(),
    leave_type: Joi.string().valid('annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid').required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref('start_date')).required(),
    days: Joi.number().integer().positive().required(),
    reason: Joi.string().allow('', null)
  }),

  // Performance review schemas
  performanceReview: Joi.object({
    employee_id: Joi.number().required(),
    reviewer_id: Joi.number().required(),
    review_period: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5),
    goals_achievement: Joi.number().integer().min(0).max(100),
    strengths: Joi.string().allow('', null),
    areas_for_improvement: Joi.string().allow('', null),
    comments: Joi.string().allow('', null),
    review_date: Joi.date()
  })
};
