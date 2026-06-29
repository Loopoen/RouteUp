import mongoose, { Schema } from "mongoose";
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
        coordinates: {
            type: [Number, Number],
            required: true
        },
        formatedAddress: {
            type: String,
        },
    },
    ownerId: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
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
