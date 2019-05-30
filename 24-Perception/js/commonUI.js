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
 * Converts greyscale value to rgb string
 * @param {integer} value - Greyscale value to convert
 */
function grey2RGB(value){
    return `rgb(${value}, ${value}, ${value})`
}