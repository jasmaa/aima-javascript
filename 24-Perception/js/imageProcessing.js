// Image processing

/**
 * 2x2 grid with channels
 */
class Array2D {

	constructor(data, width, height, channels=1){
		this.data = data;
		this.width = width;
        this.height = height;
        this.channels = channels;
	}
    
    /**
     * Gets center row index
     */
	get centerRow(){
		return Math.floor(this.height / 2);
    }
    
    /**
     * Gets center column index
     */
	get centerCol(){
		return Math.floor(this.width / 2);
    }
    
    /**
     * Gets value at (row, col, chan)
     * @param {integer} row 
     * @param {integer} col 
     * @param {integer} chan 
     */
    getValue(row, col, chan=0){
        return this.data[this.channels*(this.width*row + col) + chan];
    }

    /**
     * Sets value  at (row, col, chan)
     * @param {*} value 
     * @param {integer} row 
     * @param {integer} col 
     * @param {integer} chan 
     */
    setValue(value, row, col, chan=0){
        this.data[this.channels*(this.width*row + col) + chan] = value;
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
 * 
 * @param {Array2D} source - RGBA source
 */
function grayscale(source){
    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){
            let index = 4*(source.width*i + j);
            let avg = Math.floor((source.data[index + 0] + source.data[index + 1] + source.data[index + 2]) / 3);
            source.data[index + 0] = avg;
            source.data[index + 1] = avg;
            source.data[index + 2] = avg;
        }
    }
}

/**
 * Convolves filter on RGBA source
 * 
 * @param {Array2D} source - RGBA source
 * @param {Array2D} filter - Convolving filter 
 * @param {integer} defaultValue - Default out of bounds value 
 */
function convolve(source, filter, defaultValue=0){

    // Copy data to buffer for output
    buffer = [...source.data];

    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){
            
            // Apply filter for RGB channels
            for(let chan=0; chan < 3; chan++){

                let value = 0;
                
                loop1:
                for(let filterRow=0; filterRow < filter.height; filterRow++){
                    loop2:
                    for(let filterCol=0; filterCol < filter.width; filterCol++){
                        let srcRow = i + filterRow - filter.centerRow;
                        let srcCol = j + filterCol - filter.centerCol;
                        let filterValue = filter.data[filter.height*(filter.height - filterRow - 1) + (filter.width - filterCol - 1)];

                        // Calculate if within source
                        if(srcRow >= 0 && srcRow < source.height && srcCol >= 0 && srcCol < source.width){
                            value += source.data[source.channels*(source.width*srcRow + srcCol) + chan] * filterValue;
                        }
                        // Use default value if out of bounds
                        else{
                            value = defaultValue;
                            break loop1;
                        }
                    }
                }
                
                buffer[source.channels*(source.width*i + j) + chan] = value;
            }
            
        }
    }

    // Copy buffer over
    fillArray(source.data, buffer, source.data.length);
}

/**
 * Computes magnitude and angles of gradients from X and Y components
 * 
 * @param {Array2D} sourceX 
 * @param {Array2D} sourceY 
 */
function computeGradients(sourceX, sourceY){
    let mags = new Array2D(
        Array.from({length: 4*sourceX.width*sourceX.width}, ()=>255),
        sourceX.width, sourceX.height, 4
    );
    let angles = new Array2D(
        Array.from({length: 4*sourceX.width*sourceX.width}, ()=>255),
        sourceX.width, sourceX.height, 4
    );

    for(let i=0; i < sourceX.height; i++){
        for(let j=0; j < sourceX.width; j++){
            const xVal = sourceX.data[sourceX.channels*(sourceX.width*i + j) + 0];
            const yVal = sourceY.data[sourceY.channels*(sourceY.width*i + j) + 0];
            const mag = mag2d(xVal, yVal);
            let angle = Math.atan2(yVal, xVal);

            // Fix angle between 0 and PI
            if(angle < 0){
                angle += 2*Math.PI
            }
            if(angle > Math.PI){
                angle -= Math.PI;
            }

            // Update grids
            mags.data[mags.channels*(mags.width*i + j) + 0] = mag;
            mags.data[mags.channels*(mags.width*i + j) + 1] = mag;
            mags.data[mags.channels*(mags.width*i + j) + 2] = mag;
            angles.data[angles.channels*(angles.width*i + j) + 0] = angle;
            angles.data[angles.channels*(angles.width*i + j) + 1] = angle;
            angles.data[angles.channels*(angles.width*i + j) + 2] = angle;
        }
    }

    return [mags, angles];
}

