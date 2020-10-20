class IntervalTimerDisplay
{
    constructor(intervalData, containerId)
    {
        this.data = intervalData;
        this.containerSelect = d3.select('#' + containerId);
        this.firstTimemark = Date.now();
        this.lastTimemark = Date.now();
        this.startAudio = new Audio('./assets/321-go.mp3');
        this.endAudio = new Audio('./assets/321-rest.mp3');
        
        this.largeRoadmapMargin = 50;
        this.largeRoadmapDotR = 25;
        let numSpaces = this.data.mainWorkoutList.length;

        this.largeRoadmapScaleX = d3.scaleLinear()
            .domain([0, numSpaces - 1])
            .range([this.largeRoadmapMargin, this.largeRoadmapWidth - this.largeRoadmapMargin]);

        this.largeRoadmapSvg = d3.select('#roadmap-viz-container')
            .append('svg')
            .attr('width', 0)
            .attr('height', 0);

        
        // small roadmap init
        this.smallRoadmapHeight = 300;
        this.smallRoadmapWidth = 1000;
        this.smallRoadmapDotR = this.smallRoadmapHeight / 6;
        this.smallRoadmapScaleX = d3.scaleLinear()
            .domain([0, this.data.intervalPattern.length/2 + 1])
            .range([0, this.smallRoadmapWidth]);

        const gapWidth = this.smallRoadmapScaleX(1) - this.smallRoadmapScaleX(0) - 2 * this.smallRoadmapDotR;

        this.smallRoadmapScaleWidth = d3.scaleLinear()
            .domain([0, 1])
            .range([0, gapWidth]);

        this.smallRoadmapSvg = d3.select('#small-roadmap-viz-container')
            .append('svg')
            .attr('width', 0)
            .attr('height', 0)
            .classed('small-roadmap-viz', true);
            
        this.init();
        this.update();
        this.resize();
        this.playing = false;
        d3.select('#play-button').on('click', () => this.play());
        d3.select('#pause-button').on('click', () => this.pause());
    }

    init()
    {
        let formatOptions = {
            hour: 'numeric', minute: 'numeric'
          };
        const start = new Intl.DateTimeFormat('en-US', formatOptions).format(this.firstTimemark);
        const endDate = this.firstTimemark + (this.data.workoutLength * 1000);
        const end = new Intl.DateTimeFormat('en-US', formatOptions).format(endDate);
        d3.select('#top-roadmap').selectAll('.clock-time')
            .data([start, end])
            .text(d => d);
    }

    resize()
    {

        let bbox = d3.select('#roadmap-viz-container').node().getBoundingClientRect();
        this.largeRoadmapHeight = bbox.height * 0.9;
        this.largeRoadmapWidth = bbox.width;

        const pad = 4 +  this.largeRoadmapHeight * 0.1;// 4 is based on stroke-width of .in-progress css class

        this.largeRoadmapMargin = this.largeRoadmapHeight;
        this.largeRoadmapDotR = this.largeRoadmapHeight / 2 - pad;
        this.largeRoadmapDotR = Math.min(this.largeRoadmapDotR, 0.8 * this.largeRoadmapWidth / (2 * this.data.mainWorkoutList.length));

        let numSpaces = this.data.mainWorkoutList.length;

        this.largeRoadmapScaleX = d3.scaleLinear()
            .domain([0, numSpaces - 1])
            .range([this.largeRoadmapMargin, this.largeRoadmapWidth - this.largeRoadmapMargin]);


        this.largeRoadmapSvg
            .attr('width', this.largeRoadmapWidth)
            .attr('height', this.largeRoadmapHeight);



        bbox = d3.select('#small-roadmap-viz-container').node().getBoundingClientRect();
        this.smallRoadmapHeight = bbox.height;
        this.smallRoadmapWidth = bbox.width * 0.8;


        this.smallRoadmapDotR = this.smallRoadmapWidth / 14;

        this.smallRoadmapScaleX = d3.scaleLinear()
            .domain([0, this.data.intervalPattern.length/2 + 1])
            .range([0, this.smallRoadmapWidth]);

        const gapWidth = this.smallRoadmapScaleX(1) - this.smallRoadmapScaleX(0) - 2 * this.smallRoadmapDotR;

        this.smallRoadmapScaleWidth = d3.scaleLinear()
            .domain([0, 1])
            .range([0, gapWidth]);


        this.smallRoadmapSvg
            .attr('width', this.smallRoadmapWidth)
            .attr('height', this.smallRoadmapHeight)

        this.update();
    }

    
    update()
    {
        let deltaTime = (Date.now() - this.lastTimemark) / 1000;
        this.lastTimemark = Date.now();
        this.data.update(deltaTime);
        
        let workoutName = this.data.currentWorkout();
        const onCooldown = this.data.onCooldown();
        if (onCooldown)
        {
            workoutName += ' (rest)'
        }

        d3.select('#outer-container')
            .classed('run', !onCooldown)
            .classed('rest', onCooldown);

        this.containerSelect
            .select('#name-container')
            .text(workoutName);

        let timeRemaining = this.data.timeRemaining();

        if (onCooldown)
        {
            if (timeRemaining < 3)
            {
                this.startAudio.play();
            }
        }
        else
        {
            if (timeRemaining < 3)
            {
                this.endAudio.play();
            }
        }

        this.updateLargeRoadmap();
        this.updateSmallRoadmap();

        let dateObj = new Date(1000 * timeRemaining);
        let timeString = '';
        if (timeRemaining >= 60)
        {
            timeString = `${dateObj.getMinutes()}:${('0' + dateObj.getSeconds()).slice(-2)}`;
        }
        else
        {
            timeString = timeRemaining.toFixed(1);
        }
        this.containerSelect
            .select('#countdown-time')
            .text(timeString);

        if (this.data.isDone())
        {
            this.playing = false;
        }
        if (this.playing)
        {
            window.requestAnimationFrame(() => this.update());
        }
    }

    updateLargeRoadmap()
    {
        const midY = this.largeRoadmapHeight / 2;
        // add dots
        this.largeRoadmapSvg.selectAll('.small-dot')
            .data(this.data.mainWorkoutList)
            .join('circle')
            .attr('cx', (d, i) => this.largeRoadmapScaleX(i))
            .attr('cy', midY)
            .attr('r', this.largeRoadmapDotR)
            .classed('small-dot', true)
            .classed('complete', (d, i) => i < this.data.workoutIndex)
            .classed('in-progress', (d, i) => i === this.data.workoutIndex)
            .classed('incomplete', (d, i) => i > this.data.workoutIndex)
            
        // long break lines
        const numBreaks = Math.floor(this.data.mainWorkoutList.length / this.data.countPerPass);
        let breaks = [];
        for (let i = 1; i < numBreaks; i++)
        {
            breaks.push(i * this.data.countPerPass - 0.5);
        }

        const lineHalfLength = this.largeRoadmapDotR * 1.3

        this.largeRoadmapSvg.selectAll('.break-line')
            .data(breaks)
            .join('line')
            .attr('x1', d => this.largeRoadmapScaleX(d))
            .attr('x2', d => this.largeRoadmapScaleX(d))
            .attr('y1', midY + lineHalfLength)
            .attr('y2', midY - lineHalfLength)
            .attr('stroke', 'black')
            .attr('stroke-width', 3)
            .attr('stroke-linecap', 'round')
            .classed('break-line', true);

    }

    updateSmallRoadmap()
    {
        const midY = this.smallRoadmapHeight / 2;
        // add outlines
        let workoutState = this.data.getRunState();
        this.smallRoadmapSvg.selectAll('circle')
            .data(workoutState)
            .join('circle')
            .attr('cx', (d, i) => this.smallRoadmapScaleX(i) + this.smallRoadmapDotR)
            .attr('cy', midY)
            .attr('r', this.smallRoadmapDotR)
            .style('fill', 'white')

        // add arcs
        var arc = d3.arc()
            .innerRadius(0)
            .outerRadius(this.smallRoadmapDotR)
            .startAngle(0);


        this.smallRoadmapSvg.selectAll('.dot')
            .data(workoutState)
            .join('path')
            .attr('d', d => arc({endAngle: 2 * d * Math.PI}))
            .attr('transform', (d, i) => `translate(${this.smallRoadmapScaleX(i) + this.smallRoadmapDotR}, ${midY})`)
            .style('fill', 'black')
            .classed('dot', true);


        // add paths
        const pathWidth = 6;
        let restState = this.data.getCooldownState();

        this.smallRoadmapSvg.selectAll('.rest-line-incomplete')
            .data(restState)
            .join('rect')
            .attr('x', (d, i) => this.smallRoadmapScaleX(i) + 2 * this.smallRoadmapDotR)
            .attr('y', midY - pathWidth / 2)
            .attr('width', d => this.smallRoadmapScaleWidth(1))
            .attr('height', pathWidth)
            .style('fill', 'white')
            // .style('stroke', 'white')
            .classed('rest-line-incomplete', true);

        this.smallRoadmapSvg.selectAll('.rest-line')
            .data(restState)
            .join('rect')
            .attr('x', (d, i) => this.smallRoadmapScaleX(i) + 2 * this.smallRoadmapDotR)
            .attr('y', midY - pathWidth / 2)
            .attr('width', d => this.smallRoadmapScaleWidth(d))
            .attr('height', pathWidth)
            .style('fill', 'black')
            .style('stroke', 'black')
            .classed('rest-line', true);

        // add next workout text
        const offset = 8;
        const xPos = offset + this.smallRoadmapScaleX(restState.length);
        this.smallRoadmapSvg.selectAll('text')
            .data([this.data.nextWorkout()])
            .join('text')
            .attr('x', xPos)
            .attr('y', midY)
            .attr('alignment-baseline', 'middle')
            .classed('label', true)
            .classed('medium', true)
         .selectAll('tspan')
            .data(d => d.split(' '))
            .join('tspan')
            .attr('x', xPos)
            .attr('y', (d, i) => midY + 26 * i)
            .text(d => d);
    }

    play()
    {
        this.lastTimemark = Date.now();
        this.playing = true;
        this.update();
        d3.select('#play-button').classed('no-display', true);
        d3.select('#pause-button').classed('no-display', false);
    }

    pause()
    {
        this.playing = false;
        d3.select('#play-button').classed('no-display', false);
        d3.select('#pause-button').classed('no-display', true);
    }

}