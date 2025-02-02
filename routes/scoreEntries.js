import ScoreEntry from "../models/ScoreEntry.js";
import { faker } from "@faker-js/faker";
import express from 'express';
import mongoose from "mongoose";
import "dotenv/config";

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const scoreEntries = await ScoreEntry.find({});
        // add link to self and link to collection to confirm to HATEOS HAL standards
        let collection = {
            items: scoreEntries,
            _links: {
                self: { href: `${process.env.BASE_URL}/scoreEntries/` },
                collection: { href: `${process.env.BASE_URL}/scoreEntries/` }
            }
        };
        res.json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create ScoreEntry or seed scoreEntries (POST /)
router.post('/', async (req, res) => {
    try {
        const { method, score, title, description, author, amount } = req.body;
        // fill score with 0 if it's empty
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
            return res.status(201).json({ success: true, message: `${seedAmount} scoreEntries seeded successfully` });
        }

        if (!title || !description || !author) {
            return res.status(400).json({ error: 'Title, description, and author are required.' });
        }
        const newScoreEntry = await ScoreEntry.create({ score: finalScore, title, description, author });
        res.status(201).json(newScoreEntry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.options('/', (req, res) => {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.status(204).send();
});

// scoreEntries detail
router.get('/:id', async (req, res) => {
    let scoreEntry = null
    try {
        const { id } = req.params;
        const scoreEntry = await ScoreEntry.findById(id);
        res.json(scoreEntry);
    } catch (error) {
        if (scoreEntry === null){
            res.status(404).json('No scoreEntry with this id exists')
        } else{
            res.status(400).json({ error });

        }
    }
});

// scoreEntries edit
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { score, title, description, author } = req.body;
    if (!title || !description || !author) {
        return res.status(400).json({ error: 'Title, description, and author are required.' });
    }
    const finalScore = score || 0;
    let updatedScoreEntry = null;
    try {
        const updatedScoreEntry = await ScoreEntry.findByIdAndUpdate(id, { score: finalScore, title, description, author });
        if (!updatedScoreEntry) {
            return res.status(404).json({ error: 'ScoreEntry not found' });
        }
        res.json(updatedScoreEntry);
    } catch (error) {
        if (updatedScoreEntry === null){
            res.status(404).json('No scoreEntry with this id exists')
        } else{
            res.status(400).json({ error });
        }    }
});

// scoreEntries delete
router.delete('/:id', async (req, res) => {
    let errorType = 0;
    try {
        const { id } = req.params;
        console.log('trying to delete', id);
        const scoreEntry = await ScoreEntry.findById(id);
        errorType = 1
        const result = await ScoreEntry.findByIdAndDelete(id);
        console.log('result', result);
        res.status(204).send();
    } catch (error) {
        if (errorType === 0) {
            return res.status(404).json({error: 'ScoreEntry not found'});
        } else {
            res.status(500).json({error});
        }
    }
});

//opdracht 6.1
router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
    res.status(204).send();
});

export default router;
