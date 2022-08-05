// defining a car class with 4 different parameters of how big is a car, store as attribute inside an obbject to be remembered 
class Car{
    constructor(x, y, width, height, controlType, maxSpeed = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed=0;
        this.acceleration = 0.2;

        //implement some friction to stop the car from going too fast
        this.maxSpeed=maxSpeed;
        this.friction=0.05;
        this.angle=0;
        this.damaged=false;

        this.useBrain=controlType=="AI";

        if(controlType!="DUMMY"){
            this.sensor=new Sensor(this);
            this.brain=new NeuralNetwork(
                [this.sensor.rayCount,6,4]
            );
        }
        this.controls=new Controls(controlType);
    }

    update(roadBorders,traffic) { // detect border, update the sensor
        if(!this.damaged){
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged=this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders,traffic);
            const offsets=this.sensor.readings.map(
                s=>s==null?0:1-s.offset
            );
            const outputs=NeuralNetwork.feedForward(offsets,this.brain);

            if(this.useBrain){
                this.controls.forward=outputs[0];
                this.controls.left=outputs[1];
                this.controls.right=outputs[2];
                this.controls.reverse=outputs[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic){ //by adding traffic the car will get damaged if it interacts with the other cars on the road
        for(let i=0;i<roadBorders.length;i++){
            if(polysIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }
        for(let i = 0;i < traffic.length; i++){
            if(polysIntersect(this.polygon,traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }


    #createPolygon(){
        const points=[];
        const rad=Math.hypot(this.width,this.height)/2;
        const alpha=Math.atan2(this.width,this.height);
        points.push({
            x:this.x-Math.sin(this.angle-alpha)*rad,
            y:this.y-Math.cos(this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(this.angle+alpha)*rad,
            y:this.y-Math.cos(this.angle+alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle-alpha)*rad
        });
        points.push({
            x:this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y:this.y-Math.cos(Math.PI+this.angle+alpha)*rad
        });
        return points;
    }

    #move(){ // how to move the car on canvas

        if(this.controls.forward){
            this.speed+=this.acceleration;
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration;
        }

        if(this.speed>this.maxSpeed){
            this.speed=this.maxSpeed;
        }
        if(this.speed<-this.maxSpeed/2){
            this.speed=-this.maxSpeed/2; // negative indicates the car going backward, not negative value.
        }
        if(this.speed > 0) {
            this.speed-= this.friction;
        }
        if (this.speed < 0) {
            this.speed+= this.friction;
        }
        // case to let the car stop completely without moving at all even in small increments.
        if(Math.abs(this.speed) < this.friction) {
            this.speed =0;
        }
        //calculate the flip:
        if(this.speed != 0) {
            const flip = this.speed > 0?1:-1; // the value of flip is 1 or -1 depending on the speed so that the car can be flipped from the controls backwards.
            
            //moving left and right
            if(this.controls.left) {
                this.angle +=0.03*flip // according to unit circle coordinates system to slower the speed when car moving on certain angles.
            }
            if(this.controls.right){
                this.angle-=0.03*flip;
            }
        }

        // implementing direction of the car when we rotate the car and move forward/backward on certain angles and rotated directions.

        this.x-=Math.sin(this.angle)*this.speed; // we meed to scale this by value of x and y
        this.y-=Math.cos(this.angle)*this.speed;

    }


    // draw context as parameters
    draw(ctx, color,drawSensor =false) { 
        if(this.damaged){
            ctx.fillStyle="gray";
        }else{
            ctx.fillStyle=color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y);
        for(let i=1;i<this.polygon.length;i++){
            ctx.lineTo(this.polygon[i].x,this.polygon[i].y);
        }
        ctx.fill();
        
        if(this.sensor && drawSensor) {
            this.sensor.draw(ctx); //draw the sensor on canvas
        }
    }
}