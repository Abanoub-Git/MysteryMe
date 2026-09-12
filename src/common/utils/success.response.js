export const successResponse = ({res, data=undefined, message = 'Success', statusCode = 200}={}) => {
    return res.status(statusCode).json({message, status: true, data})
}


//aldata law msh mwgoda edeha undefined 
//almessage law msh mwgoda edeha success
//alstatus law msh mwgoda edeha 200

//aldenia 3ndi flexiable ana 3aiz shkl almessage ezay boolean msln
//aw 3aiz alstuasCode brkm tany w hkza f kolo
