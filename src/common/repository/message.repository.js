import * as baseDB from "./db.repository.js"
import { MessageModel } from './../../DB/model/message.model.js';



// create
export const create = async ({
    data = [{}],
    options = { validateBeforeSave: true }
} = {}) => {
    return baseDB.create({model:MessageModel,data,options})
}


// createOne
export const createOne = async ({
    data = {},
    options = { validateBeforeSave: true }
} = {}) => {
    return baseDB.createOne({model:MessageModel,data,options})
}


// findOne
export const findOne = async ({
    filter = {},
    options = {}
} = {}) => {
    return baseDB.findOne({model:MessageModel,filter,options})
}



// findById
export const findById = async ({
    id,
    options = {},
} = {}) => {
    return baseDB.findById({model:MessageModel,id,options})
}


// find
export const find = async ({
    filter = {},
    options = {},
} = {}) => {
    return baseDB.find({model:MessageModel,filter,options})
}



//count
export const countDocument = async ({
    filter = {},
} = {}) => {
    return baseDB.countDocument({model:MessageModel,filter})
};



//paginate
export const paginate = async ({
    filter = {},
    options = {},
    page = 1,
    limit = 5
} = {}) => {
    return baseDB.paginate({model:MessageModel,filter,options,page,limit})
};




// insertMany
export const insertMany = async ({
    data,
} = {}) => {
    return baseDB.insertMany({model:MessageModel,data})
}



// updateOne
export const updateOne = async ({
    filter,
    update,
    options,
} = {}) => {
    return baseDB.updateOne({model:MessageModel,filter,options,update})
}



// updateMany
export const findOneAndUpdate = async ({
    filter,
    update,
    options,
} = {}) => {
    return baseDB.findOneAndUpdate({model:MessageModel,filter,options,update})
}



// findByIdAndUpdate
export const findByIdAndUpdate = async ({
    id,
    update,
    options = { new: true },
}) => {
    return baseDB.findByIdAndUpdate({model:MessageModel,id,options,update})
}



// findOneAndDelete
export const deleteOne = async ({
    filter,
} = {}) => {
    return baseDB.deleteOne({model:MessageModel,filter})
}


// findOneAndDelete
export const deleteMany = async ({
    filter,
} = {}) => {
    return baseDB.deleteMany({model:MessageModel,filter})
}


// findOneAndDelete
export const findOneAndDelete = async ({
    filter,
} = {}) => {
    return baseDB.findOneAndDelete({model:MessageModel,filter})
}


