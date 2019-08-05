// Utility functions and classes

/**
 * Loads input to image using promise
 * 
 * @param {string} imgId - Id of destination image tag
 * @param {input} input - File upload input
 */
export function readURL(imgId, input) {

    return new Promise((resolve, reject) => {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $(`#${imgId}`)
                    .attr('src', e.target.result)
                    .width(200)
                    .height(200)
                    .load(() => resolve(null));
            };

            reader.readAsDataURL(input.files[0]);
        }
    });
}

/**
 * Calculates value on 2D Gaussian function
 * 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} sigma 
 */
export function gaussian(x, y, sigma) {
    let mult = 1 / (2 * Math.PI * Math.pow(sigma, 2));
    let exp = -(Math.pow(x, 2) + Math.pow(y, 2)) / (2 * Math.pow(sigma, 2));
    return mult * Math.pow(Math.E, exp);
}

/**
 * Converts grayscale value to rgb string
 * 
 * @param {integer} value - Grayscale value to convert
 */
function gray2RGB(value) {
    return `rgb(${value}, ${value}, ${value})`
}

/**
 * Gets magnitude of 2d vector from components
 * 
 * @param {Number} x 
 * @param {Number} y 
 */
export function mag2d(x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

/**
 * Draws gradient arrow on canvas
 * https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
 * 
 * @param {CanvasRenderingContext2D} context 
 * @param {Number} centerx 
 * @param {Number} centery 
 * @param {Number} tox 
 * @param {Number} toy 
 */
export function canvas_arrow(context, centerx, centery, tox, toy) {
    const headlen = 10;   // length of head in pixels
    const angle = Math.atan2(toy - centery, tox - centerx);
    context.moveTo(centerx + centerx - tox, centery + centery - toy);
    context.lineTo(tox, toy);

    context.moveTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

export function canvasArrowCurveX(context, fromx, fromy, tox, toy) {
    const headlen = 8;
    const angle = tox - fromx > 0 ? 0 : Math.PI; // Snap angle to x axis

    const midx = fromx + (tox - fromx) / 2;
    const offsetx = fromx + 5 * (tox - fromx) / 8;

    context.moveTo(fromx, fromy);
    context.bezierCurveTo(
        midx, fromy,
        midx, toy,
        offsetx, toy
    );

    context.lineTo(tox, toy);

    // Paint head
    context.moveTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

/**
 * Draw X on canvas
 * @param {CanvasRenderingContext2D} context 
 * @param {Number} centerx 
 * @param {Number} centery 
 */
export function canvasCross(context, centerx, centery) {
    const len = 10;
    context.moveTo(centerx + len * Math.cos(Math.PI / 4), centery + len * Math.sin(Math.PI / 4));
    context.lineTo(centerx + len * Math.cos(5 * Math.PI / 4), centery + len * Math.sin(5 * Math.PI / 4));
    context.moveTo(centerx + len * Math.cos(3 * Math.PI / 4), centery + len * Math.sin(3 * Math.PI / 4));
    context.lineTo(centerx + len * Math.cos(-Math.PI / 4), centery + len * Math.sin(-Math.PI / 4));
}

/**
 * Converts percentage to heatmap color
 * https://stackoverflow.com/questions/12875486/what-is-the-algorithm-to-create-colors-for-a-heatmap
 * 
 * @param {Number} value 
 */
export function heatMapColorforValue(value) {
    const h = Math.floor((1.0 - value) * 240);
    const s = Math.floor(60 * value + 30);
    return `hsl(${h}, ${s}%, 50%)`;
}

/**
 * Linear interpolation
 * @param {*} start 
 * @param {*} from 
 * @param {*} delta 
 */
function lerp(start, from, delta) {
    return (from - start) * delta + start;
}

/**
 * Maps (0, 1) to red-green color scale
 * @param {*} value 
 */
export function divergingColormap(value) {
    const anchor1 = [59, 76, 192];
    const anchor2 = [255, 255, 224];
    const anchor3 = [180, 4, 38];

    // linear interpolation
    const vals = [
        Math.floor(value > 0.5 ? lerp(anchor2[0], anchor3[0], 2 * (value - 0.5)) : lerp(anchor1[0], anchor2[0], 2 * (value))),
        Math.floor(value > 0.5 ? lerp(anchor2[1], anchor3[1], 2 * (value - 0.5)) : lerp(anchor1[1], anchor2[1], 2 * (value))),
        Math.floor(value > 0.5 ? lerp(anchor2[2], anchor3[2], 2 * (value - 0.5)) : lerp(anchor1[2], anchor2[2], 2 * (value))),
    ];

    return vals;
}

/**
 * Texture load as promise
 * https://gist.github.com/zadvorsky/a79787a4703ecc74cab2fdbd05888e9b
 * 
 * @param {string} url - URL of image texture
 */
function loadTexture(url) {
    return new Promise(resolve => {
        new THREE.TextureLoader().load(url, resolve);
    });
}

/**
 * Swap and load texture from canvas
 * @param {Canvas} canvas 
 * @param {THREE.Material} mat 
 */
async function swapCanvasTexture(canvas, mat) {
    if (mat == null) {
        return;
    }

    let texture = await loadTexture(canvas.toDataURL("image/png"));

    if (mat.map != null) {
        mat.map.dispose();
    }
    texture.magFilter = THREE.NearestFilter;
    mat.map = texture;
    mat.needsUpdate = true;
}

// === GRID PATTERNS ===

export function createVerticalLine(source, offset = 0) {

    for (let i = 0; i < source.height; i++) {
        for (let j = 0; j < source.width; j++) {

            let value = Math.floor(Math.abs(source.centerCol - j + offset) / 3 * 206);
            value = Math.max(Math.min(value, 255), 0);

            source.setValue(value, i, j, 0);
            source.setValue(value, i, j, 1);
            source.setValue(value, i, j, 2);
        }
    }
}

export function createVerticalLineThick(source, offset = 0) {

    for (let i = 0; i < source.height; i++) {
        for (let j = 0; j < source.width; j++) {

            let value = Math.abs(source.centerCol - j + offset) < 2 ? Math.floor(Math.random() * 50) : Math.floor(Math.abs(source.centerCol - j + offset) / 2 * 200 + Math.random() * 10);
            value = Math.max(Math.min(value, 255), 0);

            source.setValue(value, i, j, 0);
            source.setValue(value, i, j, 1);
            source.setValue(value, i, j, 2);
        }
    }
}

export function createHorizontalLine(source, offset = 0) {
    for (let i = 0; i < source.height; i++) {
        for (let j = 0; j < source.width; j++) {

            let value = Math.floor(Math.abs(source.centerRow - i + offset) / 3 * 206);
            value = Math.max(Math.min(value, 255), 0);

            source.setValue(value, i, j, 0);
            source.setValue(value, i, j, 1);
            source.setValue(value, i, j, 2);
        }
    }
}

export function createDiagonalLine(source) {
    for (let i = 0; i < source.height; i++) {
        for (let j = 0; j < source.width; j++) {

            let value = Math.abs(i - j) * 100;
            value = Math.min(value, 255);

            source.setValue(value, i, j, 0);
            source.setValue(value, i, j, 1);
            source.setValue(value, i, j, 2);
        }
    }
}

export function createLineGradient(source) {
    for (let i = 0; i < source.height; i++) {
        for (let j = 0; j < source.width; j++) {

            let value = Math.floor(j * 10);
            value = Math.max(Math.min(value, 255), 0);

            source.setValue(value, i, j, 0);
            source.setValue(value, i, j, 1);
            source.setValue(value, i, j, 2);
        }
    }
}

export function createRadialGradient(source) {
    for (let i = 0; i < source.height; i++) {
        for (let j = 0; j < source.width; j++) {

            let value = Math.floor(Math.sqrt(Math.pow(i - source.centerRow, 2) + Math.pow(j - source.centerCol, 2)) * 15);
            value = Math.min(value, 255);

            source.setValue(value, i, j, 0);
            source.setValue(value, i, j, 1);
            source.setValue(value, i, j, 2);
        }
    }
}

export function createClear(source, color = 255) {
    for (let i = 0; i < source.height; i++) {
        for (let j = 0; j < source.width; j++) {

            source.setValue(color, i, j, 0);
            source.setValue(color, i, j, 1);
            source.setValue(color, i, j, 2);
        }
    }
}