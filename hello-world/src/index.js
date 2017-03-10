import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import L from './UI-lang';
import {ref} from './UI-lang';

// "globals"
window.editors = [];

var SQRLT = {
  '_a': [1, L.to, 10],
  // TODO: handle f as well as [f]?
  '_b': [L.sqr],
  '_c': [L.lt, 15]
};

var MULT = {
  a: [1, L.to, 3],
  _a: ["*"],
  _aa: undefined,
  b: [1, L.to, 3],
  _b: ["="],
  _bb: undefined,
  c: [ref('a'), L.mult, ref('b')],
};

function changed() {
  ReactDOM.render(
    <App prog={SQRLT} editors={window.editors}/>,
    document.getElementById('root')
  );
}

window.changed = changed;
changed();


