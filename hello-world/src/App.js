import React, { Component } from 'react';
import './App.css';
import {funcs, ref, Ref} from './UI-lang';

function Apply(fun, args) {
//  console.log("APPLY(", fun, args, ")");
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
      const label = <b style={{float: 'left', margin: '-5px', padding: '5px', fontSize: '10px', background: 'white', border: '1px solid black', borderRadius: '5px', padding: '3px'}}>{key}:</b>;

      if (!res[key]) return;
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
    color = '#66FF99';
    function showSource(){
      if (!window.editors.some((x) => (x == prog))) {
        window.editors.push(prog);
        window.changed();
      }
    }
    txt = <b onClick={showSource} title={prog.doc}>{prog.name}</b>
  } else {
    color = 'red';
    txt = '' + prog;
  }
  return <div style={{padding: '6px'}}>
    <div style={{textAlign: 'center', padding: '7px', background: color}}>
      {txt}
    </div>
  </div>;
}

function App(props) {
  var prog = props.prog;
  var res = Run(prog);
  var editors = props.editors;

  var fs = funcs.map(function(f){
    return <span> {f.name} </span>;
  });
  var eds = editors.map(function(f){
    function remove(){ window.editors = window.editors.filter((x) => (x != f)); window.changed(); }
    var name_rest = f.toString().match(/function (\w+)([\s\S]*)/m);
    var s = <span>function <b style={{background: 'lightgreen'}} onClick={remove}>{name_rest[1]}</b>{name_rest[2]}</span>;
    return <pre style={{border: '1px solid black', textAlign: 'left', padding: '5px', margin: '5px'}}>{s}</pre>
  });
  return (
    <div className="App">
    <div className="App-header">
    <h2>UI-First</h2>
    </div>
    <div>{fs}</div>
    <br/><br/>
    <div style={{float: 'right'}}>{eds}</div>
    <center><table><tbody><tr><td><Program prog={prog} res={res}/></td></tr></tbody></table></center>
    </div>
  );
}

export default App;
