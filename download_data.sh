#!/bin/sh
mkdir -p data && curl http://data.stackexchange.com/stackoverflow/csv/948038 > data/QueryResults.csv
# For data since 01-01-2010 :
# mkdir -p data && curl http://data.stackexchange.com/stackoverflow/csv/958648 > data/QueryResults.csv