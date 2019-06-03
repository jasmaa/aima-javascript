// Image processing

/**
 * 2D array
 */
class Array2D {
	constructor(data, width, height){
		this.data = data;
		this.width = width;
		this.height = height;
	}
	
	get centerRow(){
		return parseInt(this.height / 2);
	}
	get centerCol(){
		return parseInt(this.width / 2);
	}
}

/**
 * Gaussian filter approximation
 */
class GaussianFilter extends Array2D {
	constructor(size, sigma=1){
		super([], size, size);
	
		// Calculate values
		let total = 0;
		for(let i=0; i < size; i++){
			for(let j=0; j < size; j++){
				let x = (j - this.centerCol) / this.centerCol * sigma;
				let y = (this.centerRow - i) / this.centerRow * sigma;
				
				let value = gaussian(x, y, sigma)
				total += value;
				this.data.push(value);
			}
		}
		
		// Normalize
		for(let i=0; i < size*size; i++){
			this.data[i] /= total;
		}
	
	}
}

/**
 * Converts image to greyscale
 * @param {Array2D} sourceData 
 */
function greyscale(sourceData){
    for(let i=0; i < sourceData.height; i++){
        for(let j=0; j < sourceData.width; j++){
            let index = 4*(sourceData.width*i + j);
            let avg = (sourceData.data[index + 0] + sourceData.data[index + 1] + sourceData.data[index + 2]) / 3;
            sourceData.data[index + 0] = avg;
            sourceData.data[index + 1] = avg;
            sourceData.data[index + 2] = avg;
        }
    }
}

/**
 * Convolves filter on sourceData
 * @param {*} sourceData 
 * @param {*} filter 
 */
function convolve(sourceData, filter){

    buffer = [...sourceData.data];

    for(let i=0; i < sourceData.height; i++){
        for(let j=0; j < sourceData.width; j++){
            let index = 4*(sourceData.width*i + j);
            
            // apply filter for rgb channels
            for(let chan=0; chan < 3; chan++){
                let value = 0;
                
                for(let filterRow=0; filterRow < filter.height; filterRow++){
                    for(let filterCol=0; filterCol < filter.width; filterCol++){
                        let srcRow = i + filterRow - filter.centerRow;
                        let srcCol = j + filterCol - filter.centerCol;
                        let filterValue = filter.data[filter.height*(filter.height - filterRow - 1) + (filter.width - filterCol - 1)];
                        // calculate if within
                        if(srcRow >= 0 && srcRow < sourceData.height && srcCol >= 0 && srcCol < sourceData.width){
                            value += sourceData.data[4*(sourceData.width*srcRow + srcCol) + chan] * filterValue;
                        }
                        // assume 255 outside image
                        else{
                            value += 255 * filterValue;
                        }
                    }
                }
                
                buffer[4*(sourceData.width*i + j) + chan] = value;
            }
            
        }
    }

    // copy buffer over
    fillArray(sourceData.data, buffer, sourceData.data.length);
}

/**
 * Stretches color of sourceData between 0-255
 * @param {*} sourceData 
 */
function stretchColor(sourceData){

    let max = Math.max(...sourceData.data);
    let min = Math.min(...sourceData.data);

    for(let i=0; i < sourceData.height; i++){
        for(let j=0; j < sourceData.width; j++){
            for(let k=0; k < 3; k++){
                value = sourceData.data[4*(sourceData.width*i + j) + k];
                value = (value-min) / (max-min) * 255;
                
                sourceData.data[4*(sourceData.width*i + j) + k] = value;
            }
        }
    }
}

/**
 * Copies length values from target to source
 * @param {*} source 
 * @param {*} target 
 * @param {*} length 
 */
function fillArray(source, target, length){
    for(let i=0; i < length; i++){
        source[i] = target[i];
    }
}