
// create
export const create = async ({
    model,
    data = [{}],
    options = { validateBeforeSave: true }
} = {}) => {

    return await model.create(data, options)
}


// createOne
export const createOne = async ({
    model,
    data = {},
    options = { validateBeforeSave: true }
} = {}) => {
    const [doc] = await create({ model, data: [data], options });
    return doc
}


// findOne
export const findOne = async ({
    model,
    filter = {},
    options = {}
} = {}) => {
    const doc = model.findOne(filter);
    if (options.select) {
        doc.select(options.select);
    }
    if (options.populate) {
        doc.populate(options.populate);
    }
    if (options.lean) {
        doc.lean();
    }
    return await doc.exec();
}


// findById
export const findById = async ({
    id,
    options = {},
    model
} = {}) => {
    const doc = model.findById(id);
    if (options.select) {
        doc.select(options.select);
    }
    if (options.populate) {
        doc.populate(options.populate);
    }
    if (options.lean) {
        doc.lean(options.lean);
    }
    return await doc.exec();
}


// find
export const find = async ({
    filter = {},
    options = {},
    model
} = {}) => {
    const doc = model.find(filter);
    if (options.select) {
        doc.select(options.select);
    }
    if (options.populate) {
        doc.populate(options.populate);
    }
    if (options.skip) {
        doc.skip(options.skip);
    }
    if (options.limit) {
        doc.limit(options.limit);
    }
    if (options.sort) {
        doc.sort(options.sort);
    }
    if (options.lean) {
        doc.lean(options.lean);
    }
    return await doc.exec();
}


// insertMany
export const insertMany = async ({
    data,
    model
} = {}) => {
    return (await model.insertMany(data))
}


// updateOne
export const updateOne = async ({
    filter,
    update,
    options,
    model
} = {}) => {
    return await model.updateOne(
        filter || {},
        { ...update, $inc: { __v: 1 } },
        options
    );
}


// updateMany
export const findOneAndUpdate = async ({
    filter,
    update,
    options,
    model
} = {}) => {
    return await model.findOneAndUpdate(
        filter || {},
        { ...update, $inc: { __v: 1 } },
        {
        new: true,
        runValidators: true,
        ...options,
        }
    );
}


// findByIdAndUpdate
export const findByIdAndUpdate = async ({
    id,
    update,
    options = { new: true },
    model
}) => {
    return await model.findByIdAndUpdate(
        id,
        { ...update, $inc: { __v: 1 } },
        options
    );
}


// findOneAndDelete
export const deleteOne = async ({
    filter,
    model
} = {}) => {
    return await model.deleteOne(filter || {});
}


// findOneAndDelete
export const deleteMany = async ({
    filter,
    model
} = {}) => {
    return await model.deleteMany(filter || {});
}


// findOneAndDelete
export const findOneAndDelete = async ({
    filter,
    model
} = {}) => {
    return await model.findOneAndDelete(
        filter || {},
    );
}


