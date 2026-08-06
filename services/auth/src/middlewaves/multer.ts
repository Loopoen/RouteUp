import multer from "multer";


const storage = multer.memoryStorage() // anh anh buffer

const uploadFile = multer({storage}).single("file")

export default uploadFile
