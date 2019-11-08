export interface Frame {
	fraction?: number, // if no fraction is specified, it is assumed to be equal weight
	minSize?: number,
	maxSize?: number,
	direction?: Direction,

	inside: Frame[] | ComponentTypes
}

export enum Direction {
	row = "row",
	column = "col"
}

export enum ComponentTypes {
	Toolbar = "Toolbar",
	Console = "Console",
	Plot2dPathsWidget = "Plot2dPathsWidget",
	TableWidget = "Table",
	LevelOfDetailWidget = "LevelOfDetailWidget",
	MetricDistributionWidget = "MetricDistributionWidget"
}