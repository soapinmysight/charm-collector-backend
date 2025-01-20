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

// items create from form
router.post('/', async(req, res) => {
    try{
        const {title, body, author} = req.body;
        console.log(title, body, author)
        const item = await Item.create({
            title: title,
            body: body,
            author: author,
        })
        res.json(item);
    }catch(error){
        res.status(404).json({
            error: error.message
        })
    }
});

//opdracht 6.1
router.options('/',(req, res)=>{
    res.setHeader('Allow','GET, POST, OPTIONS');
    res.status(204).send();
});

// items create with seeder
router.post('/seed', async(req,res)=>{
    try{
        await Item.deleteMany({});
        // const amount = 10
        const { amount = 10 } = req.body;
        for (let i = 0; i < amount; i++) {
            await Item.create({
                title: faker.lorem.lines(1),
                body: faker.lorem.lines(2),
                author: faker.person.fullName(),
            })
        }
        res.json({succes:true});
    }catch(error){
        res.status(404).json({
            error: error.message
        })    }
});

//opdracht 6.1
router.options('/seed',(req, res)=>{
    res.setHeader('Allow','POST, OPTIONS');
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
    const {title, body, author} = req.body;
    try{
        const itemUpdate = await Item.updateOne({
            title:title,
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
    res.status(204).send();
});
export default router;