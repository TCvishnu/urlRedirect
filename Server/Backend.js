const {v4} = require("uuid");

const express = require("express");
const cors = require("cors");
const app = express();

const {MongoClient} = require("mongodb");
const url = process.env.MONGO_URL;
const client = new MongoClient(url);

const myDomain = process.env.SERVER_URL;
let data;
app.use(express.json())
app.use(cors())

const bindUrls = () =>{
    data.map(bothUrl => {
        bothUrl.urlCode = myDomain + "/" + bothUrl.urlCode
        return bothUrl;
    })
}

app.get("/api/urls", async (req, res) => {
    try {
        await client.connect();
        const db = client.db("ProjectsDB");
        const collection = db.collection("UrlMaps");
        data = await collection.find().toArray();
        bindUrls();
        res.json(data);
    } catch (error) {
        console.log("Failed to fetch urls: ", error);
        res.status(500).json({ message: "Failed to fetch data" });
    }
})

app.post("/api/addUrl", async(req, res) => {
    const {mainUrl} = req.body
    try{
        const newUuid = v4();
        await client.connect();
        const db = client.db("ProjectsDB");
        const collection = db.collection("UrlMaps");
        const exist = await collection.findOne({mainUrl: mainUrl});
        
        if (!exist){
            await collection.insertOne({
                urlCode: newUuid,
                mainUrl: mainUrl
            });
            data = await collection.find().toArray();  
            bindUrls();
            res.json(data);
        } else {
            res.status(409).json({ message: "URL already exists" });
        }
    } catch (error) {
        console.log("Url Adding Error: ", error);
    }
})

app.get("/:urlCode", async (req, res) => {
    const {urlCode} = req.params;
    try{
        await client.connect();
        const db = client.db("ProjectsDB");
        const collection = db.collection("UrlMaps");
        const originalUrl = await collection.findOne({urlCode: urlCode});
        if (originalUrl){
            res.redirect(originalUrl.mainUrl);
        }

    } catch (error) {
        console.log("Error: ", error)
    }
})

app.delete("/api/delete/", async (req, res) => {
    const uuidUrl = req.body.shrtUrl.replace(myDomain + "/", "");
    try{
        await client.connect();
        const db = client.db("ProjectsDB");
        const collection = db.collection("UrlMaps");
        await collection.deleteOne({urlCode: uuidUrl});
        data = await collection.find().toArray(); 
        bindUrls();   
        res.json(data);

    } catch (error) {
        console.log("Error: ", error)
    }
})


const PORT = 4000;
app.listen(PORT, ()=>{console.log(`Listening on port: ${PORT}...`)});
module.exports = app;