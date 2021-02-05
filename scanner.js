const BeaconScanner = require('node-beacon-scanner');
const scanner = new BeaconScanner();
const date = require('date-and-time');

let debug = true;

// let deviceId = process.env.BALENA_DEVICE_UUID;
// let deviceName = process.env.BALENA_DEVICE_NAME_AT_INIT;
let rssiThreshold = process.env.RSSI_THRESHOLD || -100;
// let separationPeriod = process.env.SEP_PERIOD || 30;


// let debugSetting = process.env.DEBUG || "false";
// if (debugSetting.toLowerCase() == "true") {
//   debug = true;
// }

//Set the separation period
// separationPeriod = separationPeriod * 1000;


// Set an Event handler for becons
scanner.onadvertisement = (ad) => {

    let tagId = ad.address

    if (ad.rssi > -10) {
        if (debug) { console.log("Invalid beacon received: " + ad.address + " and ignored"); }
        return;
    }

    if (ad.beaconType == "iBeacon") {
        if (ad.iBeacon.major == 0 || ad.iBeacon.minor == 0) {
            if (debug) {
                console.log("Beacon with invalid UUID/major/minor found. Ignoring") }
            return;
        } else {
            console.log("Ad: " + objToString(ad))
        }

        tagId = ad.iBeacon.uuid + "-" + ad.iBeacon.major + "-" + ad.iBeacon.minor;
    }
    else if (ad.beaconType == "eddystoneUid") {
        if (debug) {
            console.log("Ad: " + objToString(ad))
            console.log("EddystoneUid: " + objToString(ad.eddystoneUid))
        }
        tagId = ad.eddystoneUid.namespace + "-" + ad.eddystoneUid.instance;
    }
    else if (ad.beaconType == "eddystoneTlm") {
        if (debug) {
            console.log("Ad: " + objToString(ad))
            console.log("eddystoneTlm: " + objToString(ad.eddystoneTlm))
            console.log("Eddystone TLM beacons are not supported. Ignoring")
        }
        return;
    }
    else if (ad.beaconType == "eddystoneUrl") {
        if (debug) {
            console.log("Ad: " + objToString(ad))
            console.log("eddystoneUrl: " + objToString(ad.eddystoneUrl))
            console.log("Eddystone URL beacons are not supported. Ignoring")
        }
        return;
    }
    else {
        if (debug) {
            console.log("Other type of advertisement packet recieved. Currently not supported. Ignoring:")
            console.log(objToString(ad))
        }
        return;
    }



    if (null != rssiThreshold && ad.rssi < rssiThreshold) {
        if (debug) { console.log("Beacon for tag: " + tagId + " ignored because the RSSI (" + ad.rssi + ") was below the set threshold: " + rssiThreshold) }
        return;
    }

    //create the Influx data row from the beacon
    data = 'beacon,tag=' + tagId + ' rssi=' + ad.rssi
    console.log("Beacon: " + data);

};

function objToString(obj) {
    let str = '';
    for (let p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}

// Start scanning for iBeacons
scanner.startScan().then(() => {
    console.log('Started to scan.');
}).catch((error) => {
    console.error(error);
});
