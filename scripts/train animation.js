function createStar() {   
    var star = new Path.Circle({
        center: [0, 0],
        radius: 5,
        opacity: 1
    });

    star.fillColor = {
        gradient: {
            stops: [['white', 0], ['white', 0.7], ['white', 1]],
            radial: true
        },
        origin: star.position,
        destination: star.bounds.rightCenter
    };

    var newStar = new Symbol(star);

    return newStar;
}

function getRandomScaleValue(minValue, maxValue) {
    return minValue +  Math.random()*(maxValue-minValue);
}

function addStarWithDelay(delay) {
    var numberOfStarsToAdd = numberOfStars;
    var addStarIntervalId = setInterval( function() {
        var starCenter = getRandomPosition();
        var currentStar = createStar();
        var placedStar = currentStar.place(starCenter);
        
        project.layers[0].addChild(placedStar);

        placedStar.scale(getRandomScaleValue(0.1, 1));
        numberOfStarsToAdd--;
        if(numberOfStarsToAdd === 0) {
            clearInterval(addStarIntervalId);
        }
    }, delay);
}

function getRandomPosition() {
    var position = {};
    var newPositionX;
    var newPositionY;    
    var randomSide = Math.round(Math.random()*4);

        if(randomSide === 1) {
            newPositionX = Point.random().x * view.size.width;
            newPositionY = view.size.height;
        } else if(randomSide === 2) {
            newPositionX = Point.random().x * view.size.width;
            newPositionY = 0;
        } else if(randomSide === 3) {
            newPositionX = view.size.width;
            newPositionY = Point.random().y * view.size.height; 
        } else {
            newPositionX = 0;
            newPositionY = Point.random().y * view.size.height;
        }

        position.x = newPositionX;
        position.y = newPositionY;
    return position;
}

function checkOutOfEndPoint(item, distanceToCenter, id, endPointDistance){    
    if (distanceToCenter < endPointDistance ) {
       item.position = getRandomPosition();
       maxDistancesToCenter[id] = null;       
    }        
}

function moveStars() {
    var center = view.center;
    var numberOfActivLayerChilds = project.layers[0].children.length;
    var screenRatio = view.size.width / view.size.height;
    for (var i = 0; i < numberOfActivLayerChilds; i++) {
        var item = project.layers[0].children[i];
        var distanceToCenter = item.position.getDistance(view.center);        
        var dx = (item.position.x - center.x)/center.x;
        var dy = (item.position.y - center.y)/center.y;  
        var endPointDistance;

        maxDistancesToCenter[i] = maxDistancesToCenter[i] || distanceToCenter; 
        starInitialSizes[i] = starInitialSizes[i] || item.bounds.size; 

        if(screenRatio > 1) {
            dx *= screenRatio;
            endPointDistance = 1/screenRatio/starInitialSizes[i].height*view.size.width;
        } else {
            dy /= screenRatio;
            endPointDistance = screenRatio/starInitialSizes[i].height*view.size.width;
        }  
        
        item.position.x -= dx*item.bounds.width*view.size.width/300;
        item.position.y -= dy*item.bounds.width*view.size.width/300;    
        itemScaleFactor = distanceToCenter / maxDistancesToCenter[i];
        item.bounds.size = starInitialSizes[i] * itemScaleFactor;

        if (i != numberOfStars - 1){
            checkOutOfEndPoint(item, distanceToCenter, i, endPointDistance);
        }
    }
}

function getInitialSleeperSize() {
    var tmpSleeper = new paper.Raster({
        source: './images/sleeper.png', 
    });
    var size = tmpSleeper.bounds.size;
    tmpSleeper.remove();

    return size;
}

function addSleeper() {
    var newSleeper = new paper.Raster({
        source: './images/sleeper.png', 
    });
    newSleeper.bounds.size = initialSleeperSize * view.size.width/1000;
    newSleeper.position.y = view.size.height;
    newSleeper.position.x = view.center.x;

    project.layers[1].addChild(newSleeper);     
}

function scaleSleeper(sleeper) {
    sleeper.bounds.size = initialSleeperSize * view.size.width/1000;
    sleeper.position.x = view.center.x;    
}

function moveSleeper() {
    var numberOfSleeperLayerChilds = project.layers[1].children.length;
    for (var i = 0; i < numberOfSleeperLayerChilds; i++) {
        var sleeper = project.layers[1].children[i];
        var distanceToEndPoint = sleeper.position.y - train.position.y;

        sleeper.position.y -= view.size.width*distanceToEndPoint/50000;
        sleeper.position.x = view.center.x;
        scaleSleeper(sleeper);
        constrictSleeper(sleeper);

        if(sleeper.position.y < train.position.y) {
            sleeper.remove();            
        }

        if(i === numberOfSleeperLayerChilds-1) { 
            var isTimeToAddNewSleeper = sleeper.position.y < view.size.height - 2*sleeper.bounds.height;

            if(!isPauseBeforeNewSleeper && isTimeToAddNewSleeper) {
                addSleeper();
            }
        }              
    }
}

function constrictSleeper(sleeper) {
    var distanceToEnd = sleeper.position.y - view.center.y;

    sleeper.bounds.size = sleeper.bounds.size*Math.sqrt(distanceToEnd/300);
    sleeper.position.x = view.center.x;
    sleeper.bounds.height *= distanceToEnd/500
}

function scaleRails() {  
    rails.bounds.size = initialRailsSize * view.size.width/2600;
    rails.position.x = view.center.x;
    rails.bounds.top = view.center.y;
    rails.bounds.bottom = view.size.height;
}


function scaleTrain() {  
    train.bounds.size = initialTrainSize*view.size.width/1800;
    train.position = view.center; 
}


function pumpTrain(maxDY) {   
    var vector = destination - train.position.y;
    var deltaX = Math.abs(train.position.x - view.center.x);

	train.position.y += vector / 60;

	if (vector < view.size.width/300) {
		destination = view.center.y - Math.random() * view.size.width/20;
    }   

    train.position.x += (Math.random() - 0.5)*2;   

    if(deltaX > view.size.width/800) {
        train.position.x = view.center.x;
    }
}

function onFrame(event) {
    if(view.center.y > normalViewCenterY) {
        view.center.y -= normalViewCenterY/40;
    }
    
    moveStars();   

    pumpTrain();

    moveSleeper();

    rails.bounds.top = train.position.y;

}

function onResize() {
    scaleTrain();
    scaleRails();
}

var centerNormalizeIntervalId;
var numberOfStars = 100;
var maxDistancesToCenter = {};
var starInitialSizes = {};
var isPauseBeforeNewSleeper = false;
var normalViewCenterY = view.center.y;

view.center.y = view.size.height-2;

addStarWithDelay(100);

var sleeperLayer = new Layer();
var trainLayer = new Layer();

trainLayer.activate();

var rails = new paper.Raster({
    source: './images/rails.png', 
});

rails.bounds.top = view.center.y;

var train = new paper.Raster({
    source: './images/train.png', 
    position: view.center
});

view.center.y = view.size.height - train.bounds.height/3;

var initialTrainSize = train.bounds.size;
var initialRailsSize = rails.bounds.size;
var initialSleeperSize = getInitialSleeperSize();
var destination = view.center.y;

addSleeper();