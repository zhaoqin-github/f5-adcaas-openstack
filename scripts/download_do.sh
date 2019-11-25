#!/bin/bash 

# TODO: make filelist configurable.
dofile="https://github.com/F5Networks/f5-declarative-onboarding/releases/download/v1.7.0/f5-declarative-onboarding-1.7.0-3.noarch.rpm"

cdir=`cd $(dirname $0); pwd`
(
    cd $cdir/../dependencies
    if [ ! -f  `basename $dofile` ]; then 
        wget -nv $dofile # $dofile.sha256
        #sha256sum -c $dofile.sha256
   fi
)

