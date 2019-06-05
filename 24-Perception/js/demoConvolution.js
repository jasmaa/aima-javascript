// Convolution demo UI

/**
 * Convolution result grid
 */
class ConvolutionResult extends React.Component {

    renderCells(){

        // Perform convolution
        let sourceCopy = new Array2D([...this.props.source.data], this.props.source.width, this.props.source.height);
        convolve(sourceCopy, this.props.filter, 0);

        // Add cells
        let cells = [];
        for(let i=0; i < sourceCopy.width; i++){
            for(let j=0; j < sourceCopy.height; j++){

                let value = sourceCopy.data[4*(sourceCopy.width*i + j) + 0];
                let isTarget = this.props.filterLocation.col == j && this.props.filterLocation.row == i;

                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    value: value,
                    isHighlighted: isTarget,
                }, null));
            }
        }
        
        return cells;
    }

    render(){
        return e('div', {
                className:'square-grid-5'
            },
            this.renderCells()
        );
    }

}

/**
 * Source grid with filter applied
 */
class ConvolutionGrid extends React.Component {

    renderCells(){

        let cells = []
        for(let i=0; i < this.props.source.width; i++){
            for(let j=0; j < this.props.source.height; j++){

                // Highlight cells
                let isWithinFilter =    i >= this.props.filterLocation.row - this.props.filter.centerRow &&
                                        i <= this.props.filterLocation.row + this.props.filter.centerRow &&
                                        j >= this.props.filterLocation.col - this.props.filter.centerCol &&
                                        j <= this.props.filterLocation.col + this.props.filter.centerCol;

                let value = this.props.source.data[4*(this.props.source.width*i + j) + 0];
                if(isWithinFilter){
                    let filterRow = this.props.filter.height - (i - this.props.filterLocation.row + this.props.filter.centerRow) - 1;
                    let filterCol = this.props.filter.width - (j - this.props.filterLocation.col + this.props.filter.centerCol) - 1;
                    value *= this.props.filter.data[this.props.filter.width*filterRow + filterCol];
                }

                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    value: value,
                    isHighlighted: isWithinFilter,
                }, null));
            }
        }

        return cells;
    }

    render(){
        return e('div', {
                className:'square-grid-5'
            },
            this.renderCells()
        );
    }
}

/**
 * Control panel for moving convolution filter
 */
class ConvolutionControl extends React.Component {

    render(){
        return e('div', {
            className:'square-grid-3'
        },[
            e('div', {key: 'cell-0-0'}, null),
            e('div', {key: 'cell-0-1', className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(-1, 0)},
                e('i', {className: 'fas fa-arrow-up'}, null)
            ),
            e('div', {key: 'cell-0-2'}, null),
            e('div', {key: 'cell-1-0', className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(0, -1)},
                e('i', {className: 'fas fa-arrow-left'}, null)
            ),
            e('div', {key: 'cell-1-1', className: 'btn btn-danger', onClick: ()=>this.props.resetHandler()},
                e('i', {className: 'fas fa-undo'}, null)
            ),
            e('div', {key: 'cell-1-2', className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(0, 1)},
                e('i', {className: 'fas fa-arrow-right'}, null)
            ),
            e('div', {key: 'cell-2-0'}, null),
            e('div', {key: 'cell-2-1', className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(1, 0)},
                e('i', {className: 'fas fa-arrow-down'}, null)
            ),
            e('div', {key: 'cell-2-2'}, null),
        ]);
    }
}

/**
 * Filter input grid
 */
class ConvolutionFilterInput extends React.Component {

    renderCells(){
        let cells = [];
        for(let i=0; i < this.props.filter.width; i++){
            for(let j=0; j < this.props.filter.height; j++){

                cells.push(e('input', {
                    key: `cell-${i}-${j}`,
                    className: 'square',
                    id: `convolution-filter-cell-${i}-${j}`,
                    value: this.props.filter.data[this.props.filter.width*i + j],
                    onInput: ()=>this.props.updateFilterHandler(
                        document.getElementById(`convolution-filter-cell-${i}-${j}`).value, i, j
                    ),
                }, null));
            }
        }
        return cells;
    }

    render(){
        return e('div', {className:'square-grid-3'},
            this.renderCells()
        );
    }
}

/**
 * Source input grid
 */
class ConvolutionSourceInput extends React.Component {

