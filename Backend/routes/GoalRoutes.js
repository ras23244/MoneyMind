const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const GoalController = require('../controllers/GoalController');
const { body } = require('express-validator');

router.get('/get-goals', protect, GoalController.getGoals);

router.post('/create-goal', protect, [
    body("title").notEmpty().withMessage("Title is required"),
    body("targetAmount")
        .isFloat({ gt: 0 })
        .withMessage("Target amount must be greater than 0"),
    body("currentAmount")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Current amount cannot be negative"),
    body("startDate").isISO8601().withMessage("Invalid start date"),
    body("endDate").isISO8601().withMessage("Invalid end date"),
], GoalController.createGoal);


router.put('/update-goal/:id', protect, GoalController.updateGoal);

router.delete('/delete-goal/:id', protect, GoalController.deleteGoal);

module.exports = router;