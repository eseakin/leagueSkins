const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const axios = require('axios');
const fb = require('firebase');
const hasher = require('object-hash');
// require('dotenv').config()

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(favicon(path.join(__dirname, './public', 'favicon.png')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  console.log('get')
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize Firebase
const config = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId
};

fb.initializeApp(config);
const db = fb.database();

//Make sure data is current
const compareRiotDataHash = function() {
  db.ref('/champData/hash').once('value')
    .then(snapshot => {
      const dbHash = snapshot.val();

      const route = 'https://na1.api.riotgames.com/lol/static-data/v3/champions?locale=en_US&tags=skins&dataById=false';

      axios.get(route + '&api_key=' + process.env.RIOT_API_KEY)
        .then(function (response) {
          let riotHash = hasher(response.data);
          
          if(riotHash != dbHash)
            db.ref('/champData').set(response.data)
        })
        .catch(function (error) {
          console.log(error);
        });
    });
}
// compareRiotDataHash();


app.get('/champData', (req, res) => {
  console.log('champData')
  db.ref('/champData').once('value')
    .then(snap => res.send(snap.val()))
    .catch(err => console.log(err));
});

app.post('/youtube', (req, res) => {
  console.log('youtube')
  let skinName = req.body.skinName;
  let key = process.env.youtube_key;
  let path = 'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UC0NwzCHb8Fg89eTB5eYX17Q&maxResults=5&q=' + skinName + '&key=' + key;
  res.send({});
  // axios.get(path)
  // .then((result) => {
  //   res.send(result.data);
  // })
  // .catch(err => console.log(err));
});

let port = process.env.PORT || 9000;

app.listen(port);
console.log('app listening on ' + port)










