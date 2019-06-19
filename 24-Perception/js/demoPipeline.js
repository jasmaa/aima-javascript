/**
 * Edge detection pipeline demo
 */

 class PipelineDemo extends React.Component {

    constructor(props){
        super(props);

        this.size = 16;
        this.gridUnit = 0.5;
        this.position = {row: 4, col: 0};

        // color source
        this.colorSource = new Array2D(new Array(this.size*this.size*4), this.size, this.size, 4);
        for(let i=0; i < this.size; i++){
            for(let j=0; j < this.size; j++){

                let value = Math.floor(Math.abs(Math.floor(this.size/2) - i) / Math.floor(this.size/2) * 206);

                this.colorSource.data[4*(this.size*i + j) + 0] = value;
                this.colorSource.data[4*(this.size*i + j) + 1] = value;
                this.colorSource.data[4*(this.size*i + j) + 2] = value;
                this.colorSource.data[4*(this.size*i + j) + 3] = 255;
            }
        }
        

        // Grayscale
        this.source = new Array2D([...this.colorSource.data], this.size, this.size, 4);
        grayscale(this.source);

        // Apply Sobel operator horizontally
        this.sobelXData = new Array2D([...this.source.data], this.size, this.size, 4);
        convolve(this.sobelXData, sobelX);
        
        // Apply Sobel operator vertically
        this.sobelYData = new Array2D([...this.source.data], this.size, this.size, 4);
        convolve(this.sobelYData, sobelY);
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

    render(){

        const xDistUnit = 0.8*this.size*this.gridUnit;
        const yDistUnit = 1.1*this.size*this.gridUnit;
        const center = 15 - (this.size*this.gridUnit) / 2

        return e('div', null, [

            e('div', {className: 'scene-3d'}, [
                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `rotateY(70deg) translateY(${yDistUnit * 0 + center}vmax)`,
                    }
                }, this.renderGrid(this.colorSource)),

                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `rotateY(70deg) translateZ(${xDistUnit * 1}vmax) translateY(${yDistUnit * -1 + center}vmax)`,
                    }
                }, this.renderGrid(this.colorSource, 0)),
                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `rotateY(70deg) translateZ(${xDistUnit * 1}vmax) translateY(${yDistUnit * 0 + center}vmax)`,
                    }
                }, this.renderGrid(this.colorSource, 1)),
                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `rotateY(70deg) translateZ(${xDistUnit * 1}vmax) translateY(${yDistUnit * 1 + center}vmax)`,
                    }
                }, this.renderGrid(this.colorSource, 2)),

                e('div', {
                    className: 'panel-3d',
                    style: {
                        transform: `rotateY(70deg) translateZ(${xDistUnit * 2}vmax) translateY(${yDistUnit * 0 + center}vmax)`,
                    }
                }, this.renderGrid(this.source)),
            ])
        ]);
    }
 }

 // Render elements
ReactDOM.render(
    e(PipelineDemo, null, null),
    document.getElementById('pipeline-root')
);
