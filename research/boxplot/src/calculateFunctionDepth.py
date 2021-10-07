import csv
import math
import sys

filename = sys.argv[1]
# 3.79885E-05

filename = '../data/' + sys.argv[1]
timeStepKeyword = "t"

timeStepColumnIndex = -1
depthArray = []

with open(filename) as csvFile:
	csvReader = csv.reader(csvFile, delimiter=',')
	lineCount = 0
	for row in csvReader:
		if lineCount == 0:
			columnIndex = 0;
			print(", ".join(row))
			for header in row:
				if (header == timeStepKeyword):
					timeStepColumnIndex = columnIndex
				columnIndex += 1
			depthArray = [0 for x in range(columnIndex)]
			depthArray[timeStepColumnIndex] = "depth"
		else:
			numCols = len(row)
			for i in range(numCols):
				if i == timeStepColumnIndex:
					continue
				x = row[i];
				for j in range(numCols-1):
					if j == timeStepColumnIndex:
						continue
					y = row[j];
					for k in range(j+1, numCols):
						if k == timeStepColumnIndex:
							continue
						z = row[k]
						if min(y,z) <= x and x <= max(y,z):
							depthArray[i] += 1
		lineCount += 1
		print("Row: " + str(lineCount))

numCols -= 1 # remove the column for t
lineCount -= 1 # remove the data column
maxDepth = float(lineCount) * (math.factorial(numCols) / (math.factorial(numCols - 2)*2))
for i in range(len(depthArray)):
	depth = depthArray[i]
	if not isinstance(depth, str):
		depthArray[i] = depth / maxDepth

print(", ".join([str(x) for x in depthArray]))
