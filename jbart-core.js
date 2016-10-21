function jb_run(context,parentParam,settings) {
  try {
    var profile = context.profile;
    if (context.probe && (!settings || !settings.noprobe)) {
      if (context.probe.pathToTrace.indexOf(context.path) == 0)
        return context.probe.record(context,parentParam)
    }
    if (profile === null)
      return jb_tojstype(profile,parentParam && parentParam.as,context);
    if (profile.$debugger == 0) debugger;
    if (profile.$asIs) return profile.$asIs;
    if (parentParam && (parentParam.type||'').indexOf('[]') > -1 && ! parentParam.as) // fix to array value. e.g. single feature not in array
        parentParam.as = 'array';

    if (typeof profile === 'object' && Object.getOwnPropertyNames(profile).length == 0)
      return;
    var run = jb_prepare(context,parentParam);
    var jstype = parentParam && parentParam.as;
    context.parentParam = parentParam;
    switch (run.type) {
      case 'booleanExp': return jb_bool_expression(profile, context);
      case 'expression': return jb_tojstype(jb_expression(profile, context,parentParam), jstype, context);
      case 'asIs': return profile;
      case 'object': return jb_entriesToObject(jb_entries(profile).map(e=>[e[0],context.runInner(e[1],null,e[0])]));
      case 'function': return jb_tojstype(profile(context),jstype, context);
      case 'null': return jb_tojstype(null,jstype, context);
      case 'ignore': return context.data;
      case 'list': { debugger; return profile.map(function(inner,i) { jb_run(jb_ctx(context,{profile: inner, path: i})) }) };
      case 'runActions': return jbart.comps.runActions.impl(jb_ctx(context,{profile: { actions : profile },path:''}));
      case 'if': 
		return jb_run(run.ifContext, run.IfParentParam) ? 
          jb_run(run.thenContext, run.thenParentParam) : jb_run(run.elseContext, run.elseParentParam);      
      case 'profile':
        for(var varname in profile.$vars || {})
          run.ctx.vars[varname] = jb_run(jb_ctx(run.ctx,{ profile: profile.$vars[varname], path: '$vars~'+varname }));
        run.preparedParams.forEach(function(paramObj) {
          switch (paramObj.type) {
            case 'function': run.ctx.params[paramObj.name] = paramObj.func; break;
            case 'array': run.ctx.params[paramObj.name] = 
              paramObj.array.map(function(prof,i) { return jb_run(jb_ctx(run.ctx,{profile: prof, path: paramObj.name+'~'+i}),paramObj.param); } ); break;  // maybe we should [].concat and handle nulls
            default: run.ctx.params[paramObj.name] = jb_run(paramObj.context, paramObj.param);
          }
        });
        var out;
        if (run.impl) {
          run.args = prepareGCArgs(run.ctx,run.preparedParams);
          if (profile.$debugger) debugger;
          out = run.impl.apply(null,run.args);
        }
        else {
          run.ctx.callerPath = context.path;
          out = jb_run(jb_ctx(run.ctx, { componentContext: run.ctx }),parentParam);
        }

        if (profile.$log)
          jbart.comps.log.impl(context, (profile.$log == true) ? out : jb_run( jb_ctx(context, { profile: profile.$log, data: out, vars: { data: context.data } })));

        if (profile.$trace) console.log('trace: ' + context.path, jb_compName(profile),context,out,run);
          
        return jb_tojstype(out,jstype, context);
    }
  } catch (e) {
    if (context.vars.$throw) throw e;
    jb_logException(e,'exception while running jb_run');
  }

  function prepareGCArgs(ctx,preparedParams) {
    return [ctx].concat(preparedParams.map(param=>ctx.params[param.name]))
  }
}

function jb_compParams(comp) {
  return Array.isArray(comp.params) ? comp.params : jb_entries(comp.params).map(x=>jb_extend(x[1],jb_obj('id',x[0])));
}

function jb_prepareParams(comp,profile,ctx) {
  return jb_compParams(comp)
    .filter(comp=> 
      !comp.ignore)
    .map((param,index) => {
      var p = param.id;
      var val = profile[p], path =p;
      if (!val && index == 0 && jb_sugarProp(profile)) {
        path = jb_sugarProp(profile)[0];
        val = jb_sugarProp(profile)[1]; 
      }
      var valOrDefault = (typeof(val) != "undefined") ? val : (typeof(param.defaultValue) != 'undefined') ? param.defaultValue : null;
      var valOrDefaultArray = valOrDefault ? valOrDefault : []; // can remain single, if null treated as empty array
      var arrayParam = param.type && param.type.indexOf('[]') > -1 && Array.isArray(valOrDefaultArray);

      if (param.dynamic) {
        if (arrayParam)
          var func = (ctx2,data2) => 
            jb_flattenArray(valOrDefaultArray.map((prof,i)=>
              ctx.extendVars(ctx2,data2).runInner(prof,param,path+'~'+i)))
        else
          var func = (ctx2,data2) => 
                valOrDefault != null ? ctx.extendVars(ctx2,data2).runInner(valOrDefault,param,path) : valOrDefault;

        Object.defineProperty(func, "name", { value: p }); // for debug
        func.profile = (typeof(val) != "undefined") ? val : (typeof(param.defaultValue) != 'undefined') ? param.defaultValue : null;
        func.srcPath = ctx.path;
        return { name: p, type: 'function', func: func };
      } 

      if (arrayParam) // array of profiles
        return { name: p, type: 'array', array: valOrDefaultArray, param: {} };
      else 
        return { name: p, type: 'run', context: jb_ctx(ctx,{profile: valOrDefault, path: p}), param: param };
  })
}

function jb_prepare(context,parentParam) {
  var profile = context.profile;
  var profile_jstype = typeof profile;
  var parentParam_type = parentParam && parentParam.type;
  var jstype = parentParam && parentParam.as;
  var isArray = Array.isArray(profile);

  if (profile_jstype === 'string' && parentParam_type === 'boolean') return { type: 'booleanExp' };
  if (profile_jstype === 'boolean' || profile_jstype === 'number' || parentParam_type == 'asIs') return { type: 'asIs' };// native primitives
  if (profile_jstype === 'object' && jstype === 'object') return { type: 'object' };
  if (profile_jstype === 'string') return { type: 'expression' };
  if (profile_jstype === 'function') return { type: 'function' };
  if (profile_jstype === 'object' && !isArray && jb_entries(profile).filter(p=>p[0].indexOf('$') == 0).length == 0) return { type: 'asIs' };
  if (profile_jstype === 'object' && (profile instanceof RegExp)) return { type: 'asIs' };
  if (profile == null) return { type: 'asIs' };

  if (isArray) {
    if (!profile.length) return { type: 'null' };
    if (!parentParam || !parentParam.type || parentParam.type === 'data' ) //  as default for array
      return { type: 'list' };
    if (parentParam_type === 'action' || parentParam_type === 'action[]' && profile.isArray) {
      profile.sugar = true;
      return { type: 'runActions' };
    }
  } else if (profile.$if) 
  return {
      type: 'if',
      ifContext: jb_ctx(context,{profile: profile.$if, path: '$if'}),
      IfParentParam: { type: 'boolean', as:'boolean' },
      thenContext: jb_ctx(context,{profile: profile.then || 0 , path: '~then'}),
      thenParentParam: { type: parentParam_type, as:jstype },
      elseContext: jb_ctx(context,{profile: profile['else'] || 0 , path: '~else'}),
      elseParentParam: { type: parentParam_type, as:jstype }
    }
  var comp_name = jb_compName(profile);
  if (!comp_name) 
    return { type: 'ignore' }
  var comp = jbart.comps[comp_name];
  if (!comp && comp_name) { jb_logError('component ' + comp_name + ' is not defined'); return { type:'null' } }
  if (!comp.impl) { jb_logError('component ' + comp_name + ' has no implementation'); return { type:'null' } }

  var ctx = new jbCtx(context,{});
  ctx.parentParam = parentParam;
  ctx.params = {}; // TODO: try to delete this line
  var preparedParams = jb_prepareParams(comp,profile,ctx);
  if (typeof comp.impl === 'function') {
    Object.defineProperty(comp.impl, "name", { value: comp_name }); // comp_name.replace(/[^a-zA-Z0-9]/g,'_')
    return { type: 'profile', impl: comp.impl, ctx: ctx, preparedParams: preparedParams }
  } else
    return { type:'profile', ctx: jb_ctx(ctx,{profile: comp.impl, comp: comp_name, path: ''}), preparedParams: preparedParams };
}

