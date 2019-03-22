

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const Express = require("express");
const BodyParser = require("body-parser");



const DENZEL_IMDB_ID = 'nm0000243';
const imdb = require('./src/imdb');

const CONNECTION_URL = "mongodb+srv://Theo:FgMfdtuqeaW9!Y@cluster0-bhrvq.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Denzel";


const graphqlHTTP = require("express-graphql");
const gql = require('graphql-tag');
const {buildASTSchema} = require("graphql");

const sandbox = require('./sandbox');

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


const schema = buildASTSchema(gql `
type Query {
        populate : Int
        movies: [Movie]
        movie(id: String!): [Movie]
        search(limit: Int, metascore: Int): SearchResults
        review(idMovie: String!, date: String!, review: String!): String
    },
type Movie {
        link: String
        metascore: Int
        synopsis: String
        title: String
        year: Int
    },
type Populate{
       total: String
},
input Review{
        date: String
        review: String
}
`)


const root = {
populate: async (source, args) => {
  const movies = await populate(DENZEL_IMDB_ID);
  const insertion = await collection.insertMany(movies);
  return {
    total: insertion.movie.n
  };

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}))


app.get("/movies/populate", async(request, response) => {

    const movies = await sandbox.movies;
    await collection.insertMany(movies, (error, result) => {
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

app.post("/movies", (request, response) => {
  collection.insert(request.body, (error, result) => {
    if(error) {
      return response.status(500).send(error);
    }
    response.send(result.result);
  });
});




app.get("/movies/search", (request, response) => {
  var limit = request.query.limit;
  var metascore = request.query.metascore;
  if(limit==undefined) {
    limit = 5;
  }
  if(metascore==undefined) {
    metascore = 0;
  }
   collection = database.collection("Denzel");

    collection.aggregate([{$match: {"metascore": {$gte: Number(metascore)}}}, {$limit: Number(limit)}, {$sort: {"metascore": -1}}]).toArray((error, result) => {
        if(error) 
        {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});





app.get("/movies/:id", (request, response) => {
  collection.findOne({"id": request.params.id}, (error, result) => {
    if(error){
      return response.status(500).send(error);
    }
    response.send(result);
  });
});

app.post("/movies/:id", (request, response) => {
  collection.updateOne(
    {"id": request.params.id},

    {$set: {date: request.body.date, review: request.body.review} },
    {  upsert: true  }, (error, result) =>{
      if(error)
      {
           return response.status(500).send(error);
      }
      response.send(result.result);
    });
  });

