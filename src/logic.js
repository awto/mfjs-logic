'strict mode';
import M from '@mfjs/core'
import CC from '@mfjs/cc'

class Result {
  constructor(tree) {
    this.tree = tree
  }
  getIterator() {
    return new ResultIterator(this);
  }
}

Result.prototype[Symbol.iterator] = Result.prototype.getIterator;

class ResultIterator {
  constructor(result) {
    this.cur = result.tree
  }

  next() {
    if(!this.cur)
      return {done:true}
    return CC.run.call(L,() => this.cur).next(this)
  }
}

class Tree {
}

class Zero extends Tree {
  compose(other) {
    return other;
  }

  next(i) {
    return { done: true }
  }
}

class One extends Tree {
  constructor(val) {
    super()
    this.val = val
  }

  compose(other) {
    return new Choice(this.val, other)
  }

  next(i) {
    i.cur = null
    return { value: this.val }
  }

}

class Choice extends Tree {
  constructor(head, tail) {
    super()
    this.head = head;
    this.tail = tail;
  }

  compose(other) {
    return new Choice(this.head, L.bind(this.tail, function(v) {
      return v.compose(other);
    }));
  }

  next(i) {
    i.cur = this.tail
    return { value: this.head }
  }
}

class Suspended extends Tree {
  constructor(tail) {
    super()
    this.tail = tail;
  }
}

const btPrompt = CC.newPrompt();

class LogicDefs extends CC.Defs {
  constructor() {
    super();
  }

  reifyL(m) {
    return CC.pushPrompt(btPrompt, CC.apply(M.liftContext(this,m)(),
      function(v) {
        return new One(v);
      }));
  }

  empty() {
    return CC.abort(btPrompt, new Zero());
  }

  plus(a, b) {
    var m = this;
    return m.join(CC.shift(btPrompt, function(sk) {
      return m.bind(sk(a), function(f1) {
        return f1.compose(sk(b));
      });
    }));
  }

  run(m) {
    return new Result(this.reifyL(m));
  }
}

const L = new LogicDefs()

M.completePrototype(L,CC.ctor.prototype,true)

export default L
