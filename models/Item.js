import mongoose, {Schema} from 'mongoose';

const itemSchema = new mongoose.Schema({
    title: {type: String, required: true},
    body: {type: String, required: true},
    author: {type: String, required: true},
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            ret._links = {
                self: {
                    href: `${process.env.BASE_URL}/items/${ret._id}`
                    //     load id in link dynamically
                },
                collection: {
                    href: process.env.BASE_URL
                }
            }

            delete ret._id
        }
    }
});
const Item = mongoose.model('Item', itemSchema);

export default Item