// get a reference to canvas with canvas id defined previously on html and css.
const carCanvas=document.getElementById("carCanvas");
carCanvas.width = 200; // set width of canvas in the center at 200 pixels.
// for networkCanvas
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width = 300;

//context
const carCtx = carCanvas.getContext("2d"); 
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width/2, carCanvas.width*0.9); // draw road with the width in the center of canvas and the height is entire height of canvas

const N=100;
const cars = generateCars(N);
let bestCar=cars[0];

// parsing the json string save previously local storage to brain
if(localStorage.getItem("bestBrain")){
    for(let i=0;i<cars.length;i++){
        cars[i].brain=JSON.parse( // the brain will equal to local storage
            localStorage.getItem("bestBrain"));
        if(i!=0){ // the brain that in local storage will be kept for the case when I zeroa dn that is our best car initialization, and this if is for the other one
            NeuralNetwork.mutate(cars[i].brain,0.1); 
            // mutate the shadow other car following the main car
        }
    }
}

const traffic=[
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2),
];

animate();

// serializing the brain onto the local storage
function save(){
    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
}

function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return cars;
}


function animate(time) {
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }
    // best car is the one has the minimum y value. Three dots work with many y values.
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    carCanvas.height = window.innerHeight; // resize the canvas and let the car move clearly without leaving any trace within the width of the road.
    networkCanvas.height = window.innerHeight; // resize the networkCanvas 

    carCtx.save();
    carCtx.translate(0,-bestCar.y + carCanvas.height*0.7) // centering the car

    // draw cars and other cars
    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx,"red");
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx,"blue");
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,"blue",true);

    carCtx.restore();

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate); //call request animation frame again and again many times per second to give the illusion of movement that we want

}