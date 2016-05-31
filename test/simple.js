'use strict';
const M = require('@mfjs/core')
import L from '../src/logic'

//M.setContext(L)

M.option({
  test: {
    CallExpression:{
      match:{
        name:{"run":true}
      },
      select:'matchCallName',
      cases:{true:{sub:'defaultFull'}}
    },
    full: {
      CallExpression:{
        match:{
          name:{expect:true,equal:true,fail:true,check:true}
        }
      }
    },
    compile:true
  }
})
M.profile('test')

describe('running logical monad', () => {
  context('with no logical effects', () => {
    it('should return single value', () => {
      const k = L.run(() => {
        return 2
      })
      expect(Array.from(k)).to.eql([2])
    })
  })
  context('with alt', () => {
    it('should convert choice alternative into a single value', () => {
      const k = L.run(() => {
        const v = M.alt(1,2,3)
        return v * 10
      })
      expect(Array.from(k)).to.eql([10,20,30])
    })
  })
  context('with yield', () => {
    it('should answer yield argument', () => {
      const k = L.run(() => {
        M.yield(1)
        M.yield(2)
        M.yield(3)
        return 4
      })
      expect(Array.from(k)).to.eql([1,2,3,4])
    })
    it('should suspend execution after `yield`', () => {
      const k = L.run(() => {
        M.yield(1)
        expect().fail()
      }).dfs()
      expect(k.next().value).to.eql(1)
    })
    it('should suspend execution until `next`', () => {
      const k = L.run(() => {
        expect().fail()
        M.yield(1)
      }).dfs()
      expect(typeof k).to.equal('object')
    })
    it('should revert local variables values on backtracking', () => {
      const k = L.run(() => {
        let i = 1
        M.yield(i)
        i++
        expect(i).to.equal(2)
        M.empty()
        expect().fail()
        M.yield(i)
        expect(i).to.equal(1)
        M.yield(i)
        i++
        M.yield(i)
        M.empty()
      })
      expect(Array.from(k)).to.eql([1,1,2])
    })
    context('in loop body', () => {
      it('should return an answer for each iteration', () => {
        const k = L.run(() => {
          for (let i = 1; i <= 4; ++i)
            M.yield(i)
          M.empty();
        })
        expect(Array.from(k)).to.eql([1,2,3,4])
      })
    })
  })
})

describe('empty', () => {
  it('should return no answers', () => {
    const k = L.run(() => {
      M.empty()
    })
    expect(Array.from(k)).to.eql([])
  })
})

describe('yield', () => {
  it('should discharge empty', () => {
    const k = L.run(() => {
      M.empty()
      expect().fail()
      M.yield(1)
      return 2
    })
    expect(Array.from(k)).to.eql([2])
  })
})

describe('control flow', () => {
  const state = []
  const rec = v => state.push(v)
  const check = (...args) => 
    expect(state).to.eql(args)
  context('with labeld break', () => {
    it('should respect js control flow', () => {
      const k = L.run(() => {
        for(var i = 0; i < 5; i++) {
          rec(`i1:${i}`)
          if (i === 3)
            break
          rec(`i2:${i}`)
          M.yield(i)
          rec(`i3:${i}`)
          M.yield(`i:${i}`)
          rec(`i4:${i}`)
        }
        rec(`i5:${i}`)
        if (i === 3)
          M.empty()
        rec(`i6:${i}`)
        return 'fin'
      })
      expect(Array.from(k)).to.eql([0,'i:0',1,'i:1',2,'i:2','i:3',4,
                                    'i:4','fin'])
      check('i1:0','i2:0','i3:0','i4:0','i1:1','i2:1','i3:1','i4:1',
            'i1:2','i2:2','i3:2','i4:2','i1:3','i5:3','i3:3','i4:3',
            'i1:4','i2:4','i3:4','i4:4','i5:5','i6:5')
    })
  })
})

describe('breadth first order', () => {
  it('should return elements in breadth first order', () => {
    const k = L.run(() => {
      {
        M.yield(1)
        M.yield(2)
        {
          M.yield(3)
          M.yield(4)
        }
        M.yield(5)
      } 
      M.yield(6)
      M.yield(7)
      return 8
    }).bfs()
    // TODO: maybe associativity of yield should be changed
    expect(Array.from(k)).to.eql([8,7,6,1,2,5,3,4])
  })
})

describe('once function', () => {
  it('should discard all but one answers', function() {
    const k = L.run(() => L.once(M.reify(() => {
        M.yield(1)
        expect().fail()
        M.yield(2)
        M.yield(3)
    })))
    expect(Array.from(k)).to.eql([1])
  })
  it('should return no answers if its argument returns none', function() {
    const k = L.run(() => L.once(M.empty()))
    expect(Array.from(k)).to.eql([])
  })
})