function jb_resolveFinishedPromise(val) {
  if (!val) return val;
  if (val.$jb_parent) 
    val.$jb_parent = jb_resolveFinishedPromise(val.$jb_parent);
  if (val && typeof val == 'object' && val._state == 1) // finished promise
    return val._result; 
  return val; 
}

function jb_var(context,varname) {
  var res;
  if (context.componentContext && typeof context.componentContext.params[varname] != 'undefined') 
    res = context.componentContext.params[varname];
  else if (context.vars[varname] != null) 
    res = context.vars[varname];
  else if (context.vars.scope && context.vars.scope[varname] != null) 
    res = context.vars.scope[varname];
  else if (context.resources && context.resources[varname] != null) 
    res = context.resources[varname];
  return jb_resolveFinishedPromise(res);
}

function jb_expression(expression, context, parentParam) {
  var jstype = parentParam && parentParam.as;
  expression = '' + expression;
  if (jstype == 'boolean') return jb_bool_expression(expression, context);
  if (expression.indexOf('$debugger:') == 0) {
    debugger;
    expression = expression.split('$debugger:')[1];
  }
  if (expression.indexOf('$log:') == 0) {
    var out = jb_expression(expression.split('$log:')[1],context,parentParam);
    jbart.comps.log.impl(context, out);
    return out;
  }
  if (expression.indexOf('%') == -1 && expression.indexOf('{') == -1) return expression;
  // if (context && !context.ngMode)
  //   expression = expression.replace(/{{/g,'{%').replace(/}}/g,'%}')
  if (expression == '{%%}' || expression == '%%')
      return expPart('',context,jstype);

  if (expression.lastIndexOf('{%') == 0 && expression.indexOf('%}') == expression.length-2) // just one expression filling all string
    return expPart(expression.substring(2,expression.length-2),context,jstype);

  expression = expression.replace(/{%(.*?)%}/g, function(match,contents) {
      return jb_tostring(expPart(contents,context,'string'));
  })
  expression = expression.replace(/{\?(.*?)\?}/g, function(match,contents) {
      return jb_tostring(conditionalExp(contents));
  })
  if (expression.match(/^%[^%;{}\s><"']*%$/)) // must be after the {% replacer
    return expPart(expression.substring(1,expression.length-1),context,jstype);

  expression = expression.replace(/%([^%;{}\s><"']*)%/g, function(match,contents) {
      return jb_tostring(expPart(contents,context,'string'));
  })

  function conditionalExp(expression) {
    // check variable value - if not empty return all expression, otherwise empty
    var match = expression.match(/%([^%;{}\s><"']*)%/);
    if (match && jb_tostring(expPart(match[1],context,'string')))
      return jb_expression(expression, context, { as: 'string' });
    else
      return '';
  }

  function expPart(expressionPart,context,jstype) {
    return jb_resolveFinishedPromise(jb_evalExpressionPart(expressionPart,context,jstype))
  }

  return expression;
}


function jb_evalExpressionPart(expressionPart,context,jstype) {
  if (!jbart.jstypes) jb_initJstypes();
 
  // example: {{$person.name}}.     
  if (expressionPart == ".") expressionPart = "";

  // empty primitive expression
  if (!expressionPart && (jstype == 'string' || jstype == 'boolean' || jstype == 'number')) 
    return jbart.jstypes[jstype](context.data);

  if (expressionPart.indexOf('=') == 0) { // function
    var parsed = expressionPart.match(/=([a-zA-Z]*)\(?([^)]*)\)?/);
    var funcName = parsed && parsed[1];
    if (funcName && jbart.functions[funcName])
      return jb_tojstype(jbart.functions[funcName](context,parsed[2]),jstype,context);
  }

  var parts = expressionPart.split(/[.\/]/);
  var item = context.data;

  for(var i=0;i<parts.length;i++) {
    var part = parts[i], index, match;
    if ((match = part.match(/(.*)\[([0-9]+)\]/)) != null) { // x[y]
      part = match[1];
      index = Number(match[2]);
    }
    if (part == '') ;
    else if (part == '$parent' && item.$jb_parent && i > 0) 
      item = item.$jb_parent;
    else if (part.charAt(0) == '$' && i == 0 && part.length > 1)
      item = jb_var(context,part.substr(1));

    else if (Array.isArray(item))
      item = jb_map(item,function(inner) {
        return typeof inner === "object" ? jb_objectProperty(inner,part,jstype,i == parts.length -1) : inner;
      });
    else if (typeof item === 'object')
      item = item && jb_objectProperty(item,part,jstype,i == parts.length -1);
    else if (index && Array.isArray(item)) 
      item = item[index];
    else
      item = null; // no match
    if (!item) 
      return item;	// 0 should return 0
  }
  return item;
}

function jb_bool_expression(expression, context) {
  if (expression.indexOf('$debugger:') == 0) {
    debugger;
    expression = expression.split('$debugger:')[1];
  }
  if (expression.indexOf('$log:') == 0) {
    var calculated = jb_expression(expression.split('$log:')[1],context,{as: 'string'});
    var result = jb_bool_expression(expression.split('$log:')[1], context);
    jbart.comps.log.impl(context, calculated + ':' + result);
    return result;
  }
  if (expression.indexOf('!') == 0)
    return !jb_bool_expression(expression.substring(1), context);
  var parts = expression.match(/(.+)(==|!=|<|>|>=|<=|\^=|\$=)(.+)/);
  if (!parts) {
    var asString = jb_expression(expression, context, {as: 'string'});
    return !!asString && asString != 'false';
  }
  if (parts.length != 4)
    return jb_logError('invalid boolean expression: ' + expression);
  var op = parts[2].trim();

  if (op == '==' || op == '!=' || op == '$=' || op == '^=') {
    var p1 = jb_tostring(jb_expression(trim(parts[1]), context, {as: 'string'}))
    var p2 = jb_tostring(jb_expression(trim(parts[3]), context, {as: 'string'}))
    // var p1 = jb_expression(trim(parts[1]), context, {as: 'string'});
    // var p2 = jb_expression(trim(parts[3]), context, {as: 'string'});
    p2 = (p2.match(/^["'](.*)["']/) || [,p2])[1]; // remove quotes
    if (op == '==') return p1 == p2;
    if (op == '!=') return p1 != p2;
    if (op == '^=') return p1.lastIndexOf(p2,0) == 0; // more effecient
    if (op == '$=') return p1.indexOf(p2, p1.length - p2.length) !== -1;
  }

  var p1 = jb_tojstype(jb_expression(parts[1].trim(), context), {as:'number'});
  var p2 = jb_tojstype(jb_expression(parts[3].trim(), context), {as:'number'});

  if (op == '>') return p1 > p2;
  if (op == '<') return p1 < p2;
  if (op == '>=') return p1 >= p2;
  if (op == '<=') return p1 <= p2;

  function trim(str) {  // trims also " and '
    return str.trim().replace(/^"(.*)"$/,'$1').replace(/^'(.*)'$/,'$1');
  }
}

function jb_tojstype(value,jstype,context) {
  if (!jstype) return value;
  if (!jbart.jstypes) jb_initJstypes();
  if (typeof jbart.jstypes[jstype] != 'function') debugger;
  return jbart.jstypes[jstype](value,context);
}
function jb_tostring(value) { return jb_tojstype(value,'string'); }
function jb_toarray(value) { return jb_tojstype(value,'array'); }
function jb_toboolean(value) { return jb_tojstype(value,'boolean'); }
function jb_tosingle(value) { return jb_tojstype(value,'single'); }
function jb_tonumber(value) { return jb_tojstype(value,'number'); }

function jb_initJstypes() {
  jbart.jstypes = {
    'asIs': x => x,
    'object': x => x,
    'string': function(value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null) return '';
      value = jb_val(value);
      if (typeof(value) == 'undefined') return '';
      return '' + value;
    },
    'number': function(value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null || value == undefined) return null;	// 0 is not null
      value = jb_val(value);
      var num = Number(value);
      return isNaN(num) ? null : num;
    },
    'array': function(value) {
      if (Array.isArray(value)) return value;
      if (value == null) return [];
      return [value];
    },
    'boolean': function(value) {
      if (Array.isArray(value)) value = value[0];
      return jb_val(value) ? true : false;
    },
    'single': function(value) {
      if (Array.isArray(value)) return value[0];
      if (!value) return value;
      value = jb_val(value);
      return value;
    },
    'ref': function(value) {
      if (Array.isArray(value)) value = value[0];
      if (value == null) return value;
      if (value && (value.$jb_parent || value.$jb_val))
        return value;
      return { $jb_val: () => value }
    }
  }
}

function jb_profileType(profile) {
  if (!profile) return '';
  if (typeof profile == 'string') return 'data';
  var comp_name = jb_compName(profile);
  return (jbart.comps[comp_name] && jbart.comps[comp_name].type) || '';
}

function jb_sugarProp(profile) {
  return jb_entries(profile)
    .filter(p=>p[0].indexOf('$') == 0 && p[0].length > 1)
    .filter(p=>['$vars','$debugger','$log'].indexOf(p[0]) == -1)[0]
}

function jb_compName(profile) {
  if (!profile) return;
  if (profile.$) return profile.$;
  var f = jb_sugarProp(profile);
  return f && f[0].slice(1);
}

// give a name to the impl function. Used for tgp debugging
function jb_assignNameToFunc(name, fn) {
  Object.defineProperty(fn, "name", { value: name });
  return fn;
} 

function jb_equals(x,y) {
  return x == y || jb_val(x) == jb_val(y)
}

function jb_writeValue(to,val) {
  if (!to) return;
  if (to.$jb_val) 
    return to.$jb_val(jb_val(val));
  if (to.$jb_parent)
    to.$jb_parent[to.$jb_property] = jb_val(val);
}

function jb_writeToResource(resource,val,ctx) {
  if (resource)
    ctx.resources[resource] = val;
}

function jb_objectProperty(object,property,jstype,lastInExpression) {
  if (!object) return null;
  if (typeof object[property] == 'undefined') 
    object[property] = lastInExpression ? null : {};
  if (lastInExpression) {
    if (jstype == 'string' || jstype == 'boolean' || jstype == 'number')
      return jbart.jstypes[jstype](object[property]); // no need for valueByRef
    if (jstype == 'ref')
      return { $jb_parent: object, $jb_property: property };
  }
  return object[property];
}

function jb_val(val) {
  if (val == null) return val;
  if (val.$jb_val) return val.$jb_val();
  return (val.$jb_parent) ? val.$jb_parent[val.$jb_property] : val;
}

function jb_handledObject(object) {
  return object
}

function jb_initJbartObject() {
  jbart.classes = jbart.classes || {};
}

function jb_profile(profile) {  
  return profile;   // TODO: add support for alt-N
}

function jb_component(compName,component) {
  jbart.comps[compName] = jb_handledObject(component);
  if (jbart.currentFileName) 
    jb_path(jbart,['studio','componentFiles',compName],jbart.currentFileName);
  return function(options) { 
    if (typeof options == 'string') {
      var out = {};
      out['$'+compName] = options;
      return out;
    } else if (typeof options == 'object') {
      options.$ = compName;
      return options;
    } else
      return {$: compName}
  }
}

function jb_type(typeName,typeObj) {
  jb_path(jbart,['types',typeName],typeObj || {});
}

function jb_function(funcName, func) {
  jb_path(jbart,['functions',funcName],func);
}

function jb_resource(widgetName,name,resource) {
  jb_path(jbart_widgets,[widgetName,'resources',name],jb_handledObject(resource));

  if (jbart.currentFileName) 
    jb_path(jbart,['studio','componentFiles',widgetName + '-' + name],jbart.currentFileName);
}

function jb_tests(widgetName,tests) {
  jbart_widgets[widgetName] = jbart_widgets[widgetName] || {};
  jbart_widgets[widgetName].tests = jb_extend(jbart_widgets[widgetName].tests || {},tests);

  Object.getOwnPropertyNames(tests).forEach(function(id) { 
    jbart.comps['__'+id] = { impl: tests[id]}
  })
}

jbart.ctxCounter = jbart.ctxCounter || 0;
jbart.ctxDictionary = jbart.ctxDictionary || {};

function jbCtx(context,ctx2) {
  this.id = jbart.ctxCounter++;
  this._parent = context;
  if (typeof context == 'undefined') {
    this.vars = {};
    this.params = {};
    this.resources = {}
  }
  else {
    if (ctx2.profile && ctx2.path == null) {
      debugger;
      ctx2.path = '?';
    }
    this.profile = (typeof(ctx2.profile) != 'undefined') ?  ctx2.profile : context.profile;

    this.path = (context.path || '') + (ctx2.path ? '~' + ctx2.path : '');
    if (ctx2.comp)
      this.path = ctx2.comp;
    this.data= (typeof ctx2.data != 'undefined') ? ctx2.data : context.data;     // allow setting of data:null
    this.vars= ctx2.vars ? jb_extend({},context.vars,ctx2.vars) : context.vars;
    this.params= ctx2.params || context.params;
    this.resources= context.resources;
    this.componentContext= (typeof ctx2.componentContext != 'undefined') ? ctx2.componentContext : context.componentContext;
    this.probe= context.probe;
  }
}

jbCtx.prototype = {
  run: function(profile,parentParam,path) { 
    if (path != null)
      debugger;
    return jb_run(jb_ctx(this,{ profile: profile, comp: profile.$ , path: ''}), parentParam) },
  exp: function(expression,jstype) { return jb_expression(expression, this, {as: jstype}) },
  setVars: function(vars) { return new jbCtx(this,{vars: vars}) },
  setData: function(data) { return new jbCtx(this,{data: data}) },
  runInner: function(profile,parentParam, path) { return jb_run(new jbCtx(this,{profile: profile,path: path}), parentParam) },
//  str: function(profile) { return this.run(profile, { as: 'string'}) },
  bool: function(profile) { return this.run(profile, { as: 'boolean'}) },
  // keeps the context vm and not the caller vm - needed in studio probe
  ctx: function(ctx2) { return new jbCtx(this,ctx2) },
  win: function() { return window }, // used for multi windows apps. e.g., studio
  extendVars: function(ctx2,data2) { 
    if (ctx2 == null && data2 == null)
      return this;
    return new jbCtx(this,{ vars: ctx2.vars, data: (data2 == null) ? ctx2.data : data2 })
  },
  runItself: function(parentParam,settings) { return jb_run(this,parentParam,settings) },
}

function jb_ctx(context,ctx2) {
  return new jbCtx(context,ctx2);
}

// end: context creation functions

function jb_profileHasValue(context,paramName) {
  return typeof context.profile[paramName] != 'undefined';
}

function jb_logError(errorStr,errorObj) {
  jbart.logs = jbart.logs || {};
  jbart.logs.error = jbart.logs.error || [];
  jbart.logs.error.push(errorStr);
  jb_trigger(jbart.logs,'add',{ type: 'error', text: errorStr });
  console.error(errorStr,errorObj);
}

function jb_logPerformance(type,text) {
  jb_path(jbart,['logPerf',type],(jb_path(jbart,['logPerf',type]) || 0) +1);
//  console.log(type,text||'',jb_path(jbart,['logPerf',type]))
}

function jb_logException(e,errorStr) {
  jb_logError('exception: ' + errorStr + "\n" + (e.stack||''));
}

// functions
function jb_extend(obj,obj1,obj2,obj3) {
  if (!obj) return;
  Object.getOwnPropertyNames(obj1||{})
    .forEach(function(p) { obj[p] = obj1[p] })
  Object.getOwnPropertyNames(obj2||{})
    .forEach(function(p) { obj[p] = obj2[p] })
  Object.getOwnPropertyNames(obj3||{})
    .forEach(function(p) { obj[p] = obj3[p] })

  return obj;
}
function jb_each(array,func) {
  for(var i=0;i<array.length;i++)
    func(array[i],i);
}
function jb_map(array,func) {
  var res = [];
  for(var i in array) {
    if (i.indexOf('$jb') == 0) continue;
    var item = func(array[i],i);
    if (Array.isArray(item))
      res = res.concat(item); // to check is faster than: for(var i=0;i<item.length;i++) res.push(item[i]);
    else if (item != null)
      res.push(item);
  }
  return res;
}
function jb_path(object,path,value) {
  var cur = object;

  if (typeof value == 'undefined') {  // get
    for(var i=0;i<path.length;i++) {
      cur = cur[path[i]];
      if (cur == null || typeof cur == 'undefined') return null;
    }
    return cur;
  } else { // set
    for(var i=0;i<path.length;i++)
      if (i == path.length-1)
        cur[path[i]] = value;
      else
        cur = cur[path[i]] = cur[path[i]] || {};
    return value;
  }
}

function jb_firstProp(obj) {
  for(var i in obj)
    if (obj.hasOwnProperty(i)) 
      return i;
  return '';
}

function jb_obj(k,v,base) {
  var ret = base || {};
  ret[k] = v;
  return ret;
}
function jb_cleanSystemProps(obj) {
  var ret = {};
  for(var i in obj) 
    if (! i.indexOf('$jb_') == 0)
      ret[i] = obj[i];

  return ret;
}
// Object.getOwnPropertyNames does not keep the order
function jb_ownPropertyNames(obj) {
  var res = [];
  for (var i in (obj || {}))
    if (obj.hasOwnProperty(i))
      res.push(i);
  return res;
}

function jb_pushItemOrArray(arr,item) {
  // adds item to arr. if item is null, it is not added. if item is an array, all of its items are added. if it's a single object, it's just added
  if (typeof item == 'undefined' || item === null) return;
  if (!Array.isArray(item)) return arr.push(item);
  for(var i=0;i<item.length;i++)
    arr.push(item[i]);
}


function jb_bind(object,eventType,handler,identifier,elementForAutoUnbind,addAsFirstListener) {
  if (!object) return;
  object.$jbListeners = object.$jbListeners || {};
  object.$jbListeners.counter = object.$jbListeners.counter || 0;
  var listenerID = ++object.$jbListeners.counter;

  var listeners = object.$jbListeners[eventType] = object.$jbListeners[eventType] || [];

  for(var i=0;i<listeners.length;i++) {
    if (identifier && listeners[i].eventType == eventType && listeners[i].identifier == identifier) {
      listeners[i].handler = handler;
      return;
    }
  }
  var item = {eventType: eventType, handler: handler, identifier: identifier, listenerID: listenerID };
  if (addAsFirstListener)
    listeners.unshift(item);
  else
    listeners.push(item); 

  if (elementForAutoUnbind) {
    jb_onElementDetach(elementForAutoUnbind,function() { 
      jb_unbind(object,listenerID);
    });
  }

  return listenerID;
}

function jb_unbind(object,listenerID) {
  if (!object || !object.$jbListeners) return;

  for(var i in object.$jbListeners) {
    var listeners = object.$jbListeners[i];
    if (!listeners.length) continue;

    for(var j=0;j<listeners.length;j++) {
      if (listeners[j].listenerID == listenerID) {
        listeners.splice(j,1);
        return;
      }
    } 
  }
}

function jb_trigger(object,eventType,eventObject) {
  if (!object || !object.$jbListeners || !object.$jbListeners[eventType]) return;
  eventObject = eventObject || {};
  eventObject.eventType = eventType;
  var params = [eventObject].concat(Array.prototype.slice.call(arguments,3));
  
  var listeners = object.$jbListeners[eventType];
  for(var i=0;i<listeners.length;i++) {
    try {
      listeners[i].handler.apply(object,params);
    } catch(e) {
      jb_logException(e,'error trigerring event ' + eventType);
    }
  } 
}

function jb_cloneData(data) {
  if (!data) return null;
  if (data.nodeType) return $(data).clone(true)[0];
  if (typeof data != 'object') return data;

  if (Array.isArray(data))
    return data.map(function(item) { return jb_cloneData(item); })
  
  var out = {};
  for(var propName in data)
    if (propName.indexOf('$jb_') != 0) 
      out[propName] = jb_cloneData(data[propName]);
  return out;
}

jbart.run = function(context,data) {
  if (!context.profile) {
    context = jb_ctx(jb_ctx(), {profile: jb_profile(context), data: data });
  }
  return jb_run(context);
}

function jb_ref(obj,top) {
  if (typeof obj === 'string') {
    console.log('can find a ref for string: ' + obj);
    return null;
  }
  for(var i in top) {  
    if (i.indexOf('$jb') === 0 || (!top.hasOwnProperty(i))) continue;
    if (top[i] === obj) 
      return { parent: top, prop: i};
    if (typeof top[i] === 'object') {
      var res = jb_ref(obj,top[i]);
      if (res) 
        return res;
    }
  }
}

function jb_delay(ms,ctx) {
  if (ctx && ctx.vars.ngZone)
    return ctx.vars.ngZone.runOutsideAngular(() =>
        new Promise(resolve => setTimeout(resolve, ms)))

  return new Promise(resolve => setTimeout(resolve, ms));
}

function jb_compareArrays(arr1, arr2) {
  if (arr1 == arr2)
    return true;
  if (!Array.isArray(arr1) && !Array.isArray(arr2)) return arr1 == arr2;
  if (!arr1 || !arr2 || arr1.length != arr2.length) return false;
  for (var i = 0; i < arr1.length; i++)
    if (arr1[i] !== arr2[i]) return false;
  return true;
}

 function jb_range(start, count) {
    return Array.apply(0, Array(count)).map((element, index) => index + start);
}

function jb_entries(obj) {
  if (!obj || typeof obj != 'object') return [];
  var ret = [];
  for(var i in obj) // keeps definition order
      if (obj.hasOwnProperty(i)) 
        ret.push([i,obj[i]])
  return ret;
}

function jb_entriesToObject(entries) {
  var ret = {};
  entries.map(e=>ret[e[0]]=e[1]);
  return ret;
}

function jb_flattenArray(items) {
  var out = [];
  items.filter(i=>i).forEach(function(item) { 
    if (Array.isArray(item)) 
      out = out.concat(item);
    else 
      out.push(item);
  })
  return out;
}

function jb_isProfOfType(prof,type) {
  var types = ((jbart.comps[jb_compName(prof)] || {}).type || '').split('[]')[0].split(',');
  return types.indexOf(type) != -1;
}

// usage: .filter( jb_unique(x=>x.id) )
function jb_unique(mapFunc) { 
  function onlyUnique(value, index, self) { 
      return self.map(mapFunc).indexOf(mapFunc(value)) === index;
  }
  return onlyUnique;
}

function jb_prettyPrintComp(compId,comp) {
  if (comp)
    return "jb.component('" + compId + "', "
      + jb_prettyPrintWithPositions(comp).result + ')'
}

function jb_prettyPrint(profile,colWidth,tabSize,initialPath) {
  return jb_prettyPrintWithPositions(profile,colWidth,tabSize,initialPath).result;
}

function jb_prettyPrintWithPositions(profile,colWidth,tabSize,initialPath) {
  colWidth = colWidth || 80;
  tabSize = tabSize || 2;

  var remainedInLine = colWidth;
  var result = '';
  var depth = 0;
  var lineNum = 0;
  var positions = {};

  printValue(profile,initialPath || '');
  return { result : result, positions : positions }

  function sortedPropertyNames(obj) {
    var props = jb_entries(obj)
      .filter(p=>p[1] != null)
      .map(x=>x[0]) // try to keep the order
      .filter(p=>p.indexOf('$jb') != 0)

    var comp_name = jb_compName(obj);
    if (comp_name) { // tgp obj - sort by params def
      var params = ((jbart.comps[comp_name] || {}).params || []).map(p=>p.id);
      props.sort((p1,p2)=>params.indexOf(p1) - params.indexOf(p2));
    }
    if (props.indexOf('$') > 0) { // make the $ first
      props.splice(props.indexOf('$'),1);
      props.unshift('$');
    }
    return props;
  }

  function printValue(val,path) {
    positions[path] = lineNum;
    if (!val) return;
    if (val.$jb_arrayShortcut)
      val = val.items;
    if (Array.isArray(val)) return printArray(val,path);
    if (typeof val === 'object') return printObj(val,path);
    if (typeof val === 'string' && val.indexOf('$jbProbe:') == 0)
      val = val.split('$jbProbe:')[1];
    if (typeof val === 'function')
      result += val.toString();
    else if (typeof val === 'string' && val.indexOf('\n') == -1) 
      result += "'" + val + "'";
    else if (typeof val === 'string' && val.indexOf('\n') != -1) {
      result += "`" + val.replace(/`/g,'\\`') + "`"
      // depth++;
      // result += "`";
      // var lines = val.split('\n');
      // lines.forEach((line,index)=>{
      //     result += line.trim(); 
      //     if(index<lines.length-1) 
      //       newLine();
      // })
      // depth--;
      // result += "`";
    }  else
      result += JSON.stringify(val);
  }

  function printObj(obj,path) {
      var obj_str = flat_obj(obj);
      if (!printInLine(obj_str)) { // object does not fit in parent line
        depth++;
        result += '{';
        if (!printInLine(obj_str)) { // object does not fit in its own line
          sortedPropertyNames(obj).forEach(function(prop,index,array) {
              if (prop != '$')
                newLine();
              if (obj[prop] != null) {
                printProp(obj,prop,path);
                if (index < array.length -1)
                  result += ', ';//newLine();
              }
          });
        }
        depth--;
        newLine();
        result += '}';
      }
  }
  function quotePropName(p) {
    if (p.match(/^[$a-zA-Z_][$a-zA-Z0-9_]*$/))
      return p;
    else
      return `"${p}"`
  }
  function printProp(obj,prop,path) {
    if (obj[prop] && obj[prop].$jb_arrayShortcut)
      obj = jb_obj(prop,obj[prop].items);

    if (printInLine(flat_property(obj,prop))) return;

    if (prop == '$')
      result += '$: '
    else
      result += quotePropName(prop) + (jb_compName(obj[prop]) ? ' :' : ': ');
    //depth++;
    printValue(obj[prop],path+'~'+prop);
    //depth--;
  }
  function printArray(array,path) {
    if (printInLine(flat_array(array))) return;
    result += '[';
    depth++;
    newLine();
    array.forEach(function(val,index) {
      printValue(val,path+'~'+index);
      if (index < array.length -1) {
        result += ', ';
        newLine();
      }
    })
    depth--;newLine();
    result += ']';
  }
  function printInLine(text) {
    if (remainedInLine < text.length || text.match(/:\s?{/) || text.match(/, {\$/)) return false;
    result += text;
    remainedInLine -= text.length;
    return true;
  }
  function newLine() {
    result += '\n';
    lineNum++;
    for (var i = 0; i < depth; i++) result += '               '.substr(0,tabSize);
    remainedInLine = colWidth - tabSize * depth;
  }
  function flat_obj(obj) {
    var props = sortedPropertyNames(obj)
      .filter(p=>obj[p] != null)
      .filter(x=>x!='$')
      .map(prop => 
      quotePropName(prop) + ': ' + flat_val(obj[prop]));
    if (obj && obj.$) {
      props.unshift("$: '" + obj.$+ "'");
      return '{' + props.join(', ') + ' }'
    }
    return '{ ' + props.join(', ') + ' }'
  }
  function flat_property(obj,prop) {
    if (jb_compName(obj[prop]))
      return quotePropName(prop) + ' :' + flat_val(obj[prop]);
    else
      return quotePropName(prop) + ': ' + flat_val(obj[prop]);
  }
  function flat_val(val) {
    if (Array.isArray(val)) return flat_array(val);
    if (typeof val === 'object') return flat_obj(val);
    if (typeof val === 'function') return val.toString();
    if (typeof val === 'string') 
      return "'" + val + "'";
    else
      return JSON.stringify(val); // primitives
  }
  function flat_array(array) {
    return '[' + array.map(item=>flat_val(item)).join(', ') + ']';
  }
}

jb_type('control',{description: "can be rendered to create a HTML control"});
jb_type('data',{description: "The most basic type of jbart. returns a data (usually without side effects)"});
jb_type('aggregator');
jb_type('boolean',{description: "Returns true/false"});
jb_type('action',{description: "Does some action"});
jb_type('dataResource');
jb_type('feature');

jb_component('call',{
 	type: '*',
 	params: [
 		{ id: 'param', as: 'string' }
 	],
 	impl: function(context,param) {
 	  var paramObj = context.componentContext && context.componentContext.params[param];
      if (typeof(paramObj) == 'function')
 		return paramObj(jb_ctx(context, { 
 			data: context.data, 
 			vars: context.vars, 
 			componentContext: context.componentContext.componentContext,
 			comp: paramObj.srcPath // overrides path - use the former path
 		}));
      else
        return paramObj;
 	}
});

jb_component('pipeline',{
	type: "data",
	params: [
		{ id: 'items', type: "data,aggregator[]", ignore: true, essential: true, composite: true }
	],
	impl: function(context,items) {
		var data = jb_toarray(context.data);
		var curr = [data[0]]; // use only one data item, the first or null
		if (typeof context.profile.items == 'string')
			return context.runInner(context.profile.items,null,'items');
		var profiles = jb_toarray(context.profile.items || context.profile['$pipeline']);
		if (context.profile.items && context.profile.items.sugar)
			var innerPath =  '' ;
		else 
			var innerPath = context.profile['$pipeline'] ? '$pipeline~' : 'items~';

		profiles.forEach(function(profile,i) {
			var parentParam = (i == profiles.length - 1 && context.parentParam) ? context.parentParam : { as: 'array'};
			if (jb_profileType(profile) == 'aggregator')
				curr = jb_run(jb_ctx(context,	{ data: curr, profile: profile, path: innerPath+i }), parentParam);
			else 
				curr = [].concat.apply([],curr.map(function(item) {
					return jb_run(jb_ctx(context,{data: item, profile: profile, path: innerPath+i}), parentParam);
				})).filter(notNull);
		});
		return curr;
		function notNull(value) { return value != null; }
  }
})

jb_component('run',{
 	type: '*',
 	params: [
 		{ id: 'profile', as: 'single'},
 	],
 	impl: function(context,profile) {
 	  	return context.run(profile);
 	}
});

jb_component('list',{
	type: "data",
	params: [
		{ id: 'items', type: "data[]", as: 'array', composite: true }
	],
	impl: function(context,items) {
		var out = [];
		items.forEach(function(item) {
			if (Array.isArray(item))
				out = out.concat(item);
			else
				out.push(item);
		});
		return out;
	}
});

jb_component('firstSucceeding',{
	type: "data",
	params: [
		{ id: 'items', type: "data[]", as: 'array' }
	],
	impl: function(context,items) {
		for(var i=0;i<items.length;i++)
			if (jb_val(items[i]))
				return items[i];
	}
});

jb_component('objectProperties',{
	type: "data",
	params: [
		{ id: 'object', defaultValue: '%%', as: 'single' }
	],
	impl: (ctx,object) =>
		jb_ownPropertyNames(object)
})

jb_component('extend',{
	type: "data",
	params: [
		{ id: 'with', as: 'single' },
		{ id: 'object', defaultValue: '%%', as: 'single' }
	],
	impl: function(context,_with,object) {
		return jb_extend({},object,_with);
	}
})

jb_component('objectToArray',{
	type: "data",
	params: [
		{ id: 'object', defaultValue: '%%', as: 'single' }
	],
	impl: (context,object) =>
		jb_ownPropertyNames(object).map((id,index) => 
			({id: id, val: object[id], index: index}))
});

jb_component('propertyName',{
	type: "data",
	impl: function(context) {
		return context.data && context.data.$jb_property;
	}
});

jb_component('prefix', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,separator,text) {
		return (text||'').substring(0,text.indexOf(separator))
	}
});

jb_component('suffix', {
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,separator,text) {
		return (text||'').substring(text.lastIndexOf(separator)+separator.length)
	}
});

jb_component('removePrefix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,separator,text) {
		return (text||'').substring(text.indexOf(separator)+separator.length)
	}
});

jb_component('removePrefixRegex',{
	type: 'data',
	params: [
		{ id: 'prefix', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,prefix,text) {
		context.profile.prefixRegexp = context.profile.prefixRegexp || new RegExp('^'+prefix);
		var m = (text||'').match(context.profile.prefixRegexp);
		return ((m && m.index==0 && text || '').substring(m[0].length)) || text;
	}
});

jb_component('removeSuffix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,separator,text) {
		return (text||'').substring(0,text.lastIndexOf(separator))
	}
});

jb_component('removeSuffixRegex',{
	type: 'data',
	params: [
		{ id: 'suffix', as: 'string', essential: true },
		{ id: 'text', as: 'string', defaultValue: '%%' },
	],
	impl: function(context,suffix,text) {
		context.profile.prefixRegexp = context.profile.prefixRegexp || new RegExp(suffix+'$');
		var m = (text||'').match(context.profile.prefixRegexp);
		return (m && (text||'').substring(m.index+1)) || text;
	}
});

jb_component('writeValue',{
	type: 'action',
	params: [
		{ id: 'to', as: 'ref' },
		{ id: 'value',}
	],
	impl: (ctx,to,value) =>
		jb_writeValue(to,value)
});

jb_component('toggleBooleanValue',{
	type: 'action',
	params: [
		{ id: 'of', as: 'ref' },
	],
	impl: (ctx,of) =>
		jb_writeValue(of,jb_val(of) ? false : true)
});

jb_component('addToArray', {
	type: 'action',
	params: [
		{ id: 'array',},
		{ id: 'add',}
	],
	impl: function(context,array,add) {
		jb_addToArray(array,add,true);
	}
});

jb_component('removeFromArray',{
	type: 'action',
	params: [
		{ id: 'array', as:'array' },
		{ id: 'remove', as:'array' }
	],
	impl: function(context,array,remove) {
		for (var i=0; i<array.length; i++)
			if (remove.indexOf(array[i]) >= 0)
				array.splice(i--,1);
	}
});

jb_component('remove', {
	type: 'action',
	params: [{ id: 'value' }],
	impl: function(context,value) {
		jb_remove(value,true);
	}
});


jb_component('slice', {
	params: [
		{ id: 'start', as: 'number', defaultValue: 0, description: '0-based index', essential: true },
		{ id: 'end', as: 'number', essential: true, description: '0-based index of where to end the selection (not including itself)' }
	],
	type: 'aggregator',
	impl: function(context,begin,end) {
		if (!context.data || !context.data.slice) return null;
		return end ? context.data.slice(begin,end) : context.data.slice(begin);
	}
});

jb_component('not',{
	type: 'boolean',
	params: [ 
		{ id: 'of', type: 'boolean', as: 'boolean', essential: true} 
	],
	impl: function(context, of) {
		return !of;
	}
});

jb_component('and',{
	type: 'boolean',
	params: [ 
		{ id: 'items', type: 'boolean[]', ignore: true, essential: true } 
	],
	impl: function(context) {
		var items = context.profile.$and || context.profile.items || [];
		for(var i=0;i<items.length;i++) {
			if (!jb_run(jb_ctx(context,{ profile: items[i], path: i}),{ type: 'boolean' }))
				return false;
		}
		return true;
	}
});

jb_component('or',{
	type: 'boolean',
	params: [ 
		{ id: 'items', type: 'boolean[]', ignore: true, essential: true } 
	],
	impl: function(context) {
		var items = context.profile.$or || context.profile.items || [];
		for(var i=0;i<items.length;i++) {
			if (jb_run(jb_ctx(context,{ profile: items[i], path: i}),{ type: 'boolean' }))
				return true;
		}
		return false;
	}
});

jb_component('contains',{
	type: 'boolean',
	params: [
		{ id: 'text', type: 'data[]', as: 'array', essential: true },
		{ id: 'allText', defaultValue: '%%', as:'array'}
	],
	impl: function(context,text,allText) {
      var all = "";
      allText.forEach(function(allTextItem) {
		if (allTextItem.outerHTML)
			all += allTextItem.outerHTML + $(allTextItem).findIncludeSelf('input,textarea').get().map(function(item) { return item.value; }).join();
		else if (typeof(allTextItem) == 'object') 
			all += JSON.stringify(allTextItem);
		else 
			all += jb_tostring(allTextItem);
      });
      var prevIndex = -1;
      for(var i=0;i<text.length;i++) {
      	var newIndex = all.indexOf(jb_tostring(text[i]),prevIndex);
      	if (newIndex <= prevIndex) return false;
      	prevIndex = newIndex;
      }
      return true;
	}
})

jb_component('startsWith',{
	type: 'boolean',
	params: [
		{ id: 'startsWith', as: 'string', essential: true },
		{ id: 'text', defaultValue: '%%', as:'string'}
	],
	impl: function(context,startsWith,text) {
		return text.lastIndexOf(startsWith,0) == 0;
	}
})

jb_component('endsWith',{
	type: 'boolean',
	params: [
		{ id: 'endsWith', as: 'string', essential: true },
		{ id: 'text', defaultValue: '%%', as:'string'}
	],
	impl: function(context,endsWith,text) {
		return text.indexOf(endsWith,text.length-endsWith.length) !== -1;
	}
})


jb_component('filter',{
	type: 'aggregator',
	params: [
		{ id: 'filter', type: 'boolean', as: 'boolean', dynamic: true, essential: true }
	],
	impl: (context,filter) =>
		jb_toarray(context.data).filter(item =>
			filter(context,item)
		)
});

jb_component('count',{
	type: 'aggregator',
	params: [
		{ id: 'items', as:'array', defaultValue: '%%'}
	],
	impl: (ctx,items) =>
		items.length
});

jb_component('toUpperCase', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,text) =>
		text.toUpperCase()
});

jb_component('toLowerCase', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,text) =>
		text.toLowerCase()
});

