////////////////////////////////////////////////////////////////////////////////
// langauge elements
function Ref(name) {
  this.val = function(env) {
    if (!env) return;
    if (env[name]) return env[name];
    for (let i in env) {
      var r = env[i];
      if (r) return r;
    }
  }
  this.name = name;
}

function ref(name) {
  return new Ref(name);
}

function Vertical(list) {
  //this.list = Array.prototype.slice.call(list);
  this.list = list;
}

function vertical() {
  return new Vertical(arguments);
}

//console.log(ref('a')({a: 3}));
//{ var x = ref('a'); console.log(x(x)); }
//console.log((ref('a')) instanceof Ref);

function Apply(fun, args) {
  //console.log("APPLY(", fun, args, ")");
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

function Runn(prog, env, prev) {
  console.log("RUN=>", prog, 'env=', env, 'prev=', prev);
  var r = Runn(prog, env, prev);
  console.log("<=RUN", r, "of", prog);
  return r;
}

function Run(prog, env, prev) {
  if (!env) env = {}; // start an env
  if (!prog) return;
  //  if (prog instanceof Ref) return Run(prog.val(env), env);
  if (prog instanceof Ref) return prog.val(env);
  if (prog instanceof Function) return prog;
  if (prog instanceof Vertical) prog = prog.list;
  if (prog instanceof Array) {
    var r = prog.map(function(x){return Run(x, env);});
    var x, f, a = [], first = true;
    while (x = r.shift()) {
      if (x instanceof Function) {
        // 1 2 plus 3 foo => [plus(1 2 3)] foo
        // TODO: handle "arrays"
        if (f) a = [Apply(f, a)];
        f = x;
        if (prev && first && f) a.push(prev);
      } else {
        a.push(x);
      }
      first = false;
    }
    if (f) a = Apply(f, a);
    if (a && a.length === 1) return a[0];
    return a;
  }
  // named items, not implicitly refer to previous value (above)
  if (typeof(prog) === 'object') {
    var p, rr = {};
    for (let k in prog) {
//      prev = rr[k] = env[k] = Run(prog[k], env, undefined);
      prev = rr[k] = env[k] = Run(prog[k], env, prev);
    }
    return rr;
  }
  if (typeof(prog) === 'number') return prog;
  if (typeof(prog) === 'string') return prog;
}

////////////////////////////////////////////////////////////////////////////////
// initial functions
function to(f, t) {
  var i, r = [];
  for(i = f; i <= t; i++) {
    r.push(i);
  }
  return r;
}
to.doc = "Give the numbers in the interval, inclusive";

function sqr(r){ return r*r;}
sqr.doc = "Square the number";

function lt(x,y){ return x < y ? x : undefined; }
lt.doc = "Keep if less than";

function mult(a,b){ return a*b; }
mult.doc = "Multiply it with ";

function plus(a,b){ return a+b; }
plus.doc = "Plus it with ";
 

var funcs = [to, sqr, lt, mult, plus];
funcs.forEach(function(x){
  funcs[x.name] = x;
});
// Read back user defined functions from storage
Object.keys(localStorage).forEach(function(k){
  var f = localStorage[k];
  var name = k.match(/func\/(.*)/);
  if (!name) return;
  name = name[1];

  try {
    f = eval('(' + f + ')');
  } catch (e) {
    alert(e);
  }
  funcs[name] = f;
  funcs.push(f);
});

function register(f, name) {
  // need replace if there
  if (!funcs[name]) {
    funcs.push(f);
  } else {
    funcs.forEach(function(x, i){
      if (x.name == name)
        funcs[i] = f;
    });
  }

  funcs[name] = f;
  // store user defined functions
  localStorage['func/' + name] = f.toString();
}

function Print(p) {
  var r = '';
  if (p === null || p === undefined || typeof(p) === 'number' || typeof(p) === 'string') return '' + p;
  if (typeof(p) === 'function') return '#' + p.name;
  if (p instanceof Ref) return '$' + p.name;

  if (p instanceof Array) {
    r = '[ ';
    for(var i = 0; i < p.length; i++) {
      r += ' ' + Print(p[i]);
    }
    r += ' ]';
    return r;
  }

  if (p instanceof Object) {
    r = '{\n';
    for (var k in p) {
      r += '  ' + k + ': ' + Print(p[k]) + '\n';
    }
    r += '}\n';
    return r;
  }

  return '' + p;
}

function Map(p, f) {
  if (p === null || p === undefined || typeof(p) === 'number' || typeof(p) === 'string') return f(p);
  if (typeof(p) === 'function') return f(p);
  if (p instanceof Ref) return f(p);

  var r;
  if (p instanceof Vertical) return new Vertical(Map(p.list, f));
  if (p instanceof Array) {
    r = [];
    for(var i = 0; i < p.length; i++) {
      r.push(Map(p[i], f));
    }
    return r;
  }

  if (p instanceof Object) {
    r = {};
    for (var k in p) {
      r[k] = Map(p[k], f);
    }
    return r;
  }

  return p;
}

function Copy(p) {
  return Map(p, (x) => x);
}
