import React, { Component } from 'react';
import './App.css';

function Apply(fun, args) {
  console.log("APPLY(", fun, args, ")");
  // find any array pos loop over it's elements, recurse
  var i = 0;
  while (i < args.length && !(args[i] instanceof Array)) {
    i++;
  }
  if (i < args.length) {
    args = args.slice();
    var arr = args[i];
    return arr.map((x) => {
      args[i] = x;
      return Apply(fun, args);
    }).filter((x) => x !== undefined);
  } else {
    return fun.apply(null, args);
  }
}

//console.log(function(a){return a*a;}, [3]);

function Run(prog, env, prev) {
  console.log("RUN=>", prog, env, prev);
  var r = Runn(prog, env, prev);
  console.log("<=RUN", r, "of", prog);
  return r;
}

function Runn(prog, env, prev) {
  if (!prog) return;
  if (prog instanceof Ref) return Run(prog.val(env), env);
  if (prog instanceof Function) return prog;
  if (prog instanceof Array) {
    var r = prog.map(function(x){return Run(x, env);});
    var x, f, a = [], first = true;
    while (x = r.shift()) {
      if (x instanceof Function) {
        // 1 2 plus 3 foo => [plus(1 2 3)] foo
        // TODO: handle "arrays"
        if (f) a = [Apply(f, a)];
        f = x;
        if (prev && first) a.push(prev);
        first = false;
      } else a.push(x);
    }
    if (f) a = Apply(f, a);
    if (a && a.length == 1) return a[0];
    return a;
  }
  if (typeof(prog) === 'object') {
    var prev, r = {};
    for (let k in prog) {
      prev = r[k] = Run(prog[k], r, prev);
    }
    return r;
  }
  if (typeof(prog) === 'number') return prog;
  if (typeof(prog) === 'string') return prog;
}

//console.log(Run([1, 2, function(a,b){return a+b;}]));
//console.log(Run([1, 2, function(a,b){return a+b;}, function(a,b){return a*b;}, 5]));

function Program(props) {
  var prog = props.prog;
  var res = props.res || [];
  if (!prog) return null;

  if (prog instanceof Array) {
    const cols = prog.map((item, i) =>
      <td>
        <Program prog={item} res={res[i]}/>
      </td>
    );
    
    return (
      <center>
        <table style={{width: '100%'}}><tbody>
           <tr style={{background: ''}}>
             {cols}
           </tr>
        </tbody></table>
      </center>
    );
  }

  if (prog instanceof Ref)
    ;// later
  else if (typeof(prog) === 'object') {
    const rows = Object.keys(prog).map((key) => {
      const label = <b style={{float: 'left', margin: '-5px', padding: '5px', 'font-size': '10px', background: 'white', border: '1px solid black', borderRadius: '5px', padding: '3px'}}>{key}:</b>;

      return (
        <tr><td style={{background: 'lightgreen'}}>
          {key.match(/^_/) ? "" : label}
          <Program prog={prog[key]} name={key} res={res[key]}/>
        </td></tr>
      );
    });
//          <div style={{background: 'silver', 'text-align': 'center', padding: '10px', 'borderRadius': '10px'}}>
//            {''+res[key]}
//          </div>
    return (
      <table>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  var color = 'lightgray', txt = prog;
  if (typeof prog === 'number') color = 'white';
  else if (typeof prog === 'string') color = 'white';
  else if (prog instanceof Ref) {
    color = 'cyan';
    txt = <i>{prog.name}</i>
  } else if (typeof prog === 'function') {
    console.log("PROG", prog, prog instanceof Ref);
    color = '#66FF99';
    txt = <b>{prog.name}</b>
  } else {
    color = 'red';
    txt = '' + prog;
  }
  return <div style={{padding: '6px'}}>
    <div style={{'text-align': 'center', padding: '7px', background: color}}>
      {txt}
    </div>
  </div>;
}

function to(f, t){
  var i, r = [];
  for(i = f; i <= t; i++) {
    r.push(i);
  }
  return r;
}

function Ref(name) {
  this.val = function(env) { return env ? env[name] : undefined; }
  this.name = name;
}

function ref(name) {
  return new Ref(name);
}

//console.log(ref('a')({a: 3}));
//{ var x = ref('a'); console.log(x(x)); }
//console.log((ref('a')) instanceof Ref);

function sqr(r){ return r*r;}
function lt(x,y){ return x < y ? x : undefined; }
function mult(a,b){ return a*b; }
function plus(a,b){ return a+b; }
 
class App extends Component {
  render() {

    var SQRLT = {
      '_a': [1, to, 10],
      // TODO: handle f as well as [f]?
      '_b': [sqr],
      '_c': [lt, 15]
      };

    var MULT = {
      a: [1, to, 3],
      _aa: undefined,
      b: [1, to, 3],
      _b: ["="],
      _bb: undefined,
      c: [ref('a'), mult, ref('b')],
    };

    var prog = MULT;

    function Page(prog, res) {
      return (
        <div className="App">
          <div className="App-header">
            <h2>UI-First</h2>
          </div>
          <center><table><tbody><tr><td><Program prog={prog} res={res}/></td></tr></tbody></table></center>
        </div>
      );
    }
    
    var res = Run(prog);
    console.log(res);
    return Page(prog, res);
  }
}

export default App;
