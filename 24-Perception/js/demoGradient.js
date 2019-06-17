// Gradient detection demo

/**
 * Top level gradient demo
 */
class GradientDemo extends React.Component {

    constructor(props){
        super(props);

        // Generate source array2d
        const size = 7;
        let src = Array.from({length: 4*size*size}, ()=>0);

        for(let i=0; i < size; i++){
            for(let j=0; j < size; j++){

                let value = Math.floor(Math.abs(Math.floor(size/2) - i) / Math.floor(size/2) * 206);

                src[4*(size*i + j) + 0] = value;
                src[4*(size*i + j) + 1] = value;
                src[4*(size*i + j) + 2] = value;
            }
        }

        this.source = new Array2D(src, size, size, 4);

        $(document).ready(()=>this.process());

        this.canvas = null;
        $(window).resize(()=>this.resize());
    }

    /**
     * Sets gradient demo with a vertical line
     */
    setVerticalLine(){

        for(let i=0; i < this.source.height; i++){
            for(let j=0; j < this.source.width; j++){

                let value = Math.floor(Math.abs(this.source.centerRow - j) / this.source.centerRow * 206);

                this.source.data[4*(this.source.width*i + j) + 0] = value;
                this.source.data[4*(this.source.width*i + j) + 1] = value;
                this.source.data[4*(this.source.width*i + j) + 2] = value;

            }
        }

        this.process();

        this.setState({
            grid: this.source,
        });
    }

    /**
     * Sets gradient demo with a horizontal line
     */
    setHorizontalLine(){

        for(let i=0; i < this.source.height; i++){
            for(let j=0; j < this.source.width; j++){

                let value = Math.floor(Math.abs(Math.floor(this.source.height/2) - i) / Math.floor(this.source.height/2) * 206);

                this.source.data[4*(this.source.width*i + j) + 0] = value;
                this.source.data[4*(this.source.width*i + j) + 1] = value;
                this.source.data[4*(this.source.width*i + j) + 2] = value;

            }
        }

        this.process();

        this.setState({
            grid: this.source,
        });
    }

    /**
     * Sets gradient demo with a horizontal line
     */
    setDiagonalLine(){

        for(let i=0; i < this.source.height; i++){
            for(let j=0; j < this.source.width; j++){

                let value = Math.min(Math.abs(i - j) * 100, 255);

                this.source.data[4*(this.source.width*i + j) + 0] = value;
                this.source.data[4*(this.source.width*i + j) + 1] = value;
                this.source.data[4*(this.source.width*i + j) + 2] = value;

            }
        }

        this.process();

        this.setState({
            grid: this.source,
        });
    }

    /**
     * Set gradient demo with horizontal line gradient
     */
    setHorizontalGrad(){

        for(let i=0; i < this.source.height; i++){
            for(let j=0; j < this.source.width; j++){

                let value = j * 40;

                this.source.data[4*(this.source.width*i + j) + 0] = value;
                this.source.data[4*(this.source.width*i + j) + 1] = value;
                this.source.data[4*(this.source.width*i + j) + 2] = value;

            }
        }

        this.process();

        this.setState({
            grid: this.source,
        });
    }

    /**
     * Set gradient demo with radial gradient
     */
    setRadialGrad(){

        for(let i=0; i < this.source.height; i++){
            for(let j=0; j < this.source.width; j++){

                let value = Math.floor(Math.sqrt(Math.pow(i-this.source.centerRow, 2) + Math.pow(j-this.source.centerCol, 2)) * 50);

                this.source.data[4*(this.source.width*i + j) + 0] = value;
                this.source.data[4*(this.source.width*i + j) + 1] = value;
                this.source.data[4*(this.source.width*i + j) + 2] = value;

            }
        }

        this.process();

        this.setState({
            grid: this.source,
        });
    }

    /**
     * Canvas resize handler
     */
    resize(){
        this.canvas.style.width = (innerWidth / 4)+'px';
    }