jb_component('capitalize', {
	params: [
		{ id: 'text', as: 'string', defaultValue: '%%'}
	],
	impl: (ctx,text) =>
		text.charAt(0).toUpperCase() + text.slice(1)
});


jb_component('join',{
	params: [
		{ id: 'separator', as: 'string', defaultValue:',', essential: true },
		{ id: 'prefix', as: 'string' },
		{ id: 'suffix', as: 'string' },
		{ id: 'items', as: 'array', defaultValue: '%%'},
		{ id: 'itemName', as: 'string', defaultValue: 'item'},
		{ id: 'itemText', as: 'string', dynamic:true, defaultValue: '%%'}
	],
	type: 'aggregator',
	impl: function(context,separator,prefix,suffix,items,itemName,itemText) {
		var itemToText = (context.profile.itemText) ?
			function(item) { return itemText(jb_ctx(context, {data: item, vars: jb_obj(itemName,item) }));	} :
			function(item) { return jb_tostring(item); };	// performance

		return prefix + items.map(itemToText).join(separator) + suffix;
	}
});

jb_component('unique',{
	params: [
		{ id: 'id', as: 'string', dynamic: true, defaultValue: '%%' },
		{ id: 'items', as:'array', defaultValue: '%%'}
	],
	type: 'aggregator',
	impl: function(context,id,items) {
		var out = [];
		var soFar = {};
		for(var i=0;i<items.length;i++) {
			var itemId = id( jb_ctx(context, {data: items[i] } ));
			if (soFar[itemId]) continue;
			soFar[itemId] = true;
			out.push(items[i]);
		}
		return out;
	}
});

