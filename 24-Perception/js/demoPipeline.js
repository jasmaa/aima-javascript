// Edge detection 3D pipeline UI

/**
 * Pipeline demo indicator prism
 */
class PipelineIndicator extends React.Component {

    /**
     * Renders base indicator grid
     */
    renderIndicatorBase(){

        let cells = [];

        for(let i=0; i < this.props.size; i++){
            for(let j=0; j < this.props.size; j++){

                if(i == 0){
                    cells.push(e('div', {
                        style: {
                            background: 'coral',
                            opacity: 0.3,
                        }
                    }, null));
                }
                else{
                    cells.push(e('div', null, null));
                }
            }
        }

        return e('div', {
            className:'square-grid-base',
            style: {
                gridTemplateColumns: `repeat(${this.props.size}, ${this.props.gridUnit}vmax)`,
                gridTemplateRows: `repeat(${this.props.size}, ${this.props.gridUnit}vmax)`,
            },
        }, cells);
    }

    render(){

        const indicatorLeft = `rotateY(-90deg) translateX(${this.props.gridUnit * this.props.size / 2}vmax)
                                translateZ(${this.props.gridUnit * this.props.size / 2}vmax)`;
        const indicatorRight = `${indicatorLeft} translateZ(${-this.props.gridUnit}vmax)`;
        const indicatorTop = `rotateY(-90deg) rotateX(-90deg) translateX(${this.props.gridUnit * this.props.size / 2}vmax)
                                translateZ(-${this.props.gridUnit * this.props.size / 2}vmax)`;
        const indicatorBottom = `${indicatorTop} translateZ(${this.props.gridUnit}vmax)`;
        const offsetStr = `translateZ(${this.props.xOffset}vmax) translateY(${this.props.yOffset}vmax)`;

        return [
            e('div', {
                key: 'indicator-left',
                className: 'panel-3d',
                style: {
                    transform: `${this.props.rotStr} ${offsetStr} ${indicatorLeft}
                                translateY(${this.props.gridUnit * this.props.position.row}vmax)
                                translateZ(${-this.props.gridUnit * this.props.position.col}vmax)`,
                }
            }, this.renderIndicatorBase()),
            e('div', {
                key: 'indicator-right',
                className: 'panel-3d',
                style: {
                    transform: `${this.props.rotStr} ${offsetStr} ${indicatorRight}
                                translateY(${this.props.gridUnit * this.props.position.row}vmax) 
                                translateZ(${-this.props.gridUnit * this.props.position.col}vmax)`,
                }
            }, this.renderIndicatorBase()),
            e('div', {
                key: 'indicator-top',
                className: 'panel-3d',
                style: {
                    transform: `${this.props.rotStr} ${offsetStr} ${indicatorTop}
                                translateZ(${this.props.gridUnit * this.props.position.row}vmax)
                                translateY(${this.props.gridUnit * this.props.position.col}vmax)`,
                }
            }, this.renderIndicatorBase()),
            e('div', {
                key: 'indicator-bottom',
                className: 'panel-3d',
                style: {
                    transform: `${this.props.rotStr} ${offsetStr} ${indicatorBottom}
                                translateZ(${this.props.gridUnit * this.props.position.row}vmax)
                                translateY(${this.props.gridUnit * this.props.position.col}vmax)`,
                }
            }, this.renderIndicatorBase()),
        ];
    }
}

/**
 * Pipeline demo grid
 */
class PipelineGrid extends React.Component {

