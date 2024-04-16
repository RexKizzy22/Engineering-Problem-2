const { getTrips, getDriver } = require("api");

/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */

const analysis = async () => {
  const trips = await getTrips();

  // Get cash trips and non-cash trips
  const cashTrips = trips.filter((trip) => trip.isCash === true);
  const noOfCashTrips = cashTrips.length;

  const nonCashTrips = trips.filter((trip) => trip.isCash !== true);
  const noOfNonCashTrips = nonCashTrips.length;

  // Get total of cash and non-cash trips
  const allBills = trips.map((trip) =>
    parseFloat(trip.billedAmount.toString().replace(/,/g, ""))
  );
  const billedTotal = allBills
    .reduce((a, b) => {
      return a + b;
    }, 0)
    .toFixed(2);

  const cashBills = cashTrips.map((trip) =>
    parseFloat(trip.billedAmount.toString().replace(/,/g, ""))
  );
  const cashBilledTotal = cashBills
    .reduce((a, b) => {
      return a + b;
    }, 0)
    .toFixed(2);

  const nonCashBills = nonCashTrips.map((trip) =>
    parseFloat(trip.billedAmount.toString().replace(/,/g, ""))
  );
  const nonCashBilledTotal = nonCashBills
    .reduce((a, b) => {
      return a + b;
    }, 0)
    .toFixed(2);

  // Get driver info
  const tripsPromise = trips.map(async (trip) => {
    try {
      const driver = await getDriver(trip.driverID);
      if (driver)
        return {
          driverID: trip.driverID,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          billedAmount: parseFloat(
            trip.billedAmount.toString().replace(/,/g, "")
          ),
        };
    } catch (error) {}
  });

  let tripsInfo = await Promise.all(tripsPromise);
  tripsInfo = tripsInfo.filter(Boolean);

  // Get unique driver info
  const uniqueTripsInfo = Array.from(new Set(tripsInfo));

  // key,value pair of driverID,noOfTrips
  const noOfTripsByDriver = {};

  for (let value of uniqueTripsInfo) {
    if (!noOfTripsByDriver.hasOwnProperty(value.driverID)) {
      noOfTripsByDriver[value.driverID] = 1;
    } else {
      noOfTripsByDriver[value.driverID]++;
    }
  }

  // Get drivers with more than one vehicle
  const driverIDs = uniqueTripsInfo.map((driver) => driver.driverID);
  const uniqueDriverIDs = Array.from(new Set(driverIDs));
  let driverVehicles = [];
  let vehicleAmount;

  const driversPromise = uniqueDriverIDs.map(async (id) => {
    try {
      const driver = await getDriver(id);
      if (driver) vehicleAmount = Array.from(new Set(driver.vehicleID)).length;
      return vehicleAmount;
    } catch (error) {}
  });

  let driversInfo = await Promise.all(driversPromise);
  driversInfo = driversInfo.filter(Boolean);

  driversInfo.forEach((vehicleAmount) => {
    if (vehicleAmount > 1) {
      driverVehicles.push(vehicleAmount);
    }
  });

  const noOfDriversWithMoreThanOneVehicle = driverVehicles.length;

  // Get maximum number of trips taken by a driver
  const tripsByDrivers = Object.values(noOfTripsByDriver);
  const maxTrips = Math.max(...tripsByDrivers);

  // Get info of drivers with most trips
  let topDriver = {};
  for (let trip of tripsInfo) {
    if (!topDriver.hasOwnProperty(trip.driverID)) {
      if (noOfTripsByDriver[trip.driverID] === maxTrips) {
        topDriver[trip.driverID] = {
          name: trip.name,
          email: trip.email,
          phone: trip.phone,
          noOfTrips: maxTrips,
        };
      }
    }
  }

  // Get total amount earned per top driver
  let amountEarned;
  trips.forEach((trip) => {
    if (topDriver[trip.driverID]) {
      if (!topDriver[trip.driverID].hasOwnProperty("totalAmountEarned")) {
        amountEarned = parseFloat(
          trip.billedAmount.toString().replace(/,/g, "")
        );
        topDriver[trip.driverID].totalAmountEarned = parseFloat(amountEarned);
      } else {
        amountEarned = parseFloat(
          trip.billedAmount.toString().replace(/,/g, "")
        );
        topDriver[trip.driverID].totalAmountEarned += parseFloat(amountEarned);
      }
    }
  });

  const mostTripsByDriver = Object.values(topDriver)[0];

  // Get info of highest earning driver
  const topDrivers = Object.values(topDriver);
  topDrivers.sort((a, b) => a.billedAmount - b.billedAmount);
  const highestEarner = topDrivers[topDrivers.length - 1];

  return {
    noOfCashTrips: parseInt(noOfCashTrips),
    noOfNonCashTrips: parseInt(noOfNonCashTrips),
    billedTotal: parseFloat(billedTotal),
    cashBilledTotal: parseFloat(cashBilledTotal),
    nonCashBilledTotal: parseFloat(nonCashBilledTotal),
    noOfDriversWithMoreThanOneVehicle: parseInt(
      noOfDriversWithMoreThanOneVehicle
    ),
    mostTripsByDriver: mostTripsByDriver,
    highestEarningDriver: highestEarner,
  };
};

analysis();
module.exports = analysis;
