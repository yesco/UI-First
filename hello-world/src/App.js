import React from 'react';
import './App.css';

import {register, funcs, Ref, Run, Vertical} from './UI-lang';

function Press(props) {
  var timer;
  function down(e) {
    e.preventDefault();
    timer = setTimeout(()=>{
      clearTimeout(timer);
      timer = undefined;
      console.log("PRESS");
      if (props.onLongPress) props.onLongPress(e);
    }, 250);
  }
  function up(e) {
    e.preventDefault();
    if (timer) {
      clearTimeout(timer);
      console.log("CLICK");
      if (props.onTap) props.onTap(e);
    }
    timer = undefined;
  }
  return (
    <span onMouseDown={down} onTouchStart={down} onMouseUp={up} onTouchEnd={up}>
      {props.children}
    </span>
  );
}

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

function showSource(e, f){
  e.preventDefault();
  // don't add if already there
  if (!window.editors.some((x) => (x === f))) {
    window.editors.push(f);
    window.changed();
  }
}

function Program(props) {
  var prog = props.prog;
  var res = props.res || [];
  if (prog === null || prog === undefined) return <div style={{height: '10px', background: 'white'}}></div>;

  function add() {
    var v = parseValue(prompt("Add Expression"));
    console.log("ADD", v, prog);
    if (v === null) return;
    prog.push(v);
    window.changed();
  }
  //if (prog instanceof Vertical) return <Program prog={prog.list} res={res}/>;
  // display columns
  if (prog instanceof Vertical) prog = prog.list;

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
        <td key={i} className='ui'><Press onTap={edit}>
          <Program prog={item} res={res[i]}/>
          <hidden onClick={del}>x</hidden>
        </Press></td>
      );
    });

    //cols.push(<td></td>); // make sure there are always two+ columns, otherwise the add will be wide
    cols.push(<td key='new' onClick={add} title="Add" style={{background: 'limegreen', width: '10px'}}>&nbsp;</td>);
    
    // Show result under
    if (0) {
      // show result below
      return (
        <center>
          <table style={{width: '100%'}}><tbody>
             <tr style={{background: ''}}>{cols}</tr>
             <tr style={{align: 'center', background: 'white'}}><td>
               {props.res !== undefined? '=> '+ props.res : '' }
             </td></tr>
          </tbody></table>
        </center>
      )
    } else {
      // Show result on side
      // click to maximize and minimize
      function max(e) {
        var d = e.target, p = d.parentNode;
        p.style.overflow = 'visible';

        d.style.width = '400px';
        d.style.width = '98%';
        d.style.maxHeight = '3000px';
        d.style.background = 'yellow';
        d.style.border = 'solid 1px black';
        d.style.left = '0px';
        d.style.position = 'absolute';
      }
      function min(e) {
        var d = e.target, p = d.parentNode;
        p.style.overflow = 'hidden';

        d.style.background = 'white';
        d.style.width = '';
        d.style.maxHeight = '100px';
        d.style.border = '';
        d.style.position = '';
      }
      function toggle(e) {
        if (e.target.style.position === 'absolute')
          min(e);
        else 
          max(e);
      }
      return (
        <center>
          <table style={{width: '100%'}}><tbody>
            <tr style={{background: ''}}>
              {cols}
              <td style={{paddingLeft: '10px', width: '150px', maxWidth: '150px', align: 'center', background: 'white', overflow: 'auto', wordBreak: 'break-all'}}>
              <div style={{maxHeight: '100px'}} onClick={toggle}>{props.res ? '=> '+ props.res : '' }</div>
              </td>
            </tr>
          </tbody></table>
        </center>
      );
    }
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
          <tr key={i}><td>
          {key.match(/^[_0-9]/) ? "" : label}
          <Program key={key} prog={prog[key]} res={res[key]}/>
        </td></tr>
      );
    });

    function addLine() {
      var id = '_' + new Date().valueOf();
      var oldprog = prog;
      prog = prog[id] = [];
      add();
      if (!prog || prog.length === 0) {
        delete oldprog[id];
        prog = oldprog;
        return;
      }
      window.changed();
    }

    rows.push(<tr key='new'><td style={{background: 'limegreen'}} onClick={addLine}>&nbsp;</td></tr>);
//          <div style={{background: 'silver', 'text-align': 'center', padding: '10px', 'borderRadius': '10px'}}>
//            {''+res[key]}
//          </div>
    return (
//      <table>
      <table style={{background: 'lightgreen', padding: '0px', border: '0px', margin: '0px'}}>
        <tbody>{rows}</tbody>
      </table>
    );
  }

  function input(e) {
    e.preventDefault();
    var v = 'function ' + prog + '(a){\n  \n}\n';
    window.editors.push(v);
    window.changed();
  }

  // display "simple" values (bottom)
  var color = 'lightgray', txt = prog;
  if (typeof prog === 'number') color = 'white';
  else if (typeof prog === 'string') {
    color = 'white';
    // TODO: title='create function - rightclick' 
    txt = <Press onLongPress={input}>{prog}</Press>
  } else if (prog instanceof Ref) {
    color = 'cyan';
    txt = <i>{prog.name}</i>
  } else if (typeof prog === 'function') {
    color = '#66FF99';
    txt = (
      <Press onLongPress={(e) => showSource(e, prog)}>
        <b title={prog.doc}>{prog.name}</b>
      </Press>
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
  try {
    var res = Run(prog);
  } catch (e) {
    alert(e);
  }
  var editors = props.editors;

  var fs = funcs.map((f) => <span key={f} onClick={(e) => showSource(e, f)}> {f.name} </span>);

  var eds = editors.map(function(f){
    function remove(e){
      var code = e.target.nextSibling.innerText;
      try {
        var r = eval('(' + code + ')');
        var name = r.name
        register(r, name);

        // Remove from list and display
        window.editors = window.editors.filter((x) => (x !== f));
        window.changed(function(x){return (x === name || x.name === name)? r : x; });
      } catch (e) {
        alert(e);
      }
    }

    var name_rest = f.toString().match(/function (\w+)([\s\S]*)/m);
    var s = <span contentEditable='true'>function <b style={{background: 'lightgreen'}} onClick={remove}>{name_rest[1]}</b>{name_rest[2]}</span>;
    return <pre style={{border: '1px solid black', textAlign: 'left', padding: '5px', margin: '5px'}}>
      <tt onClick={remove} style={{float: 'right', fontSize: '18px', paddingLeft: '10px', marginTop: '-5px'}}>X</tt>
      {s}
      <span style={{background: 'pink'}}></span>
    </pre>
//      <tt onClick={remove} style={{float: 'right', fontSize: '18px', marginRight: '-10px', marginTop: '10px'}}>save</tt>
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

      <Press onTap={(e)=>console.log("tap")} onLongPress={(e)=>console.log("press")}>
        <div>foobar fie fum</div>
      </Press>

    </div>
  );
}

export default App;
