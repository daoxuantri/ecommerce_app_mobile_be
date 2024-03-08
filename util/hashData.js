const bcrypt = require("bcrypt");

const hashData = async (data, saltRounds = 10) =>{
    try{
        const hashedData = await bcrypt.hash(data, saltRounds);
        return hashedData;
    }
    catch(e){
        throw e;
    }
}


const verifyHashedData = async (unhashed , hashed) =>{
    try{
        const match = await bcrypt.compare(unhashed , hashed);
        return match;
    }catch(e){
        throw e;
    }
}

module.exports = {hashData, verifyHashedData};
