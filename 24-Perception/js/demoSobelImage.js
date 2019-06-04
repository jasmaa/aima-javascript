// Sobel operator image demo UI

/**
 * Sobel operator image demo
 */
class SobelImageDemo extends React.Component {

    /**
     * Do image processing on inputted image
     */
    process(){
        const canvas = document.getElementById('sobel-image-canvas');
        const context = canvas.getContext('2d');
        const img = document.getElementById("sobel-image-img");

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.drawImage(img, 0, 0, 200, 200);
        let data = context.getImageData(0, 0, 200, 200);
        let sourceData = new Array2D([...data.data], data.width, data.height);
        
        // Convert to grey
        greyscale(sourceData);
        
        fillArray(data.data, sourceData.data, data.data.length);
        context.putImageData(data, 200, 0);
        
        // Do gaussian blur
        let gaussianBlur = new Array2D([
                1/273, 4/273, 7/273, 4/273, 1/273,
                4/273, 16/273, 26/273, 16/273, 4/273,
                7/273, 26/273, 41/273, 26/273, 7/273,
                4/273, 16/273, 26/273, 16/273, 4/273,
                1/273, 4/273, 7/273, 4/273, 1/273
            ], 5, 5);
        convolve(sourceData, gaussianBlur);
        
        fillArray(data.data, sourceData.data, data.data.length);
        context.putImageData(data, 400, 0);
        
        // Apply Sobel operator
        let sobelXData = new Array2D([...sourceData.data], sourceData.width, sourceData.height);
        let sobelX = new Array2D([
                -1, 0, 1,
                -2, 0, 2,
                -1, 0, 1
            ], 3, 3);
        convolve(sobelXData, sobelX);
        
        let sobelYData = new Array2D([...sourceData.data], sourceData.width, sourceData.height);
        let sobelY = new Array2D([
                1, 2, 1,
                0, 0, 0,
                -1, -2, -1
            ], 3, 3);
        convolve(sobelYData, sobelY);
        
        // Calculate hypotenuse
        for(let i=0; i < sourceData.height; i++){
            for(let j=0; j < sourceData.width; j++){
                let value = Math.sqrt(
                                Math.pow(sobelXData.data[4*(sourceData.width*i + j) + 0], 2) +
                                Math.pow(sobelYData.data[4*(sourceData.width*i + j) + 0], 2));
                
                sourceData.data[4*(sourceData.width*i + j) + 0] = value;
                sourceData.data[4*(sourceData.width*i + j) + 1] = value;
                sourceData.data[4*(sourceData.width*i + j) + 2] = value;
            }
        }

        // Stretch color for display
        stretchColor(sourceData);

        fillArray(data.data, sourceData.data, data.data.length);
        context.putImageData(data, 600, 0);
    }

    render(){
        return e('div', null, [
            e('div', {key: 'control-row', className: 'row'}, [
                e('div', {key: 'col-1', className: 'col-md-9'},
                    e('label', {className: 'btn btn-success'}, [
                        e('input', {
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
                e('div', {key: 'col2', className: 'col-md-3'},
                    e('div', {                                                      // Replace with webcam??
                        className: 'btn btn-primary',
                        //onClick: ()=>this.process(),
                    }, 'TODO')),
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
