/**
 * Edge detection pipeline demo
 */

 class PipelineDemo extends React.Component {

    constructor(props){
        super(props);

        this.size = 16;
        this.gridUnit = 0.5;
        this.position = {row: 4, col: 4};
        this.imageId = 'pipeline';

        let tmp = new Array(this.size*this.size*4).fill(0);

        this.colorSource = new Array2D(tmp, this.size, this.size, 4);
        this.source = new Array2D(tmp, this.size, this.size, 4);
        this.sobelXData = new Array2D(tmp, this.size, this.size, 4);
        this.sobelYData = new Array2D(tmp, this.size, this.size, 4);
        this.grads = new Array2D(tmp, this.size, this.size, 4);
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

        context.drawImage(img, 0, 0, 16, 16);
        let imgData = context.getImageData(0, 0, 16, 16);
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
        });
    }

    /**
     * Renders RGB color cells
     * @param {Array2D} grid 
     * @param {integer} channel - Channel to render. 0,1,2 renders R,G,B. Displays full color otherwise. 
     */
    renderCells(grid, channel=-1){

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
                    value: "",
                    isHighlighted: i == this.position.row && j == this.position.col,
                    highlightTextColor: 'coral',
                    bgColor: `rgb(${r}, ${g}, ${b})`
                }, null));
            }
        }

        return cells;
    }

    /**
     * Renders grid
     * @param {Array2D} grid 
     * @param {integer} channel - Channel to render. 0,1,2 renders R,G,B. Displays full color otherwise. 
     */
    renderGrid(grid, channel=-1){

        return e('div', {
            className:'square-grid-base',
            style: {
                gridTemplateColumns: `repeat(${grid.width}, ${this.gridUnit}vmax)`,
                gridTemplateRows: `repeat(${grid.height}, ${this.gridUnit}vmax)`,
            },
        },
            this.renderCells(grid, channel)
        );
    }

    /**
     * Renders base indicator grid
     */
    renderIndicatorBase(){

        let cells = [];

        for(let i=0; i < this.size; i++){
            for(let j=0; j < this.size; j++){

                if(i == 0){
                    cells.push(e('div', {
                        style: {
                            background: 'red',
                        }
                    }, null));
                }
                else{
                    cells.push(e('div', {
                        style: {
                        }
                    }, null));
                }
            }
        }

        return e('div', {
            className:'square-grid-base',
            style: {
                gridTemplateColumns: `repeat(${this.size}, ${this.gridUnit}vmax)`,
                gridTemplateRows: `repeat(${this.size}, ${this.gridUnit}vmax)`,
            },
        }, cells);
    }

    /**
     * Renders grid indicator
     * @param {String} rotStr - Initial rotation of demo
     * @param {Number} xOffset - Frontal offset of grid
     * @param {Number} yOffset - Vertical offset of grid
     * @param {integer} row - Indicator row
     * @param {integer} col - Indicator column
     */
    renderIndicator(rotStr, xOffset, yOffset, row, col){

        const indicatorLeft = `rotateY(-90deg) translateX(${this.gridUnit * this.size / 2}vmax) translateZ(${this.gridUnit * this.size / 2}vmax)`;
        const indicatorRight = `${indicatorLeft} translateZ(${-this.gridUnit}vmax)`;
        const indicatorTop = `rotateY(-90deg) rotateX(-90deg) translateX(${this.gridUnit * this.size / 2}vmax) translateZ(-${this.gridUnit * this.size / 2}vmax)`;
        const indicatorBottom = `${indicatorTop} translateZ(${this.gridUnit}vmax)`;

        return [
            e('div', {
                className: 'panel-3d',
                style: {
                    transform: `${rotStr} translateZ(${xOffset}vmax) translateY(${yOffset}vmax) ${indicatorLeft} translateY(${this.gridUnit * row}vmax) translateZ(${-this.gridUnit * col}vmax)`,
                }
            }, this.renderIndicatorBase()),
            e('div', {
                className: 'panel-3d',
                style: {
                    transform: `${rotStr} translateZ(${xOffset}vmax) translateY(${yOffset}vmax) ${indicatorRight} translateY(${this.gridUnit * row}vmax) translateZ(${-this.gridUnit * col}vmax)`,
                }
            }, this.renderIndicatorBase()),
            e('div', {
                className: 'panel-3d',
                style: {
                    transform: `${rotStr} translateZ(${xOffset}vmax) translateY(${yOffset}vmax) ${indicatorTop} translateZ(${this.gridUnit * row}vmax) translateY(${this.gridUnit * col}vmax)`,
                }
            }, this.renderIndicatorBase()),
            e('div', {
                className: 'panel-3d',
                style: {
                    transform: `${rotStr} translateZ(${xOffset}vmax) translateY(${yOffset}vmax) ${indicatorBottom} translateZ(${this.gridUnit * row}vmax) translateY(${this.gridUnit * col}vmax)`,
                }
            }, this.renderIndicatorBase()),
        ];
    }

    render(){

        const rotY = 45;
        const rotX = -45;
        const xDistUnit = this.gridUnit * this.size;
        const yDistUnit = 1.1*this.size*this.gridUnit;
        const center = 18 - (this.size*this.gridUnit) / 2

        const rotStr = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

        return e('div', null, [

            e(ImageUploader, {
                imageId: this.imageId,
                defaultImage: 'images/test-16.png',
                processHandler: () => this.process(),
            }, null),

            e('canvas', {
                key: `${this.imageId}-canvas`,
                id: `${this.imageId}-canvas`,
                width: '16',
                height: '16',
                hidden: true,
            }, null),

            e('div', {className: 'scene-3d'}, [
                this.renderIndicator(rotStr, 0*xDistUnit, center, this.position.row, this.position.col),
                this.renderIndicator(rotStr, 1*xDistUnit, center, this.position.row, this.position.col),
                this.renderIndicator(rotStr, 2*xDistUnit, center, this.position.row, this.position.col),
                this.renderIndicator(rotStr, 3*xDistUnit, center, this.position.row, this.position.col),

                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `${rotStr} translateY(${yDistUnit * 0 + center}vmax)`,
                    }
                }, this.renderGrid(this.colorSource)),

                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `${rotStr} translateZ(${xDistUnit * 1}vmax) translateY(${yDistUnit * -1 + center}vmax)`,
                    }
                }, this.renderGrid(this.colorSource, 0)),
                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `${rotStr} translateZ(${xDistUnit * 1}vmax) translateY(${yDistUnit * 0 + center}vmax)`,
                    }
                }, this.renderGrid(this.colorSource, 1)),
                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `${rotStr} translateZ(${xDistUnit * 1}vmax) translateY(${yDistUnit * 1 + center}vmax)`,
                    }
                }, this.renderGrid(this.colorSource, 2)),

                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `${rotStr} translateZ(${xDistUnit * 2}vmax) translateY(${yDistUnit * 0 + center}vmax)`,
                    }
                }, this.renderGrid(this.source)),

                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `${rotStr} translateZ(${xDistUnit * 3}vmax) translateY(${yDistUnit * -1 + center}vmax)`,
                    }
                }, this.renderGrid(this.sobelXData)),
                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `${rotStr} translateZ(${xDistUnit * 3}vmax) translateY(${yDistUnit * 1 + center}vmax)`,
                    }
                }, this.renderGrid(this.sobelYData)),

                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `${rotStr} translateZ(${xDistUnit * 4}vmax) translateY(${yDistUnit * 0 + center}vmax)`,
                    }
                }, this.renderGrid(this.grads)),
            ])
        ]);
    }
 }

 // Render elements
ReactDOM.render(
    e(PipelineDemo, null, null),
    document.getElementById('pipeline-root')
);
