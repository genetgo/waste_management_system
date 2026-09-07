const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {

        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success:false,
                message:"Token required"
            });
        }


        let token = authHeader;

        if(authHeader.startsWith("Bearer ")){
            token = authHeader.split(" ")[1];
        }


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback_secret_key"
        );


        console.log("Decoded User:", decoded);


        req.user = decoded;

        next();


    } catch(error){

        return res.status(401).json({
            success:false,
            message:"Invalid or expired token"
        });

    }
};


module.exports = protect;