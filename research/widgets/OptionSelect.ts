import * as d3 from 'd3';
import { ButtonProps, HtmlSelection } from '../lib/DevLibTypes';

export class OptionSelect {
	
	constructor(htmlContainerId: string)
	{
		this._containerSelect = d3.select("#" + htmlContainerId);
	}

	private _data : ButtonProps[];
	public get data() : ButtonProps[] {
		return this._data;
	}

	private _containerSelect : HtmlSelection;
	public get containerSelect() : HtmlSelection {
		return this._containerSelect;
	}

	private clearSelectedButton(): void
	{
		this.containerSelect.selectAll(".selected")
			.classed("selected", false);
	}

	public onDataChange(data: ButtonProps[], selectFirst = false): void
	{
		this._data = data;
		console.log(data);
		this.containerSelect.html(null);

		if (this.data.length === 1)
		{
			this.containerSelect
				.append("h5")
				.classed("valueHeader", true)
				.text(this.data[0].displayName);
			return;
		}

		let thisOptionSelect: OptionSelect = this;
		this.containerSelect
			.selectAll("button")
			.data(this.data)
			.join("button")
			.text(d => d.displayName)
			.classed("optionButton", true)
			.classed("selected", (d, i) => selectFirst && i === 0)
			.on("click", function(buttonProps: ButtonProps)
			{
				if ((this as HTMLElement).classList.contains("selected"))
				{
					return;
				}
				thisOptionSelect.clearSelectedButton();
				buttonProps.callback();
				d3.select(this).classed("selected", true);
			});
	}

}