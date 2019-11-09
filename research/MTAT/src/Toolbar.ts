import {BaseComponent} from './BaseComponent';
import { UploadFileButton } from './UploadFileButton';
import {ButtonProps} from '../../lib/DevLibTypes';

export class Toolbar extends BaseComponent{
	
	constructor(container: Element, fileLoadCallback: (data: string) => any, buttonPropList: ButtonProps[])
	{
		super(container);
		this._callback = fileLoadCallback;
		this._buttonList = buttonPropList;
		this.initExampleButtons();
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

	private _buttonList : ButtonProps[];
	public get buttonList() : ButtonProps[] {
		return this._buttonList;
	}

	protected init(): void
	{
		this._uploadFileButtonWrapper = document.createElement("div");
		this.container.appendChild(this.uploadFileButtonWrapper);
		this._uploadFileButton = new UploadFileButton(this.uploadFileButtonWrapper, (data: string, filename: string) => {this.fileLoadCallback(data, filename)})
	}

	private initExampleButtons(): void
	{
		for (let buttonProp of this.buttonList)
		{
			let button: HTMLButtonElement = document.createElement("button");
			button.textContent = buttonProp.displayName;
			button.onclick = (ev: Event) => buttonProp.callback();
			this.container.appendChild(button);
		}
	}

	protected OnResize(): void
	{
		// do nothing
	}

	private fileLoadCallback(data: string, filename: string): void
	{
		this._callback(data);
	}

	private fileFetchCallback(): void
	{

	}
}