    /**
     * Renders grid
     * @param {Array2D} grid 
     * @param {integer} channel - Channel to render. 0,1,2 renders R,G,B. Displays full color otherwise. 
     */
    renderGrid(grid, channel=-1){

        let cells = [];

        for(let i=0; i < grid.height; i++){
            for(let j=0; j < grid.width; j++){

                let r = grid.data[grid.channels*(grid.width*i + j) + 0];
                let g = grid.data[grid.channels*(grid.width*i + j) + 1];
                let b = grid.data[grid.channels*(grid.width*i + j) + 2];

                if(channel == 0){
                    g = 0;
                    b = 0;
                }
                else if(channel == 1){
                    r = 0;
                    b = 0;
                }
                else if(channel == 2){
                    r = 0;
                    g = 0;
                }

                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    isHighlighted: i == this.props.position.row && j == this.props.position.col,
                    highlightTextColor: 'coral',
                    highlightColor: 'magenta',
                    bgColor: `rgb(${r}, ${g}, ${b})`,
                    handleMouseOver: this.props.handleMouseOver ? ()=>this.props.handleMouseOver(i, j) : null,
                }, null));
            }
        }

        return e('div', {
            className:'square-grid-base',
            style: {
                gridTemplateColumns: `repeat(${grid.width}, ${this.props.gridUnit}vmax)`,
                gridTemplateRows: `repeat(${grid.height}, ${this.props.gridUnit}vmax)`,
            },
        }, cells);
    }

    /**
     * Renders highlighted filter at indicator location
     * 
     * @param {Array2D} grid - Grid filter is being applied to
     * @param {Array2D} filter - Highlighted filter
     */
    renderFilter(grid, filter){

        let cells = [];

        for(let i=0; i < grid.height; i++){
            for(let j=0; j < grid.width; j++){

                let isWithinFilter =    i >= this.props.position.row - filter.centerRow &&
                                        i <= this.props.position.row + filter.centerRow &&
                                        j >= this.props.position.col - filter.centerCol &&
                                        j <= this.props.position.col + filter.centerCol;

                if(isWithinFilter){
                    cells.push(e(Cell, {
                        key: `cell-${i}-${j}`,
                        bgColor: 'blue'
                    }, null));
                }
                else{
                    cells.push(e('div', {
                        key: `cell-${i}-${j}`,
                    }, null));
                }
            }
        }

        return e('div', {
            className:'square-grid-base',
            style: {
                gridTemplateColumns: `repeat(${grid.width}, ${this.props.gridUnit}vmax)`,
                gridTemplateRows: `repeat(${grid.height}, ${this.props.gridUnit}vmax)`,
            },
        }, cells);
    }

    render(){
        let gridBase;
        if(this.props.renderType == 0){
            gridBase = this.renderGrid(this.props.grid, this.props.channel);
        }
        else if(this.props.renderType == 1){
            gridBase = this.renderFilter(this.props.grid, this.props.filter);
        }

        return gridBase;
    }
}

/**
 * Pipline demo 3D grid
 */
class PipelineGrid3D extends React.Component {
    render(){
        return e('div', {
            className: 'panel-3d',
            style: {
                transform: `${this.props.rotStr} translateZ(${this.props.xOffset}vmax) translateY(${this.props.yOffset}vmax)`,
            }
        },
            e(PipelineGrid, {renderType: this.props.renderType, grid: this.props.grid, filter: this.props.filter,
                channel: this.props.channel, gridUnit: this.props.gridUnit, position: this.props.position}, null),
        );
    }
}

/**
 * Pipeline demo 3D label
 */
class PipelineLabel extends React.Component {
    render(){

        const panel = e('div', {style: {
            width: `${this.props.size * this.props.gridUnit}vmax`,
            height: `${this.props.size * this.props.gridUnit}vmax`,
        }}, this.props.content);

        return e('div', {
            className: 'panel-3d',
            style: {
                transform: `${this.props.rotStr} translateZ(${this.props.xOffset}vmax)
                            translateY(${this.props.yOffset}vmax) translateX(${this.props.size * this.props.gridUnit + 1}vmax)`,
            }
        }, panel);
    }
}

