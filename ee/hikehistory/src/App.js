import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';
import YouTubePlaylist from './YouTubePlaylist';
import CalendarGrid from './CalendarGrid';
import {tsv} from 'd3-fetch';

class App extends Component {

  componentDidMount()
  {
    this.fetchData();
  }

  fetchData()
  {
    tsv('https://docs.google.com/spreadsheets/d/e/2PACX-1vRbuRgkPKcZuCdROW4HPx1gXwHIu_Z9gYmj5mlRwSzYjd2KAU9G4oaP9xffOV9bf6WUNADtyrCU2Yot/pub?output=tsv')
      .then(data =>
        {
          console.log(data);
          this.setState({data: data});
        })
  }

  getAllVideoIds(data)
  {
    let videoIds = data.map(x => x.Video);
    videoIds.reverse(); // reverse chron
    return videoIds.join(',');
  }

  render()
  {
    let videoIds = '';
    if (this.state?.data)
    {
      videoIds = this.getAllVideoIds(this.state.data);
    }
    return (
      <div className="App">
        <h1>Hike History</h1>
        <YouTubePlaylist playlistTitle={'All Videos'} videoIds={videoIds} />
        <CalendarGrid data={this.state?.data}/>
      </div>
    );
  }
}

export default App;
