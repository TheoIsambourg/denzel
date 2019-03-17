

const Express = require("express");
const BodyParser = require("body-parser");

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const DENZEL_IMDB_ID = 'nm0000243';
const imdb = require('./src/imdb');

const CONNECTION_URL = "mongodb+srv://Theo:FgMfdtuqeaW9!Y@cluster0-bhrvq.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Denzel";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(9292, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("Denzel");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});



app.get("/movies/populate", async(request, response) => {
    const movies = await imdb(DENZEL_IMDB_ID);
    collection.insert(movies, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });
});

app.post("/movies/populate", async (request,response) => {
  const movies = await imdb(actor);
  const str_movies = JSON.stringify(movies);
  collection.insertMany(movies,(error,result) =>{
    if(error) {
      return response.status(500).send(error);
    }
    response.send(result.result);
  });
});




app.get("/movies/search", (request, response) => {
  console.log(request.query.limit);
  collection
    .aggregate([
      {
        $match: { metascore: { $gte: Number(request.query.metascore) } }
      },
      { $sample: { size: Number(request.query.limit) } }
    ])
    .toArray((error, result) => {
      if (error) {
        return response.status(500).send(error);
      }
      response.send(result);
    });
});


app.post("/movies", (request, response) => {
  collection.insert(request.body, (error, result) => {
    if(error) {
      return response.status(500).send(error);
    }
    response.send(result.result);
  });
});


app.get("/movies", (request, response) => {
  collection
    .aggregate([
      { $match: { metascore: { $gte: 70 } } },
      { $sample: { size: 1 } }
    ])
    .toArray((error, result) => {
      if (error) {
        return response.status(500).send(error);
      }
      response.send(result);
    });
});


app.get("/movies/:id", (request, response) => {
  collection.findOne({ "_id": new ObjectId(request.params.id) }, (error, result) => {
    if(error) {
      return response.status(500).send(error);
    }
    response.send(result);
  });
});

