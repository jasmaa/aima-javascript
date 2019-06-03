// Utility functions and classes

/**
 * Loads input file as img
 * @param {*} id 
 * @param {*} input 
 */
function readURL(id, input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $(`#${id}`)
                .attr('src', e.target.result)
                .width(200)
                .height(200);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * Calculates value on 2D Gaussian function
 * @param {*} x 
 * @param {*} y 
 * @param {*} sigma 
 */
function gaussian(x, y, sigma){
    let mult = 1 / (2*Math.PI*Math.pow(sigma, 2));
    let exp = -(Math.pow(x, 2) + Math.pow(y, 2)) / (2*Math.pow(sigma, 2));
    return mult*Math.pow(Math.E, exp);
}

/**
 * Converts greyscale value to rgb string
 * @param {integer} value - Greyscale value to convert
 */
function grey2RGB(value){
    return `rgb(${value}, ${value}, ${value})`
}