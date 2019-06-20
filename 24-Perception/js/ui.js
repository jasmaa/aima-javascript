// Common UI elements

// Create element shortcut
const e = React.createElement;

/**
 * Grid cell
 */
class Cell extends React.Component {

    render(){
        const highlightColor = this.props.highlightColor ? this.props.highlightColor : "red";
        const highlightTextColor = this.props.highlightTextColor ? this.props.highlightTextColor : "white";

        let bgColor = this.props.isHighlighted ? highlightColor : this.props.bgColor;
        let textColor = this.props.isHighlighted ? highlightTextColor : "black";

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
 * Displays colored number
 */
class DisplayNumber extends React.Component {

    render(){
        return e('span', {
            style: {
                color: this.props.highlightColor,
                fontSize: '1.7vmax',
            }
        }, this.props.value);
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
                    type: 'text',
                    style: {
                        backgroundColor: this.props.gridColor ? this.props.gridColor.data[this.props.gridColor.channels*(this.props.gridColor.width*i + j) + 0] : "white",
                    },
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
                gridTemplateColumns: `repeat(${this.props.grid.width}, 3vmax)`,
                gridTemplateRows: `repeat(${this.props.grid.height}, 3vmax)`,
            },
        },
            this.renderCells()
        );
    }
}

/**
 * Upload image button
 * 
 * Provides button for uploading image to document
 * and processing it
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
                            .finally(()=>{
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

/**
 * Control panel for moving position
 */
class PositionControl extends React.Component {

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