import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    itemId: {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
}, {
    timestamps: true,
});
schema.index({ userId: 1, restaurantId: 1, itemId: 1 }, { unique: true }); // Btree
export default mongoose.model("Cart", schema);
