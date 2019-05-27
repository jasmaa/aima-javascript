// UI

const e = React.createElement;

/**
 * Converts greyscale value to rgb string
 * @param {integer} value - Greyscale value to convert
 */
function grey2RGB(value){
    return `rgb(${value}, ${value}, ${value})`
}

/**
 * Grid cell
 */
class Cell extends React.Component {

    render(){
        let bgColor = this.props.isHighlighted ? "red" : "white";
        let textColor = this.props.isHighlighted ? "white" : "black";

        return e('div', {
                className:'square',
                style: {backgroundColor: bgColor}
            },
            e('div', {style: {color: textColor}},
                this.props.value
            )
        );
    }    
}

/**
 * Grid UI for convolution demo
 */
class ConvolutionGrid extends React.Component {

    renderCells(){
        let cells = []
        for(let i=0; i < 5; i++){
            for(let j=0; j < 5; j++){

                // Perform convolution if within filter bounds
                let isWithinFilter = i >= this.props.filterData.y && i < this.props.filterData.y + this.props.filterData.h &&
                                        j >= this.props.filterData.x && j < this.props.filterData.x + this.props.filterData.w;

                let value = this.props.source[i][j];
                if(isWithinFilter){
                    value *= this.props.filter[3 - (i - this.props.filterData.y) - 1][3 - (j - this.props.filterData.x) - 1];
                }

                cells.push(e(Cell, {
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
            e('div', null, null),
            e('div', {className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(0, -1)}, "^"),
            e('div', null, null),
            e('div', {className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(-1, 0)}, "<"),
            e('div', {className: 'btn btn-danger', onClick: ()=>this.props.resetHandler()}, ""),
            e('div', {className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(1, 0)}, ">"),
            e('div', null, null),
            e('div', {className: 'btn btn-primary', onClick: ()=>this.props.moveHandler(0, 1)}, "v"),
            e('div', null, null),
        ]);
    }
}

/**
 * Filter input UI
 */
class ConvolutionFilterInput extends React.Component {

    renderCells(){
        let cells = [];
        for(let i=0; i < 3; i++){
            for(let j=0; j < 3; j++){
                cells.push(e('input', {
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
 * Source input UI
 */
class ConvolutionSourceInput extends React.Component {

    renderCells(){
        let cells = [];
        for(let i=0; i < 5; i++){
            for(let j=0; j < 5; j++){
                cells.push(e('input', {
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
        this.reset()
    }

    /**
     * Move filter
     * @param {integer} x 
     * @param {integer} y 
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
            [3, 4, 5],
            [6, 7, 8],
        ]
        this.filterData = {x: 0, y: 0, w: 3, h: 3},
        this.source = [
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
        ]

        this.setState({
            filter: this.filter,
            filterData: this.filterData,
            source: this.source,
        });
    }

    /**
     * Updates 2d data array with value
     * @param {Array} data 
     * @param {integer} value 
     * @param {integer} row 
     * @param {integer} col 
     */
    updateData(data, value, row, col){
        data[row][col] = +value;

        this.setState({
            filter: this.filter,
            filterData: this.filterData,
            source: this.source,
        });
    }

    render(){
        return e('div', null, [
            e(ConvolutionControl, {
                moveHandler: (x, y)=>this.move(x, y),
                resetHandler: ()=>this.reset(),
            }, null),
            e('br', null, null),
            e('br', null, null),
            e('div', {className: 'row'}, [
                e('div', {className: 'col-md-4'},
                    e(ConvolutionFilterInput, {
                        filter: this.filter,
                        updateFilterHandler: (v, i, j)=>this.updateData(this.filter, v, i, j)
                    }, null)
                ),
                e('div', {className: 'col-md-4'},
                    e(ConvolutionSourceInput, {
                        source: this.source,
                        updateSourceHandler: (v, i, j)=>this.updateData(this.source, v, i, j)
                    }, null)
                ),
                e('div', {className: 'col-md-4'},
                    e(ConvolutionGrid, {
                        filter: this.filter,
                        filterData: this.filterData,
                        source: this.source,
                    }, null)
                ),
            ]),
        ]);
    }
}

// Render elements
ReactDOM.render(
    e(ConvolutionDemo, null, null),
    document.getElementById('convolution-root')
);
