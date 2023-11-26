// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";

import {app} from './app.js'


dotenv.config({
    path: './env'
})

const port = process.env.PORT || 3000;

connectDB()
.then(()=>{
    app.listen(port, ()=>{
        console.log(`Server is running at port ${port}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection is failed !! ", err)
})


/*
import express from 'express';

const app = express();

//ifee functions :  define function and immediately execute it. use ";" before ifee function
(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("Error: ", error)
            throw error
        })
        app.listen(process.port.PORT, ()=>{
            console.log(`App is listening on port ${process.port.PORT}`)
        })
    } catch (error) {
        console.error("Error: ", error)
        throw error
    }
})() 
*/