/**
 * Performs non-maximum suppression and returns suppressed Array2D
 * 
 * @param {Array2D} magGrid - Grid of magnitudes
 * @param {Array2D} angleGrid - Grid of angles
 */
function nonMaxSuppress(magGrid, angleGrid){

    let res = new Array2D(
        [...magGrid.data],
        magGrid.width, magGrid.height, 4
    );

    for(let i=1; i < magGrid.height-1; i++){
        for(let j=1; j < magGrid.width-1; j++){

            const currMag = magGrid.data[magGrid.channels*(magGrid.width*i + j) + 0];
            const angle = angleGrid.data[angleGrid.channels*(angleGrid.width*i + j) + 0];

            // Get relevant neighbors
            let mags = [currMag];
            if(angle >= 0 && angle < Math.PI/8){
                mags.push(magGrid.data[magGrid.channels*(magGrid.width*i + (j-1))]);
                mags.push(magGrid.data[magGrid.channels*(magGrid.width*i + (j+1))]);
            }
            else if(angle >= Math.PI/8 && angle < 3*Math.PI/8){
                mags.push(magGrid.data[magGrid.channels*(magGrid.width*(i+1) + (j-1))]);
                mags.push(magGrid.data[magGrid.channels*(magGrid.width*(i+1) + (j-1))]);
            }
            else if(angle >= 3*Math.PI/8 && angle < 5*Math.PI/8){
                mags.push(magGrid.data[magGrid.channels*(magGrid.width*(i-1) + j)]);
                mags.push(magGrid.data[magGrid.channels*(magGrid.width*(i+1) + j)]);
            }
            else if(angle >= 5*Math.PI/8 && angle < 7*Math.PI/8){
                mags.push(magGrid.data[magGrid.channels*(magGrid.width*(i-1) + (j-1))]);
                mags.push(magGrid.data[magGrid.channels*(magGrid.width*(i+1) + (j+1))]);
            }
            else{
                mags.push(magGrid.data[magGrid.channels*(magGrid.width*i + (j-1))]);
                mags.push(magGrid.data[magGrid.channels*(magGrid.width*i + (j+1))]);
            }

            // Choose to suppress
            const value = Math.max(...mags) > currMag ? 0 : currMag;
            res.data[res.channels*(res.width*i + j) + 0] = value;
            res.data[res.channels*(res.width*i + j) + 1] = value;
            res.data[res.channels*(res.width*i + j) + 2] = value;
        }
    }

    return res;
}

/**
 * Performs double threshold
 * 127 is a weak edge and 255 is a strong edge for display
 * 
 * @param {Array2D} source - Grid of magnitudes
 * @param {Number} hi - High threshold
 * @param {Number} lo - Low threshold
 */
function doubleThreshold(source, hi, lo){
    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){

            const value = source.data[source.channels*(source.width*i + j)];
            let res = 0;

            if(value > hi){
                res = 255;
            }
            else if(value > lo){
                res = 127;
            }

            source.data[source.channels*(source.width*i + j) + 0] = res;
            source.data[source.channels*(source.width*i + j) + 1] = res;
            source.data[source.channels*(source.width*i + j) + 2] = res;
        }
    }
}

/**
 * Performs edge tracking by hysteresis on a grid that has
 * had its edge strength determined
 * 
 * @param {Array2D} source - Grid with edge strength detected
 */
