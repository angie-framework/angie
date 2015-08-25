#!/bin/sh

# This is used to insure that Facebook Watchman is installed

# LICENSE:
# https://github.com/facebook/watchman/blob/master/LICENSE

# These instructions have been pulled straight from:
# https://facebook.github.io/watchman/docs/install.html

# Clone the watchman repo
git clone https://github.com/facebook/watchman.git

# Perform the install
cd watchman
./autogen.sh
./configure
make
sudo make install

# Make sure that we create the required Watchman directories
mkdir /usr/local/var/run/watchman

# Remove the repo directory
cd ../
sudo rm -rf watchman