    renderCells(){
        let cells = [];
        for(let i=0; i < this.props.source.width; i++){
            for(let j=0; j < this.props.source.height; j++){

                cells.push(e('input', {
                    key: `cell-${i}-${j}`,
                    className: 'square',
                    id: `convolution-source-cell-${i}-${j}`,
                    value: this.props.source.data[4*(this.props.source.width*i + j) + 0],
                    onInput: ()=>this.props.updateSourceHandler(
                        document.getElementById(`convolution-source-cell-${i}-${j}`).value, i, j
                    ),
                }, null));
            }
        }

        return cells;
    }

    render(){

        return e('div', {
            className:'square-grid-5'
        },
            this.renderCells()
        );
    }
}

/**
 * Top-level convolution demo
 */
class ConvolutionDemo extends React.Component {

    constructor(props){
        super(props);
        this.reset();
    }

    /**
     * Move filter
     * @param {integer} r - Rows to move filter
     * @param {integer} c - Columns to move filter
     */
    move(r, c){
        
        this.filterLocation.col += c;
        this.filterLocation.row += r;

        this.setState({
            filter: this.filter,
            filterLocation: this.filterLocation,
            source: this.source,
        });
    }

    /**
     * Reset convolution demo
     */
    reset(){
        this.filter = new Array2D([
            1, 2, 1,
            2, 4, 2,
            1, 2, 1
        ], 3, 3);
        this.filterLocation = {row: 0, col: 0};

        // Generate 5x5 array2d of random values
        let src = Array.from({length: 4*5*5}, ()=>0);
        for(let i=0; i < 5; i++){
            for(let j=0; j < 5; j++){
                let value = Math.floor(Math.random() * 10);
                src[4*(5*i + j) + 0] = value;
                src[4*(5*i + j) + 1] = value;
                src[4*(5*i + j) + 2] = value;
                src[4*(5*i + j) + 3] = 255;
            }
        }

        this.source = new Array2D(src, 5, 5);

        this.setState({
            filter: this.filter,
            filterLocation: this.filterLocation,
            source: this.source,
        });
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

        if(clampedValue >= 10){
            return;
        }
        else if(clampedValue < 0){
            return;
        }

        grid.data[4*(grid.width*row + col) + 0] = clampedValue;

        this.setState({
            filter: this.filter,
            filterLocation: this.filterLocation,
            source: this.source,
        });
    }

    render(){
        
        return e('div', null, [
            e('br', {key: 'space'}, null),
            e('div', {key: 'top-row', className: 'row'}, [
                e('div', {key: 'col-0', className: 'col-md-4'}, [
                    e('h4', {key: 'filter-header', align: 'center'}, "Filter"),
                    e(ConvolutionFilterInput, {
                        key: 'filter-input',
                        filter: this.filter,
                        updateFilterHandler: (v, i, j)=>this.updateData(this.filter, v, i, j)
                    }, null)
                ]),
                e('div', {key: 'col-1', className: 'col-md-4'}, 
                    e(ConvolutionControl, {
                        moveHandler: (r, c)=>this.move(r, c),
                        resetHandler: ()=>this.reset(),
                    }, null)
                ),
                e('div', {key: 'col-2', className: 'col-md-4'}, [
                    e('h4', {key: 'source-header', align: 'center'}, "Source"),
                    e(ConvolutionSourceInput, {
                        key: 'source-input',
                        source: this.source,
                        updateSourceHandler: (v, i, j)=>this.updateData(this.source, v, i, j)
                    }, null)
                ]),
            ]),
            e('div', {key: 'bottom-row', className: 'row'}, [
                e('div', {key: 'col-0', className: 'col-md-6'}, [
                    e('h4', {key: 'applied-header', align: 'center'}, "Applied"),
                    e(ConvolutionGrid, {
                        key: 'applied-output',
                        filter: this.filter,
                        filterLocation: this.filterLocation,
                        source: this.source,
                    }, null)
                ]),
                e('div', {key: 'col-1', className: 'col-md-6'}, [
                    e('h4', {key: 'res-header', align: 'center'}, "Result"),
                    e(ConvolutionResult, {
                        key: 'res-output',
                        filter: this.filter,
                        filterLocation: this.filterLocation,
                        source: this.source,
                    }, null)
                ]),
            ])
        ]);

    }
}

// Render elements
ReactDOM.render(
    e(ConvolutionDemo, null, null),
    document.getElementById('convolution-root')
);
