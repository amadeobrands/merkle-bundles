This is an example of how to use turbojs (pronounced turbo-jays).

 1. Install the client and server. `yarn add astex-client astex-server`
 2. Run the server in your webpack dist folder. `merkle-ast-server -d .`
 3. Insert this code into your main `index.js`:

```js
window.addEventListener('DOMContentLoaded', function() {
    require('astex-client/dist/min/bootstrap')
    .bootstrap('http://localhost:9002')
    .then(client => {
        client.load('bundle.js')
    })
});
```

**`bundle.js` is the name of your webpack-generated bundle.**

 4. Fix the webpack config to generate the same filename every time. i.e.

```js
{
    ...
    output: {
        filename: 'bundle.js',
    }
}
```

 5. Run webpack without the hot reloading (to mimic a production environment). 

What should happen?

 - your bundle is cached on first load. Further loads are instant


## Page load process
1. Download bootstrapper (this happens every time to instantiate the client) - 41 KiB.
2. Download turbojs client (only if it has changed, else it's loaded from cache) - 225 KiB.
3. Download diff of `bundle.js` (if any), apply it, and then run the bundle - 0->? KiB.

Every page load now becomes 41 KiB + the diff of the last bundle.