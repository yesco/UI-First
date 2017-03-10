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

