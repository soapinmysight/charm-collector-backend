import mongoose, {Schema} from 'mongoose';
import "dotenv/config"

const scoreEntrySchema = new mongoose.Schema({
    score: {type: Number, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    author: {type: String, required: true},
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            ret._links = {
                self: {
                    href: `${process.env.BASE_URL}/scoreEntries/${ret._id}`
                },
                collection: {
                    href: `${process.env.BASE_URL}/scoreEntries/`
                }
            }
            delete ret._id
        }
    }
});
const ScoreEntry = mongoose.model('ScoreEntry', scoreEntrySchema);

export default ScoreEntry