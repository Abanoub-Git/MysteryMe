import * as baseDB from "./db.repository.js";
import { RequestModel } from "../../DB/model/request.model.js";

// create
export const create = async ({
    data = [{}],
    options = { validateBeforeSave: true }
} = {}) => {
    return baseDB.create({ model: RequestModel, data, options });
};

// createOne
export const createOne = async ({
    data = {},
    options = { validateBeforeSave: true }
} = {}) => {
    return baseDB.createOne({ model: RequestModel, data, options });
};

// findOne
export const findOne = async ({
    filter = {},
    options = {}
} = {}) => {
    return baseDB.findOne({ model: RequestModel, filter, options });
};

// findById
export const findById = async ({
    id,
    options = {}
} = {}) => {
    return baseDB.findById({ model: RequestModel, id, options });
};

// find
export const find = async ({
    filter = {},
    options = {}
} = {}) => {
    return baseDB.find({ model: RequestModel, filter, options });
};

// count
export const countDocument = async ({
    filter = {}
} = {}) => {
    return baseDB.countDocument({ model: RequestModel, filter });
};

// paginate
export const paginate = async ({
    filter = {},
    options = {},
    page = 1,
    limit = 5
} = {}) => {
    return baseDB.paginate({ model: RequestModel, filter, options, page, limit });
};

// updateOne
export const updateOne = async ({
    filter,
    update,
    options
} = {}) => {
    return baseDB.updateOne({ model: RequestModel, filter, options, update });
};

// findOneAndUpdate
export const findOneAndUpdate = async ({
    filter,
    update,
    options
} = {}) => {
    return baseDB.findOneAndUpdate({ model: RequestModel, filter, options, update });
};

// findByIdAndUpdate
export const findByIdAndUpdate = async ({
    id,
    update,
    options = { new: true }
}) => {
    return baseDB.findByIdAndUpdate({ model: RequestModel, id, options, update });
};

// deleteOne
export const deleteOne = async ({
    filter
} = {}) => {
    return baseDB.deleteOne({ model: RequestModel, filter });
};
