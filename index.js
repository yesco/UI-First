// "globals"
window.editors = [];

var L = funcs;

var SQRLT = vertical(
  [1, L.to, 10],
  [L.sqr],
  [L.lt, 15]
);

var MULT = vertical(
  [{a: [1, L.to, 3]}, undefined],
  [{b: [1, L.to, 3]}, undefined],
  [ ref('a'), L.mult, ref('b') ]
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
  [L.plus, 7]
);

window.program = SQRLT;
//window.program = MULT;
//window.program = BAR;
//window.program = vertical();

// f gets Map:ed over program before rerender
function changed(f) {
  if (f) {
    window.program = Map(window.program, f);
  }

  render(App(window.program, window.editors));
}

window.changed = changed;
changed();
