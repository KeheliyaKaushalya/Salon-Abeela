const express = require('express');
const router = express.Router();
const { getInventory, createItem, updateItem, deleteItem, getLowStock } = require('../controllers/inventoryController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getInventory);
router.get('/low-stock', protect, adminOnly, getLowStock);
router.post('/', protect, adminOnly, createItem);
router.put('/:id', protect, adminOnly, updateItem);
router.delete('/:id', protect, adminOnly, deleteItem);

module.exports = router;
