// Non-maximum suppression demo UI

/**
 * Top level non-maximum suppression demo
 */
class SuppressionDemo extends React.Component {

    constructor(props){
        super(props);

        const size = 3;
        this.source = new Array2D(Array.from({length: 4*size*size}, ()=>255), size, size, 4);
        this.highlightMask = new Array2D(Array.from({length: size*size}, ()=>false), size, size, 1);
        this.magGrid = null;
        this.sobelXData = null;
        this.sobelYData = null;
    }

    /**
     * Computes gradient, draws vector field, and highlights neighbors
     */
    process(){

        // Apply Sobel operator horizontally
        this.sobelXData = new Array2D([...this.source.data], this.source.width, this.source.height, 4);
        convolve(this.sobelXData, sobelX);
        
        // Apply Sobel operator vertically
        this.sobelYData = new Array2D([...this.source.data], this.source.width, this.source.height, 4);
        convolve(this.sobelYData, sobelY);

        // Compute mag and angle
        let [magGrid, angleGrid] = computeGradients(this.sobelXData, this.sobelYData);
        this.magGrid = magGrid;
        this.angleGrid = angleGrid;

        // Highlight neighbor cells pointed at by gradient in center
        if(this.magGrid.getValue(1, 1)){
            const angle = this.angleGrid.getValue(1, 1);
            this.highlightMask = new Array2D(
                Array.from({length: this.source.width*this.source.height}, ()=>false),
                this.source.width, this.source.height, 1);

            if(angle >= 0 && angle < Math.PI/8){
                this.highlightMask.setValue(true, 1, 0);
                this.highlightMask.setValue(true, 1, 2);
            }
            else if(angle >= Math.PI/8 && angle < 3*Math.PI/8){
                this.highlightMask.setValue(true, 0, 2);
                this.highlightMask.setValue(true, 2, 0);
            }
            else if(angle >= 3*Math.PI/8 && angle < 5*Math.PI/8){
                this.highlightMask.setValue(true, 0, 1);
                this.highlightMask.setValue(true, 2, 1);
            }
            else if(angle >= 5*Math.PI/8 && angle < 7*Math.PI/8){
                this.highlightMask.setValue(true, 0, 0);
                this.highlightMask.setValue(true, 2, 2);
            }
            else{
                this.highlightMask.setValue(true, 1, 0);
                this.highlightMask.setValue(true, 1, 2);
            }
        }
    }

    /**
     * Updates source when drawing with mouse
     * 
     * @param {integer} row 
     * @param {integer} col 
     */
    drawHandler(row, col){
        let value = this.source.getValue(row, col) - 20;
        value = Math.min(255, value);
        this.source.setValue(value, row, col);

        this.setState({
            grid: this.source,
        });
    }

    /**
     * Clears drawing
     */
    reset(){
        createClear(this.source);
        this.highlightMask = new Array2D(
            Array.from({length: this.source.width*this.source.height}, ()=>false),
            this.source.width, this.source.height, 1);

        this.setState({
            grid: this.source,
        });
    }

    render(){
        this.process();

        return e('div', null, 
            e('div', {className: 'jumbotron'},
                e('div', {className: 'row'},
                    e('div', {className: 'col-xs-6 text-left'},
                        e('div', {className: 'btn btn-danger', onClick: ()=>this.reset()},
                            e('i', {className: 'fas fa-eraser'}, null)
                        ),
                    ),
                ),
                e('div', {className: 'row'},
                    e('div', {className: 'col-xs-12'},
                        e(GradientGrid, {
                            idBase: 'suppression',
                            gridUnit: 8,
                            source: this.source,
                            magGrid: this.magGrid,
                            sobelX: this.sobelXData,
                            sobelY: this.sobelYData,
                            highlightMask: this.highlightMask,
                            drawHandler: (i, j)=>this.drawHandler(i, j),
                        }, null),
                    ),
                ),
            )
        );
    }
}

// Render elements
ReactDOM.render(
    e(SuppressionDemo, null, null),
    document.getElementById('suppression-root')
);
