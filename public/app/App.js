import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      windowWidth: window.innerWidth,
      headerText: 'Pick a champ to preview their skins',
      activeView: 'champList',
      activeChamp: 'Aatrox',
      activeVideo: 'S1KMKxtiliY',
      youtubePath: 'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UC0NwzCHb8Fg89eTB5eYX17Q&maxResults=5&q=',
      backgroundUrl: 'http://cdn.leagueoflegends.com/lolkit/1.1.6/resources/images/bg-default.jpg',
      iconStyle: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
        marginTop: 700,
        opacity: 0
      },
      iconLoadedStyle: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
        marginTop: 5,
        opacity: 1
      },
      skinStyle: {
        marginLeft: 700,
        marginRight: 5,
        marginBottom: 5,
        marginTop: 5,
        opacity: 0
      },
      skinLoadedStyle: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 5,
        marginTop: 5,
        opacity: 1
      },
      iconsLoaded: [],
      skinsLoaded: []
    };
  }

  componentDidMount() {
    const context = this;  
    window.addEventListener("resize", this.updateDimensions.bind(context));
  }

  componentWillUnmount() {
    const context = this;  
    window.removeEventListener("resize", this.updateDimensions.bind(context));
  }

  componentWillMount() {
    this.updateDimensions();
    axios.get('/champData')
    .then((res) => {
        // console.log('componentWillMount', res.data)
        this.setState({
          champData: res.data
        });
      })
    .catch((err) => console.log(err));
  }

  updateDimensions() {
    this.setState({windowWidth: window.innerWidth})
  }

  handleIconClick(champ) {
    let skinName = champ; //fix this to have better default video
    let headerText;

    if(this.state.champData) {
      skinName = this.state.champData.data[champ].skins[1].name;
      headerText = this.state.champData.data[champ].name + ': ' + this.state.champData.data[champ].title;
    }

    if(skinName === 'default')
      skinName = this.state.activeChamp;

    skinName = skinName.split(' ').join('+');

    this.setState({
      activeChamp: champ, 
      headerText,
      iconsLoaded: this.state.iconsLoaded.fill(false),
      skinsLoaded: [],
      backgroundUrl: 'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + champ + '_0.jpg'
    });

    this.searchYoutube(skinName);

    setTimeout(() => this.setState({ activeView: 'champDetail' }), 1000);
  }

  handleBack() {
    this.setState({activeView: 'champList', headerText: 'Pick a champ to preview their skins'});
  }

  handleSkinClick(skinName, splashPath, i) {
    let champ = this.state.activeChamp;

    if(skinName === 'default')
      skinName = champ + ' top plays';
      // skinName = this.state.activeChamp;

    let name = this.state.champData.data[champ].skins[i].name;  
    let title = this.state.champData.data[champ].title;  

    this.setState({backgroundUrl: splashPath, headerText: name + ': ' + title});

    skinName = skinName.split(' ').join('+');
    this.searchYoutube(skinName);
  }

  searchYoutube(skinName) {
    axios.post('/youtube', {skinName})
    .then((res) => {
      // console.log(res.data)
      this.setState({activeVideo: res.data.items[0].id.videoId});
    })
  }

  onIconLoad(i) {
    const iconsLoaded = this.state.iconsLoaded;
    iconsLoaded[i] = true;
    this.setState({iconsLoaded});
  }

  onSkinLoad(i) {
    console.log(`loaded ${i}`)
    const skinsLoaded = this.state.skinsLoaded;
    skinsLoaded[i] = true;
    this.setState({skinsLoaded});
  }

  render() {
    console.log('render')
    const { 
      windowWidth,
      headerText,
      champData, 
      activeView, 
      activeChamp, 
      activeVideo, 
      backgroundUrl, 
      iconStyle, 
      iconLoadedStyle, 
      iconsLoaded, 
      skinsLoaded, 
      skinStyle, 
      skinLoadedStyle } = this.state;

      console.log(windowWidth)
    let version = '7.14.1'
    let champ = {};

    if(champData) {
      version = champData.version;
      champ = champData.data[activeChamp];
    }
    const iconPath = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/';
    const skinPath = 'http://ddragon.leagueoflegends.com/cdn/img/champion/loading/';
    const splashPath = 'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/';

    return (
      <div className="App">
        <div className="App-header">
          <h2>Welcome to League Skins</h2>
          <p className="App-intro">
            {headerText}
          </p>
          {activeView === 'champDetail' && <button className='backBtn' onClick={this.handleBack.bind(this)}>Back</button>}
        </div>

        {activeView === 'champList' && <div name='champList' className='champList' style={{background: 'url(http://cdn.leagueoflegends.com/lolkit/1.1.6/resources/images/bg-default.jpg) no-repeat center center fixed'}}>
          <div style={{paddingTop: 110}}>
          {champData && Object.keys(champData.data).map((champ, i) => {
            const name = champData.data[champ].name
            const title = champData.data[champ].title

            return (
              <span className='icon' onClick={() => this.handleIconClick(champ)} style={iconsLoaded[i] ? iconLoadedStyle : iconStyle}>
                <img src={iconPath + champ + '.png'} onLoad={() => this.onIconLoad(i)} />
                <p>{name}</p>
              </span>
            )
          })}
          </div>
        </div>}
        {activeView === 'champDetail' && 
        <div name='champDetail' className='champDetail' style={{background: 'url(' + backgroundUrl + ') no-repeat top right fixed'}}>
          <div style={{paddingTop: 110}}>
          
          <div style={{textAlign: 'left', margin: '30px 5%'}}>
          <iframe width="560" height="315" src={"https://www.youtube.com/embed/" + activeVideo + '?rel=0'} frameborder="0" allowfullscreen></iframe>
          </div>

          <div className='skinContainer'>
          {champ.skins.map((skin, i) => {
            const path = skinPath + champ.key + '_' + i + '.jpg';
            const path2 = splashPath + champ.key + '_' + i + '.jpg';
            let skinName = skin.name;

            if(skinName === 'default')
              skinName = 'Default';

            // if(skinName.length > 19)
            //   skinName = skinName.substring(0, 19);

            return (
              <div 
                className='skinDetail'
                onClick={() => this.handleSkinClick(skin.name, path2, i)}
                style={skinLoadedStyle}
              >
                <div>
                  <img src={path} onLoad={() => this.onSkinLoad(i)} />
                  <p>{skinName}</p>
                </div>
              </div>
            )
          })}
          </div>
          </div>
        </div>}

      </div>
    );
  }
}

export default App;