jb_component('log',{
	params: [
		{ id: 'obj', as: 'single', defaultValue: '%%'}
	],
	impl: function(context,obj) {
		var out = obj;
		if (typeof GLOBAL != 'undefined' && typeof(obj) == 'object')
			out = JSON.stringify(obj,null," ");
		if (typeof window != 'undefined')
			(window.parent || window).console.log(out);
		else
			console.log(out);
		return context.data;
	}
});

jb_component('asIs',{ params: [{id: '$asIs'}], impl: function(context) { return context.profile.$asIs } });
jb_component('profile',{ impl: function(context) { return jb_handledObject(context.profile.$profile); } });

jb_component('object',{
	impl: function(context) {
		var result = {};
		var obj = context.profile.$object || context.profile;
		if (Array.isArray(obj)) return obj;
		for(var prop in obj) {
			if (prop == '$' && obj[prop] == 'object')
				continue;
			result[prop] = jb_run(jb_ctx(context,{profile: obj[prop], path: prop }));
			var native_type = obj[prop]['$as'];
			if (native_type)
				result[prop] = jb_tojstype(result[prop],native_type);
		}
		return result;
	}
});

jb_component('stringify',{
	params: [
		{ id: 'value', defaultValue: '%%', as:'single'},
		{ id: 'space', as: 'string', description: 'use space or tab to make pretty output' }
	],
	impl: (context,value,space) =>		
			JSON.stringify(value,null,space)
});

