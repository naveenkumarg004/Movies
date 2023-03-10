const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const startServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running Successfully");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
startServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//GET books API  1

app.get("/movies/", async (request, response) => {
  const getBooksQuery = `
    select *
    from movie
    order by movie_id`;
  const booksArray = await db.all(getBooksQuery);
  response.send(
    booksArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

//POST movie API  2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    insert into
    movie (director_id , movie_name, lead_actor)
    values (
        ${directorId} ,
        "${movieName}"  ,
        "${leadActor}"
        );`;
  addMovieQueryRes = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET movie API  3
const api3ResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getBookQuery = `
    select *
    from movie
    where movie_id = ${movieId}`;
  const addedMovieDetails = await db.get(getBookQuery);
  response.send(api3ResponseObject(addedMovieDetails));
});

//UPDATE movie API  4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateBookQuery = `
    update movie
    set 
        director_id = ${directorId} ,
        movie_name = "${movieName}" ,
        lead_actor = "${leadActor}"
    where movie_id = ${movieId} `;
  await db.run(updateBookQuery);
  response.send("Movie Details Updated");
});

//DELETE movie API  5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const delBookQuery = `
    delete from
    movie
    where movie_id = ${movieId}`;
  await db.run(delBookQuery);
  response.send("Movie Removed");
});
//GET director API  6
const directorObjToResObj = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    select *
    from director
    order by director_id`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray.map((each) => directorObjToResObj(each)));
});

// GET director movies API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    select *
    from movie
    where director_id = ${directorId}`;
  const directorMoviesList = await db.all(getDirectorMoviesQuery);
  response.send(
    directorMoviesList.map((each) => convertDbObjectToResponseObject(each))
  );
});
module.exports = app;