    /**
     * Computes gradient and draws vector field
     */
    process(){

        this.canvas = document.getElementById('gradient-canvas');
        const context = this.canvas.getContext('2d');

        const unit = Math.floor(this.canvas.width / this.source.height);
        const halfUnit = Math.floor(unit / 2);
        const quarterUnit = Math.floor(halfUnit / 2);

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply Sobel operator horizontally
        let sobelXData = new Array2D([...this.source.data], this.source.width, this.source.height, 4);
        convolve(sobelXData, sobelX);
        
        // Apply Sobel operator vertically
        let sobelYData = new Array2D([...this.source.data], this.source.width, this.source.height, 4);
        convolve(sobelYData, sobelY);

        // Find and scale magnitudes
        let mags = [];
        for(let i=0; i < this.source.height; i++){
            for(let j=0; j < this.source.width; j++){
                let mag = Math.sqrt(
                    Math.pow(sobelXData.data[4*(this.source.width*i + j) + 0], 2) +
                    Math.pow(sobelYData.data[4*(this.source.width*i + j) + 0], 2)
                );
                mags.push(mag);
            }
        }

        let minMag = Math.min(...mags);
        let maxMag = Math.max(...mags);

        for(let i=0; i < this.source.height; i++){
            for(let j=0; j < this.source.width; j++){

                // Convert magnitude to light spectrum wavelength
                let mag = mags[this.source.width*i + j];
                let wavelength = (mag - minMag) / (maxMag - minMag) * 250 + 450;

                // Color cell
                context.fillStyle = gray2RGB(this.source.data[4*(this.source.width*i + j) + 0]);
                context.fillRect(unit*j, unit*i, unit, unit);

                // Draw vector
                context.beginPath();
                context.strokeStyle = wavelengthToColor(wavelength)[0];
                canvas_arrow(
                    context,
                    unit*j + halfUnit,
                    unit*i + halfUnit,
                    unit*j + halfUnit + quarterUnit*(sobelXData.data[4*(this.source.width*i + j) + 0] / mag),
                    unit*i + halfUnit - quarterUnit*(sobelYData.data[4*(this.source.width*i + j) + 0] / mag),
                );
                context.stroke();
                context.closePath();
            }
        }

        this.resize();
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
        this.process();

        this.setState({
            grid: this.source,
        });
    }

    render(){
        
        return e('div', null,
            e('div', {key: 'display-row', className: 'row'}, [
                e('div', {key: 'col-1', className: 'col-xs-6'}, [
                    e('div', {key: 'control-row', className: 'row', style: {textAlign: 'center'}},  [
                        e('div', {key: 'col-0', className: 'col-xs-1'}, null),
                        e('div', {key: 'col-1', className: 'col-xs-2'},
                            e('div', {className: 'btn btn-danger', onClick: ()=>this.setHorizontalLine()}, '1'),
                        ),
                        e('div', {key: 'col-2', className: 'col-xs-2'},
                            e('div', {className: 'btn btn-danger', onClick: ()=>this.setVerticalLine()}, '2'),
                        ),
                        e('div', {key: 'col-3', className: 'col-xs-2'},
                            e('div', {className: 'btn btn-danger', onClick: ()=>this.setDiagonalLine()}, '3'),
                        ),
                        e('div', {key: 'col-4', className: 'col-xs-2'},
                            e('div', {className: 'btn btn-danger', onClick: ()=>this.setHorizontalGrad()}, '4'),
                        ),
                        e('div', {key: 'col-5', className: 'col-xs-2'},
                            e('div', {className: 'btn btn-danger', onClick: ()=>this.setRadialGrad()}, '5'),
                        ),
                        e('div', {key: 'col-6', className: 'col-xs-1'}, null),
                    ]),
                    e('br', {key: 'space'}, null),
                    e(GridInput, {
                        key: 'gradient-input',
                        idBase: 'gradient-cell',
                        grid: this.source,
                        updateGridHandler: (v, i, j)=>this.updateData(this.source, v, i, j)
                    }, null),
                    
                ]),
                e('div', {key: 'col-2', className: 'col-xs-6'},
                    e('canvas', {
                        id: 'gradient-canvas',
                        width: 400,
                        height: 400,
                    }, null)
                ),
            ])
        );
    }

}

// Render elements
ReactDOM.render(
    e(GradientDemo, null, null),
    document.getElementById('gradient-root')
);
