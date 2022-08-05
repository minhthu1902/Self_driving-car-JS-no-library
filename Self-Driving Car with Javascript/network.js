

class NeuralNetwork{
    constructor(neuronCounts){
        this.levels=[];
        for(let i=0;i<neuronCounts.length-1;i++){
            this.levels.push(new Level(
                neuronCounts[i],neuronCounts[i+1]
            ));
        }
    }

    static feedForward(givenInputs,network){
        let outputs=Level.feedForward(
            givenInputs,network.levels[0]);
        for(let i=1;i<network.levels.length;i++){
            outputs=Level.feedForward(
                outputs,network.levels[i]);
        }
        return outputs;
    }

    static mutate(network,amount=1){
        network.levels.forEach(level => { // iterate through all biases and through all the weights later
            for(let i=0;i<level.biases.length;i++){
                level.biases[i]=lerp( // use linear interpolation
                    level.biases[i], // current value of biases 
                    Math.random()*2-1, // and a random value between minus one and one randomly
                    amount // using loop to go from the current value of the bias to worfs (random value is)
                )
            }
            // repeat the same loop for all the weights
            for(let i=0;i<level.weights.length;i++){
                for(let j=0;j<level.weights[i].length;j++){
                    level.weights[i][j]=lerp(
                        level.weights[i][j],
                        Math.random()*2-1,
                        amount
                    )
                }
            }
        });
    }
}

class Level{
    constructor(inputCount,outputCount){
        this.inputs=new Array(inputCount);
        this.outputs=new Array(outputCount);
        this.biases=new Array(outputCount);

        this.weights=[];
        for(let i=0;i<inputCount;i++){
            this.weights[i]=new Array(outputCount);
        }

        Level.#randomize(this); //random brain
    }

    static #randomize(level) {
        // set a weight to a random value between -1 and 1 for each of pair of inputs and outputs 
        for (let i = 0 ; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                level.weights[i][j] = Math.random()* 2-1 ; // use Math random * 2 -> value between 0 and 2 and subtract 1 to have a value between -1 and 1
            }
        }
        for (let i = 0 ; i < level.biases.length; i++) {
            level.biases[i] = Math.random()* 2 - 1;
        }
    }

    static feedForward(givenInputs,level){
        for(let i=0;i<level.inputs.length;i++){
            level.inputs[i]=givenInputs[i];
        }

        for(let i=0;i<level.outputs.length;i++){
            let sum=0
            for(let j=0;j<level.inputs.length;j++){
                sum+=level.inputs[j]*level.weights[j][i];
            }

            if(sum>level.biases[i]){
                level.outputs[i]=1;
            }else{
                level.outputs[i]=0;
            } 
        }

        return level.outputs;
    }
}