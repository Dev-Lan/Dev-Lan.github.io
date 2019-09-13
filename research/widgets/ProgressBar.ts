import * as TSUtil from '../lib/DevlibTSUtil';

export class ProgressBar {
	
	private _container : HTMLElement;
	public get container() : HTMLElement {
		return this._container;
	}

	private _progressBarElement : HTMLProgressElement;
	public get progressBarElement() : HTMLProgressElement {
		return this._progressBarElement;
	}

	private _timeIntervalUpdate : number;
	public get timeIntervalUpdate() : number {
		return this._timeIntervalUpdate;
	}

	private _lastUpdateTime : number;
	public get lastUpdateTime() : number {
		return this._lastUpdateTime;
	}

	private _shown : boolean;
	public get shown() : boolean {
		return this._shown;
	}

	constructor(container: HTMLElement, timeIntervalUpdate: number = 200)
	{
		this._container = container;
		this.hide();
		this._timeIntervalUpdate = timeIntervalUpdate;
		container.innerHTML = ""; // make sure there's nobody in here already
		const progBar = document.createElement("progress");
		progBar.value = 0;
		progBar.max = 1000;
		progBar.style.flexGrow = "1";
		this._progressBarElement = progBar;
		this.container.appendChild(progBar);
	}

	/**
	 * @param progress - number assumed to be between 0 and 1.
	 */	
	public async updateProgress(progress: number): Promise<void>
	{
		if (!this.shown)
		{
			await this.actuallyUpdateProgress(progress, performance.now());
			await this.show();
			return;
		}
		const now: number = performance.now();
		if (now - this.lastUpdateTime >= this._timeIntervalUpdate)
		{
			await this.actuallyUpdateProgress(progress, now);
			return;
		}
	}
	
	public done(): void
	{
		this.hide();
	}

	private async actuallyUpdateProgress(progress: number, now: number): Promise<void>
	{
		const max: number = this.progressBarElement.max;
		const newValue = Math.round(progress * max)
		await TSUtil.DevlibTSUtil.makeAsync(() =>
		{
			this.progressBarElement.setAttribute("value", newValue.toString());
		});
		this._lastUpdateTime = now;
	}

	private async show(): Promise<void>
	{
		await TSUtil.DevlibTSUtil.makeAsync(() =>
		{
			this.container.style.display = "flex";
		});
		this._shown = true;
	}

	private hide(): void
	{
		this.container.style.display = "none";
		this._shown = false;
	}
}