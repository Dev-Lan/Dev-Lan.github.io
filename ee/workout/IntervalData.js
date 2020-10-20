class IntervalData
{
    constructor() { }

    update(deltaTime)
    {
        this.timeElapsed += deltaTime;
        let timeRemaining = this.timeRemaining();
        if (timeRemaining <= 0)
        {
            if (!this.warmUpComplete)
            {
                this.warmUpComplete = true;
            }
            else if (!this.mainWorkoutComplete())
            {
                this.intervalIndex++;
                if (this.intervalIndex === this.intervalPattern.length)
                {
                    this.intervalIndex = 0;
                    this.workoutIndex++;
                }
            }
            else if (!this.stretchComplete)
            {
                this.stretchComplete = true;
            }
            this.timeElapsed = Math.abs(timeRemaining);
        }
    }

    currentWorkout()
    {
        if (!this.warmUpComplete)
        {
            let i = Math.floor(this.percentDone() * this.warmUpList.length);
            return this.warmUpList[i];
        }
        if (!this.mainWorkoutComplete())
        {
            return this.mainWorkoutList[this.workoutIndex];
            
        }
        if (!this.stretchComplete)
        {
            let i = Math.floor(this.percentDone() * this.stretchList.length);
            return this.stretchList[i];
        }
        return 'Workout Complete!';
    }

    nextWorkout()
    {
        if (this.workoutIndex >= this.mainWorkoutList.length - 1)
        {
            if (this.stretchComplete)
            {
                return 'Done!';
            }
            else
            {
                return 'Stretch'
            }
        }
        return this.mainWorkoutList[this.workoutIndex + 1];
    }

    timeRemaining()
    {
        if (!this.warmUpComplete)
        {
            return this.warmUpLength - this.timeElapsed;
        }
        if (!this.mainWorkoutComplete())
        {

            let thisTimePeriod = this.intervalPattern[this.intervalIndex];
            if (this.workoutIndex % this.countPerPass === this.countPerPass - 1 && this.intervalIndex === this.intervalPattern.length - 1)
            {
                thisTimePeriod += this.extraBreak;
            }
            return thisTimePeriod - this.timeElapsed;
        }
        if (!this.stretchComplete)
        {
            return this.stretchLength - this.timeElapsed;
        }
        return 0;
    }

    percentDone()
    {
        if (!this.warmUpComplete)
        {
            return this.timeElapsed / this.warmUpLength;
        }
        if (!this.mainWorkoutComplete())
        {

            let thisTimePeriod = this.intervalPattern[this.intervalIndex];
            if (this.workoutIndex % this.countPerPass === this.countPerPass - 1 && this.intervalIndex === this.intervalPattern.length - 1)
            {
                thisTimePeriod += this.extraBreak;
            }
            return this.timeElapsed / thisTimePeriod;
        }
        if (!this.stretchComplete)
        {
            return this.timeElapsed / this.stretchLength;
        }
        return 1;
    }

    mainWorkoutComplete()
    {
        return this.workoutIndex >= this.mainWorkoutList.length;
    }

    isDone()
    {
        return this.mainWorkoutComplete() && this.stretchComplete;
    }

    onCooldown()
    {
        return this.intervalIndex % 2 === 1 || this.mainWorkoutComplete();
    }

    getRunState()
    {
        let state = [];

        for (let i = 0; i < this.intervalPattern.length; i += 2)
        {
            if (i < this.intervalIndex)
            {
                state.push(1);
            }
            else if (i > this.intervalIndex)
            {
                state.push(0);
            }
            else
            {
                state.push(this.percentDone());
            }
        }
        return state;
    }

    getCooldownState()
    {
        let state = [];

        for (let i = 1; i < this.intervalPattern.length; i += 2)
        {
            if (i < this.intervalIndex)
            {
                state.push(1);
            }
            else if (i > this.intervalIndex)
            {
                state.push(0);
            }
            else
            {
                state.push(this.percentDone());
            }
        }
        return state;
    }

    static BuildData(workoutOptions, bigIntervalCount, intervalPattern)
    {
        let outData = new IntervalData();
        let workoutOptionsCopy = _.cloneDeep(workoutOptions);

        // WARM UP
        let warmUpOptions = workoutOptions.get('warm-up');
        let warmUpList = [];

        if (warmUpOptions)
        {
            while (warmUpList.length < 6)
            {
                let thisWarmup = warmUpOptions.splice(Math.floor(Math.random() * warmUpOptions.length), 1)[0];
                warmUpList.push(thisWarmup.Activity);
                if (warmUpList.length === 0)
                {
                    warmUpList = [...workoutOptionsCopy.get('warm-up')];
                }
            }
        }
        outData.warmUpLength = 180; // 3 minutes
        outData.warmUpIntervalLength = 30; // 30 seconds
        outData.warmUpList = warmUpList;
        outData.warmUpComplete = warmUpList.length === 0;

        // STRETCHES
        let stretchOptions = workoutOptions.get('stretch');
        let stretchList = [];

        if (stretchOptions)
        {
            while (stretchList.length < 6)
            {
                let thisStretch = stretchOptions.splice(Math.floor(Math.random() * stretchOptions.length), 1)[0];
                stretchList.push(thisStretch.Activity);
                if (stretchList.length === 0)
                {
                    stretchList = [...workoutOptionsCopy.get('stretch')];
                }
            }
        }
        outData.stretchLength = 180; // 3 minutes
        outData.stretchIntervalLength = 30; // 30 seconds
        outData.stretchList = stretchList;
        outData.stretchComplete = stretchList.length === 0;

        // MAIN WORKOUT 
        if (intervalPattern)
        {
            outData.intervalPattern = intervalPattern.split(',').map( d => parseInt(d));
        }
        else
        {
            outData.intervalPattern = [20,10, 20,10, 40,20, 60,40];
        }

        const singlePassIntervalLength = outData.intervalPattern.reduce((x,y) => x + y)
        outData.countPerPass = Math.max(1, Math.floor(15 * 60 / singlePassIntervalLength));

        let workoutCount = outData.countPerPass * bigIntervalCount;
        let workoutTypes =  [...workoutOptions.keys()].filter(type => type !== 'warm-up' && type !== 'stretch')
        let workoutList = [];
        let typeIndex = 0;
        while (workoutList.length < workoutCount)
        {
            let type = workoutTypes[typeIndex];
            typeIndex = (typeIndex + 1) % workoutTypes.length;
            let options = workoutOptions.get(type);
            let thisWorkout = options.splice(Math.floor(Math.random() * options.length), 1)[0];
            workoutList.push(thisWorkout.Activity);
            if (options.length === 0)
            {
                workoutOptions.set(type, [...workoutOptionsCopy.get(type)]);
            }
        }

        outData.extraBreak = 20;
        outData.workoutLength = outData.intervalPattern.reduce((x,y) => x + y) * workoutList.length;
        outData.workoutLength += outData.extraBreak * bigIntervalCount;
        if (!outData.warmUpComplete)
        {
            outData.workoutLength += outData.warmUpLength;
        }
        
        outData.mainWorkoutList = workoutList;

        outData.workoutIndex = 0;
        outData.intervalIndex = 0;
        outData.timeElapsed = 0;


        return outData;
    }

}