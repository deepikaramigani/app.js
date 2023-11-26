const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();

app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//GET players
app.get("/players/", async (request, response) => {
  const playerDetailsQuery = `
    select *
    from cricket_team
    order by player_id`;
  const playerDetails = await db.all(playerDetailsQuery);

  const convertDbObjectToResponseObject = (playerDetails) => {
    return {
      playerId: playerDetails.player_id,
      playerName: playerDetails.player_name,
      jerseyNumber: playerDetails.jersey_number,
      role: playerDetails.role,
    };
  };
  response.send(
    playerDetails.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//POST player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const playeraddQyery = `
    INSERT INTO
    cricket_Team
    (player_name,
jersey_number,
role)
    Values ('${player_name}', '${jersey_number}','${role}')`;
  const dbResponse = await db.run(playeraddQyery);
  response.send("Player Added to Team");
  console.log(dbResponse);
});

//GET player according to id
app.get("/players/:player_id/", async (request, response) => {
  const { player_id } = request.params;
  const playerDetailsQuery = `
    select *
    from cricket_team
    where player_id=${player_id}`;
  const playerDetails = await db.all(playerDetailsQuery);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  response.send(
    playerDetails.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//upding playerDetails
app.put("/players/:player_id/", async (request, response) => {
  const { player_id } = request.params;
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const playeraddQyery = `
    update
    cricket_Team
    Set
    player_name='${player_name}',
    jersey_number='${jersey_number}',
    role='${role}'`;
  const dbResponse = await db.run(playeraddQyery);
  response.send("Player Details Updated");
  console.log(dbResponse);
});

//delete player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    delete from cricket_team 
    where player_id=${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
