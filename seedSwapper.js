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

function setHtmlPageSeed(seedLink) {
    $('source')[0].src = seedLink;
}

function getHtmlPageVidLink() {
    return $('source')[0].src.split('.bitchute.com/')[1];
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

// Yes, I know this violates DRY
// the issue is that some of the seeds now
// do not contain the text 'seed' ... they are
// a raw random character array
// so these contain 'seed' because some of them will not
// this is a prototype code file and every available seed
// will need to be added by Rich or Ray
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
var seedArrayCurrentPosition = Math.floor(Math.random(availableSeedArray.length) * 10);

function getSeedSourceFromSeedNo(seedNo) {
    return 'https://' + seedNo + '.bitchute.com/' + vidLink;
}

async function getNextSeed(vidLink) {
    var seedNo = availableSeedArray[seedArrayCurrentPosition];
    while (getHtmlPageSeed() === getSeedSourceFromSeedNo(seedNo)) {
        if (seedArrayCurrentPosition < (availableSeedArray.length - 1)) {
            seedArrayCurrentPosition++; // add one to try next seed
        } else {
            seedArrayCurrentPosition = 0; // start back at the beginning
        }
        seedNo = availableSeedArray[seedArrayCurrentPosition];
    }
    return getSeedSourceFromSeedNo(seedNo);
}

var seedIsValidFromLoop = false;

var seedSwapAttempts = 0;

var seedIsValidating = false;

var seedToSwapInto = undefined;

async function validateSeedLoop() {
    seedIsValidating = true;
    var newSeed = await getNextSeed(getHtmlPageVidLink());
    seedSwapAttempts++;
    seedIsValidFromLoop = await verifySeedIsValid(newSeed);
    if (seedIsValidFromLoop) {
        seedToSwapInto = newSeed;
    }
    seedIsValidating = false;
}

async function runOnInterval() {
    if (plyr.playing) {
        if (!(plyr.currentTime > latestKnownVideoPosition)) {
            bufferDelta = bufferDelta + timerInterval;
            if (bufferDelta > 8000) {
                if (!seedSwapInProgress) {
                    seedSwapInProgress = true;
                    seedIsValidFromLoop = await verifySeedIsValid(getHtmlPageSeed());
                    while (!seedIsValidFromLoop && (seedSwapAttempts < 8)) {
                        if (!seedIsValidating) {
                            setTimeout(validateSeedLoop, 1500);
                        }
                    }
                    if (seedSwapAttempts >= 8) {
                        console.log('attempted to swap seed 8 times and failed, aborting');
                        plyr.pause();
                    }
                    if (seedIsValidFromLoop && seedToSwapInto != undefined) {
                        setHtmlPageSeed(seedToSwapInto);
                        plyr.play();
                    }
                    seedSwapAttempts = 0;
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