function edgeConnect(source){
    for(let i=1; i < source.height-1; i++){
        for(let j=1; j < source.width-1; j++){

            const value = source.data[source.channels*(source.width*i + j)];
            let strongDetected = false;

            // If weak edge, check neighborhood
            if(value == 127){
                for(let rowOffset= -1; rowOffset <= 1; rowOffset++){
                    for(let colOffset= -1; colOffset <= 1; colOffset++){
                        // Detect strong edge
                        if(source.data[source.channels*(source.width*(i+rowOffset)) + (j+colOffset)] == 255){
                            strongDetected = true;
                        }
                    }
                }

                let res = strongDetected ? 255 : 0;
                source.data[source.channels*(source.width*i + j) + 0] = res;
                source.data[source.channels*(source.width*i + j) + 1] = res;
                source.data[source.channels*(source.width*i + j) + 2] = res;
            }
        }
    }
}

/**
 * Stretches color of source to between 0-255
 * 
 * @param {Array2D} source - RGBA source
 */
function stretchColor(source){

    let max = source.data.reduce(function(a, b) {
        return Math.max(a, b);
    });
    let min = source.data.reduce(function(a, b) {
        return Math.min(a, b);
    });

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
 * 
 * @param {Array} targetData - RGBA target pixel data
 * @param {Array} sourceData - RGBA source pixel data
 * @param {integer} length - Amount of data to copy
 */
function fillArray(targetData, sourceData, length){
    for(let i=0; i < length; i++){
        targetData[i] = sourceData[i];
    }
}


// === GRID PATTERNS ===

function createVerticalLine(source){

    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){

            let value = Math.floor(Math.abs(source.centerCol - j) / source.centerCol * 206);

            source.data[4*(source.width*i + j) + 0] = value;
            source.data[4*(source.width*i + j) + 1] = value;
            source.data[4*(source.width*i + j) + 2] = value;
        }
    }
}

function createHorizontalLine(source){
    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){

            let value = Math.floor(Math.abs(source.centerRow - i) / source.centerRow * 206);

            source.data[4*(source.width*i + j) + 0] = value;
            source.data[4*(source.width*i + j) + 1] = value;
            source.data[4*(source.width*i + j) + 2] = value;

        }
    }
}

function createDiagonalLine(source){
    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){

            let value = Math.abs(i - j) * 100;
            value = Math.min(value, 255);

            source.data[4*(source.width*i + j) + 0] = value;
            source.data[4*(source.width*i + j) + 1] = value;
            source.data[4*(source.width*i + j) + 2] = value;
        }
    }
}

function createLineGradient(source){
    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){

            let value = j * 40;
            value = Math.min(value, 255);

            source.data[4*(source.width*i + j) + 0] = value;
            source.data[4*(source.width*i + j) + 1] = value;
            source.data[4*(source.width*i + j) + 2] = value;
        }
    }
}

function createRadialGradient(source){
    for(let i=0; i < source.height; i++){
        for(let j=0; j < source.width; j++){

            let value = Math.floor(Math.sqrt(Math.pow(i-source.centerRow, 2) + Math.pow(j-source.centerCol, 2)) * 50);
            value = Math.min(value, 255);

            source.data[4*(source.width*i + j) + 0] = value;
            source.data[4*(source.width*i + j) + 1] = value;
            source.data[4*(source.width*i + j) + 2] = value;
        }
    }
}

// === FILTERS ===

const gaussianBlur5 = new Array2D([
    1/273, 4/273, 7/273, 4/273, 1/273,
    4/273, 16/273, 26/273, 16/273, 4/273,
    7/273, 26/273, 41/273, 26/273, 7/273,
    4/273, 16/273, 26/273, 16/273, 4/273,
    1/273, 4/273, 7/273, 4/273, 1/273
], 5, 5);

const sobelX = new Array2D([
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
], 3, 3);

const sobelY = new Array2D([
    1, 2, 1,
    0, 0, 0,
    -1, -2, -1
], 3, 3);