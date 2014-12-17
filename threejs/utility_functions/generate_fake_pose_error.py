#!/usr/bin/python

import sys
import random

def getOpening(variable):
  return "// Javascript data file for " + variable + "\n\n"

def main():
  if len(sys.argv) < 3:
    print "Usage: ./generate_fake_pose_error.py <number of poses> <end variable name> "
    return

  number_of_poses = int(float(sys.argv[1]))
  variable = sys.argv[2]

  outfile = open(variable+'.js', 'w')
  outfile.write("var " + variable + " = [")

  randomValuesOrig = [0.8, 0.5, 1.4, 0.7, 0.2, 1.3];
  randomValues = [0.8, 0.5, 1.4, 0.7, 0.2, 1.3];
  for line in range(number_of_poses):
    outfile.write("[")
    for item in range(6):
      randomValues[item] += random.uniform(-0.1, 0.1);
      if randomValues[item] > 5.0 or randomValues[item] < 0.05:
        randomValues[item] = randomValuesOrig[item]
      outfile.write(""+str(randomValues[item])+",");
    outfile.write("],");

  outfile.write("]\n");
  outfile.close()

if __name__ == "__main__":
    sys.exit(main())