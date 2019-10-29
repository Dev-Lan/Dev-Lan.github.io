export interface pointWithImage {
	x: number,
	y: number,
	image: string
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