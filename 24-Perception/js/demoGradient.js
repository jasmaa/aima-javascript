// Gradient detection demo

/**
 * Cell with gradient arrow
 */
class GradientCell extends React.Component {

    componentDidMount(){
        this.canvas = document.getElementById(`${this.props.idBase}-canvas`);
        this.updateCanvas();
    }

    /**
     * Updates canvas with magnitude arrow
     */
    updateCanvas(){
        if(this.canvas){
            const context = this.canvas.getContext('2d');
            context.clearRect(0, 0, 40, 40);
            
            context.strokeStyle = this.props.color;
            context.beginPath();
            canvas_arrow(context, 20, 20, 10*this.props.dx + 20, -10*this.props.dy + 20);
            context.stroke();
        }
    }

    render(){        

        if(this.props.isShowGrad){
            this.updateCanvas();
        }

        return e('div', {
            className: 'square',
            style: {
                backgroundColor: gray2RGB(this.props.value),
                border: 'none',
            },
            onMouseOver: ()=>{
                if(!isMouseDown){
                    return;
                }
                this.props.drawHandler()
            },
            onClick: ()=>this.props.drawHandler(),
        },
            e('canvas', {
                id: `${this.props.idBase}-canvas`,
                width: '40px',
                height: '40px',
            }, null),
        );
    }
}

/**
 * Gradient grid container
 */
class GradientGrid extends React.Component {

    renderCells(){

        let minMag = Math.min(...this.props.magGrid.data);
        let maxMag = Math.max(...this.props.magGrid.data);

        let cells = [];
        for(let i=0; i < this.props.magGrid.height; i++){
            for(let j=0; j < this.props.magGrid.width; j++){

                // Hide gradient on border
                const isShowGrad = i > 0 && j > 0 && i < this.props.source.height-1 && j < this.props.source.width-1;

                cells.push(e(GradientCell, {
                    key: `gradient-cell-${i}-${j}`,
                    idBase: `gradient-cell-${i}-${j}`,
                    value: this.props.source.getValue(i, j),
                    color: wavelengthToColor((this.props.magGrid.getValue(i, j) - minMag) / (maxMag - minMag) * 250 + 450)[0],
                    dx: this.props.sobelX.getValue(i, j) / this.props.magGrid.getValue(i, j),
                    dy: this.props.sobelY.getValue(i, j) / this.props.magGrid.getValue(i, j),
                    isShowGrad: isShowGrad,
                    drawHandler: ()=>this.props.drawHandler(i, j),
                }, null));
            }
        }
        return cells;
    }

    render(){
        return e('div', {
            className: 'square-grid-base',
            style: {
                gridTemplateColumns: `repeat(${this.props.magGrid.width}, ${this.props.gridUnit}vmax)`,
                gridTemplateRows: `repeat(${this.props.magGrid.height}, ${this.props.gridUnit}vmax)`,
            }
        },
            this.renderCells(),
        )
    }
}

/**
 * Top level gradient demo
 */
class GradientDemo extends React.Component {

    constructor(props){
        super(props);

        // Generate source array2d
        const size = 20;

        this.source = new Array2D(Array.from({length: 4*size*size}, ()=>255), size, size, 4);
        this.process();
    }

    componentDidMount(){
        // Set starter image
        const img = new Image(20, 20);
        img.onload = ()=>{
            const canvas = document.getElementById('gradient-starter-canvas');
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0, 20, 20);
            const imgData = context.getImageData(0, 0, 20, 20);
            this.source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);

            this.setState({
                grid: this.source,
            });
        };
        img.src = "./images/starter.png";
    }

    /**
     * Computes gradient and draws vector field
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
    }

    /**
     * Updates source when drawing with mouse
     * 
     * @param {integer} row 
     * @param {integer} col 
     */
    drawHandler(row, col){
        for(let i=-2; i <= 2; i++){
            for(let j=-2; j <= 2; j++){
                // Stamp circle on drawing
                if(row+i >= 0 && row+i < this.source.height && col+j >= 0 && col+j < this.source.width){
                    let value = Math.min(100*mag2d(i, j), this.source.getValue(row+i, col+j));
                    this.source.setValue(value, row+i, col+j);
                }
            }
        }

        this.setState({
            grid: this.source,
        });
    }

    /**
     * Clears drawing
     */
    reset(){
        const size = 20;
        createClear(this.source);

        this.setState({
            grid: this.source,
        });
    }

    render(){
        this.process();

        return e('div', null,
            e('canvas', {
                id: 'gradient-starter-canvas',
                width: '20',
                height: '20',
                hidden: true,
            }, null),
            e('div', {className: 'jumbotron'},
                e('div', {className: 'row'},
                    e('div', {className: 'col-xs-6 text-left'},
                        e('div', {className: 'btn btn-danger', onClick: ()=>this.reset()},
                            e('i', {className: 'fas fa-eraser'}, null)
                        ),
                    ),
                    e('div', {className: 'col-xs-6 text-right'},
                        e('div', {
                            className: 'btn-group mr-2',
                            role: 'group',
                        },
                            e('div', {className: 'btn btn-info', onClick: ()=>{
                                createVerticalLine(this.source);
                                this.setState({
                                    grid: this.source,
                                });
                            }}, '1'),
                            e('div', {className: 'btn btn-info', onClick: ()=>{
                                createHorizontalLine(this.source);
                                this.setState({
                                    grid: this.source,
                                });
                            }}, '2'),
                            e('div', {className: 'btn btn-info', onClick: ()=>{
                                createRadialGradient(this.source);
                                this.setState({
                                    grid: this.source,
                                });
                            }}, '3'),
                            e('div', {className: 'btn btn-info', onClick: ()=>{
                                createDiagonalLine(this.source);
                                this.setState({
                                    grid: this.source,
                                });
                            }}, '4'),
                            e('div', {className: 'btn btn-info', onClick: ()=>{
                                createLineGradient(this.source);
                                this.setState({
                                    grid: this.source,
                                });
                            }}, '5'),
                        ),
                    ),
                ),
                e('br', null, null),
                e('div', {className: 'row'},
                    e('div', {className: 'col-xs-12'},
                        e(GradientGrid, {
                            gridUnit: 1.8,
                            source: this.source,
                            magGrid: this.magGrid,
                            sobelX: this.sobelXData,
                            sobelY: this.sobelYData,
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
    e(GradientDemo, null, null),
    document.getElementById('gradient-root')
);
