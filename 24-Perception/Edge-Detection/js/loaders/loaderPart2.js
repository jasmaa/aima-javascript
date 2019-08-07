import { FallbackComponent } from '../ui.js';

// Render elements
ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/TopologyDemo.js')), null, null),
    ),
    document.getElementById('topology-root')
);

ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/ConvolutionDemo.js')), null, null),
    ),
    document.getElementById('convolution-root')
);

ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/GradientDemo.js')), null, null),
    ),
    document.getElementById('gradient-root')
);

ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/pipeline2d/Pipeline2dShortDemo.js')), null, null),
    ),
    document.getElementById('pipeline2d-short-root')
);

ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/pipeline2d/Pipeline2dLongDemo.js')), null, null),
    ),
    document.getElementById('pipeline2d-long-root')
);

ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/pipeline2d/Pipeline2dGrainyDemo.js')), null, null),
    ),
    document.getElementById('pipeline2d-grainy-root')
);