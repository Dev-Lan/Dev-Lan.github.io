type MetricFunction = (...args: any) => number;

export class Metric {
	
	constructor(valueOrFunction: number | MetricFunction, ...functionArgs: any) {
		if (typeof valueOrFunction === "number")
		{
			this._value = valueOrFunction;
			return;
		}
		this.setFunc(valueOrFunction, functionArgs);
	}

	private _value : number;
	public get value() : number {
		return this._value;
	}

	private _func : MetricFunction;
	public get func() : MetricFunction {
		return this._func;
	}

	public setFunc(v : MetricFunction, ...args: any) {
		this._func = v;
		this._value = this.func(args);
	}

	public toString(): string
	{
		if (this._func)
		{
			return "f " + this.value;
		}
		return this.value.toString();
	}

}