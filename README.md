# Logic programming in JavaScript

The library is based on
[Backtracking, Interleaving, and Terminating Monad Transformers](http://okmij.org/ftp/papers/LogicT.pdf)

Using it with [@mfjs/compiler](https://github.com/awto/mfjs-compiler) turns
JavaScript into a logical programming language.

For example, here is almost literal translation of classical Prolog
bi-directional list append function to JavaScript (defined in separate
[samples project](https://github.com/awto/mfjs-samples/tree/master/unify)):

```javascript
function append(a,b,r) {
  const [h, t, rt] = newRefs()
  unify(a, cons(h, t))
  unify(r, cons(h, rt))
  append(t, b, rt)
  M.answer()
  unify(a, nil())
  unify(r, b)
}
```

with usages:

```javascript
let l1 = List.from([1,2,3])
let l2 = List.from(['a','b','c'])
// free variables:
let [l3,l4,l5] = newRefs()

append(l1, l2, l3)
console.log('append:', List.toArray(l3))
// ==> append: [ 1, 2, 3, 'a', 'b', 'c' ]

append(l1, l4, l3)
console.log('suffix', List.toArray(l4))
// ==> suffix [ 'a', 'b', 'c' ]

append(l5, l2, l3)
console.log('prefix', List.toArray(l5))
// ==> prefix [ 1, 2, 3 ]
```

or non-determenistic with only result defined:

```javascript
let [x,y] = newRefs()
let z = List.from([1,2,3,4])
// only result is instantied 
append(x,y,z)
console.log('x:', List.toArray(x))
console.log('y:', List.toArray(y))
console.log('z:', List.toArray(z))
```

outputs all 5 possible answers:

```
x: [ 1, 2, 3, 4 ]
y: []
z: [ 1, 2, 3, 4 ]

x: [ 1, 2, 3 ]
y: [ 4 ]
z: [ 1, 2, 3, 4 ]

x: [ 1, 2 ]
y: [ 3, 4 ]
z: [ 1, 2, 3, 4 ]

x: [ 1 ]
y: [ 2, 3, 4 ]
z: [ 1, 2, 3, 4 ]

x: []
y: [ 1, 2, 3, 4 ]
z: [ 1, 2, 3, 4 ]
```

## API

In standard Prolog language there is only depth first search options for
possible answer lookup. The library provides means to add arbitrary search
strategies. By default it provides depth-first and breadth-first searches.

Result object returned from `L.run` is ES iterable. Its default iterator
traverses answers in depth-first order. The result object also has `bfs`
function returning iterator for breadth first order.

There are a few additional functions in logic monad definition:

 * once - takes logical computation and returns only its first answer if any
 * level - for logical computation returns object with either field `value`
   or `alts`, the first is final result of the computation and the second
   is a list of other logical computations if original one was non-deterministic

## Usage

```
$ npm install --save-dev @mfjs/compiler
$ npm install --save @mfjs/core @mfjs/logic
$ mfjsc input.js --output=out
# or for browser
$ browserify -t @mfjsc/compiler/monadify input.js -o index.js
```

## 

## License

Copyright © 2016 Vitaliy Akimov

Distributed under the terms of the [The MIT License (MIT)](LICENSE). 

