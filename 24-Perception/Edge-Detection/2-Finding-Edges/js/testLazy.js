// Render elements
ReactDOM.render(
    e(React.lazy(()=>import('./demoGradient')), null, null),
    document.getElementById('gradient-root')
);