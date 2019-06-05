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
    
    /**
     * Gets center row index
     */
	get centerRow(){
		return parseInt(this.height / 2);
    }
    
    /**
     * Gets center column index
     */
	get centerCol(){
		return parseInt(this.width / 2);
	}
}

/**
 * Gaussian filter rough approximation
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
 * @param {Array2D} source - RGBA source
 */
function grayscale(source){
    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){
            let index = 4*(source.width*i + j);
            let avg = (source.data[index + 0] + source.data[index + 1] + source.data[index + 2]) / 3;
            source.data[index + 0] = avg;
            source.data[index + 1] = avg;
            source.data[index + 2] = avg;
        }
    }
}

/**
 * Convolves filter on RGBA source
 * @param {Array2D} source - RGBA source
 * @param {Array2D} filter - Convolving filter 
 * @param {integer} defaultValue - Default out of bounds value 
 */
function convolve(source, filter, defaultValue=255){

    // Copy data to buffer for output
    buffer = [...source.data];

    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){
            
            // Apply filter for RGB channels
            for(let chan=0; chan < 3; chan++){

                let value = 0;
                
                for(let filterRow=0; filterRow < filter.height; filterRow++){
                    for(let filterCol=0; filterCol < filter.width; filterCol++){
                        let srcRow = i + filterRow - filter.centerRow;
                        let srcCol = j + filterCol - filter.centerCol;
                        let filterValue = filter.data[filter.height*(filter.height - filterRow - 1) + (filter.width - filterCol - 1)];

                        // Calculate if within source
                        if(srcRow >= 0 && srcRow < source.height && srcCol >= 0 && srcCol < source.width){
                            value += source.data[4*(source.width*srcRow + srcCol) + chan] * filterValue;
                        }
                        // Use default value if out of bounds
                        else{
                            value += defaultValue * filterValue;
                        }
                    }
                }
                
                buffer[4*(source.width*i + j) + chan] = value;
            }
            
        }
    }

    // Copy buffer over
    fillArray(source.data, buffer, source.data.length);
}

/**
 * Stretches color of source to between 0-255
 * @param {Array2D} source - RGBA source
 */
function stretchColor(source){

    let max = Math.max(...source.data);
    let min = Math.min(...source.data);

    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){
            for(let k=0; k < 3; k++){
                value = source.data[4*(source.width*i + j) + k];
                value = (value-min) / (max-min) * 255;
                
                source.data[4*(source.width*i + j) + k] = value;
            }
        }
    }
}

/**
 * Copies length values from source to target
 * @param {Array} targetData - RGBA target pixel data
 * @param {Array} sourceData - RGBA source pixel data
 * @param {integer} length - Amount of data to copy
 */
function fillArray(targetData, sourceData, length){
    for(let i=0; i < length; i++){
        targetData[i] = sourceData[i];
    }
}