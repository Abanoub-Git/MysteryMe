import * as baseDB from "./db.repository.js"
import { UserModel } from './../../DB/model/user.model.js';



// create
export const create = async ({
    data = [{}],
    options = { validateBeforeSave: true }
} = {}) => {
    return baseDB.create({model:UserModel,data,options})
}


// createOne
export const createOne = async ({
    data = {},
    options = { validateBeforeSave: true }
} = {}) => {
    return baseDB.createOne({model:UserModel,data,options})
}


// findOne
export const findOne = async ({
    filter = {},
    options = {}
} = {}) => {
    return baseDB.findOne({model:UserModel,filter,options})
}



// findById
export const findById = async ({
    id,
    options = {},
} = {}) => {
    return baseDB.findById({model:UserModel,id,options})
}


// find
export const find = async ({
    filter = {},
    options = {},
} = {}) => {
    return baseDB.find({model:UserModel,filter,options})
}



//count
export const countDocument = async ({
    filter = {},
} = {}) => {
    return baseDB.countDocument({model:UserModel,filter})
};



//paginate
export const paginate = async ({
    filter = {},
    options = {},
    page = 1,
    limit = 5
} = {}) => {
    return baseDB.paginate({model:UserModel,filter,options,page,limit})
};




// insertMany
export const insertMany = async ({
    data,
} = {}) => {
    return baseDB.insertMany({model:UserModel,data})
}



// updateOne
export const updateOne = async ({
    filter,
    update,
    options,
} = {}) => {
    return baseDB.updateOne({model:UserModel,filter,options,update})
}



// updateMany
export const findOneAndUpdate = async ({
    filter,
    update,
    options,
} = {}) => {
    return baseDB.findOneAndUpdate({model:UserModel,filter,options,update})
}



// findByIdAndUpdate
export const findByIdAndUpdate = async ({
    id,
    update,
    options = { new: true },
}) => {
    return baseDB.findByIdAndUpdate({model:UserModel,id,options,update})
}



// findOneAndDelete
export const deleteOne = async ({
    filter,
} = {}) => {
    return baseDB.deleteOne({model:UserModel,filter})
}


// findOneAndDelete
export const deleteMany = async ({
    filter,
} = {}) => {
    return baseDB.deleteMany({model:UserModel,filter})
}


// findOneAndDelete
export const findOneAndDelete = async ({
    filter,
} = {}) => {
    return baseDB.findOneAndDelete({model:UserModel,filter})
}


