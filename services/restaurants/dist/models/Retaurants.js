import mongoose from "mongoose";
import Schema from 'mongoose';
const schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    image: {
        type: String,
        required: true
    },
    autoLocation: {
        type: {
            type: String,
            emun: ["Point"],
            required: true
        },
        coordinateds: {
            type: [Number, Number],
            required: true
        },
        formattedAddress: {
            type: String,
        }
    },
    isOpen: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true
});
schema.index({ autoLocation: "2dsphere" });
export default mongoose.model("Restaurant", schema);
