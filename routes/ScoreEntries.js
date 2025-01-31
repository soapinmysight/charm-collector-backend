// import Item from "../models/Item.js";
import ScoreEntry from "../models/ScoreEntry.js";
import {faker} from "@faker-js/faker";
import express from 'express';
import mongoose from "mongoose";

const router = express.Router();

router.get('/', async(req, res) => {
    try{
        const scoreEntries = await ScoreEntry.find({});

        // add link to self and link to collection to confirm to HATEOS HAL standards
        const collection = {
            scoreEntries: scoreEntries,
            _links: {
                self: {
                    href: `${process.env.BASE_URL}/score_entries`
                },
                collection: {
                    href: `${process.env.BASE_URL}/score_entries`
                }
            },
        };

        res.json(collection );
    }catch (error){
        res.status(500).json({
            error: error.message
        });
    }
});

// Create ScoreEntry or seed scoreEntries (POST /)
router.post('/', async (req, res) => {
    try {
        const { method, score, title, description, author, amount } = req.body;
        // Ensure score is filled with 0 if it's empty
        const finalScore = score || 0;
        //if method === SEED was in body, use seeder
        if (method === 'SEED') {
            await ScoreEntry.deleteMany({});
            const seedAmount = amount || 10; // Default amount is 10 if not provided

            for (let i = 0; i < seedAmount; i++) {
                await ScoreEntry.create({
                    score: 0,
                    title: faker.lorem.lines(1),
                    description: faker.lorem.lines(2),
                    author: faker.person.fullName(),
                });
            }

            res.status(201).json({ success: true, message: `${seedAmount} scoreEntries seeded successfully` });
        }

        // Create a single ScoreEntry (normal POST request)
        // error message for if fields are not filled
        // if (!score || !title || !description || !author) {
        //     return res.status(400).json({ error: 'All fields are required' });
        // }

        const newScoreEntry = await ScoreEntry.create({
            score: finalScore,
            title: title,
            description: description,
            author: author,
        });

        res.status(201).json(ScoreEntry);

    } catch (error) {
        res.status(404).json({
            error: error.message
        });
    }
});



router.options('/',(req, res)=>{
    res.setHeader('Allow','GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', ['GET, POST']); // Specificeer de toegestane methoden.
    res.status(204).send();
});


// scoreEntries detail
router.get('/:id', async(req, res) => {
    try{
        const { id } = req.params;
        const newScoreEntry = await ScoreEntry.findOne({ _id: id }); // Use findOne instead of find since find returns an array instead of an object
        // links to self and link to collection to confirm to HATEOS HAL standards are added in schema
        if (!newScoreEntry) {
            return res.status(404).json({
                error: `ScoreEntry met id ${id} niet gevonden.`,
            });
        }
        res.json(newScoreEntry);
    }catch (error){
        res.status(500).json({
            error: error.message
        })
    }
});

// scoreEntries edit
router.put('/:id',async (req,res)=>{
    const { id } = req.params;
    const {score, title, description, author} = req.body;

    // Check if required fields are empty
    if (!title || !description || !author) {
        return res.status(400).json({
            error: 'All fields except score (title, description, and author) are required and cannot be empty.'
        });
    }
    // Ensure score is filled with 0 if it's empty
    const finalScore = score || 0;
        try{
        const scoreEntryUpdate = await ScoreEntry.findByIdAndUpdate(id, {
            score:finalScore,
            title:title,
            description:description,
            author:author
        })
        res.json(scoreEntryUpdate)
    }catch(err){
        res.status(404).json({
            error: error.message
        })    }
})

// scoreEntries delete
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ScoreEntry.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            // Als er geen document verwijderd is, stuur een 404 response
            return res.status(404).json({
                error: `ScoreEntry met id ${id} niet gevonden of bestaat al niet.`,
            });
        }
        // Als het verwijderen gelukt is, stuur een 204 No Content response
        res.status(204).json({ success: true });
    } catch (error) {
        res.status(500).json({
            error: error.message
        })    }
});

//opdracht 6.1
router.options('/:id',(req, res)=>{
    res.setHeader('Allow','GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', ['GET, POST, PUT, DELETE']); // Specificeer de toegestane methoden.
    res.status(204).send();
});
export default router;