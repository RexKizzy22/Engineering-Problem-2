const { getTrips, getVehicle, getDriver } = require("api");

/**
 * This function should return the data for drivers in the specified format
 *
 * Question
 *
 * @returns {any} Driver report data
 */

async function driverReport() {
  const driversInfo = [];
  const trips = await getTrips();

  // Get driver info per trip
  const tripsPromise = trips.map(async (trip) => {
    try {
      const driver = await getDriver(trip.driverID);
      const vehicles = await getVehicle(driver.vehicleID);
      const user = {
        user: trip.user.name,
        created: trip.created,
        pickup: trip.pickup,
        destination: trip.destination,
        billed: trip.billedAmount,
        isCash: trip.isCash,
      };

      // Get vehicle info per trip
      let vehicleInfo;
      if (vehicles) {
        vehicleInfo = {
          manufacturer: vehicles.manufacturer,
          plate: vehicles.plate,
        };
      }

      // Returns driver and vehicle info if available
      if (driver)
        return {
          tripID: trip.tripID,
          driverID: trip.driverID,
          isCash: trip.isCash,
          name: driver.name,
          email: driver.email,
          phone: driver.phone,
          user: user,
          vehicle: vehicleInfo,
          billedAmount: parseFloat(
            trip.billedAmount.toString().replace(/,/g, "")
          ),
        };
    } catch (error) {
      // Returns only trip info if driver info and vehicle info not available
      if (error === "Driver not found" || "Vehicle not found")
        return {
          isCash: trip.isCash,
          driverID: trip.driverID,
          billedAmount: parseFloat(
            trip.billedAmount.toString().replace(/,/g, "")
          ),
          user: trip.user,
        };
    }
  });

  let tripsInfo = await Promise.all(tripsPromise);
  tripsInfo = tripsInfo.filter(Boolean);

  // Get unique driver info
  const uniqueTripsInfo = Array.from(new Set(tripsInfo));

  // Number of trips per driver
  const noOfTripsByDriver = {};
  for (let driver of uniqueTripsInfo) {
    if (!noOfTripsByDriver.hasOwnProperty(driver.driverID)) {
      noOfTripsByDriver[driver.driverID] = 1;
    } else {
      noOfTripsByDriver[driver.driverID]++;
    }
  }

  // Get number of cash and non-cash trips per driver
  let revenueByDriver = {};

  for (let driver of uniqueTripsInfo) {
    if (!revenueByDriver[driver.driverID]) {
      if (driver.isCash) {
        let billedAmount = driver.billedAmount.toString().replace(/,/g, "");
        revenueByDriver[driver.driverID] = {
          totalCashAmount: parseFloat(billedAmount),
          noOfCashTrips: 1,
          totalNonCashAmount: 0,
          noOfNonCashTrips: 0,
          totalAmountEarned: parseFloat(billedAmount),
        };
      } else {
        let billedAmount = driver.billedAmount.toString().replace(/,/g, "");
        revenueByDriver[driver.driverID] = {
          totalCashAmount: 0,
          noOfCashTrips: 0,
          totalNonCashAmount: parseFloat(billedAmount),
          noOfNonCashTrips: 1,
          totalAmountEarned: parseFloat(billedAmount),
        };
      }
    } else {
      if (driver.isCash) {
        let billedAmount = driver.billedAmount.toString().replace(/,/g, "");
        revenueByDriver[driver.driverID].totalCashAmount +=
          parseFloat(billedAmount);
        revenueByDriver[driver.driverID].noOfCashTrips += 1;
        revenueByDriver[driver.driverID].totalAmountEarned +=
          parseFloat(billedAmount);
      } else {
        let billedAmount = driver.billedAmount.toString().replace(/,/g, "");
        revenueByDriver[driver.driverID].totalNonCashAmount +=
          parseFloat(billedAmount);
        revenueByDriver[driver.driverID].noOfNonCashTrips++;
        revenueByDriver[driver.driverID].totalAmountEarned +=
          parseFloat(billedAmount);
      }
    }
  }

  // Get trip-user and vehicle info per driver
  let tripUsersPerDriver = {};
  let vehiclePerDriver = {};

  uniqueTripsInfo.forEach((trip) => {
    let tripUser = [];
    let vehicle = [];

    if (!vehiclePerDriver.hasOwnProperty(trip.driverID)) {
      vehicle.push(trip.vehicle);
      vehiclePerDriver[trip.driverID] = vehicle;
    } else {
      vehiclePerDriver[trip.driverID].push(trip.vehicle);
    }

    if (!tripUsersPerDriver.hasOwnProperty(trip.driverID)) {
      tripUser.push(trip.user);
      tripUsersPerDriver[trip.driverID] = tripUser;
    } else {
      tripUsersPerDriver[trip.driverID].push(trip.user);
    }
  });

  // Get hold of all driver info
  const driverIDs = {};

  uniqueTripsInfo.forEach((trip) => {
    let driver = {};

    if (!driverIDs.hasOwnProperty(trip.driverID)) {
      driverIDs[trip.driverID] = trip.driverID;

      if (trip.name) {
        driver.fullName = trip.name;
        driver.id = trip.driverID;
        driver.phone = trip.phone;
        driver.noOfTrips = noOfTripsByDriver[trip.driverID];
        driver.noOfVehicles = vehiclePerDriver[trip.driverID].length;
        driver.vehicles = vehiclePerDriver[trip.driverID];
        driver.noOfCashTrips = revenueByDriver[trip.driverID].noOfCashTrips;
        driver.noOfNonCashTrips =
          revenueByDriver[trip.driverID].noOfNonCashTrips;
        driver.totalAmountEarned = parseFloat(
          revenueByDriver[trip.driverID].totalAmountEarned.toFixed(2)
        );
        driver.totalCashAmount = parseFloat(
          revenueByDriver[trip.driverID].totalCashAmount.toFixed(2)
        );
        driver.totalNonCashAmount = parseFloat(
          revenueByDriver[trip.driverID].totalNonCashAmount.toFixed(2)
        );
        driver.trips = tripUsersPerDriver[trip.driverID];
      } else {
        driver.id = trip.driverID;
        driver.noOfTrips = noOfTripsByDriver[trip.driverID];
        driver.noOfCashTrips = revenueByDriver[trip.driverID].noOfCashTrips;
        driver.noOfNonCashTrips =
          revenueByDriver[trip.driverID].noOfNonCashTrips;
        driver.totalAmountEarned = parseFloat(
          revenueByDriver[trip.driverID].totalAmountEarned.toFixed(2)
        );
        driver.totalCashAmount = parseFloat(
          revenueByDriver[trip.driverID].totalCashAmount.toFixed(2)
        );
        driver.totalNonCashAmount = parseFloat(
          revenueByDriver[trip.driverID].totalNonCashAmount.toFixed(2)
        );
        driver.trips = tripUsersPerDriver[trip.driverID];
      }

      driversInfo.push(driver);
    }
  });

  return driversInfo;
}

module.exports = driverReport;
