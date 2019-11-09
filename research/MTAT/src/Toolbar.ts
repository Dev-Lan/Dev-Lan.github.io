import {BaseComponent} from './BaseComponent';
import { UploadFileButton } from './UploadFileButton';

export class Toolbar extends BaseComponent{
	
	constructor(container: Element, fileLoadCallback: (data: string) => any)
	{
		super(container);
		this._callback = fileLoadCallback;
	}

	private _uploadFileButton : UploadFileButton;
	public get uploadFileButton() : UploadFileButton {
		return this._uploadFileButton;
	}

	private _uploadFileButtonWrapper : HTMLDivElement;
	public get uploadFileButtonWrapper() : HTMLDivElement {
		return this._uploadFileButtonWrapper;
	}

	private _callback : (data: string) => any;
	public get callback() : (data: string) => any {
		return this._callback;
	}

	protected init(): void
	{
		this._uploadFileButtonWrapper = document.createElement("div");
		this.container.appendChild(this.uploadFileButtonWrapper);
		this._uploadFileButton = new UploadFileButton(this.uploadFileButtonWrapper, (data: string, filename: string) => {this.fileLoadCallback(data, filename)})
	}

	protected OnResize(): void
	{
		// do nothing
	}

	private fileLoadCallback(data: string, filename: string): void
	{
		this._callback(data);
	}
}