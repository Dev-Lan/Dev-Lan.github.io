export interface pointWithImage {
	x: number,
	y: number,
	image: string,
	attributes?: attributeLookup
}

export interface attributeLookup {
	[index: string]: attribute
}

export interface attribute {
	displayName: string,
	value: number
}

export interface imageOffset {
	top: number,
	left: number,
	width: number,
	height: number
}

export interface imageLookup {
	[index: string]: imageOffset
}

export type attributeSelector = (point: pointWithImage) => number