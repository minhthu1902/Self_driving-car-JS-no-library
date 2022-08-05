// road class with road x is center of road, number of lane.
// 

class Road {
    constructor(x, width, laneCount = 3) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x - width/2 ; // value for left , 1/2 of width
        this.right = x + width/2;

        const infinity = 1000000; // big value, infinitely downward and upward
        this.top = -infinity; // road are running downward
        this.bottom = infinity;


        //sensor for borders
        const topLeft = {x:this.left, y:this.top};
        const topRight = {x:this.right, y:this.top};
        const bottomLeft = {x:this.left, y:this.bottom};
        const bottomRight = {x:this.right, y:this.bottom};

        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    getLaneCenter(laneIndex){ // have the car in the center lane
        const laneWidth = this.width/this.laneCount;
        return this.left + laneWidth/2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth; 
    } // starting in the middle of the first lane, Math.min...indicates that the car going under rightmost possible lane.

    draw(ctx) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white"; // line on the lane

        for(let i = 1; i <= this.laneCount -1; i++) {
            const x = lerp(
                this.left,
                this.right,
                i/this.laneCount
            ); // interpolation "lerp", interpolate from left to right, using for loop when i become this.laneCount then it become 1 then get percent value

            ctx.setLineDash([20, 20]); // dash will break at 20 pixels
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        // go through the border move to first pointing border x and y
        this.borders.forEach(border=>{
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });
    }
}
