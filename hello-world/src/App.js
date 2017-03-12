import React from 'react';
import './App.css';
import {funcs, Ref, Run} from './UI-lang';

//console.log(Run([1, 2, function(a,b){return a+b;}]));
//console.log(Run([1, 2, function(a,b){return a+b;}, function(a,b){return a*b;}, 5]));

// TODO:move to UI-Lang?
// take user input value and "guess" what it is
// => function/number
function parseValue(s) {
  if (s === null) return s;
  var n = parseFloat(s);
  var f = funcs[s];
  if (!isNaN(n)) return n;
  else if (f) return f;
  return s;
}

function Program(props) {
  var prog = props.prog;
  var res = props.res || [];
  if (prog === null) return null;

  function showSource(e){
    e.preventDefault();
    if (!window.editors.some((x) => (x === prog))) {
      window.editors.push(prog);
      window.changed();
    }
  }

  function add() {
    var v = parseValue(prompt("Add Expression"));
    console.log("ADD", v, prog);
    if (v === null) return;
    prog.push(v);
    window.changed();
  }
  // display columns
  if (prog instanceof Array) {
    const cols = prog.map((item, i) => {
      function del(e) {
        e.preventDefault();
        prog.splice(i, 1);
        window.changed();
      }
      function edit(e) {
        e.preventDefault();
        if (e.target.tagName === 'HIDDEN') return;
        var v = prog[i];
        v = v instanceof Function ? v.name : v;
        v = parseValue(prompt("New value:", v));
        if (v === null) return;
        prog[i] = v;
        window.changed();
      }
      // onLongPress only work on touch?
      // <td onContextMenu={del} delayLongPress={500} onLongPress={del}>
      // <hidden style={{marginLeft: '20px', marginTop: '-50px', fontSize: '13px'}} onClick={showSource}>definition</hidden>
      return (
        <td key={i} className='ui' onClick={edit}>
          <Program prog={item} res={res[i]}/>
          <hidden onClick={del}>x</hidden>
        </td>
      );
    });

    //cols.push(<td></td>); // make sure there are always two+ columns, otherwise the add will be wide
    cols.push(<td key='new' onClick={add} title="Add" style={{background: 'limegreen', width: '10px'}}>&nbsp;</td>);
    
    return (
      <center>
        <table style={{width: '100%'}}><tbody>
           <tr style={{background: ''}}>{cols}</tr>
        </tbody></table>
      </center>
    );
  }

  if (prog instanceof Ref)
    ;// later
  else if (typeof(prog) === 'object') {
    // display row
    const rows = Object.keys(prog).map((key, i) => {
      const label = <b style={{float: 'left', margin: '-5px', fontSize: '10px', background: 'white', border: '1px solid black', borderRadius: '5px', padding: '3px'}}>{key}:</b>;
      // TODO: this causes program not to render, at error, lol, lol
      //if (!res[key]) return null;
      return (
        <tr key={i}><td style={{background: 'lightgreen'}}>
          {key.match(/^_/) ? "" : label}
          <Program key={key} prog={prog[key]} res={res[key]}/>
        </td></tr>
      );
    });

    function addLine() {
      prog = prog['_' + new Date().valueOf()] = [];
      add();
      window.changed();
    }

    rows.push(<tr key='new'><td style={{background: 'limegreen'}} onClick={addLine}>&nbsp;</td></tr>);
//          <div style={{background: 'silver', 'text-align': 'center', padding: '10px', 'borderRadius': '10px'}}>
//            {''+res[key]}
//          </div>
    return (
      <table>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  // display "simple" values (bottom)
  var color = 'lightgray', txt = prog;
  if (typeof prog === 'number') color = 'white';
  else if (typeof prog === 'string') color = 'white';
  else if (prog instanceof Ref) {
    color = 'cyan';
    txt = <i>{prog.name}</i>
  } else if (typeof prog === 'function') {
    color = '#66FF99';
    txt = (
      <b title={prog.doc} onContextMenu={showSource}>{prog.name}</b>
    );
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

  //https://github.com/kolodny/immutability-helper
  //( https://facebook.github.io/react/docs/update.html )
  console.log("------------------", prog);
  //  console.log(Print(prog));

  var fs = funcs.map(function(f){
    return <span key={f}> {f.name} </span>;
  });

  var eds = editors.map(function(f){
    function remove(){ window.editors = window.editors.filter((x) => (x !== f)); window.changed(); }
    var name_rest = f.toString().match(/function (\w+)([\s\S]*)/m);
    var s = <span>function <b style={{background: 'lightgreen'}} onClick={remove}>{name_rest[1]}</b>{name_rest[2]}</span>;
    return <pre style={{border: '1px solid black', textAlign: 'left', padding: '5px', margin: '5px'}}>
      <tt onClick={remove} style={{float: 'right', fontSize: '18px', marginTop: '-5px'}}>X</tt>
      {s}
    </pre>
  });

  return (
    <div className="App">
    <div className="App-header">
    <h2>UI-First</h2>
    <b><small>(C) 2017 Jonas S Karlsson</small></b>
    </div>
    <div>{fs}</div>
    <br/><br/>
    <div style={{float: 'right'}}>{eds}</div>
    <center><table><tbody><tr><td>
      <Program prog={prog} res={res}/>
    </td></tr></tbody></table></center>
    </div>
  );
}

export default App;
