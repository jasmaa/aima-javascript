// Common UI elements

// Create element shortcut
const e = React.createElement;

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
                gridTemplateColumns: `repeat(${this.props.grid.width}, 3em)`,
                gridTemplateRows: `repeat(${this.props.grid.height}, 3em)`,
            },
        },
            this.renderCells()
        );
    }
}

/**
 * Upload image button
 * Image added to DOM and processed
 */
class ImageUploader extends React.Component {

    render(){
        return e('div', null,
            e('label', {className: 'btn btn-success'}, [
                e('input', {
                    key: `${this.props.imageId}-input`,
                    id: `${this.props.imageId}-input`,
                    type: 'file',
                    name: `${this.props.imageId}-input`,
                    accept: 'image/x-png,image/gif,image/jpeg',
                    style: {display: 'none'},
                    onChange: ()=>{
                        document.body.style.opacity = '0.3';
                        readURL(`${this.props.imageId}-img`, document.getElementById(`${this.props.imageId}-input`))
                            .then((result) => this.props.processHandler())
                            .then((result)=>{
                                document.body.style.opacity = '';
                            });
                    },
                }, null),
                e('img', {
                    key: `${this.props.imageId}-img`,
                    src: this.props.defaultImage,
                    id: `${this.props.imageId}-img`,
                    hidden: true,
                    onLoad: ()=>this.props.processHandler(),
                }, null),
                'Upload Image'
            ])
        );
    }
}