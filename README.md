# bahn-cli
A simple command line application to retrieve German and European railway connections powered by [db-hafas](https://github.com/derhuerst/db-hafas).

![Screenshot](/images/screenshot.png)

## Installation
```
# Clone the repo into a new folder
git clone https://github.com/MutedJam/bahn-cli.git

# Change into the new folder
cd bahn-cli

# Install dependencies
npm install

# Optional: Make the tool available everywhere (so you don't have to be in this directory to use it)
npm link
```

## Usage
Run the tool either by running `./bahn-cli` in the bin directory or by running `bahn` anywhere on your command line if you have linked it as described in the _Installation_ section.

If you run it without any arguments it will search the next connection from _Bernau(b Berlin)_ to _Berlin Schönhauser Allee_. You can overwrite this directly in the _app.js_ file in the repo's root directory.

The tool accepts the following arguments:

`-f` or `--from`: Specify a start

`-t` or `--to`: Specify a destination

`-d` or `--departure`: Specify a departure time

Example:

```
# Search for a connection from Stralsund to Zürich HB at 10:00 on July 17 2019
bahn -f Stralsund -t "Zürich HB" -d 2019-07-17T10:00
```
