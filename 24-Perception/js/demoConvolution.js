// Convolution demo UI

/**
 * Convolution result grid
 */
class ConvolutionResult extends React.Component {

    renderCells(){

        // Perform convolution
        let sourceCopy = new Array2D([...this.props.source.data], this.props.source.width, this.props.source.height, 4);
        convolve(sourceCopy, this.props.filter, 0);

        // Add cells
        let cells = [];
        for(let i=0; i < sourceCopy.height; i++){
            for(let j=0; j < sourceCopy.width; j++){

                let value = sourceCopy.data[4*(sourceCopy.width*i + j) + 0];
                let isTarget = this.props.filterLocation.col == j && this.props.filterLocation.row == i;

                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    value: value,
                    isHighlighted: isTarget,
                    bgColor: 'white',
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
        for(let i=0; i < this.props.source.height; i++){
            for(let j=0; j < this.props.source.width; j++){

                // Highlight cells
                let isWithinFilter =    i >= this.props.filterLocation.row - this.props.filter.centerRow &&
                                        i <= this.props.filterLocation.row + this.props.filter.centerRow &&
                                        j >= this.props.filterLocation.col - this.props.filter.centerCol &&
                                        j <= this.props.filterLocation.col + this.props.filter.centerCol;

                let value = this.props.source.data[4*(this.props.source.width*i + j) + 0];
                let filterRow = this.props.filter.height - (i - this.props.filterLocation.row + this.props.filter.centerRow) - 1;
                let filterCol = this.props.filter.width - (j - this.props.filterLocation.col + this.props.filter.centerCol) - 1;
                if(isWithinFilter){
                    value *= this.props.filter.data[this.props.filter.width*filterRow + filterCol];
                }

                cells.push(e(Cell, {
                    key: `cell-${i}-${j}`,
                    value: value,
                    isHighlighted: isWithinFilter,
                    highlightColor: this.props.filterColor.data[this.props.filterColor.width*filterRow + filterCol],
                    bgColor: 'white',
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
 * Displays weighted sum operation
 */
class ConvolutionMathDisplay extends React.Component {

    renderNumList(){
        let nums = []

        let res = 0;
        for(let i=0; i < this.props.source.height; i++){
            for(let j=0; j < this.props.source.width; j++){

                // Highlight cells
                let isWithinFilter =    i >= this.props.filterLocation.row - this.props.filter.centerRow &&
                                        i <= this.props.filterLocation.row + this.props.filter.centerRow &&
                                        j >= this.props.filterLocation.col - this.props.filter.centerCol &&
                                        j <= this.props.filterLocation.col + this.props.filter.centerCol;

                let value = this.props.source.data[4*(this.props.source.width*i + j) + 0];
                if(isWithinFilter){
                    let filterRow = this.props.filter.height - (i - this.props.filterLocation.row + this.props.filter.centerRow) - 1;
                    let filterCol = this.props.filter.width - (j - this.props.filterLocation.col + this.props.filter.centerCol) - 1;
                    let weight = this.props.filter.data[this.props.filter.width*filterRow + filterCol];
                    res += value * weight;

                    nums.push(e(DisplayNumber, {
                        key: `num-${i}-${j}-weight`,
                        value: weight,
                        highlightColor: this.props.filterColor.data[this.props.filterColor.width*filterRow + filterCol],
                    }, null));
                    nums.push(e(DisplayNumber, {
                        key: `num-${i}-${j}-mult`,
                        value: '×',
                        highlightColor: 'black',
                    }, null));
                    nums.push(e(DisplayNumber, {
                        key: `num-${i}-${j}-value`,
                        value: value,
                        highlightColor: 'black',
                    }, null));
                    nums.push(e(DisplayNumber, {
                        key: `num-${i}-${j}-plus`,
                        value: ' + ',
                        highlightColor: 'black',
                    }, null));
                }
            }
        }

        nums.pop();
        nums.push(e(DisplayNumber, {
            key: 'equals',
            value: ' = ',
            highlightColor: 'black',
        }, null));
        nums.push(e(DisplayNumber, {
            key: 'res',
            value: res,
            highlightColor: 'red',
        }, null));
        return nums;
    }

    render(){
        return e('p', {
            style: {
                margin: '3vmax 0vmax 3vmax 0vmax',
            },
            align: 'center',
        }, this.renderNumList());
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
        
        if(this.filterLocation.col + c >= this.source.width || this.filterLocation.col + c < 0 ||
            this.filterLocation.row + r >= this.source.height || this.filterLocation.row + r < 0){
                return;
        }

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

        this.filterColor = new Array2D([
            'orange', 'darkGrey', 'darkGrey',
            'darkGrey', 'darkGrey', 'darkGrey',
            'darkGrey', 'darkGrey', 'lightBlue',
        ], 3, 3);

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

        this.source = new Array2D(src, 5, 5, 4);

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

        grid.data[grid.channels*(grid.width*row + col) + 0] = clampedValue;

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
                e('div', {key: 'col-0', className: 'col-xs-4'}, [
                    e('h4', {key: 'filter-header', align: 'center'}, "Filter"),
                    e(GridInput, {
                        key: 'filter-input',
                        idBase: 'convolution-filter-cell',
                        grid: this.filter,
                        gridColor: this.filterColor,
                        updateGridHandler: (v, i, j)=>this.updateData(this.filter, v, i, j)
                    }, null)
                ]),
                e('div', {key: 'col-1', className: 'col-xs-4'}, 
                    e(PositionControl, {
                        moveHandler: (r, c)=>this.move(r, c),
                        resetHandler: ()=>this.reset(),
                    }, null)
                ),
                e('div', {key: 'col-2', className: 'col-xs-4'}, [
                    e('h4', {key: 'source-header', align: 'center'}, "Source"),
                    e(GridInput, {
                        key: 'source-input',
                        idBase: 'convolution-source-cell',
                        grid: this.source,
                        updateGridHandler: (v, i, j)=>this.updateData(this.source, v, i, j)
                    }, null)
                ]),
            ]),
            e('div', {key: 'bottom-row', className: 'row'}, [
                e('div', {key: 'col-0', className: 'col-xs-4'}, [
                    e('h4', {key: 'applied-header', align: 'center'}, "Applied"),
                    e(ConvolutionGrid, {
                        key: 'applied-output',
                        filter: this.filter,
                        filterColor: this.filterColor,
                        filterLocation: this.filterLocation,
                        source: this.source,
                    }, null)
                ]),
                e('div', {key: 'col-1', className: 'col-xs-4'}, 
                    e(ConvolutionMathDisplay, {
                        key: 'math-display',
                        filter: this.filter,
                        filterColor: this.filterColor,
                        filterLocation: this.filterLocation,
                        source: this.source,
                    }, null)
                ),
                e('div', {key: 'col-2', className: 'col-xs-4'}, [
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
