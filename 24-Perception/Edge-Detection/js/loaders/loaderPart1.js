// Lazy loader for modules

import { FallbackComponent } from '../ui.js';

// Render elements
ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/pipeline2d/Pipeline2dDirectDemo.js')), null, null),
    ),
    document.getElementById('pipeline2d-direct-root')
);

ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/RGBDemo.js')), null, null),
    ),
    document.getElementById('rgb-root')
);

ReactDOM.render(
    e(React.Suspense, {fallback: e(FallbackComponent, null, null)},
        e(React.lazy(()=>import('../demos/pipeline2d/Pipeline2dGrayscaleDemo.js')), null, null),
    ),
    document.getElementById('pipeline2d-gray-root')
);