const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.createDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });

exports.getAllDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (Model.collection.modelName === "Task") {
      filter = { user: req.user.id };
    }
    const doc = await Model.find(filter);
    if (doc.length === 0) return next(new AppError("No Data found", 404));
    res.status(200).json({
      status: "success",
      result: doc.length,
      data: doc,
    });
  });

exports.getDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = { _id: req.params.id };
    if (Model.collection.modelName === "Task") {
      filter = { ...filter, user: req.user.id };
    }
    const doc = await Model.findOne(filter);
    if (!doc) return next(new AppError("No Data Found", 404));
    res.status(200).json({ status: "success", data: doc });
  });

exports.updateDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = { _id: req.params.id };
    if (Model.collection.modelName === "Task") {
      filter = { ...filter, user: req.user.id };
    }
    const doc = await Model.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError("No Data Found to update", 404));
    res.status(200).json({ status: "success", data: doc });
  });
exports.deleteDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = { _id: req.params.id };
    if (Model.collection.modelName === "Task") {
      filter = { ...filter, user: req.user.id };
    }
    const doc = await Model.findOneAndDelete(filter);
    if (!doc) return next(new AppError("Data Not Found to delete", 404));
    res.status(204).json({ status: "success" });
  });

// module.exports = { createOne, getAll };
