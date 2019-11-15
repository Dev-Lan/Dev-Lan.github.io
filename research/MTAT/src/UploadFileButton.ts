import {BaseComponent} from './BaseComponent';
import { FileLoadUtil, CallbackFunction } from '../../lib/FileLoadUtil';


export class UploadFileButton extends BaseComponent {
	
	constructor(container: Element, callback: CallbackFunction)
	{
		super(container);
		let fileLoader: FileLoadUtil = new FileLoadUtil(callback);
		this.fileInputElement.onchange = (ev: Event) => fileLoader.OpenFile(ev);
	}

	private _fileInputElement : HTMLInputElement;
	public get fileInputElement() : HTMLInputElement {
		return this._fileInputElement;
	}

	static _buttonCount = 0;

	protected init(): void
	{
		this.renderDom();
		this.container.classList.add("uploadFileButtonContainer");
	}

	public ResetValue(): void
	{
		this.fileInputElement.value = null;
	}

	private renderDom(): void
	{
		this._fileInputElement = document.createElement("input");
		this.fileInputElement.classList.add("noDisp");
		let uniqueId: string = UploadFileButton.getUniqueId();

		this.fileInputElement.id = uniqueId;
		this.fileInputElement.type = "file";
		this.fileInputElement.accept = "text/plain, .csv";

		let labelEl: HTMLLabelElement = document.createElement("label");
		labelEl.classList.add("uploadFileButton");
		labelEl.htmlFor = uniqueId;

		let icon = document.createElement("i")
		icon.classList.add("fas", "fa-upload", "uploadFileButtonIcon"); // font-awesome
		labelEl.appendChild(icon);
		labelEl.append("Upload File");
		this.container.appendChild(this.fileInputElement);
		this.container.appendChild(labelEl);
	}

	private static getUniqueId(): string
	{
		UploadFileButton._buttonCount++;
		return "UploadFileButton_" + UploadFileButton._buttonCount;
	}
}