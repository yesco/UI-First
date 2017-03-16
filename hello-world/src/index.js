import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import L from './UI-lang';
import {ref, Map, vertical} from './UI-lang';

// "globals"
window.editors = [];

var SQRLT = vertical(
  [1, L.to, 10],
  [L.sqr],
  [L.lt, 15],
);

var MULT = vertical(
  [{a: [1, L.to, 3]}, undefined],
  [{b: [1, L.to, 3]}, undefined],
  [ ref('a'), L.mult, ref('b') ],
);

var FOO = vertical(
    {
      a: [77, L.plus, 3],
      b: [1,2,3,4],
      c: [ref('^'), L.plus, 10]
    },
  vertical(
    [{aa: [77, L.plus, 3]}],
    [{bb: [1,2,3,4]}],
    [{cc: [ref('^'), L.plus, 10]}]
  )
)

var BAR = vertical(
  [1, L.to, 1000],
  undefined,
  [2, L.plus, 3],
//  undefined,
  [L.plus, 7],
);

//window.program = SQRLT2;
//window.program = MULT;
window.program = BAR;

// f gets Map:ed over program before rerender
function changed(f) {
  if (f) {
    window.program = Map(window.program, f);
  }

  ReactDOM.render(
    <App prog={window.program} editors={window.editors}/>,
    document.getElementById('root')
  );

  //console.log(Print(window.program));
}

window.changed = changed;
changed();
