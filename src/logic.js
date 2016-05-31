'strict mode';
import M from '@mfjs/core'
import CC from '@mfjs/cc'

class Result {
  constructor(tree) {
    this.tree = tree
  }
  dfs() {
    return new MetaIterator(new DfsIterator(this.tree));
  }
  bfs() {
    return new MetaIterator(new BfsIterator(this.tree));
  }
}

Result.prototype[Symbol.iterator] = Result.prototype.dfs;

class MetaIterator {
  constructor(inner) {
    this.inner = inner
  }
  next() {
    return CC.exec.call(L,this.inner.next())
  }
}

MetaIterator.prototype[Symbol.iterator] = function() { return this; }

class Iterator {
  constructor(tree) {
    this.stack = [tree]
  } 
  next() {
    if (!this.stack.length)
      return L.pure({done: true})
    return L.bind(this.stack.shift(), r => {
      if (r.alts) {
        this.advance(r.alts)
        return this.next()
      }
      return L.pure({value:r.value})
    })
  }
}

class BfsIterator extends Iterator {
  constructor(tree) {
    super(tree)
  }
  advance(alts) {
    this.stack.push(...alts)
  }
}

class DfsIterator extends Iterator {
  constructor(tree) {
    super(tree)
  }
  advance(alts) {
    this.stack.unshift(...alts)
  }
}

const btPrompt = CC.newPrompt("bt")

class LogicDefs extends CC.Defs {
  constructor() {
    super()
  }
  level(m) {
    return this.pushPrompt(btPrompt,
                           this.apply(
                             m,
                             v => { return {value:v} }))
  }
  alt(...args) {
    return this.join(this.shift(btPrompt, sk => {
      const len = args.length, alts = []
      for(let i = 0; i < len; ++i)
        alts.push(sk(args[i]))
      return this.pure({alts})
    }))
  }
  once(m) {
    return this.apply(
      (new DfsIterator(this.level(m))).next(),
      r => r.done ? this.empty() : this.pure(r.value))
  }
  exec(m) {
    return new Result(this.level(m));
  }
  run(m) {
    return this.exec(M.liftContext(this,m)())
  }
}

const L = new LogicDefs()

M.completePrototype(L,CC.ctor.prototype,true)

export default L