jb_component('jbart', {
	params: [
		{ id: 'script', description: 'jbart script to run' }
	],
	impl: function(context,script) {
		return jb_run(jb_ctx(context,{profile: script.$jb_object }))
	}
});

jb_component('split',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', defaultValue: ',' },
		{ id: 'text', as: 'string', defaultValue: '%%'},
		{ id: 'part', options: ',first,second,last,but first,but last' }
	],
	impl: function(context,separator,text,part) {
		var out = text.split(separator);
		switch (part) {
			case 'first': return out[0];
			case 'second': return out[1];
			case 'last': return out.pop();
			case 'but first': return out.slice(1);
			case 'but last': return out.slice(0,-1);
			default: return out;
		}
	}
});

jb_component('replace',{
	type: 'data',
	params: [
		{ id: 'find', as: 'string' },
		{ id: 'replace', as: 'string' },
		{ id: 'text', as: 'string', defaultValue: '%%' },
		{ id: 'useRegex', type: 'boolean', as: 'boolean', defaultValue: true},
		{ id: 'regexFlags', as: 'string', defaultValue: 'g', description: 'g,i,m' }
	],
	impl: function(context,find,replace,text,useRegex,regexFlags) {
		if (useRegex) {
			return text.replace(new RegExp(find,regexFlags) ,replace);
		} else
			return text.replace(find,replace);
	}
});

