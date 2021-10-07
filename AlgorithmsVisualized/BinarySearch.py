def BinarySearch(array,searchValue):
	left=0
	right=len(array)-1
	while True:
		if left > right:
			return -1
		mid=(left+right) / 2
		thisValue=array[mid]
		if (thisValue > searchValue):
			right=mid-1
		elif (thisValue < searchValue):
			left=mid+1
		else:
			return mid



def TestSearch(array,arrayName):
	print("Begin testing array: "+arrayName)
	passed=True
	print "  Testing line of ("+str(len(array))+"): ",
	for i in range(len(array)):
		print str(i)+",",
		indexFound=BinarySearch(array,array[i])
		if (indexFound != i):
			print("BEEP BOOP: Incorrect response.")
			print("Array: "+arrayName)
			print("Correct: "+str(i))
			print("Found  : "+str(indexFound))
			passed=False
	print ""
	return passed

def TestNotFound(array,searchValue):
	result = BinarySearch(array,searchValue)
	return result == -1

def TestSuite():
	allPassed=True
	allPassed = allPassed and TestSearch([],"Z")
	allPassed = allPassed and TestSearch([1],"A")
	allPassed = allPassed and TestSearch([1,2],"B")
	allPassed = allPassed and TestSearch([1,2,3],"C")
	allPassed = allPassed and TestSearch([1,2,3,4],"D")
	allPassed = allPassed and TestSearch([1,2,3,4,5],"E")
	allPassed = allPassed and TestSearch([1,6,8],"F")
	allPassed = allPassed and TestSearch([1,6,8,9,12,15,46,58,79,80,90,112,124,135,156,177,188,198,222,333,444,555,666,777,888,999,1234,2345,3456,4567,5678,12345,234567,345675],"G")
	
	# TODO - test none found.

	allPassed = TestNotFound([1,2,3,4,5],7)
	allPassed = TestNotFound([1,2,3,4,5],-7)
	allPassed = TestNotFound([1,2,4,6,8],3)

	if allPassed:
		print("All tests passed!")
	
TestSuite()
	
	
	
	
	
	

