import DataURIParser from "datauri/parser.js";
import path from 'path';
const getBuffer = (file) => {
    const parser = new DataURIParser();
    const exName = path.extname(file.originalname).toString();
    return parser.format(exName, file.buffer);
};
export default getBuffer;
