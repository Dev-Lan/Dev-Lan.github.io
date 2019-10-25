export interface StringToStringObj {
    [key: string]: string;
}

export interface StringToNumberObj {
    [key: string]: number;
}

export interface Margin {
	top: number,
	right: number,
	bottom: number,
	left: number
}

export type SvgSelection = d3.Selection<SVGElement, any, HTMLElement, any>;
