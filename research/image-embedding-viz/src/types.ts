export interface pointWithImage {
	x: number,
	y: number,
	image: string,
	sortKeys?: sortBy[]
}

export interface sortBy {
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