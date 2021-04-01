// JavaScript source code

function getHtmlPageVidLink() {
    return $('source')[0].src.split('.bitchute.com/')[1];
};

function setHtmlPageSeed(seedLink) {
    $('source')[0].src = seedLink;
    $('video')[0].src = seedLink;
    plyr.play();
};

availableSeedArray = [
    'seed111',
    'seed132',
    'seed122',
    'seed167',
    'seed126',
    'seed171',
    'seedp29xb',
    'seed305',
    'seed307',
    'seed128',
    'seed125',
    'seed177',
    'zb10-7gsop1v78'];

var seedArrayCurrentPosition = 1;

function getNewRandomSeed() {
    var _tempPosition = Math.floor(Math.random(availableSeedArray.length - 1) * 10);
    if (_tempPosition == seedArrayCurrentPosition) {
        if ((_tempPosition + 1) > (availableSeedArray.length - 1)) {
            _tempPosition = 0;
        } else {
            _tempPosition++;
        }
    }
    seedArrayCurrentPosition = _tempPosition;
    return seedArrayCurrentPosition;
};

var newSeedVidLink = '';

function getSeedSourceFromSeedNo(seedNo, vidLink) {
    if (!vidLink) {
        var vidLink = getHtmlPageVidLink()
    } if (!seedNo) {
        var seedNo = availableSeedArray[getNewRandomSeed()];
    }
    newSeedVidLink = 'https://' + seedNo + '.bitchute.com/' + vidLink;
    setHtmlPageSeed(newSeedVidLink);
    //plyr.play();
    return newSeedVidLink;
};

getSeedSourceFromSeedNo();
