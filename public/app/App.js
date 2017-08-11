import React, { Component } from 'react';
import './App.css';
import axios from 'axios';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      resizeUpdate: false,
      showMore: false,
      showMoreText: 'Show More ▾',
      headerText: 'Pick a champ to preview their skins',
      activeView: 'champList',
      activeChamp: 'Aatrox',
      activeSkin: '',
      activeVideo: 'S1KMKxtiliY',
      youtubePath: 'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UC0NwzCHb8Fg89eTB5eYX17Q&maxResults=5&q=',
      backgroundUrl: 'http://cdn.leagueoflegends.com/lolkit/1.1.6/resources/images/bg-default.jpg',
      iconStyle: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 20,
        marginTop: 700,
        opacity: 0
      },
      iconLoadedStyle: {
        marginLeft: 5,
        marginRight: 5,
        marginBottom: 20,
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
      champDetailBackgroundStyle: {
        opacity: .1,
      },
      champDetailBackgroundLoadedStyle: {
        opacity: 1,
      },
      backgroundLoaded: false,
      iconsLoaded: [],
      skinsLoaded: []
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
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
    let update = this.state.resizeUpdate;

    if(!update) {
      this.setState({
        windowWidth: window.innerWidth, 
        windowHeight: window.innerHeight, 
        resizeUpdate: true, 
        resizeUpdate: false
      });
    }
  }

  handleChampClick(champ) {
    let skinName = champ;
    let headerText;

    if(this.state.champData) {
      skinName = this.state.champData.data[champ].skins[1].name;
      headerText = this.state.champData.data[champ].name + ': ' + this.state.champData.data[champ].title;
    }

    this.setState({
      activeChamp: champ, 
      activeSkin: skinName,
      headerText,
      iconsLoaded: this.state.iconsLoaded.fill(false),
      skinsLoaded: [],
      backgroundLoaded: false,
      
    });

    skinName = skinName.split(' ').join('+');
    this.searchYoutube(skinName);

    setTimeout(() => {
      this.setState({backgroundUrl: 'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/' + champ + '_1.jpg', activeView: 'champDetail' })
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    }, 500);
  }

  handleBack() {
    this.setState({
      
      headerText: 'Pick a champ to preview their skins',
      backgroundLoaded: false
    });
    setTimeout(() => {
      this.setState({activeView: 'champList', backgroundUrl: 'http://cdn.leagueoflegends.com/lolkit/1.1.6/resources/images/bg-default.jpg'})
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    }, 500);
  }

  handleShowMore() {
    let showMoreText;
    if(!this.state.showMore)
      showMoreText = 'Show Less ▴';
    else
      showMoreText = 'Show More ▼';

    this.setState({ showMore: !this.state.showMore, showMoreText });
  }

  handleSkinClick(skinName, splashPath, i) {
    let champ = this.state.activeChamp;

    if(skinName === 'default')
      skinName = champ + ' top plays';
      // skinName = this.state.activeChamp;
    let name;

    if(i === 0)
      name = this.state.champData.data[champ].name;
    else
      name = this.state.champData.data[champ].skins[i].name;
    
    let title = this.state.champData.data[champ].title;
    this.setState({headerText: name + ': ' + title, backgroundLoaded: false, activeSkin: name});

    skinName = skinName.split(' ').join('+');
    this.searchYoutube(skinName);

    setTimeout(() => this.setState({backgroundUrl: splashPath}), 500);
  }

  searchYoutube(skinName) {
    axios.post('/youtube', {skinName})
    .then((res) => {
      // console.log(res.data)
      this.setState({activeVideo: res.data.items[0].id.videoId});
    })
  }
  onBackgroundLoad() {
    this.setState({backgroundLoaded: true});
  }
  onIconLoad(i) {
    const iconsLoaded = this.state.iconsLoaded;
    iconsLoaded[i] = true;
    this.setState({iconsLoaded});
  }

  onSkinLoad(i) {
    // console.log(`loaded ${i}`)
    const skinsLoaded = this.state.skinsLoaded;
    skinsLoaded[i] = true;
    this.setState({skinsLoaded});
  }

  render() {
    // console.log('render')
    const { 
      windowWidth,
      windowHeight,
      headerText,
      champData, 
      activeView, 
      activeChamp, 
      activeSkin,
      activeVideo, 
      backgroundUrl, 
      showMore,
      showMoreText,
      iconStyle, 
      iconLoadedStyle, 
      iconsLoaded, 
      skinsLoaded, 
      skinStyle, 
      skinLoadedStyle,
      champDetailBackgroundStyle,
      champDetailBackgroundLoadedStyle,
      backgroundLoaded } = this.state;

    let version = '7.14.1'
    let champ = {};

    if(champData) {
      version = champData.version;
      champ = champData.data[activeChamp];
    }
    const iconPath = 'http://ddragon.leagueoflegends.com/cdn/' + version + '/img/champion/';
    const skinPath = 'http://ddragon.leagueoflegends.com/cdn/img/champion/loading/';
    const splashPath = 'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/';

    let iconSize = windowWidth > 600 ? 110 : 70;
    let iconsPerRow = Math.floor(windowWidth / iconSize);

    return (
      <div className="App">
        <div className="App-header">
          <img src="../leagueSkins.png" alt="Welcome to League Skins"/>
          <p className="App-intro">
            {headerText}
          </p>
          {activeView === 'champDetail' && <button className='backBtn btn' onClick={this.handleBack.bind(this)}>&lsaquo;&nbsp;Back</button>}
        </div>


        {activeView === 'champList' && <div name='champList' className='champList'>
          
          {champData && Object.keys(champData.data).map((champ, i) => {
            if(i >= iconsPerRow * 3 && !showMore)
              return;

            const name = champData.data[champ].name;
            const title = champData.data[champ].title;

            return (
              <span key={i} className='icon' onClick={() => this.handleChampClick(champ)} style={iconsLoaded[i] ? iconLoadedStyle : iconStyle}>
                <img src={iconPath + champ + '.png'} onLoad={() => this.onIconLoad(i)} />
                <p>{name}</p>
              </span>
            )
          })}
          <button className='showMore btn' onClick={this.handleShowMore.bind(this)}>{showMoreText}</button>
          
        </div>}


        {activeView === 'champDetail' && 
        <div name='champDetail' className='champDetail' style={{overflow: 'hidden'}}>

          <div className='youtubeContainer'>
          <iframe src={"https://www.youtube.com/embed/" + activeVideo + '?rel=0&autoplay=1'} frameBorder="0" allowFullScreen></iframe>
          </div>

          <div className='skinContainer'>
          {champ.skins.map((skin, i) => {
            if(i === 0) 
              return;

            const path = skinPath + champ.key + '_' + i + '.jpg';
            const path2 = splashPath + champ.key + '_' + i + '.jpg';
            let skinName = skin.name;

            let style = Object.assign({}, skinLoadedStyle);
            if(skinName === activeSkin)
              style.border = '2px solid #1db7bf';

            // if(skinName === 'default')
            //   skinName = 'Default';

            // if(skinName.length > 19)
            //   skinName = skinName.substring(0, 19);

            return (
              <div 
                key={i} 
                className='skinDetail'
                onClick={() => this.handleSkinClick(skin.name, path2, i)}
                style={style}
              >
                <div>
                  <img src={path} onLoad={() => this.onSkinLoad(i)} />
                  <p>{skinName}</p>
                </div>
              </div>
            )
          })}
          </div>
        </div>}


        <div className='background'>
          <img onLoad={this.onBackgroundLoad.bind(this)} className='champDetailBackground' src={backgroundUrl} style={backgroundLoaded ? champDetailBackgroundLoadedStyle : champDetailBackgroundStyle} />
        </div>
      </div>
    );
  }
}

export default App;
