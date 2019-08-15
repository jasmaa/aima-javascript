// Set up global vars

// Create element shortcut
const e = React.createElement;

// Detect mouse down
let isMouseDown = false;
document.body.onmousedown = function () {
    isMouseDown = true;
}
document.body.onmouseup = function () {
    isMouseDown = false;
}