jb_component('foreach', {
	type: 'action',
	params: [
		{ id: 'items', as: 'array', defaultValue: '%%'},
		{ id: 'action', type:'action', dynamic:true },
		{ id: 'itemVariable', as:'string' },
		{ id: 'inputVariable', as:'string' }
	],
	impl: function(context,items,action,itemVariable,inputVariable) {
		items.forEach(function(item) {
			action(jb_ctx(context,{ data:item, vars: jb_obj(itemVariable,item, jb_obj(inputVariable,context.data)) }));
		});
	}
});

jb_component('isNull',{
	type: 'boolean',
	params: [
		{ id: 'item', as: 'single', defaultValue: '%%'}
	],
	impl: function(context, item) {
		return (item == null);
	}
});

jb_component('isEmpty',{
	type: 'boolean',
	params: [
		{ id: 'item', as: 'single', defaultValue: '%%'}
	],
	impl: function(context, item) {
		return (!item || (Array.isArray(item) && item.length == 0));
	}
});

jb_component('notEmpty',{
	type: 'boolean',
	params: [
		{ id: 'item', as: 'single', defaultValue: '%%'}
	],
	impl: function(context, item) {
		return (item && !(Array.isArray(item) && item.length == 0));
	}
});

jb_component('equals',{
	type: 'boolean',
	params: [
		{ id: 'item1', as: 'single', essential: true },
		{ id: 'item2', defaultValue: '%%', as: 'single' }
	],
	impl: function(context, item1, item2) {
		if (!item1 && !item2) return true;
		return JSON.stringify(openObject(item1)) == JSON.stringify(openObject(item2));

		function openObject(obj) {
			return (obj && obj.$jb_parent) ? obj.$jb_parent[obj.$jb_property] : obj;
		}
	}
});

