import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeView: 'champList',
      activeChamp: 'Aatrox',
      activeVideo: 'S1KMKxtiliY',
      youtubePath: 'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UC0NwzCHb8Fg89eTB5eYX17Q&maxResults=5&q='
    };
  }

  componentWillMount() {
    axios.get('/champData')
    .then((res) => {
        // console.log('componentWillMount', res.data)
        this.setState({
          champData: res.data
        });
      })
    .catch((err) => console.log(err))
  }

  handleIconClick(champ) {
    let skinName = champ; //fix this to have better default video

    if(this.state.champData)
      skinName = this.state.champData.data[champ].skins[1].name;

    if(skinName === 'default')
      skinName = this.state.activeChamp;

    skinName = skinName.split(' ').join('+');

    this.setState({activeView: 'champDetail', activeChamp: champ});

    this.searchYoutube(skinName);
  }

  handleBack() {
    this.setState({activeView: 'champList'});
  }

  handleSkinClick(skinName) {
    console.log(skinName)
    if(skinName === 'default')
      skinName = this.state.activeChamp;

    skinName = skinName.split(' ').join('+');

    this.searchYoutube(skinName);
  }

  searchYoutube(skinName) {
    axios.post('/youtube', {skinName})
    .then((res) => {
      console.log(res.data)
      this.setState({activeVideo: res.data.items[0].id.videoId});
    })
  }

  render() {
    const { champData, activeView, activeChamp, activeVideo } = this.state;

    let version = '7.14.1'
    let champ = {};

    if(champData) {
      version = champData.version;
      champ = champData.data[activeChamp];
    }
    const iconPath = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/';
    const skinPath = 'http://ddragon.leagueoflegends.com/cdn/img/champion/loading/';

    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to League Skins</h2>
          <p className="App-intro">
            Pick a champ below to preview their skins
          </p>
        </div>

        {activeView === 'champList' && <div name='champList'>
          {champData && Object.keys(champData.data).map(champ => {
            const name = champData.data[champ].name
            const title = champData.data[champ].title

            return (
              <span className='icon' onClick={() => this.handleIconClick(champ)}>
                <img src={iconPath + champ + '.png'} />
                <p>{name}</p>
              </span>
            )
          })}
        </div>}
        {activeView === 'champDetail' && 
        <div name='champDetail' className='champDetail'>
          <button onClick={this.handleBack.bind(this)}>Back</button>
          <h1>{champ.name}</h1>
          <h3>{champ.title}</h3>
          {champ.skins.map((skin, i) => {
            const path = skinPath + champ.key + '_' + i + '.jpg';
            let skinName = skin.name;

            if(skinName === 'default')
              skinName = 'Default';

            if(skinName.length > 20)
              skinName = skinName.substring(0, 20);

            return (
              <div 
                onClick={() => this.handleSkinClick(skin.name)}
                style={{background: 'url("' + path + '")', backgroundSize: '175px 318px', margin: 5, width: 175, height: 318, display: 'inline-block'}}>
                <p style={{color: 'white', marginTop: 293}}>{skinName}</p>
              </div>
            )
          })}
          <iframe width="560" height="315" src={"https://www.youtube.com/embed/" + activeVideo} frameborder="0" allowfullscreen></iframe>
        </div>}

      </div>
    );
  }
}

export default App;
