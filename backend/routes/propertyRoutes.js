const express = require('express');
const { getProperties, getProperty, createProperty, updateProperty, deleteProperty } = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', getProperties);
router.get('/:id', getProperty);
router.post('/', protect, authorize('admin', 'owner'), createProperty);
router.put('/:id', protect, authorize('admin', 'owner'), updateProperty);
router.delete('/:id', protect, authorize('admin', 'owner'), deleteProperty);

module.exports = router;
