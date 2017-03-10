////////////////////////////////////////////////////////////////////////////////
// langauge elements
export function Ref(name) {
  this.val = function(env) { return env ? env[name] : undefined; }
  this.name = name;
}

export function ref(name) {
  return new Ref(name);
}

//console.log(ref('a')({a: 3}));
//{ var x = ref('a'); console.log(x(x)); }
//console.log((ref('a')) instanceof Ref);

export function Apply(fun, args) {
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

export function Runn(prog, env, prev) {
  console.log("RUN=>", prog, env, prev);
  var r = Runn(prog, env, prev);
  console.log("<=RUN", r, "of", prog);
  return r;
}

export function Run(prog, env, prev) {
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
    if (a && a.length === 1) return a[0];
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

////////////////////////////////////////////////////////////////////////////////
// initial functions
export function to(f, t) {
  var i, r = [];
  for(i = f; i <= t; i++) {
    r.push(i);
  }
  return r;
}
to.doc = "Give the numbers in the interval, inclusive";

export function sqr(r){ return r*r;}
sqr.doc = "Square the number";

export function lt(x,y){ return x < y ? x : undefined; }
lt.doc = "Keep if less than";

export function mult(a,b){ return a*b; }
mult.doc = "Multiply it with ";

export function plus(a,b){ return a+b; }
plus.doc = "Plus it with ";
 
export var funcs = [to, sqr, lt, mult, plus];
funcs.forEach(function(x){
  funcs[x.name] = x;
});

export default funcs;

