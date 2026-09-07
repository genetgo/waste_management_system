const bcrypt = require("bcryptjs");



const hashPassword = async (password) => {

    const hash = await bcrypt.hash(password, 10);

    return hash;

};

//node utils/hashPassword.js for get new hash 

const passwords = [
    "123456",
    
];


(async()=>{

    for (const password of passwords){

        const hash = await hashPassword(password);

        console.log("Original Password:", password);
        console.log("Hash:", hash);
        console.log("----------------------");

    }

})();