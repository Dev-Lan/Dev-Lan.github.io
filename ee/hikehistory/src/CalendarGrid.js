import React, { Component } from 'react';
import './CalendarGrid.css';
import HeatMap from 'react-heatmap-grid';
import YouTubePlaylist from './YouTubePlaylist';

class CalendarGrid extends Component
{
    constructor(props) {
        super(props);
        this.state = { width: 0, height: 0, monthDayKey: '' };
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
      }

    render()
    {
        if (this.props.data)
        {
            let monthDayIndex = new Map();
            for (let row of this.props.data)
            {
                let datetime = row.When;
                let videoId = row.Video;
                let [month, day, _yeartime] = row.When.split('/');
                let key = month + '-' + day;
                if (!monthDayIndex.has(key))
                {
                    monthDayIndex.set(key, []);
                }
                monthDayIndex.get(key).push(videoId);
            }
            let months = ['Jan','Feb','Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            if (this.state.width < 480)
            {
                months = ['J.','F.','M.', 'A.', 'M.', 'J.', 'J.', 'A.', 'S.', 'O.', 'N.', 'D.'];
            }
            else
            {
                months = ['Jan','Feb','Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            }
            const days = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
            let videoCounts = [];
            for (let day = 1; day <= 31; day++)
            {
                let dayArray = [];
                for (let month=1; month <= 12; month++)
                {
                    let key = month + '-' + day;
                    let videoCount = 0;
                    if (monthDayIndex.has(key))
                    {
                        videoCount = monthDayIndex.get(key).length;
                    }
                    dayArray.push(videoCount);
                }
                videoCounts.push(dayArray);
            }
            console.log(videoCounts);

            const today = new Date();
            const month = today.getMonth();
            const date = today.getDate() - 1; // zero index for consistency later

            return (
                <div>
                    <div className="CalendarGrid">
                    <HeatMap
                        squares={true}
                        xLabels={months}
                        yLabels={days}
                        data={videoCounts} 
                        yLabelTextAlign={'center'}
                        height={Math.min(Math.max(this.state.width / 16, 10), 60)}
                        cellStyle={(background, value, min, max, data, x, y) =>
                        {
                            let styleObj = {
                                background: value > 0 ? `#D9D569` : 'rgb(0,0,0,0.1)',
                                // background: value > 0 ? `#CE9F73` : 'rgb(0,0,0,0.1)',
                                // fontSize: "10pt",
                                cursor: value > 0 ? "pointer" : "default",
                                color: "#333"
                            }
                            if (this.state.width < 400)
                            {
                                styleObj.fontSize = '9pt';
                            }
                            else if (this.state.width < 600)
                            {
                                styleObj.fontSize = '10pt';
                            }
                            else if (this.state.width < 800)
                            {
                                styleObj.fontSize = '11pt';
                            }
                            else if (this.state.width < 1000)
                            {
                                styleObj.fontSize = '12pt';
                            }
                            else if (this.state.width < 1200)
                            {
                                styleObj.fontSize = '13pt';
                            }

                            if (x == month && y == date)
                            {
                                styleObj.outline = 'solid #964B91 2px';
                            }
                            let thisDate = new Date(2020, x, y+1);
                            if (thisDate.getMonth() !== x)
                            {
                                styleObj.background = 'rgb(0,0,0,0)';
                            }
                            return styleObj;
                        }}
                        onClick={(x, y) => 
                        {
                            let key = (x + 1) + '-' + (y + 1);
                            if (!monthDayIndex.has(key))
                            {
                                return;
                            }
                            this.setState({monthDayKey: key});
                        }}
                        cellRender={value => value > 0 ? <div className='calendarCell'>{value}</div> : <div></div>} 
                    />
                    </div>
                    <YouTubePlaylist playlistTitle={this.state?.monthDayKey ? this.getDateStringFromKey(this.state.monthDayKey) : ''} videoIds={this.state?.monthDayKey ? monthDayIndex.get(this.state.monthDayKey) : ''} />
                </div>
            );
        }
        else 
        {
            return (
                <div className="CalendarGrid">
                    Loading...
                </div>
            );
        }
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }
      
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
    
    updateWindowDimensions() {
        this.setState(function(state, props)  { 
            return { monthDayKey: state.monthDayKey, width: window.innerWidth, height: window.innerHeight }
        });
    }
    
    getDateStringFromKey(monthDayKey)
    {
        let [month, day] = monthDayKey.split('-');
        month -= 1;
        let date = new Date(2020, month, day)
        return date.toLocaleString('default', {month: 'long', day: 'numeric'})

    }
}

export default CalendarGrid;
