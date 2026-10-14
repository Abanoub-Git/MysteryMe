import * as baseDB from "./db.repository.js";
import { ConversationModel } from "../../DB/model/conversation.model.js";

// create
export const create = async ({
    data = [{}],
    options = { validateBeforeSave: true }
} = {}) => {
    return baseDB.create({ model: ConversationModel, data, options });
};

// createOne
export const createOne = async ({
    data = {},
    options = { validateBeforeSave: true }
} = {}) => {
    return baseDB.createOne({ model: ConversationModel, data, options });
};

// findOne
export const findOne = async ({
    filter = {},
    options = {}
} = {}) => {
    return baseDB.findOne({ model: ConversationModel, filter, options });
};

// findById
export const findById = async ({
    id,
    options = {}
} = {}) => {
    return baseDB.findById({ model: ConversationModel, id, options });
};

// find
export const find = async ({
    filter = {},
    options = {}
} = {}) => {
    return baseDB.find({ model: ConversationModel, filter, options });
};

// count
export const countDocument = async ({
    filter = {}
} = {}) => {
    return baseDB.countDocument({ model: ConversationModel, filter });
};

// paginate
export const paginate = async ({
    filter = {},
    options = {},
    page = 1,
    limit = 5
} = {}) => {
    return baseDB.paginate({ model: ConversationModel, filter, options, page, limit });
};

// updateOne
export const updateOne = async ({
    filter,
    update,
    options
} = {}) => {
    return baseDB.updateOne({ model: ConversationModel, filter, options, update });
};

// findOneAndUpdate
export const findOneAndUpdate = async ({
    filter,
    update,
    options
} = {}) => {
    return baseDB.findOneAndUpdate({ model: ConversationModel, filter, options, update });
};

// findByIdAndUpdate
export const findByIdAndUpdate = async ({
    id,
    update,
    options = { new: true }
}) => {
    return baseDB.findByIdAndUpdate({ model: ConversationModel, id, options, update });
};

// deleteOne
export const deleteOne = async ({
    filter
} = {}) => {
    return baseDB.deleteOne({ model: ConversationModel, filter });
};
