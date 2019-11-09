export interface Frame {
	fraction?: number, // if no fraction is specified, it is assumed to be equal weight
	minSize?: number,
	maxSize?: number,
	direction: Direction,

	inside: Frame[] | ComponentType
}

export enum Direction {
	row = "row",
	column = "col"
}

export enum ComponentType {
	Toolbar = "Toolbar",
	Console = "Console",
	Plot2dPathsWidget = "Plot2dPathsWidget",
	TableWidget = "TableWidget",
	LevelOfDetailWidget = "LevelOfDetailWidget",
	MetricDistributionWidget = "MetricDistributionWidget"
}
