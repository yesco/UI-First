function Press(body) {
  var timer;
  function down(e) {
    e.preventDefault();
    timer = setTimeout(()=>{
      clearTimeout(timer);
      timer = undefined;
      console.log("PRESS");
      if (this.onLongPress) this.onLongPress(e);
    }, 250);
  }
  function up(e) {
    e.preventDefault();
    if (timer) {
      clearTimeout(timer);
      console.log("CLICK");
      if (this.onTap) this.onTap(e);
    }
    timer = undefined;
  }
  return span(body).a('onMouseDown', down).a('onTouchStart', down).a('onMouseUp', up).a('onTouchEnd', up);
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

function Program(prog, res) {
//  console.log("Program", prog);
  res = res || [];
  if (prog === null || prog === undefined) return div().s('height', '10px').s('background', 'white');

  function add() {
    var v = parseValue(prompt("Add Expression"));
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
      return td(Press(Program(item, res), h('hidden', 'x').a('onClick', del)).a('onTap', edit)).c('ui');
    });

    //cols.push(<td></td>); // make sure there are always two+ columns, otherwise the add will be wide
    cols.push(td(unsafehtml('&nbsp;')).a('onClick', add).a('title', "Add").s('background', 'limegreen').s('width', '15px'));
    
    // Show result under
    if (0) {
      // show result below
      return center(table(tbody(
        tr().s('background', '100%'),
        tr(res !== undefined? '=> '+ res : '')
          .s('align', 'center').s('background', 'white')))
                    .s('width', '100%'));

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
      var hasRes = res && (res instanceof Array && res.length > 0);
      return center(table(tbody(tr(
        cols,
        td(res ? '=> ' + res : '')
          .s('paddingleft', '10px').s('width', '150px').s('maxHeight', '100px')
          .s('maxWidth', '150px').s('align', 'center').s('background', res?'white':'')
          .s('overflow', 'auto').s('wordBreak', 'break-all'))))
                    .s('background', '').s('width', '100%'));
      }
  }
  

  if (prog instanceof Ref)
    ;// later
  else if (typeof(prog) === 'object') {
    // display row
    var rows = Object.keys(prog).map(function(key, i){
      var label = b(key)
        .s('float', 'left').s('margin', '-5px').s('fontSize', '10px')
        .s('background', 'white').s('border', '1px solid black').s('borderRadius', '5px').s('padding', '3px');
      // TODO: this causes program not to render, at error, lol, lol
      //if (!res[key]) return null;
      return tr(td(
        key.match(/^[_0-9]/) ? "" : label,
        Program(prog[key], res[key])));
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

    rows.push(tr(td(unsafehtml('&nbsp;')).s('background', 'limegreen').a('onClick', addLine)));
//          <div style={{background: 'silver', 'text-align': 'center', padding: '10px', 'borderRadius': '10px'}}>
//            {''+res[key]}
//          </div>
    return table(tbody(rows)).s('background', 'lightgreen').s('padding', '0px').s('border', '0px').s('margin', '0px');
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
    txt = Press(prog).a('onLongPress', input);
  } else if (prog instanceof Ref) {
    color = 'cyan';
    txt = i(prog.name);
  } else if (typeof prog === 'function') {
    color = '#66FF99';
    txt = Press(b(prog.name).a('title', prog.doc))
      .a('onLongPress', function(e){ showSource(e, prog); });
  } else {
    color = 'red';
    txt = '' + prog;
  }
  return div(
    div(txt).s('textAlign', 'center').s('padding', '7px').s('background', color))
    .s('padding', '6px');
}

function App(prog, editors) {
  try {
    var res = Run(prog);
  } catch (e) {
    alert(e);
  }

  var fs = funcs.map(function(f){return span(f.name, ' ').a('onClick', function(e){ showSource(e, f) })});

  var eds = editors.map(function(f){
    function remove(e){
      var code = e.target.nextSibling.innerText;
      try {
        var r = eval('(' + code + ')');
        var name = r.name
        register(r, name);

        // Remove from list and display
        window.editors = window.editors.filter(function(x){ return x !== f; });
        window.changed(function(x){return (x === name || x.name === name)? r : x; });
      } catch (e) {
        alert(e);
      }
    }

    var name_rest = f.toString().match(/function (\w+)([\s\S]*)/m);
    var body = span(b(name_rest[1], name_rest[2])
      .s('background', 'lightgreen'))
      .a('contentEditable', true).a('onClick', remove);
    return pre(tt('X')
               .a('onClick', remove)
               .s('float', 'right').s('fontSize', '18px').s('paddingLeft', '10px').s('marginTop', '-5px'),
               body)
      .s('border', '1px solid black').s('textAlign', 'left'),s('padding', '5px').s('margin', '5px');
//      <tt onClick={remove} style={{float: 'right', fontSize: '18px', marginRight: '-10px', marginTop: '10px'}}>save</tt>
  });

  var sortk = Object.keys(res).sort();
  var last = res[sortk[sortk.length-1]];

  return div(div(h2('UI-First'), b(small('(C) 2017 Jonas S Karlsson'))).c('App-header'),
             div(fs), br(), br(),
             div(eds).s('float', 'right'),
             center(table(tbody(tr(td(Program(prog, res)))))),
             div(last.toString()).s('background', 'white')
            ).c('App');
}
