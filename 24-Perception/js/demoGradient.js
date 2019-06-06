// Gradient detection demo

/**
 * Top level gradient demo
 */
class GradientDemo extends React.Component {

    constructor(props){
        super(props);

        let size = 7;
        // Generate 5x5 array2d of random values
        let src = Array.from({length: 4*size*size}, ()=>0);
        for(let i=0; i < size; i++){
            for(let j=0; j < size; j++){

                src[4*(size*i + j) + 0] = parseInt(Math.abs(i-parseInt(size/2))/parseInt(size/2) * 206);
            }
        }

        this.source = new Array2D(src, size, size, 4);
    }


    processGradient(){

        const canvas = document.getElementById('gradient-canvas');
        const context = canvas.getContext('2d');

        let unit = parseInt(canvas.width / this.source.height);
        let halfUnit = parseInt(unit / 2);

        context.clearRect(0, 0, canvas.width, canvas.height);

        // Apply Sobel operator horizontally
        let sobelXData = new Array2D([...this.source.data], this.source.width, this.source.height, 4);
        convolve(sobelXData, sobelX);
        
        // Apply Sobel operator vertically
        let sobelYData = new Array2D([...this.source.data], this.source.width, this.source.height, 4);
        convolve(sobelYData, sobelY);

        for(let i=0; i < this.source.height; i++){
            for(let j=0; j < this.source.width; j++){
                let mag = Math.sqrt(
                    Math.pow(sobelXData.data[4*(this.source.width*i + j) + 0], 2) +
                    Math.pow(sobelYData.data[4*(this.source.width*i + j) + 0], 2)
                );

                let angle = Math.atan2(sobelYData.data[4*(this.source.width*i + j) + 0], sobelXData.data[4*(this.source.width*i + j) + 0]);

                // Color cell
                context.fillStyle = gray2RGB(this.source.data[4*(this.source.width*i + j) + 0]);
                context.fillRect(unit*j, unit*i, unit, unit);

                // Draw vector
                context.beginPath();
                context.strokeStyle = 'cyan';
                context.moveTo(unit*j + halfUnit, unit*i + halfUnit);
                context.lineTo(unit*j + unit, unit*i + halfUnit*Math.sin(angle) + halfUnit);
                context.stroke();
                context.closePath();
            }
        }
    }

    /**
     * Updates Array2D grid with value at (row, col)
     * @param {Array2D} grid 
     * @param {integer} value 
     * @param {integer} row 
     * @param {integer} col 
     */
    updateData(grid, value, row, col){

        // Prevent non-numerical input
        if(isNaN(value)){
            return;
        }

        // Clamp input
        let clampedValue = +value;

        if(clampedValue > 255){
            return;
        }
        else if(clampedValue < 0){
            return;
        }

        grid.data[grid.channels*(grid.width*row + col) + 0] = clampedValue;
        this.processGradient();

        this.setState({
            grid: this.source,
        });
    }

    render(){

        return e('div', {className: 'row'}, [
            e('div', {className: 'col-md-6'},
                e(GridInput, {
                    key: 'source-input',
                    idBase: 'gradient-cell',
                    grid: this.source,
                    updateGridHandler: (v, i, j)=>this.updateData(this.source, v, i, j)
                }, null)
            ),
            e('div', {className: 'col-md-6'},
                e('canvas', {
                    id: 'gradient-canvas',
                    width: 400,
                    height: 400,
                }, null)
            ),
        ]);
    }

}

// Render elements
ReactDOM.render(
    e(GradientDemo, null, null),
    document.getElementById('gradient-root')
);
