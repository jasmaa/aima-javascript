
/**
 * Top level non-maximum suppression demo
 */
class SuppressionDemo extends React.Component {

    constructor(props){
        super(props);

        const size = 3;
        let src = Array.from({length: 4*size*size}, ()=>0);
        this.source = new Array2D(src, 3, 3, 4);

        $(document).ready(()=>this.process());

        this.canvas = null;
        $(window).resize(()=>this.resize());
    }

    /**
     * Draw suppression demo
     */
    process(){
        this.canvas = document.getElementById('suppression-canvas');
        const context = this.canvas.getContext('2d');

        const unit = Math.floor(this.canvas.width / this.source.height);
        const halfUnit = Math.floor(unit / 2);

        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.lineWidth = 1;

        // Apply Sobel operator horizontally
        let sobelXData = new Array2D([...this.source.data], this.source.width, this.source.height, 4);
        convolve(sobelXData, sobelX);
        
        // Apply Sobel operator vertically
        let sobelYData = new Array2D([...this.source.data], this.source.width, this.source.height, 4);
        convolve(sobelYData, sobelY);

        // Calculate center cell
        const mag = Math.sqrt(
            Math.pow(sobelXData.data[4*(this.source.width + 1) + 0], 2) +
            Math.pow(sobelYData.data[4*(this.source.width + 1) + 0], 2)
        );
        let angle = Math.atan2(sobelYData.data[4*(this.source.width + 1) + 0], sobelXData.data[4*(this.source.width + 1) + 0]);

        // Draw cells
        context.strokeStyle = 'blue';
        for(let i=0; i < this.source.height; i++){
            for(let j=0; j < this.source.width; j++){
                context.fillStyle = gray2RGB(this.source.data[4*(this.source.width*i + j) + 0]);
                context.fillRect(unit*j, unit*i, unit, unit);
                context.strokeRect(unit*j, unit*i, unit, unit);
            }
        }

        // Fix angle between 0 and PI
        if(angle < 0){
            angle += 2*Math.PI
        }
        if(angle > Math.PI){
            angle -= Math.PI;
        }

        // Draw highlighted pixels
        context.lineWidth = 3;
        context.strokeStyle = 'red';
        if(mag > 0){
            if(angle >= 0 && angle < Math.PI/8){
                context.strokeRect(unit*0, unit*1, unit, unit);
                context.strokeRect(unit*2, unit*1, unit, unit);
            }
            else if(angle >= Math.PI/8 && angle < 3*Math.PI/8){
                context.strokeRect(unit*0, unit*2, unit, unit);
                context.strokeRect(unit*2, unit*0, unit, unit);
            }
            else if(angle >= 3*Math.PI/8 && angle < 5*Math.PI/8){
                context.strokeRect(unit*1, unit*0, unit, unit);
                context.strokeRect(unit*1, unit*2, unit, unit);
            }
            else if(angle >= 5*Math.PI/8 && angle < 7*Math.PI/8){
                context.strokeRect(unit*0, unit*0, unit, unit);
                context.strokeRect(unit*2, unit*2, unit, unit);
            }
            else{
                context.strokeRect(unit*0, unit*1, unit, unit);
                context.strokeRect(unit*2, unit*1, unit, unit);
            }
        }

        // Draw gradient
        context.beginPath();
        context.strokeStyle = 'red';
        context.moveTo(
            unit + halfUnit,
            unit + halfUnit,
        )
        context.lineTo(
            unit + halfUnit + 3*unit*(sobelXData.data[4*(this.source.width + 1) + 0] / mag),
            unit + halfUnit - 3*unit*(sobelYData.data[4*(this.source.width + 1) + 0] / mag),
        );
        context.lineTo(
            unit + halfUnit - 3*unit*(sobelXData.data[4*(this.source.width + 1) + 0] / mag),
            unit + halfUnit + 3*unit*(sobelYData.data[4*(this.source.width + 1) + 0] / mag),
        );
        context.stroke();
        context.closePath();
    }

    /**
     * Canvas resize handler
     */
    resize(){
        this.canvas.style.width = (innerWidth / 4)+'px';
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
                e('div', {key: 'col-1', className: 'col-xs-6'},
                    e(GridInput, {
                        key: 'suppression-input',
                        idBase: 'suppression-cell',
                        grid: this.source,
                        updateGridHandler: (v, i, j)=>this.updateData(this.source, v, i, j)
                    }, null)
                ),
                e('div', {key: 'col-2', className: 'col-xs-6'},
                    e('canvas', {
                        id: 'suppression-canvas',
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
    e(SuppressionDemo, null, null),
    document.getElementById('suppression-root')
);
