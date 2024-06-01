
const express = require("express");
const cors = require("cors");
const app = express();

const {MongoClient} = require("mongodb");
const url = process.env.MONGO_URL;
const client = new MongoClient(url);

const myDomain = "https://url-redirect-api.onrender.com/";
//https://url-redirect-api.onrender.com/

let data;
app.use(express.json())
app.use(cors())

app.get("/api/urls", async (req, res) => {
    try {
        await client.connect();
        const db = client.db("ProjectsDB");
        const collection = db.collection("UrlMaps");
        data = await collection.find().toArray();    
        res.json(data);
    } catch (error) {
        console.log("Failed to fetch urls: ", error);
        res.status(500).json({ message: "Failed to fetch data" });
    }
})

app.post("/api/addUrl", async(req, res) => {
    const {mainUrl} = req.body
    try{
        await client.connect();
        const db = client.db("ProjectsDB");
        const collection = db.collection("UrlMaps");
        const exist = await collection.findOne({longUrl: mainUrl});
        
        if (!exist){
            await collection.insertOne({
                shortUrl: req.body.newUrl,
                longUrl: mainUrl
            });
            data = await collection.find().toArray();   
            res.json(data);
        }
    } catch (error) {
        console.log("Url Adding Error: ", error);
    }
})

app.get("/:tinyUrl", async (req, res) => {
    const {tinyUrl} = req.params;
    try{
        await client.connect();
        const db = client.db("ProjectsDB");
        const collection = db.collection("UrlMaps");
        const originalUrl = await collection.findOne({shortUrl: myDomain + tinyUrl});
        if (originalUrl){
            res.redirect(originalUrl.longUrl);
        }

    } catch (error) {
        console.log("Error: ", error)
    }
})

app.delete("/api/delete/:tinyUrl", async (req, res) => {
    const {tinyUrl} = req.params;
    try{
        await client.connect();
        const db = client.db("ProjectsDB");
        const collection = db.collection("UrlMaps");
        await collection.deleteOne({shortUrl: myDomain + tinyUrl});
        data = await collection.find().toArray();    
        res.json(data);

    } catch (error) {
        console.log("Error: ", error)
    }
})


const PORT = 4000;
app.listen(PORT, ()=>{console.log(`Listening on port: ${PORT}...`)});
module.exports = app;