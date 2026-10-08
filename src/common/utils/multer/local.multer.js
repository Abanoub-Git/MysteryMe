import multer from 'multer'
import {fileTypeFromBuffer} from 'file-type'
import {resolve} from 'path'
import {mkdir, writeFile} from 'fs/promises'
import { randomUUID } from 'crypto'
import { BadException } from '../../exceptions/error.exception.js'

export const fileValidation = {
    image: ["image/jpeg", "image/png", "image/gif"],
    files: ["application/pdf", "application/json"]
}


//di js method ali rag3 mnha multer instance function (bthandle almulter w alfile size)
export const localFileUpload = ({maxFileSize = 5} = {}) => {
    const storage = multer.memoryStorage() //kda hytb3t bs lsa f temp alghaz (ram) mt7tsh f assets
    return multer({storage, limits: { fileSize: maxFileSize * 1024 * 1024 } })
}



//di ro7 almshro3 bt3ml process w bt5zn alfile f alpath w kol 7aga 
export const processFile = async ({customPath = "general", file, validation = [] }) => {
    const result = await fileTypeFromBuffer(file.buffer)
    if (!result || !validation.includes(result.mime)) {
        throw BadException("Invalid file formats")
    } else {
        await mkdir(resolve(`./assets/${customPath}`), {recursive:true}) //law msh mwgod e3mlo creation 8er kda kml
        const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`
        await writeFile(resolve(`./${uniqueFilePath}`), file.buffer);
        file.finalPath = uniqueFilePath
        return file
    }
}



//b3ed est5dam processFile feha lma brf3 aktr mn file
export const processFiles = async ({customPath, files = [], validation = [] }) => {
    const validatedFiles = []
    // hy3ml validate 3al7aga ali d5lalo alawl
    for (const file of files) {
        const result = await fileTypeFromBuffer(file.buffer)
        if (!result || !validation.includes(result.mime)) {
            throw BadException("Invalid file formats")
        }
        validatedFiles.push({file, result})
    }

    // law kolo tmm w 3da mn ali fo2 ybd2 b2a y5zn f assets
    const assets = []
    for (const { file, result } of validatedFiles) {
        const uniqueFilePath = `${customPath}/${randomUUID()}.${result.ext}`
        await writeFile(resolve(`./${uniqueFilePath}`),file.buffer)
        file.finalPath = uniqueFilePath
        assets.push(file)
    }
    return assets
}



//b3ed est5dam processFile feha lma brf3 aktr mn file ka fields (obj of array)
export const processFields = async ({customPath, fields = {}, validation = [] }) => {
    const assets = []
    for (const field of Object.keys(fields)) {
        for (const file of fields[field]) {
            const result = await fileTypeFromBuffer(file.buffer)
            if (!result || !validation.includes(result.mime)) {
                throw BadException("Invalid file formats")
            }
        }
    }

    for (const field of Object.keys(fields)) {
        const files = await processFiles({customPath, files: fields[field],validation})
        assets.push({ field, files })
    }
    return assets
}



//di bt3ml customization b eni hcall anhy wa7da mn ali fo2 
export const processMulterUpload = async ({req, customPath = "general", validation = [] }) => {
    if (req.file) {
        await processFile({customPath, file: req.file, validation })
    }
    else if (Array.isArray(req.files)) {
        await processFiles({customPath, files: req.files, validation })
    }
    else if (typeof req.files == "object" && Object.keys(req.files ?? {})?.length){
        await processFields({customPath, fields: req.files, validation })
    }    
}



