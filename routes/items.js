import Item from "../models/Item.js";
import {faker} from "@faker-js/faker";
import express from 'express';
import mongoose from "mongoose";

const router = express.Router();

router.get('/', async(req, res) => {
    try{
        const items = await Item.find({});

        // add link to self and link to collection to confirm to HATEOS HAL standards
        const collection = {
            items: items,
            _links: {
                self: {
                    href: `${process.env.BASE_URL}/items`
                },
                collection: {
                    href: `${process.env.BASE_URL}/items`
                }
            },

            // add pagination like this
            // "pagination": {
            //     "currentPage": 1,
            //     "currentItems": 6,
            //     "totalPages": 2,
            //     "totalItems": 12,
            //     "_links": {
            //         "first": {
            //             "page": 1,
            //             "href": "http://example.com/?page=1&limit=6"
            //         },
            //         "last": {
            //             "page": 2,
            //             "href": "http://example.com/?page=2&limit=6"
            //         },
            //         "previous": null,
            //         "next": {
            //             "page": 2,
            //             "href": "http://example.com/?page=2&limit=6"
            //         }
            //     }
            // }
        };

        res.json(collection );
    }catch (error){
        res.status(500).json({
            error: error.message
        });
    }
});

// Create item or seed items (POST /)
router.post('/', async (req, res) => {
    try {
        const { method, score, body, author, amount } = req.body;

        //if method === SEED was in body, use seeder
        if (method === 'SEED') {
            await Item.deleteMany({});
            const seedAmount = amount || 10; // Default amount is 10 if not provided

            for (let i = 0; i < seedAmount; i++) {
                await Item.create({
                    score: 0,
                    body: faker.lorem.lines(2),
                    author: faker.person.fullName(),
                });
            }

            return res.json({ success: true, message: `${seedAmount} items seeded successfully` });
        }

        // Create a single item (normal POST request)
        // error message for if fields are not filled
        // if (!score || !body || !author) {
        //     return res.status(400).json({ error: 'All fields are required' });
        // }

        const item = await Item.create({
            score: score,
            body: body,
            author: author,
        });

        res.json(item);
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


// items detail
router.get('/:id', async(req, res) => {
    try{
        const { id } = req.params;
        const item = await Item.findOne({ _id: id }); // Use findOne instead of find since find returns an array instead of an object
        // links to self and link to collection to confirm to HATEOS HAL standards are added in schema
        res.json(item);
    }catch (error){
        res.status(404).json({
            error: error.message
        })
    }
});

// items edit
router.put('/:id',async (req,res)=>{
    const { id } = req.params;
    const {score, body, author} = req.body;
    try{
        const itemUpdate = await Item.updateOne({
            score:score,
            body:body,
            author:author
        })
        res.json(itemUpdate)
    }catch(err){
        res.status(404).json({
            error: error.message
        })    }
})

// items delete
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Item.deleteOne({ _id: id });
        res.json({ success: true });
    } catch (error) {
        res.status(204).json({
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