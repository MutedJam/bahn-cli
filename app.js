const createHafas = require('db-hafas');
const moment = require('moment');
const minimist = require('minimist');
const chalk = require('chalk');

module.exports = () => {
  const args = minimist(process.argv.slice(2), {
    alias: {
      f: 'from',
      t: 'to',
      d: 'departure'
    }
  });
  const hafas = createHafas('bahn-cli 1.0.0');

  hafas
    .locations(args.from || getDefaultFrom(), {
      results: 1
    })
    .then(fromResults => {
      if (fromResults.length > 0) {
        return fromResults[0]
      } else {
        console.log('"From" stop not found');
        process.exit(1);
      }
    })
    .then(from => {
      // console.log(from.name + ': ' + from.id);
      hafas
        .locations(args.to || getDefaultTo(), {
          results: 1
        })
        .then(toResults => {
          if (toResults.length > 0) {
            return toResults[0]
          } else {
            console.log('"To" stop not found');
            process.exit(1);
          }
        })
        .then(to => {
          // console.log(to.name + ': ' + to.id);
          hafas.journeys(from.id, to.id, {
              departure: moment(args.departure || new Date()).toDate(),
              results: 1
            })
            .then(journeys => {
              if (journeys.length > 0) {
                let nextJourney = journeys[0]
                // console.log(nextJourney)
                nextJourney.legs.forEach(leg => {
                  if (leg.cancelled) {
                    console.log(
                      chalk.bgRgb(240, 20, 20).bold('SERVICE CANCELLED') + ' ' +
                      chalk.strikethrough(getTimeString(leg.formerScheduledDeparture) + ' ' +
                      leg.origin.name + ' → ' +
                      getTimeString(leg.formerScheduledArrival) + ' ' +
                      leg.destination.name + ' ' +
                      getLineString(leg.line))
                    )
                  } else if (!leg.mode) {
                    console.log(
                      getTimeString(leg.departure) + ' ' + getDelayString(leg.departureDelay) +
                      leg.origin.name + getPlatformString(leg.departurePlatform) + ' → ' +
                      getTimeString(leg.arrival) + ' ' + getDelayString(leg.arrivalDelay) +
                      leg.destination.name + getPlatformString(leg.arrivalPlatform) + ' ' +
                      getLineString(leg.line)
                    )
                  }
                });
              } else {
                console.log('No route found')
              }
            });
        });
    });
};

getDefaultFrom = () => {
  if ((new Date).getHours() <= 11) {
    return 'Bernau(b Berlin)';
  } else {
    return 'Berlin Hbf';
  }
}

getDefaultTo = () => {
  if ((new Date).getHours() <= 11) {
    return 'Berlin Hbf';
  } else {
    return 'Bernau(b Berlin)';
  }
}

getPlatformString = platformValue => {
  if (platformValue) {
    return ' Plat. ' + platformValue
  } else {
    return ''
  }
};

getDelayString = delayValue => {
  if (delayValue && delayValue >= 60) {
    return chalk.red('(+' + Math.round(delayValue / 60) + ') ')
  } else {
    return ''
  }
};

getTimeString = timestamp => {
  if (moment().isSame(timestamp, 'day')) {
    return moment(timestamp).format('HH:mm')
  } else {
    return moment(timestamp).format('YYYY-MM-DD HH:mm')
  }
};

getLineString = line => {
  if (line && line.name) {
    if (line.name == 'Schiff') {
      return coloriseLineString(line.product, 'Ferry');
    } else {
      return coloriseLineString(line.product, line.name);
    }
  } else if (line && line.operator && line.operator.name) {
    return coloriseLineString(line.product, line.operator.name)
  } else {
    return ''
  }
};

coloriseLineString = (product, name) => {
  if (product && ['regional', 'regionalExp'].includes(product)) {
    return chalk.bgRgb(240, 20, 20).whiteBright(name);
  } else if (product && ['suburban'].includes(product)) {
    return chalk.bgRgb(4, 121, 57).whiteBright(name);
  } else if (product && ['subway'].includes(product)) {
    return chalk.bgHex('#0664ab').whiteBright(name);
  } else if (product && ['tram'].includes(product)) {
    return chalk.bgHex('#c00').whiteBright(name);
  } else if (product && ['bus'].includes(product)) {
    return chalk.bgHex('#993399').whiteBright(name);
  } else if (product && ['national', 'nationalExp'].includes(product)) {
    return chalk.bgWhiteBright.rgb(240, 20, 20)(name);
  } else if (product && ['ferry'].includes(product)) {
    return chalk.bgHex('#0080c0').whiteBright(name);
  } else {
    console.log('No colour found for product ' + product);
    return chalk.inverse(name);
  }
};

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