/**
 * Top-level edge detection pipeline demo
 */
 class PipelineDemo extends React.Component {

    constructor(props){
        super(props);

        this.size = 16;                     // Image resolution
        this.gridUnit = 0.5;                // Grid width and height
        this.position = {row: 4, col: 4};   // Indicator position
        this.imageId = 'pipeline';          // Image upload id

        // Init and fill data so rendering works on start-up
        let tmp = new Array(this.size*this.size*4).fill(0);
        this.filter = sobelX;
        this.colorSource = new Array2D(tmp, this.size, this.size, 4);
        this.source = new Array2D(tmp, this.size, this.size, 4);
        this.sobelXData = new Array2D(tmp, this.size, this.size, 4);
        this.sobelYData = new Array2D(tmp, this.size, this.size, 4);
        this.grads = new Array2D(tmp, this.size, this.size, 4);
    }

    /**
     * Move indicator
     * @param {integer} r - rows to move 
     * @param {integer} c - columns to move
     */
    moveIndicator(r, c){

        // Keep movement within grid
        if(this.position.row + r >= this.size || this.position.row + r < 0 ||
            this.position.col + c >= this.size || this.position.col + c < 0){
                return;
            }

        this.position.row += r;
        this.position.col += c;

        //Re-render
        this.setState({
            colorSource: this.colorSource,
            position: this.position,
        });
    }

    /**
     * Reset indicator position
     */
    resetIndicator(){

        this.position.row = 0;
        this.position.col = 0;

        //Re-render
        this.setState({
            colorSource: this.colorSource,
            position: this.position,
        });
    }

    /**
     * Processes image upload and updates demo
     */
    process(){

        this.canvas = document.getElementById(`${this.imageId}-canvas`);
        const context = this.canvas.getContext('2d');
        const img = document.getElementById(`${this.imageId}-img`);

        // Clear canvas
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        context.drawImage(img, 0, 0, this.size, this.size);
        let imgData = context.getImageData(0, 0, this.size, this.size);
        this.colorSource = new Array2D([...imgData.data], this.size, this.size, 4);

        // Grayscale
        this.source = new Array2D([...this.colorSource.data], this.size, this.size, 4);
        grayscale(this.source);

        // Apply Sobel operator horizontally
        this.sobelXData = new Array2D([...this.source.data], this.size, this.size, 4);
        convolve(this.sobelXData, sobelX);
        
        // Apply Sobel operator vertically
        this.sobelYData = new Array2D([...this.source.data], this.size, this.size, 4);
        convolve(this.sobelYData, sobelY);

        // Calculate magnitude of gradients
        this.grads = new Array2D(new Array(this.size*this.size*4), this.size, this.size, 4);
        for(let i=0; i < this.size; i++){
            for(let j=0; j < this.size; j++){
                let value = Math.sqrt(
                                Math.pow(this.sobelXData.data[4*(this.size*i + j) + 0], 2) +
                                Math.pow(this.sobelYData.data[4*(this.size*i + j) + 0], 2));
                
                this.grads.data[4*(this.size*i + j) + 0] = value;
                this.grads.data[4*(this.size*i + j) + 1] = value;
                this.grads.data[4*(this.size*i + j) + 2] = value;
            }
        }

        // Stretch color for display
        stretchColor(this.grads);

        //Re-render
        this.setState({
            colorSource: this.colorSource,
            position: this.position,
        });
    }

    /**
     * Updates position when cell is moused over
     * @param {integer} row 
     * @param {integer} col 
     */
    handleMouseOver(row, col){
        this.position.row = row;
        this.position.col = col;

        //Re-render
        this.setState({
            colorSource: this.colorSource,
            position: this.position,
        });
    }

    render(){

        const rotStr = `rotateX(-45deg) rotateY(45deg)`;    // Rotation to display grids isometrically
        const xDistUnit = this.gridUnit * this.size;        // Frontal unit distance of grids
        const center = 18 - (this.size*this.gridUnit) / 2;  // Distance to center of container
        const xStart = -5;                                  // Starting x offset

        const scene = e('div', {className: 'scene-3d'},
            // === Indicator prisms ===
            e(PipelineIndicator, {gridUnit: this.gridUnit, size: this.size, rotStr: rotStr,
                xOffset: xStart+0*xDistUnit, yOffset: center, position: this.position}, null),
            e(PipelineIndicator, {gridUnit: this.gridUnit, size: this.size, rotStr: rotStr,
                xOffset: xStart+1*xDistUnit, yOffset: center, position: this.position}, null),
            e(PipelineIndicator, {gridUnit: this.gridUnit, size: this.size, rotStr: rotStr,
                xOffset: xStart+2*xDistUnit, yOffset: center, position: this.position}, null),
            e(PipelineIndicator, {gridUnit: this.gridUnit, size: this.size, rotStr: rotStr,
                xOffset: xStart+3*xDistUnit, yOffset: center, position: this.position}, null),

            // === Grids ===
            // Color
            e(PipelineGrid3D, {renderType: 0, grid: this.colorSource, channel: -1, gridUnit: this.gridUnit,
                rotStr: rotStr, xOffset: xStart, yOffset: center, position: this.position}, null),
            // RGB
            e(PipelineGrid3D, {renderType: 0, grid: this.colorSource, channel: 0, gridUnit: this.gridUnit,
                rotStr: rotStr, xOffset: xStart+1*xDistUnit + 0, yOffset: center, position: this.position}, null),
            e(PipelineGrid3D, {renderType: 0, grid: this.colorSource, channel: 1, gridUnit: this.gridUnit,
                rotStr: rotStr, xOffset: xStart+1*xDistUnit + 1, yOffset: center, position: this.position,
            }, null),
            e(PipelineGrid3D, {renderType: 0, grid: this.colorSource, channel: 2, gridUnit: this.gridUnit,
                rotStr: rotStr, xOffset: xStart+1*xDistUnit + 2, yOffset: center, position: this.position}, null),
            // Filter applied
            e(PipelineGrid3D, {renderType: 0, grid: this.source, channel: -1, gridUnit: this.gridUnit,
                rotStr: rotStr, xOffset: xStart+2*xDistUnit, yOffset: center, position: this.position}, null),
            e(PipelineGrid3D, {renderType: 1, grid: this.source, filter: this.filter, gridUnit: this.gridUnit,
                rotStr: rotStr, xOffset: xStart+2*xDistUnit, yOffset: center, position: this.position}, null),
            // Sobel
            e(PipelineGrid3D, {renderType: 0, grid: this.sobelXData, channel: -1, gridUnit: this.gridUnit,
                rotStr: rotStr, xOffset: xStart+3*xDistUnit, yOffset: center, position: this.position}, null),
            e(PipelineGrid3D, {renderType: 0, grid: this.sobelYData, channel: -1, gridUnit: this.gridUnit,
                rotStr: rotStr, xOffset: xStart+3*xDistUnit + 1, yOffset: center, position: this.position}, null),
            // Gradient
            e(PipelineGrid3D, {renderType: 0, grid: this.grads, channel: -1, gridUnit: this.gridUnit,
                rotStr: rotStr, xOffset: xStart+4*xDistUnit, yOffset: center, position: this.position}, null),

            // === Labels ===
            e(PipelineLabel, {gridUnit: this.gridUnit, size: this.size, rotStr: rotStr,
                xOffset: xStart+0*xDistUnit, yOffset: center,
                content: e('strong', null, 'Color'),
            }, null),
            e(PipelineLabel, {gridUnit: this.gridUnit, size: this.size, rotStr: rotStr,
                xOffset: xStart+1*xDistUnit, yOffset: center,
                content: e('strong', null, 'RGB'),
            }, null),
            e(PipelineLabel, {gridUnit: this.gridUnit, size: this.size, rotStr: rotStr,
                xOffset: xStart+2*xDistUnit, yOffset: center,

                content: e('strong', null, 'Filter Application on Grayscale'),
            }, null),
            e(PipelineLabel, {gridUnit: this.gridUnit, size: this.size, rotStr: rotStr,
                xOffset: xStart+3*xDistUnit, yOffset: center,
                content: e('strong', null, 'Sobel X and Y'),
            }, null),
            e(PipelineLabel, {gridUnit: this.gridUnit, size: this.size, rotStr: rotStr,
                xOffset: xStart+4*xDistUnit, yOffset: center,
                content: e('strong', null, 'Gradients'),
            }, null),
        );

        return e('div', null,

            e('canvas', {
                id: `${this.imageId}-canvas`,
                width: this.size,
                height: this.size,
                hidden: true,
            }, null),

            e('div', {className: 'row'},
                e('div', {className: 'col-xs-12'},
                    e(ImageUploader, {
                        imageId: this.imageId,
                        defaultImage: 'images/test-16.png',
                        processHandler: () => this.process(),
                    }, null)
                )
            ),
            
            e('br', null, null),
            e('div', {className: 'row'},

                e('div', {className: 'col-xs-9'},
                    e('div', {className: 'jumbotron col-xs-12'},
                        scene
                    )
                ),

                e('div', {className: 'col-xs-3'},
                    e('div', {className: 'jumbotron col-xs-12'},
                        e(PositionControl, {
                            moveHandler: (r, c)=>this.moveIndicator(r, c),
                            resetHandler: ()=>this.resetIndicator(),
                        }, null),
                        e('br', null, null),
                        e(PipelineGrid, {renderType: 0, grid: this.colorSource, channel: -1,
                            gridUnit: this.gridUnit, position: this.position,
                            handleMouseOver: (r, c)=>this.handleMouseOver(r, c),
                        }, null),
                    )
                ),
            ),
        );
    }
 }

 // Render elements
ReactDOM.render(
    e(PipelineDemo, null, null),
    document.getElementById('pipeline-root')
);
