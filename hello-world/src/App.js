import React, { Component } from 'react';
import './App.css';
import {funcs, Ref, Run} from './UI-lang';

//console.log(Run([1, 2, function(a,b){return a+b;}]));
//console.log(Run([1, 2, function(a,b){return a+b;}, function(a,b){return a*b;}, 5]));

// TODO:move to UI-Lang?
// take user input value and "guess" what it is
// => function/number
function parseValue(s) {
  if (s === null) return s;
  var f = funcs[s];
  var n = parseFloat(s);
  if (f) return f;
  else if (!isNaN(n)) return n;
  return s;
}

function Program(props) {
  var prog = props.prog;
  var res = props.res || [];
  if (!prog) return null;

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
        var v = prog[i];
        v = v instanceof Function ? v.name : v;
        v = parseValue(prompt("New value:", v));
        if (v === null) return;
        prog[i] = v;
        window.changed();
      }
      // onLongPress only work on touch?
      // <td onContextMenu={del} delayLongPress={500} onLongPress={del}>
      return (
        <td xonContextMenu={del} onClick={edit}>
          <Program prog={item} res={res[i]}/>
        </td>
      );
    });

    function add() {
      var v = parseValue(prompt("Add Expression"));
      if (v === null) return;
      prog.push(v);
      window.changed();
    }
    cols.push(<td onClick={add} title="Add" style={{background: 'limegreen', width: '10px'}}>&nbsp;</td>);
    
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
    // display row
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

  // display "simple" values (bottom)
  var color = 'lightgray', txt = prog;
  if (typeof prog === 'number') color = 'white';
  else if (typeof prog === 'string') color = 'white';
  else if (prog instanceof Ref) {
    color = 'cyan';
    txt = <i>{prog.name}</i>
  } else if (typeof prog === 'function') {
    color = '#66FF99';
    function showSource(){
      if (!window.editors.some((x) => (x === prog))) {
        window.editors.push(prog);
        window.changed();
      }
    }
    txt = <b onDrag={showSource} title={prog.doc}>{prog.name}</b>
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
