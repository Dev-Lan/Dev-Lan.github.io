import * as d3 from 'd3';

export class FileLoadUtil {

	constructor(fileLoadCallback: Function)
	{
		this.FileLoadCallback = fileLoadCallback;
	}

	private _FileLoadCallback : Function;
	public get FileLoadCallback() : Function {
		return this._FileLoadCallback;
	}
	public set FileLoadCallback(v : Function) {
		this._FileLoadCallback = v;
	}

	public OpenFile(event: Event): any
	{
		const input = event.target as HTMLInputElement;
		const inputFile: File = input.files[0];
		const filename: string = inputFile.name;

		let reader: FileReader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result !== "string")
			{
				throw "Warning: this should be parsed as a string, not an ArrayBuffer"
			}
			let text: string = reader.result;
			this.parseText(text, filename);
		}
		reader.readAsText(inputFile);
	}

	private parseText(text: string, filename: string): void
	{
		// const numberGrid = this.ParseCSV(text);
		let structuredData: d3.DSVRowArray<string> = d3.csvParse(text);
		this.FileLoadCallback(structuredData, filename);
		
	}
}
