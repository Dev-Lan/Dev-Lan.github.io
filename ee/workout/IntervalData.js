class IntervalData
{
    constructor()
    {

    }

    update(deltaTime)
    {
        this.timeElapsed += deltaTime;
        let timeRemaining = this.timeRemaining();
        if (timeRemaining <= 0)
        {
            this.intervalIndex++;
            if (this.intervalIndex === this.intervalPattern.length)
            {
                this.intervalIndex = 0;
                this.workoutIndex++;
            }
            this.timeElapsed = Math.abs(timeRemaining);
        }
    }

    currentWorkout()
    {
        return this.mainWorkoutList[this.workoutIndex];
    }

    nextWorkout()
    {
        if (this.workoutIndex >= this.mainWorkoutList.length - 1)
        {
            return 'Done!';
        }
        return this.mainWorkoutList[this.workoutIndex + 1];
    }

    timeRemaining()
    {
        let thisTimePeriod = this.intervalPattern[this.intervalIndex];
        if (this.workoutIndex % 4 === 3 && this.intervalIndex === this.intervalPattern.length - 1)
        {
            thisTimePeriod += this.extraBreak;
        }
        return thisTimePeriod - this.timeElapsed;
    }

    percentDone()
    {
        let thisTimePeriod = this.intervalPattern[this.intervalIndex];
        if (this.workoutIndex % 4 === 3 && this.intervalIndex === this.intervalPattern.length - 1)
        {
            thisTimePeriod += this.extraBreak;
        }
        return this.timeElapsed / thisTimePeriod;
    }

    isDone()
    {
        return this.workoutIndex >= this.mainWorkoutList.length;
    }

    onCooldown()
    {
        return this.intervalIndex % 2 === 1;
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

    static BuildData(workoutOptions, bigIntervalCount)
    {
        let outData = new IntervalData();

        // main workout
        let workoutCount = 4 * bigIntervalCount;
        let workoutTypes = ['core', 'upper'];
        let workoutList = [];
        let typeIndex = 0;
        while (workoutList.length < workoutCount)
        {
            let type = workoutTypes[typeIndex];
            typeIndex = (typeIndex + 1) % 2;
            let options = workoutOptions.get(type);
            let thisWorkout = options.splice(Math.floor(Math.random() * options.length), 1)[0];
            workoutList.push(thisWorkout.Activity);
        }
        
        // workoutList = workoutList.map(d => {
        //     return {
        //         name: d,
        //         completed: 0 
        //     }
        // });

        // outData.intervalPattern = [20,10, 20,10, 40,20, 60,40];
        outData.intervalPattern = [5, 5, 5, 5,5, 5,5, 5,];
        // outData.intervalPattern = [2,1, 2,1, 4,2, 6,4];
        // outData.intervalPattern = [1,.1, 1,.1, 1,.1, 1,.1];
        outData.extraBreak = 20;
        outData.workoutLength = outData.intervalPattern.reduce((x,y) => x + y) * workoutList.length;
        outData.workoutLength += outData.extraBreak * bigIntervalCount;
        
        // console.log(workoutList);
        
        outData.mainWorkoutList = workoutList;

        outData.workoutIndex = 0;
        outData.intervalIndex = 0;
        outData.timeElapsed = 0;


        return outData;
    }

}