jb_component('notEquals',{
	type: 'boolean',
	params: [
		{ id: 'item1', as: 'single', essential: true },
		{ id: 'item2', defaultValue: '%%', as: 'single' }
	],
	impl: { $not: { $: 'equals', item1: '%$item1%', item2: '%$item2%'} }
});

jb_component('parent',{
	type: "data",
	impl: function(context) {
		var object = jb_tosingle(context.data);
		return object && object.$jb_parent;
	}
});	

jb_component('writableText', {
	type: 'data',
	params: [
		{ id: 'defaultValue', as: 'string' }
	],
	impl: function(context,defaultValue) {
		return jb_handledObject(jb_obj('v',defaultValue));
	}
});

jb_component('searchFilter', {
	type: 'aggregator',
	params: [
		{ id: 'pattern', as:'string'},
		{ id: 'itemText', dynamic:true, as:'string', defaultValue:'%%'},
		{ id: 'ignoreCase', type:'boolean', as:'boolean', defaultValue:true }
	],
	impl: function(context,pattern,itemText,ignoreCase) {
		if (!pattern) return context.data;
		var patternLowCase = pattern.toLowerCase();
		return jb_map(jb_toarray(context.data), function(item) {
			if (ignoreCase) {
				if (itemText(context,item).toLowerCase().indexOf(patternLowCase) != -1)
					return item;
			} else
			 	if (itemText(context,item).indexOf(pattern) != -1)
					return item;
		} );
	}
});

