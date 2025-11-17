
/**
 * Add console.image() method to log images in Chrome DevTools
 * Supports URLs, data URIs, and Image/HTMLImageElement objects
 */
console.image = function(url, height = 100) {
    const image = new Image();
    image.crossOrigin='anonymous';
    image.onload = function() {
        // build a data url
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = height || image.naturalHeight;
        canvas.width = canvas.height * image.naturalWidth / image.naturalHeight;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL();
        const style = [
            'font-size: 1px;',
            `padding: ${canvas.height}px ${canvas.width}px;`,
            `background: url(${dataUrl}) no-repeat;`,
            'background-size: contain;'
        ].join(' ');
        console.log('%c ', style);
    };
    image.src = url;
};

console.image('img/fishy.jpg')
console.log('fishy (https://x.com/CorrodedParadox/status/1870219696647110809)')