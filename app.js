const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "./cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`DB ERR : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//dbConverter
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//1. all

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
   SELECT 
    * 
   FROM 
    cricket_team 
   ORDER BY 
    player_id
   `;

  const dbResponse = await db.all(getPlayersQuery);

  const convertedArr = [];
  for (let arr of dbResponse) {
    convertedArr.push(convertDbObjectToResponseObject(arr));
  }

  response.send(convertedArr);
});

//2. post

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  console.log(playerDetails);
  const addPlayerQuery = `
  INSERT INTO 
    cricket_team(player_name,jersey_number,role)
  VALUES(
      '${playerName}',
      ${jerseyNumber},
      '${role}'
  );`;

  const dbResponse = await db.run(addPlayerQuery);
  const bookId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//3. get a player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayersQuery = `
   SELECT 
    * 
   FROM 
    cricket_team 
    WHERE  
    player_id = ${playerId}
   `;

  const dbResponse = await db.get(getPlayersQuery);

  response.send(convertDbObjectToResponseObject(dbResponse));
});

//4. put

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE
            cricket_team
        SET 
            player_name = '${playerName}',
            jersey_number = ${jerseyNumber},
            role = '${role}'
        WHERE 
            player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//5. delete

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
        cricket_team
    WHERE
        player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
