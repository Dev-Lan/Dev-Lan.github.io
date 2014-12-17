#!/usr/bin/python

import sys

def getOpening(variable):
  return "// Javascript data file for " + variable + "\n\n"

def main():
  if len(sys.argv) < 3:
    print "Usage: ./data_to_json.py <file_name> <end variable name> <optional: translation>"
    return

  # translation = [0, 0, 0]
  # if len(sys.argv) == 4:
  #   with open(sys.argv[3]) as transfile:
  #     lines = [x.strip() for x in transfile.readlines()]
  #     for i in range(3):
  #       translation[i] = lines[i]
  #       print translation[i]

  variable = sys.argv[2]

  with open(sys.argv[1]) as infile:
    outfile = open(variable+'.js', 'w')
    outfile.write("var " + variable + " = [")
    count = -1;
    lines = [x.strip() for x in infile.readlines()]
    for line in lines:
      count += 1
      count = count % 16
      if count in [4,5,6,7,8,9,10,11,12]:
        continue
      line = line.split(' ')
      # if len(line) > 1:
      #   outfile.write("[")
      for item in [x.strip() for x in line]:
        outfile.write(""+item+",");
      # if len(line) > 1:
      #   outfile.write("],");

    outfile.write("]\n");
    outfile.close()

if __name__ == "__main__":
    sys.exit(main())