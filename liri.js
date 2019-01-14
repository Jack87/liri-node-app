require("dotenv").config();
var keys = require("./keys");
var Spotify = require('node-spotify-api');
var axios = require('axios');
var fs = require("fs");
var chalk = require('chalk');
var moment = require('moment');
var firstRun = require('first-run');
var inquirer = require('inquirer');
var command;
var args;
firstRun.clear()
init()
//Initialize App
function init() {
    // If this is the first time the user is running the app, include title graphic
    if(firstRun()) {
      console.log('\033c'); // clears out the terminal... usually.
      console.log(chalk.magenta("    _      _____ _____  _____   ____   ____ _______ "));
      console.log(chalk.magenta("   | |    |_   _|  __ \\|_   _| |  _ \\ / __ |__   __|"));
      console.log(chalk.yellow("   | |      | | | |__) | | |   | |_) | |  | | | |   "));
      console.log(chalk.yellow("   | |      | | |  _  /  | |   |  _ <| |  | | | |   "));
      console.log(chalk.green("   | |____ _| |_| | \\ \\ _| |_  | |_) | |__| | | |   "));
      console.log(chalk.green("   |______|_____|_|  |_|_____| |____/ \\____/  |_|   "));
      console.log(chalk.blue("I am Liri, here to assist you!."));
      console.log(chalk.gray("───────────────────────────────────────────"));
    }
    inquirer.prompt([
      {
        "name": 'commandChoice',
        "message": chalk.magenta('What would you like to do?'),
        "type": 'list',
        "choices": ['Spotify a Song', 'Find Concerts', 'Retrive Movie Info', 'Just Give Me Someting', 'Clear Log', 'Exit Liri'],
      },
      {
        type: 'input',
        name: 'arg',
        message: 'Cool, what song?',
        when: function (answers) {
          return answers.commandChoice==="Spotify a Song";
        }
      },
      {
        type: 'input',
        name: 'arg',
        message: 'Okay, what band do you want to see?',
        when: function (answers) {
          return answers.commandChoice==="Find Concerts";
        }
      },
      {
        type: 'input',
        name: 'arg',
        message: 'Alright, which movie?',
        when: function (answers) {
          return answers.commandChoice==="Retrive Movie Info";
        }
      }
    ])
    .then(function(answers){
      command = answers.commandChoice;
      console.log(command);
      args = answers.arg;
      aiLogic(answers.commandChoice, answers.arg);
    });
  }
// AI logic
function aiLogic (command, args){
    switch (command) {
        case "Spotify a Song":
          spotifyThis(args);
          break;
        case "Retrive Movie Info":
          movieThis(args);
          break;
        case "Find Concerts":
          concertThis(args);
          break;
        case "Just Give Me Someting":
          doTextFile();
          break;
        case "Clear Log":
          clearFirstRun();
          break;
        case "Exit Liri":
          endProgram();
          break;
        default:
          console.log("Sorry, I don't know how to do that yet.");
          init();
      }
}
//======================Utility Functions==============================================//
// Reset the app state
function clearFirstRun() {
  // Clear out log file
  fs.writeFile("log.txt", "", function(err) {
    // If the code experiences any errors it will log the error to the console.
    if (err) {
      return console.log(err);
    }
  });
  // See https://www.npmjs.com/package/first-run
  //firstRun.clear();
  firstRun.clear();
  init();
  console.log(chalk.gray("\nThe log file was cleared! It feels like when you get a haircut. Fresh!"));
  console.log(chalk.gray("───────────────────────────────────────────"));
}
// Kill the app
function endProgram() {
    firstRun.clear();
    return;
  }
// Title case a string
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
// Log data to an external file
function writeLog(output) {
    // Set up the output
    var divider = "═══════════════════════════════════════════\n";
    var argsText = "";
    if(args) {
      argsText = "Argument: "+args+"\n";
    }
    output = divider + "\n" + Date() + "\nCommand: "+command+"\n"+argsText+output;
    // Write/append to the file
    fs.appendFile("log.txt", output, function(err) {
      // If the code experiences any errors it will log the error to the console.
      if (err) {
        return console.log(err);
      }
    });
  }
