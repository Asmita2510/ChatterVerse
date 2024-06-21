const multer = require('multer');

const Storage=multer.diskStorage({
    destination:'client/images',
    filename:(req,file,cb)=>{
        cb(null,file.originalname )
    }
})

const upload = multer({ storage: Storage});
module.exports = {
    multer: upload
};

//for s3 bucket
// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });
// module.exports = {
//     multer: upload
// };

