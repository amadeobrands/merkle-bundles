const merge = require('lodash.merge');


export const ajaxGet = (url, userOpts) => {
    let prom = new Promise((resolve, reject) => {
        let opts = merge({
            method: 'GET',
            responseType: 'text'
        }, userOpts)
    
        let xhr = new XMLHttpRequest();
        xhr.open(opts.method, url, true);
        xhr.responseType = opts.responseType;
        
        xhr.onload = function(e) {
            let res = this.response;
            switch(opts.responseType) {
                case 'arraybuffer':
                    let buf = new Uint8Array(res); 
                    resolve(buf);
                    break;
                default:
                    resolve(res)
            }
        };

        xhr.onerror = reject;
        
        xhr.send();
    });

    return prom;
}