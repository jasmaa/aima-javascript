// Convolution demo UI

/**
 * Convolution result grid
 */
class ConvolutionResult extends React.Component {

    renderCells(){
        let cells = []
        for(let i=0; i < 5; i++){
            for(let j=0; j < 5; j++){

                let value = 0;
                let isTarget = this.props.filterData.x == j && this.props.filterData.y == i;

               // Perform 2D convolution
                for(let rowOffset=-parseInt(this.props.filterData.h / 2); rowOffset <= parseInt(this.props.filterData.h / 2); rowOffset++){
                    for(let colOffset=-parseInt(this.props.filterData.w / 2); colOffset <= parseInt(this.props.filterData.w / 2); colOffset++){
                        if(i + rowOffset >= 0 && i + rowOffset < 5 && j + colOffset >= 0 && j + colOffset < 5){
                            let filterRow = this.props.filterData.h - (rowOffset + parseInt(this.props.filterData.h / 2)) - 1;
                            let filterCol = this.props.filterData.w - (colOffset + parseInt(this.props.filterData.w / 2)) - 1;
                            value += this.props.source[i+rowOffset][j+colOffset] * this.props.filter[filterRow][filterCol];
                        }
                    }
                }

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
        for(let i=0; i < 5; i++){
            for(let j=0; j < 5; j++){

                // Highlight cells
                let isWithinFilter =    i >= this.props.filterData.y - parseInt(this.props.filterData.h / 2) &&
                                        i <= this.props.filterData.y + parseInt(this.props.filterData.h / 2) &&
                                        j >= this.props.filterData.x - parseInt(this.props.filterData.w / 2) &&
                                        j <= this.props.filterData.x + parseInt(this.props.filterData.w / 2);

                let value = this.props.source[i][j];
                if(isWithinFilter){
                    let filterRow = this.props.filterData.h - (i - this.props.filterData.y + parseInt(this.props.filterData.h / 2)) - 1;
                    let filterCol = this.props.filterData.w - (j - this.props.filterData.x + parseInt(this.props.filterData.w / 2)) - 1;
                    value *= this.props.filter[filterRow][filterCol];
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
            e('div', {key: 'cell-0-1', className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(0, -1)},
                e('i', {className: 'fas fa-arrow-up'}, null)
            ),
            e('div', {key: 'cell-0-2'}, null),
            e('div', {key: 'cell-1-0', className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(-1, 0)},
                e('i', {className: 'fas fa-arrow-left'}, null)
            ),
            e('div', {key: 'cell-1-1', className: 'btn btn-danger', onClick: ()=>this.props.resetHandler()},
                e('i', {className: 'fas fa-undo'}, null)
            ),
            e('div', {key: 'cell-1-2', className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(1, 0)},
                e('i', {className: 'fas fa-arrow-right'}, null)
            ),
            e('div', {key: 'cell-2-0'}, null),
            e('div', {key: 'cell-2-1', className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(0, 1)},
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
        for(let i=0; i < 3; i++){
            for(let j=0; j < 3; j++){

                cells.push(e('input', {
                    key: `cell-${i}-${j}`,
                    className: 'square',
                    id: `convolution-filter-cell-${i}-${j}`,
                    value: this.props.filter[i][j],
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
        for(let i=0; i < 5; i++){
            for(let j=0; j < 5; j++){

                cells.push(e('input', {
                    key: `cell-${i}-${j}`,
                    className: 'square',
                    id: `convolution-source-cell-${i}-${j}`,
                    value: this.props.source[i][j],
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
     * @param {integer} x - Columns to move filter
     * @param {integer} y - Rows to move filter
     */
    move(x, y){
        
        this.filterData.x += x;
        this.filterData.y += y;

        this.setState({
            filter: this.filter,
            filterData: this.filterData,
            source: this.source,
        });
    }

    /**
     * Reset convolution demo
     */
    reset(){
        this.filter = [
            [1, 2, 1],
            [2, 4, 2],
            [1, 2, 1],
        ]
        this.filterData = {x: 0, y: 0, w: 3, h: 3},

        // Generate 5x5 array of random values
        this.source = Array.from({length: 5}, () => Array.from({length: 5}, () => Math.floor(Math.random() * 10)));

        this.setState({
            filter: this.filter,
            filterData: this.filterData,
            source: this.source,
        });
    }

    /**
     * Updates 2d data array with value at (row, col)
     * @param {Array} data 
     * @param {integer} value 
     * @param {integer} row 
     * @param {integer} col 
     */
    updateData(data, value, row, col){
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

        data[row][col] = clampedValue;

        this.setState({
            filter: this.filter,
            filterData: this.filterData,
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
                        moveHandler: (x, y)=>this.move(x, y),
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
                        filterData: this.filterData,
                        source: this.source,
                    }, null)
                ]),
                e('div', {key: 'col-1', className: 'col-md-6'}, [
                    e('h4', {key: 'res-header', align: 'center'}, "Result"),
                    e(ConvolutionResult, {
                        key: 'res-output',
                        filter: this.filter,
                        filterData: this.filterData,
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
