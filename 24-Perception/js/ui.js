// Common UI elements

const e = React.createElement; // Create element shortcut

/**
 * Grid cell
 */
class Cell extends React.Component {

    render(){
        let bgColor = this.props.isHighlighted ? "red" : "white";
        let textColor = this.props.isHighlighted ? "white" : "black";

        return e('div', {
                className:'square',
                style: {
                    backgroundColor: bgColor,
                }
            },
            e('div', {style: {color: textColor}},
                this.props.value
            )
        );
    }    
}

/**
 * Grid input grid
 */
class GridInput extends React.Component {

    renderCells(){
        let cells = [];

        for(let i=0; i < this.props.grid.height; i++){
            for(let j=0; j < this.props.grid.width; j++){

                cells.push(e('input', {
                    key: `cell-${i}-${j}`,
                    className: 'square',
                    id: `${this.props.idBase}-${i}-${j}`,
                    value: this.props.grid.data[this.props.grid.channels*(this.props.grid.width*i + j) + 0],
                    onInput: ()=>this.props.updateGridHandler(
                        document.getElementById(`${this.props.idBase}-${i}-${j}`).value, i, j
                    ),
                }, null));
            }
        }

        return cells;
    }

    render(){

        return e('div', {
            className:'square-grid-base',
            style: {
                gridTemplateColumns: `repeat(${this.props.grid.width}, 3vw)`,
                gridTemplateRows: `repeat(${this.props.grid.height}, 3vw)`,
            },
        },
            this.renderCells()
        );
    }
}