//====================================================================================//
//===================App command functions============================================//
// spotify-this-song
function spotifyThis(song) {
    if(song=="") {
      song = "The Sign";
    }
    var output = "";
    var spotify = new Spotify(keys.spotify);
    spotify
      .search({
        type: 'track',
        query: song
      })
      .then(function(response) {
        var songInfo = response.tracks.items[0];
        if (songInfo) {
          output += "───────────────────────────────────────────\n";
          output += chalk.green("SONG:   \"" + toTitleCase(song).trim() + "\"\n");
          output += chalk.green("ARTIST: " + songInfo.artists[0].name + "\n");
          output += chalk.green("ALBUM:  " + songInfo.album.name + "\n");
          output += chalk.green("LINK:   " + songInfo.external_urls.spotify + "\n");
        } else {
          output += chalk.green(".....Sorry! I couldn't find that song. Try another one.\n");
        }
        output += "───────────────────────────────────────────\n";
        writeLog(output);
        console.log(output);
        // console.log(songInfo)
        init();
      })
      .catch(function(err) {
        console.log(err);
        init();
      });
  }
// function movie this
function movieThis(title) {
    var output = "";
    if (title == "") {
      title = "mr nobody";
    }
    var queryUrl = "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=trilogy";
    console.log(queryUrl);
    axios
        .get(queryUrl)
        .then(function(response) {
            //  console.log(response.data);
            if (response.data.Title === undefined) {
                output += "\n───────────────────────────────────────────\n";
                output += chalk.yellow("....Sorry! I couldn't find info on the movie " + toTitleCase(title) + ". Try another one.\n");
            } else {
            output += "\n───────────────────────────────────────────\n";
            output += chalk.yellow("TITLE:           " + response.data.Title + "\n");
            output += chalk.yellow("YEAR:            " + response.data.Year + "\n");
            output += chalk.yellow("IMDB Rating:     " + response.data.Ratings[0].Value + "\n");
            output += chalk.yellow("Rotten Tomatoes: " + response.data.Ratings[1].Value + "\n");
            output += chalk.yellow("Country:         " + response.data.Country + "\n");
            output += chalk.yellow("Language:        " + response.data.Language + "\n");
            output += chalk.yellow("Plot:            " + response.data.Plot + "\n");
            output += chalk.yellow("Actors:          " + response.data.Actors + "\n");
            }
            output += "\n───────────────────────────────────────────\n";
            writeLog(output);
            console.log(output);
            init();
        })
        .catch(function(error) {
            console.log("");
        });    
}
// function concert this
function concertThis(artist) {
  var output = "";
  if (artist == "") {
    artist = "disturbed";
  }
  var queryUrl = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
  // console.log(queryUrl)
  axios
      .get(queryUrl)
      .then(function(response) {
        // console.log(response); 
         if (response.data == undefined || response.data.length == 0){
          output += "\n───────────────────────────────────────────\n";
          output += chalk.magenta("....Sorry! I couldn't find concert data for " + toTitleCase(artist) + ". Try another artist.\n");
          output += "\n───────────────────────────────────────────\n";
          writeLog(output);
          console.log(output);
         } else {
           //console.log(response.data.slice(0,10))
            response.data.slice(0,10).forEach(function (element) {
            output = ""
            output += "\n───────────────────────────────────────────\n";
            output += chalk.magenta("Artist: " + toTitleCase(artist) + "\n");
            output += chalk.magenta("Venue: " + element.venue["name"] + "\n");
            if (element.venue["region"]==""){
              output += chalk.magenta("Location: " + element.venue["city"] + ", " + element.venue["country"] + "\n");
            } else {
              output += chalk.magenta("Location: " + element.venue["city"] + ", " + element.venue["region"] + ", " + element.venue["country"] + "\n");
            }
            output += chalk.magenta("Date: " + moment(element.datetime).format("MM/DD/YYYY") + "\n");
            output += "\n───────────────────────────────────────────\n";
            writeLog(output);
            console.log(output);
        })}
        init();
      })
      .catch(function(error) {
          console.log("");
      });

}
// Execute the command from text file
function doTextFile() {
  fs.readFile("random.txt", "utf8", function(error, data) {
    // If the code experiences any errors it will log the error to the console.
    if (error) {
      return console.log(error);
    }
    // Then split it by commas (to make it more readable)
    var dataArr = data.split(",");
    command = dataArr[0];
    args = dataArr[1];
    //console.log(dataArr)
    //console.log(command, args)
    aiLogic(command, args);
  });
}
