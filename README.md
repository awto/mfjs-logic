# Logic programming in JavaScript

The library is intended to be used with
[@mfjs/compiler](https://github.com/awto/mfjs-compiler).

It is not yet fully finished adaptation of
[Backtracking, Interleaving, and Terminating Monad Transformers](http://okmij.org/ftp/papers/LogicT.pdf)

## Usage

```
$ npm install --save-dev @mfjs/compiler
$ npm install --save @mfjs/core @mfjs/logic
$ mfjsc input.js --output=out
# or for browser
$ browserify -t @mfjsc/compiler/monadify input.js -o index.js
```

more soon...

## License

Copyright © 2016 Vitaliy Akimov

Distributed under the terms of the [The MIT License (MIT)](LICENSE). 

