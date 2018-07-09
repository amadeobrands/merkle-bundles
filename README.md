Merkle Bundles
==============

**A new way to deliver JS**. Turn the AST of modules into a Merkle tree, and use it as an efficient index to delta update the client's source code.

Copyright [Liam Zebedee](https://liamz.co) 2018.

## Try it out
Currently it's all in `astex/`.

```
npm i
npm run build
```

Take a look in `dist/output` for the details of what the hash tree, the diff format, and the bin diff looks like.


## Envelope calculations
