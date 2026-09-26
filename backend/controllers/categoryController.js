const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories with product counts
// @route   GET /api/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const products = await Product.find({}, 'category');

    const enriched = categories.map((cat) => {
      const count = products.filter(
        (p) => p.category && p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
      return {
        ...cat.toObject(),
        productCount: count,
      };
    });

    res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name',
      });
    }

    const trimmed = name.trim();
    const existing = await Category.findOne({ name: { $regex: `^${trimmed}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category '${trimmed}' already exists`,
      });
    }

    const category = await Category.create({
      name: trimmed,
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) {
      const trimmed = name.trim();
      const existing = await Category.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: `^${trimmed}$`, $options: 'i' },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Category '${trimmed}' already exists`,
        });
      }
      category.name = trimmed;
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if products are assigned
    const inUse = await Product.findOne({
      category: { $regex: `^${category.name}$`, $options: 'i' },
    });
    if (inUse) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category '${category.name}' because products are currently assigned to it`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
