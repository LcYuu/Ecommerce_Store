const ProductCategory = require("../models/productCategory");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");

const createCategory = asyncHandler(async (req, res) => {
  const { title, description, brand } = req.body;
  const image = req?.files?.image[0]?.path;
  if (!(title && description && brand)) throw new Error("Missing inputs");
  req.body.slug = slugify(title);
  const existingCategory = await ProductCategory.findOne({ title: title });
  if (existingCategory) {
    return res.status(409).json({
      success: false,
      mes: "Category already exists",
    });
  }
  if (image) req.body.image = image;
  const newCategory = await ProductCategory.create(req.body);
  return res.status(200).json({
    success: newCategory ? true : false,
    mes: newCategory
      ? "Created category successfully"
      : "Category creation failed",
  });
});
const getCategories = asyncHandler(async (req, res) => {
  const response = await ProductCategory.find();
  return res.json({
    success: response ? true : false,
    prodCategories: response ? response : "Cannot get product-category",
  });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  );
  const formatedQueries = JSON.parse(queryString);
  if (queries?.title)
    formatedQueries.title = { $regex: queries.title, $options: "i" };
  let queryObject = {};
  if (queries?.q) {
    delete formatedQueries.q;
    queryObject = {
      $or: [{ title: { $regex: queries.q, $options: "i" } }],
    };
  }
  const qr = { ...formatedQueries, ...queryObject };
  let queryCommand = ProductCategory.find(qr);
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }
  const page = +req.query.page || 1;
  const limit = +req.query.limit || process.env.LIMIT_PRODUCTS;
  const skip = (page - 1) * limit;
  queryCommand.skip(skip).limit(limit);
  queryCommand.exec(async (err, response) => {
    if (err) throw new Error(err.message);
    const counts = await ProductCategory.find(qr).countDocuments();
    return res.status(200).json({
      success: response ? true : false,
      counts,
      productCategories: response ? response : "Cannot get Categories",
    });
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const files = req?.files;
  if (files?.image) req.body.image = files?.image[0]?.path;
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  console.log("pcid: ", pcid);
  console.log("files", files);
  console.log("body: ", req.body);
  const updatedCategory = await ProductCategory.findByIdAndUpdate(
    pcid,
    req.body,
    {
      new: true,
    }
  );
  return res.json({
    success: updatedCategory ? true : false,
    mes: updatedCategory
      ? "Updated category successfully"
      : "Cannot update category",
  });
});
const deleteCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndDelete(pcid);
  return res.json({
    success: response ? true : false,
    deletedCategory: response ? response : "Cannot delete product-category",
  });
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getAllCategories,
};
