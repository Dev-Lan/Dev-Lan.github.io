import React, { Component } from 'react';
import './YouTubePlaylist.css';

class YouTubePlaylist extends Component {
    render()
    {
        if (this.props.videoIds)
        {
            return (
                <div className="YouTubePlaylist">
                    <h2>
                    {this.props.playlistTitle}
                    </h2>
                    <div className='iframe-container'>
                        <iframe className='responsive-iframe' src={"https://www.youtube.com/embed/VIDEO_ID?playlist=" + this.props.videoIds} frameBorder="0" allowFullScreen></iframe>
                    </div>
                </div>
            );
        }
        else if (this.props.playlistTitle)
        {
            return (
                <div className="YouTubePlaylist">
                    <h2>
                    {this.props.playlistTitle}
                    </h2>
                    <div className='iframe-container'>
                    </div>

                </div>
            );
        }
        else
        {
            return <div></div>
        }
    }
}

export default YouTubePlaylist;
