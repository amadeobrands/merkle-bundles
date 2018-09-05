type ajaxOpts = {
    method?: 'GET',
    responseType: XMLHttpRequestResponseType,
    headers: { [k: string]: string }
};

export function ajaxGet(url: string, userOpts: ajaxOpts): Promise<any> {
    let prom = new Promise((resolve, reject) => {
        let opts = {
            method: 'GET',
            responseType: 'text',
            headers: [],
            ...userOpts
        };
    
        let xhr = new XMLHttpRequest();
        xhr.open(opts.method, url, true);
        Object.entries(opts.headers).map(([ k, v ]) => {
            xhr.setRequestHeader(k, v);
        })
        
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

export function parseUrl(url: string) {
    let el = document.createElement('a');
    el.href = url;
    return el;
}