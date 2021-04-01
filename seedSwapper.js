/**
  * Seed swapping mechanism by https://www.bitchute.com/channel/hexagod
   */

//store the latest known video position so that we can compare 
var latestKnownVideoPosition = undefined;
// get the video link from page
var pageVidLink = $('source')[0].src.split('.bitchute.com/')[1];


var bufferDelta = 0;
var timerInterval = 2000; // ms
var seedSwapInProgress = false;

function getHtmlPageSeed() {
    return $('source')[0].src;
}


async function verifySeedIsValid(seedUrl, onInitialLoad) {
    if (onInitialLoad) {
        seedUrl = getHtmlPageSeed(); // on initial load get this from the html source
        // verify that video link is active 
        // and if it's not swap the seed
    }
    $.ajax({
        type: 'HEAD',
        url: seedUrl,
        success: function () {
            return true;
        },
        error: function () {
            return false;
        }
    });
}

function getHtmlPageVidLink() {
    return $('source')[0].src.split('.bitchute.com/')[1];
}

function setHtmlPageSeed(seedLink) {
    $('source')[0].src = seedLink;
}

var availableSeedArray = [
    'seed167',
    'seed126',
    'seed171',
    'seed307',
    'seedp29xb',
    'seed305',
    'seed128',
    'seed125']

// get a random seed so that we're not overloading any single one
var seedArrayCurrentPosition = 1;

function getNewRandomSeed() {
    seedArrayCurrentPosition = Math.floor(Math.random(availableSeedArray.length - 1) * 10);
    return seedArrayCurrentPosition;
}

var newSeedVidLink = '';

function getSeedSourceFromSeedNo(seedNo, vidLink) {
    var vidLink = getHtmlPageVidLink()
    var seedNo = availableSeedArray[getNewRandomSeed()];
    newSeedVidLink = 'https://' + seedNo + '.bitchute.com/' + vidLink;
    setHtmlPageSeed(newSeedVidLink);
    return 'https://' + seedNo + '.bitchute.com/' + vidLink;
}

var newSeed = availableSeedArray[seedArrayCurrentPosition]

async function getNextSeed(vidLink) {
    var seedNo = availableSeedArray[seedArrayCurrentPosition];
    while (getHtmlPageSeed() === getSeedSourceFromSeedNo(seedNo, vidLink)) {
        if (seedArrayCurrentPosition < (availableSeedArray.length - 1)) {
            seedArrayCurrentPosition++; // add one to try next seed
        } else {
            seedArrayCurrentPosition = 0; // start back at the beginning
        }
        seedNo = availableSeedArray[seedArrayCurrentPosition];
    }
    return getSeedSourceFromSeedNo(seedNo, vidLink);
}

var seedIsValidFromLoop = false;

var seedSwapAttempts = 0;

var seedIsValidating = false;

var seedToSwapInto = undefined;

seedValidationHandle = undefined;

async function validateSeedLoop() {
    if (!seedIsValidating) {
        seedIsValidating = true;
        var newSeed = await getNextSeed(getHtmlPageVidLink());
        seedSwapAttempts++;
        seedIsValidFromLoop = await verifySeedIsValid(newSeed);
        if (seedIsValidFromLoop) {
            seedToSwapInto = newSeed;
            setHtmlPageSeed(seedToSwapInto);
            plyr.play();
            seedSwapAttempts = 0;
            clearInterval(seedValidationHandle);
            seedSwapInProgress = false;
        } else if (seedSwapAttempts >= 8) {
            console.log('attempted to swap seed 8 times and failed, aborting');
            plyr.pause();
            seedSwapAttempts = 0;
            clearInterval(seedValidationHandle);
            seedSwapInProgress = false;
        }
        seedIsValidating = false;
    }
}

async function runOnInterval() {
    if (plyr.playing) {
        if (!(plyr.currentTime > latestKnownVideoPosition)) {
            bufferDelta = bufferDelta + timerInterval;
            if (bufferDelta > 8000) {
                if (!seedSwapInProgress) {
                    seedSwapInProgress = true;
                    if (!seedIsValidating) {
                        seedValidationHandle = setInterval(validateSeedLoop, 8000);
                    }
                }
            }
        } else {
            bufferDelta = 0;
        }
        latestKnownVideoPosition = plyr.currentTime;
    } else {
        bufferDelta = 0;
    }
}

setInterval(runOnInterval, timerInterval);

