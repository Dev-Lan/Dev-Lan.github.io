import {Frame, ComponentType, Direction} from './types';

export class LayoutFramework {
	
	constructor(container: Element)
	{
		this._container = container;
	}

	private _container : Element;
	public get container() : Element {
		return this._container;
	}

	public InitializeLayout(frame: Frame): Map<Element, ComponentType>
	{
		let elementToComponentType = new Map<Element, ComponentType>();
		this.addFrame(this.container, frame, elementToComponentType);
		return elementToComponentType;
	}

	private addFrame(container: Element, frame: Frame, lookup: Map<Element, ComponentType>): void
	{
		container.classList.add("frame");
		let dirClass: string;
		let dirPostFix: string;
		if (frame.direction === Direction.column)
		{
			dirClass = "dir-col";
			dirPostFix = "row";
		}
		else if (frame.direction === Direction.row)
		{
			dirClass = "dir-row";
			dirPostFix = "height";
		}
		container.classList.add(dirClass);
		let inlineStyle: string = "";
		if (typeof frame.minSize !== "undefined")
		{
			inlineStyle += `min-${dirPostFix}: ${frame.minSize}px; `;
		}
		if (typeof frame.maxSize !== "undefined")
		{
			inlineStyle += `max-${dirPostFix}: ${frame.maxSize}px; `;			
		}

		if (typeof frame.fraction === "undefined")
		{
			frame.fraction = 1;
		}
		inlineStyle += `flex-grow: ${frame.fraction}; `;			
		const addDebugColor = false;
		if (addDebugColor)
		{
			// copied from: https://stackoverflow.com/questions/1152024/best-way-to-generate-a-random-color-in-javascript
			inlineStyle += `background: ${'#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)};`;
		}

		container.setAttribute("style", inlineStyle);

		if (frame.inside instanceof Array)
		{
			for (let childFrame of frame.inside)
			{
				let childContainer: HTMLElement = document.createElement("div");
				container.appendChild(childContainer);
				this.addFrame(childContainer, childFrame, lookup);
			}
		}
		else
		{
			lookup.set(container, frame.inside);
		}
	}
}