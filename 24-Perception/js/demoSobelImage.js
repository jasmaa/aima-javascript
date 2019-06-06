// Sobel operator image demo UI

/**
 * Sobel operator image demo
 */
class SobelImageDemo extends React.Component {

    /**
     * Do edge detection pipeline on inputted image
     */
    process(){
        const canvas = document.getElementById('sobel-image-canvas');
        const context = canvas.getContext('2d');
        const img = document.getElementById("sobel-image-img");

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.drawImage(img, 0, 0, 200, 200);
        let imgData = context.getImageData(0, 0, 200, 200);
        let source = new Array2D([...imgData.data], imgData.width, imgData.height, 4);
        
        // Convert to grayscale
        grayscale(source);
        
        fillArray(imgData.data, source.data, imgData.data.length);
        context.putImageData(imgData, 200, 0);
        
        // Do gaussian blur with 5x5 filter
        let gaussianBlur = new Array2D([
                1/273, 4/273, 7/273, 4/273, 1/273,
                4/273, 16/273, 26/273, 16/273, 4/273,
                7/273, 26/273, 41/273, 26/273, 7/273,
                4/273, 16/273, 26/273, 16/273, 4/273,
                1/273, 4/273, 7/273, 4/273, 1/273
            ], 5, 5);
        convolve(source, gaussianBlur);
        
        fillArray(imgData.data, source.data, imgData.data.length);
        context.putImageData(imgData, 400, 0);
        
        // Apply Sobel operator horizontally
        let sobelXData = new Array2D([...source.data], source.width, source.height);
        let sobelX = new Array2D([
                -1, 0, 1,
                -2, 0, 2,
                -1, 0, 1
            ], 3, 3);
        convolve(sobelXData, sobelX);
        
        // Apply Sobel operator vertically
        let sobelYData = new Array2D([...source.data], source.width, source.height);
        let sobelY = new Array2D([
                1, 2, 1,
                0, 0, 0,
                -1, -2, -1
            ], 3, 3);
        convolve(sobelYData, sobelY);
        
        // Calculate magnitude of gradients
        for(let i=0; i < source.height; i++){
            for(let j=0; j < source.width; j++){
                let value = Math.sqrt(
                                Math.pow(sobelXData.data[4*(source.width*i + j) + 0], 2) +
                                Math.pow(sobelYData.data[4*(source.width*i + j) + 0], 2));
                
                source.data[4*(source.width*i + j) + 0] = value;
                source.data[4*(source.width*i + j) + 1] = value;
                source.data[4*(source.width*i + j) + 2] = value;
            }
        }

        // Stretch color for display
        stretchColor(source);

        fillArray(imgData.data, source.data, imgData.data.length);
        context.putImageData(imgData, 600, 0);
    }

    render(){
        return e('div', null, [
            e('div', {key: 'control-row', className: 'row'}, [
                e('div', {key: 'col-1', className: 'col-md-9'},
                    e('label', {className: 'btn btn-success'}, [
                        e('input', {
                            key: 'sobel-image-input',
                            id: 'sobel-image-input',
                            type: 'file',
                            name: 'sobel-image-input',
                            accept: 'image/x-png,image/gif,image/jpeg',
                            style: {display: 'none'},
                            onChange: ()=>{
                                readURL('sobel-image-img', document.getElementById('sobel-image-input'))
                                    .then((result) => this.process());
                            },
                        }, null),
                        'Upload Image',
                    ])
                ),
                /*
                e('div', {key: 'col2', className: 'col-md-3'},
                    e('div', {
                        className: 'btn btn-primary',
                        //onClick: ()=>this.process(),
                    }, 'TODO')
                ),
                */
            ]),
            e('br', {key: 'space-1'}, null),
            e('br', {key: 'space-2'}, null),
            e('img', {
                key: 'sobel-image-img',
                src: '#',
                id: 'sobel-image-img',
                hidden: true,
            }, null),
            e('canvas', {
                key: 'sobel-image-canvas',
                id: 'sobel-image-canvas',
                width: '800',
                height: '200'
            }, null),
        ]);
    }
}

// Render elements
ReactDOM.render(
    e(SobelImageDemo, null, null),
    document.getElementById('sobel-image-root')
);