jb_component('queryFilter', {
	type: 'aggregator',
	params: [
		{ id: 'query', as:'single' },
		{ id: 'filters', type:'filter{}', ingore: true },
		{ id: 'mainFilter', type:'filter', as:'single', defaultValue: { $:'substringFilter' } }
	],
	impl: function(context,query,_filters,mainFilter) {
		if (typeof(query) != 'object') return context.data;

		var filters = {};
		jb_map(_filters, function(filter,property) { 
			if (query[property])
				filters[property] = jb_run(jb_ctx(context, { profile: filter }));
		});

		return jb_toarray(context.data).filter(function(item) {
			for (var col in query)
				if (query.hasOwnProperty(col) && col.indexOf('$jb_') != 0) {
					if (! ((filters[col] || mainFilter)(item[col],query[col]))) return false;
				}
			return true;
		});
	}
});

jb_type('filter');

jb_component('substringFilter',{
	type: 'filter',
	impl: function(context) {
		return function(actual,expected) {
			if (expected == null || expected == undefined) return true;
			return (jb_tostring(actual).toLowerCase().indexOf( jb_tostring(expected).toLowerCase() ) != -1);
		}
	}
});

jb_component('strictFilter',{
	type: 'filter',
	impl: function(context) {
		return function(actual,expected) {
			if (!expected) return true;
			return (actual == expected);
		}
	}
});

jb_component('numericFilter',{
	type: 'filter',
	impl: function(context) {
		return function(actual,expected) {
			if (!expected) return true;
			if (expected.from && jb_tonumber(actual) < jb_tonumber(expected.from)) return false;
			if (expected.to && jb_tonumber(actual) > jb_tonumber(expected.to)) return false;
			return true;
		}
	}
});

jb_component('pluralize', {
	type: 'data',
	params: [
		{ id: 'count', as:'number', defaultValue: '%%' },
		{ id: 'zero', as:'string', dynamic:true },
		{ id: 'one', as:'string', dynamic:true },
		{ id: 'other', as:'string', dynamic:true }
	],
	impl: function(context,count,zero,one,other) {
		switch (count) {
			case 0: return (jb_profileHasValue(context,'zero') ? zero : other)(null,count);
			case 1: return (jb_profileHasValue(context,'one') ? one : other)(null,count);
			default: return other(null,count);
		}
		// todo: add offset and json when like angular
	}
})

jb_component('runActions', {
	type: 'action',
	params: [ 
		{ id: 'actions', type:'action[]', ignore: true, composite: true, essential: true }
	],
	impl: function(context) {
		if (!context.profile) debugger;
		var actions = jb_toarray(context.profile.actions || context.profile['$runActions']);
		if (context.profile.actions && context.profile.actions.sugar)
			var innerPath =  '' ;
		else 
			var innerPath = context.profile['$runActions'] ? '$runActions~' : 'items~';
		return actions.reduce((def,action,index) =>
			def.then(() =>
				$.when(jb_run(jb_ctx(context,{profile: action, path: innerPath + index }),{ as: 'single'}))),
			$.Deferred().resolve())
	}
});

jb_component('runActionOnItems', {
	type: 'action',
	params: [ 
		{ id: 'items', type:'data[]', as:'array', essential: true},
		{ id: 'action', type:'action', ignore: true, essential: true }
	],
	impl: function(context,items) {
		var deferred = $.Deferred();
		function runFromIndex(index) {
			if (index >= items.length) 
				return deferred.resolve();

			var promise = jb_run(jb_ctx(context,{data: [items[index]], profile: context.profile.action }), {as: 'single'});
			$.when(promise).then(
					function() { runFromIndex(index+1) },
					deferred.reject
			);
		}
		runFromIndex(0);
		return deferred.promise();
	}
});

jb_component('delay', {
	params: [
		{ id: 'mSec', type: 'number', defaultValue: 1}
	],
	impl: ctx => jb_delay(ctx.params.mSec)
})

jb_component('extractPrefix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
		{ id: 'text', as: 'string', defaultValue: '%%'},
		{ id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex' },
		{ id: 'keepSeparator', type: 'boolean', as: 'boolean' }
	],
	impl: function(context,separator,text,regex,keepSeparator) {
		if (!regex) {
			return text.substring(0,text.indexOf(separator)) + (keepSeparator ? separator : '');
		} else { // regex
			var match = text.match(separator);
			if (match)
				return text.substring(0,match.index) + (keepSeparator ? match[0] : '');
		}
	}
});

jb_component('extractSuffix',{
	type: 'data',
	params: [
		{ id: 'separator', as: 'string', description: '/w- alphnumberic, /s- whitespace, ^- beginline, $-endline'},
		{ id: 'text', as: 'string', defaultValue: '%%'},
		{ id: 'regex', type: 'boolean', as: 'boolean', description: 'separator is regex' },
		{ id: 'keepSeparator', type: 'boolean', as: 'boolean' }
	],
	impl: function(context,separator,text,regex,keepSeparator) {
		if (!regex) {
			return text.substring(text.lastIndexOf(separator) + (keepSeparator ? 0 : separator.length));
		} else { // regex
			var match = text.match(separator+'(?![\\s\\S]*' + separator +')'); // (?!) means not after, [\\s\\S]* means any char including new lines
			if (match)
				return text.substring(match.index + (keepSeparator ? 0 : match[0].length));
		}
	}
});

jb_component('onNextTimer',{
	type: 'action',
	params: [
		{ id: 'action', type: 'action', dynamic: true }
	],
	impl: (ctx,action) => {
		jb_delay(1,ctx).then(()=>
			action())
	}
})

jb_function('count',function(context,expression) {
	var content = jb_expression('{{' + expression + '}}',context);
	if (!content) return 0;
	if (jb_isArray(content)) return content.length;
	return 1;
});

jb_function('name',function(context,expression) {
	var content = jb_expression('{{' + expression + '}}',context);
	return content && content.$jb_property;
});
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb;
    return {
        setters:[],
        execute: function() {
            exports_1("jb", jb = {
                component: jb_component,
                resource: jb_resource,
                type: jb_type,
                Ctx: jbCtx,
                ctx: jb_ctx,
                comps: jbart.comps,
                compName: jb_compName,
                isProfOfType: jb_isProfOfType,
                logException: jb_logException,
                logError: jb_logError,
                logPerformance: jb_logPerformance,
                widgets: jbart_widgets,
                bind: jb_bind,
                trigger: jb_trigger,
                equals: jb_equals,
                val: jb_val,
                writeValue: jb_writeValue,
                prettyPrint: jb_prettyPrint,
                stringify: jb_prettyPrint,
                path: jb_path,
                toarray: jb_toarray,
                tostring: jb_tostring,
                delay: jb_delay,
                extend: jb_extend,
                map: jb_map,
                obj: jb_obj,
                //	ownPropertyNames: jb_ownPropertyNames, // keeps the order (unlike Object.getOwn..)
                range: jb_range,
                entries: jb_entries,
                flattenArray: jb_flattenArray,
                compareArrays: jb_compareArrays,
                writeToResource: jb_writeToResource,
            });
        }
    }
});
