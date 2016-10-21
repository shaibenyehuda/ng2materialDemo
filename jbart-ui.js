jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.type('button.style')

jb.component('button', {
  type: "control",
  params: [
    { id: 'title', as: 'string', dynamic: true, essential: true, defaultValue: 'Hello' },
    { id: 'action', type: 'action', essential: true, dynamic: true },
    { id: 'style', type: 'button.style', defaultValue: { $: 'button.md-flat' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
    { id: '$click', type: 'boolean' }, // used by tests to simulate click
  ],
  impl: function(context) {
    if (context.params.$click) try { context.params.action() } catch (e) { jb.logException(e) } // for test debug
    return jb_ui.ctrl(context).jbExtend({
      beforeInit: function(cmp) {
        cmp.title = context.params.title();
        cmp.clicked = jb_ui.wrapWithLauchingElement(context.params.action, context, cmp.elementRef);
      }
    })
  }
})

jb.component('button.href', {
  type: 'button.style',
    impl :{$: 'customStyle', 
        template: '<a href="javascript:;" (click)="clicked()">{{title}}</a>',
    }
})

jb.component('button.x', {
  type: 'button.style',
  params: [
    { id: 'size', as: 'number', defaultValue: '21'}
  ],
  impl :{$: 'customStyle', 
      template: '<div><button (click)="clicked()" [title]="title" style=":hover { opacity: .5 }">&#215;</button></div>',
      css: `button {
            cursor: pointer; 
            font: %$size%px sans-serif; 
            border: none; 
            background: transparent; 
            color: #000; 
            text-shadow: 0 1px 0 #fff; 
            font-weight: 700; 
            opacity: .2;
        }
        button:hover { opacity: .5 }`
  }
})

jb.component('button.popup-menu', {
  type: 'button.style',
  impl :{$: 'customStyle',  
      template: '<div><button (click)="clicked()" [title]="title"></button></div>',
      css: `
    button { border: none; cursor: pointer;  width: 0px;  height: 0px;  
      margin: 8px 0 0 6px;  border-top: 5px solid #91B193;  border-bottom: 3px solid transparent;  border-right: 4px solid transparent;  border-left: 4px solid transparent;
      display: inline-block;  vertical-align: top; padding: 0; background: transparent;}
    button:hover { border-top: 5px solid #6A886C; }
    button:focus { outline: none; }
    `
  }
})



})

jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.component('css', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'css', essential: true, as: 'string' },
  ],
  impl: (context,css) => 
    ({css:css})
})

jb.component('css.width', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'width', essential: true, as: 'number' },
    { id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    { id: 'minMax', as: 'string', options: ',min,max'},
    { id: 'selector', as: 'string' },
],
  impl: (ctx,width,overflow,minMax) => 
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}width: ${width}px ${overflow ? '; overflow-x:' + overflow + ';' : ''} }`})
})

jb.component('css.height', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'height', essential: true, as: 'number' },
    { id: 'overflow', as: 'string', options: ',auto,hidden,scroll'},
    { id: 'minMax', as: 'string', options: ',min,max'},
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx,height,overflow,minMax) =>
    ({css: `${ctx.params.selector} { ${minMax ? minMax +'-':''}height: ${height}px ${overflow ? '; overflow-y:' + overflow : ''} }`})
})

jb.component('css.padding', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'top', as: 'number' },
    { id: 'left', as: 'number' },
    { id: 'right', as: 'number' },
    { id: 'bottom', as: 'number' },
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx) => {
    var css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `padding-${x}: ${ctx.params[x]}px`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.margin', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'top', as: 'number' },
    { id: 'left', as: 'number' },
    { id: 'right', as: 'number' },
    { id: 'bottom', as: 'number' },
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx) => {
    var css = ['top','left','right','bottom']
      .filter(x=>ctx.params[x] != null)
      .map(x=> `margin-${x}: ${ctx.params[x]}px`)
      .join('; ');
    return {css: `${ctx.params.selector} {${css}}`};
  }
})

jb.component('css.transform-rotate', {
  type: 'feature',
  params: [
    { id: 'angle', as: 'number', defaultValue: 0, from: 0, to: 360 },
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx) => {
    return {css: `${ctx.params.selector} {transform:rotate(${ctx.params.angle}deg)}`};
  }
})

jb.component('css.transform-scale', {
  type: 'feature',
  params: [
    { id: 'x', as: 'number', defaultValue: 100 },
    { id: 'y', as: 'number', defaultValue: 100 },
    { id: 'selector', as: 'string' },
  ],
  impl: (ctx) => {
    return {css: `${ctx.params.selector} {transform:scale(${ctx.params.x/100},${ctx.params.y/100})}`};
  }
})

jb.component('css.box-shadow', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'blurRadius', as: 'number', defaultValue: 5 },
    { id: 'spreadRadius', as: 'number', defaultValue: 0 },
    { id: 'shadowColor', as: 'string', defaultValue: '#000000'},
    { id: 'opacity', as: 'number', min: 0, max: 1, defaultValue: 0.75, step: 0.01 },
    { id: 'horizontal', as: 'number', defaultValue: 10},
    { id: 'vertical', as: 'number', defaultValue: 10},
    { id: 'selector', as: 'string' },
  ],
  impl: (context,blurRadius,spreadRadius,shadowColor,opacity,horizontal,vertical,selector) => {
    var color = [parseInt(shadowColor.slice(1,3),16) || 0, parseInt(shadowColor.slice(3,5),16) || 0, parseInt(shadowColor.slice(5,7),16) || 0]
      .join(',');
    return ({css: `${selector} { box-shadow: ${horizontal}px ${vertical}px ${blurRadius}px ${spreadRadius}px rgba(${color},${opacity}) }`})
  }
})

jb.component('css.border', {
  type: 'feature,dialog-feature',
  params: [
    { id: 'width',as: 'number', defaultValue: 1},
    { id: 'side', as: 'string', options: 'top,left,bottom,right' },
    { id: 'style', as: 'string', options: 'solid,dotted,dashed,double,groove,ridge,inset,outset', defaultValue: 'solid'},
    { id: 'color', as: 'string', defaultValue: 'black' },
    { id: 'selector', as: 'string' },
  ],
  impl: (context,width,side,style,color,selector) => 
    ({css: `${selector} { border${side?'-'+side:''}: ${width}px ${style} ${color} }`})
})



})
jbLoadModules(['jb-core','jb-ui','jb-ui/jb-rx']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'], jb_rx = loadedModules['jb-ui/jb-rx'];

jb.component('openDialog', {
	type: 'action',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'style', type: 'dialog.style', dynamic: true, defaultValue: { $:'dialog.default' }	},
		{ id: 'content', type: 'control', dynamic: true, defaultValue :{$: 'group'}, forceDefaultCreation: true },
		{ id: 'menu', type: 'control', dynamic: true },
		{ id: 'title', as: 'string', dynamic: true  },
		{ id: 'onOK', type: 'action', dynamic: true },
		{ id: 'modal', type: 'boolean', as: 'boolean' },
		{ id: 'features', type: 'dialog-feature[]', dynamic: true }
	],
	impl: function(context,id) {
		var modal = context.params.modal;
		var dialog = { 
			id: id, 
			onOK: context.params.onOK, 
			modal: modal, 
			$: $('div'), 
			em: new jb_rx.Subject(),
		};
//		dialog.em.subscribe(e=>console.log(e.type));

		var ctx = (modal ? context.setVars({dialogData: {}}) : context)
				.setVars({ $dialog: dialog });
		dialog.comp = jb_ui.ctrl(ctx).jbExtend({
			beforeInit: function(cmp) {
				cmp.title = ctx.params.title(ctx);
				cmp.dialog = dialog;
				cmp.dialog.$el = $(cmp.elementRef.nativeElement);
				cmp.dialog.$el.css('z-index',100);

				cmp.dialogClose = dialog.close;
				cmp.contentComp = ctx.params.content(ctx);
				cmp.menuComp = ctx.params.menu(ctx);
				cmp.hasMenu = !!ctx.params.menu.profile;
			}
		});
		jbart.jb_dialogs.addDialog(dialog,ctx);
	}
})

jb.component('closeContainingPopup', {
	type: 'action',
	params: [
		{ id: 'OK', type: 'boolean', as: 'boolean', defaultValue: true}
	],
	impl: function(context,OK) {
		context.vars.$dialog && context.vars.$dialog.close({OK:OK});
	}
})

jb.component('dialog.default', {
	type: 'dialog.style',
	impl :{$: 'customStyle',
		template: `<div class="jb-dialog jb-default-dialog">
				      <div class="dialog-title">{{title}}</div>
				      <button class="dialog-close" (click)="dialogClose()">&#215;</button>
				      <jb_comp [comp]="contentComp"></jb_comp>
				    </div>` 
	}
})

jb.component('dialog.popup', {
  type: 'dialog.style',
  impl :{$: 'customStyle',
      template: '<div class="jb-dialog jb-popup"><jb_comp [comp]="contentComp" class="dialog-content"></jb_comp></div>',
      features: [
        { $: 'dialog-feature.maxZIndexOnClick' },
        { $: 'dialog-feature.closeWhenClickingOutside' },
        { $: 'dialog-feature.cssClassOnLaunchingControl' },
        { $: 'dialog-feature.nearLauncherLocation' }
      ]
  }
})


jb.component('dialog-feature.uniqueDialog', {
	type: 'dialog-feature',
	params: [
		{ id: 'id', as: 'string' },
		{ id: 'remeberLastLocation', type: 'boolean', as: 'boolean' }
	],
	impl: function(context,id,remeberLastLocation) {
		if (!id) return;
		var dialog = context.vars.$dialog;
		dialog.id = id;
		dialog.em.filter(e=> 
			e.type == 'new-dialog')
			.subscribe(e=> {
				if (e.dialog != dialog && e.dialog.id == id )
					dialog.close();
		})
	}
})

function fixDialogOverflow($control,$dialog,offsetLeft,offsetTop) {
	var padding = 2,top,left;
	if ($control.offset().top > $dialog.height() && $control.offset().top + $dialog.height() + padding + (offsetTop||0) > window.innerHeight + window.pageYOffset)
		top = $control.offset().top - $dialog.height();
	if ($control.offset().left > $dialog.width() && $control.offset().left + $dialog.width() + padding + (offsetLeft||0) > window.innerWidth + window.pageXOffset)
		left = $control.offset().left - $dialog.width();
	if (top || left)
		return { top: top || $control.offset().top , left: left || $control.offset().left}
}

jb.component('dialog-feature.nearLauncherLocation', {
	type: 'dialog-feature',
	params: [
		{ id: 'offsetLeft', as: 'number', defaultValue: 0 },
		{ id: 'offsetTop', as: 'number' , defaultValue: 0 },
	],
	impl: function(context,offsetLeft,offsetTop) {
		return {
			afterViewInit: function(cmp) {
				if (!context.vars.$launchingElement)
					return console.log('no launcher for dialog');
				var $control = context.vars.$launchingElement.$el;
				var pos = $control.offset();
				var $jbDialog = $(cmp.elementRef.nativeElement).findIncludeSelf('.jb-dialog');
				var fixedPosition = fixDialogOverflow($control,$jbDialog,offsetLeft,offsetTop);
				if (fixedPosition)
					$jbDialog.css('left', `${fixedPosition.left}px`)
						.css('top', `${fixedPosition.top}px`)
						.css('display','block');
				else
					$jbDialog.css('left', `${pos.left + offsetLeft}px`)
						.css('top', `${pos.top + $control.outerHeight() + offsetTop}px`)
						.css('display','block');
			}
		}
	}
})

jb.component('dialog-feature.launcherLocationNearSelectedNode', {
	type: 'dialog-feature',
	params: [
		{ id: 'offsetLeft', as: 'number' },
		{ id: 'offsetTop', as: 'number' },
	],
	impl: function(context, offsetLeft, offsetTop) {
		return {
			afterViewInit: function(cmp) {
				var $elem = context.vars.$launchingElement.$el;
				var $control = $elem.closest('.selected').first();
				var pos = $control.offset();
				$(cmp.elementRef.nativeElement).findIncludeSelf('.jb-dialog').css('left', `${pos.left + offsetLeft}px`);
				$(cmp.elementRef.nativeElement).findIncludeSelf('.jb-dialog').css('top', `${pos.top + $control.outerHeight() + offsetTop}px`);
			}
		}
	}
})

jb.component('dialog-feature.onClose', {
	type: 'dialog-feature',
	params: [
		{ id: 'action', type: 'action', dynamic: true}
	],
	impl: function(context,action) { 
		context.vars.$dialog.em
			.filter(e => e.type == 'close')
			.take(1)
			.subscribe(()=>
				action())
	}
})

jb.component('dialog-feature.closeWhenClickingOutside', {
	type: 'dialog-feature',
	impl: function(context) { 
		var dialog = context.vars.$dialog;
		jb.delay(10).then(() =>  { // delay - close older before    		
			var clickoutEm = jb_rx.Observable.fromEvent(document, 'mousedown')
			      			.merge(jb_rx.Observable.fromEvent(
			      				(jbart.previewWindow || {}).document, 'mousedown'))
			      			.filter(e =>
			      				$(e.target).closest(dialog.$el[0]).length == 0)
   					 		.takeUntil(dialog.em.filter(e => e.type == 'close'));

		 	clickoutEm.take(1)
		  		.subscribe(()=>
		  			dialog.close())
  		})


		// function clickOutHandler(e) {
		// 	if ($(e.target).closest(dialog.$el[0]).length == 0)
		// 		dialog.close();
		// }
		// jb.delay(10).then( function() { // delay - close older before
		// 	window.onmousedown = clickOutHandler;
		// 	if (jbart.previewWindow)
		// 		jbart.previewWindow.onmousedown = clickOutHandler;
		// })
		// dialog.filter(x=>x.type == 'close').
		// 	subscribe(() =>{
		// 		window.onmousedown = null;
		// 		if (jbart.previewWindow) 
		// 			jbart.previewWindow.onmousedown = null;
		// 	})
	}
})

jb.component('dialog-feature.autoFocusOnFirstInput', {
	type: 'dialog-feature',
	impl: context => ({ 
			afterViewInit: cmp =>
				jb.delay(1).then(()=>
					context.vars.$dialog.$el.find('input,textarea,select').first().focus())
	})
})

jb.component('dialog-feature.cssClassOnLaunchingControl', {
	type: 'dialog-feature',
	impl: context => ({ 
			afterViewInit: cmp => {
				var dialog = context.vars.$dialog;
				var $control = context.vars.$launchingElement.$el;
				$control.addClass('dialog-open');
				dialog.em.filter(e=>
					e.type == 'close')
					.take(1)
					.subscribe(()=> {
						$control.removeClass('dialog-open');
					})
			}
	})
})

jb.component('dialog-feature.maxZIndexOnClick', {
	type: 'dialog-feature',
	params: [
		{ id: 'minZIndex', as: 'number'}
	],
	impl: function(context,minZIndex) {
		var dialog = context.vars.$dialog;

		return ({
			afterViewInit: cmp => {
				setAsMaxZIndex();
				dialog.$el.mousedown(setAsMaxZIndex);
			}
		})

		function setAsMaxZIndex() {
			var maxIndex = jbart.jb_dialogs.dialogs.reduce(function(max,d) { 
				return Math.max(max,(d.$el && parseInt(d.$el.css('z-index')) || 100)+1)
			}, minZIndex || 100)

			dialog.$el.css('z-index',maxIndex);
		}
	}
})

jb.component('dialog-feature.dragTitle', {
	type: 'dialog-feature',
	params: [
		{ id: 'id', as: 'string' }
	],
	impl: function(context, id) { 
		var dialog = context.vars.$dialog;
		return {
		      innerhost: { '.dialog-title' : {
		      	'(mousedown)': 'mousedownEm.next($event)', 
		       }},
		       css: '.dialog-title { cursor: pointer }',
	           observable: () => {}, // create jbEmitter
		       init: function(cmp) {
		       	  cmp.mousedownEm = cmp.mousedownEm || new jb_rx.Subject();
		       	  
				  if (id && sessionStorage.getItem(id)) {
						var pos = JSON.parse(sessionStorage.getItem(id));
					    dialog.$el[0].style.top  = pos.top  + 'px';
					    dialog.$el[0].style.left = pos.left + 'px';
				  }

				  var mouseUpEm = jb_rx.Observable.fromEvent(document, 'mouseup')
				      			.merge(jb_rx.Observable.fromEvent(
				      				(jbart.previewWindow || {}).document, 'mouseup'))
          						.takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') )

				  var mouseMoveEm = jb_rx.Observable.fromEvent(document, 'mousemove')
				      			.merge(jb_rx.Observable.fromEvent(
				      				(jbart.previewWindow || {}).document, 'mousemove'))
          						.takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') )

				  var mousedrag = cmp.mousedownEm
				  		.do(e => e.preventDefault())
				  		.map(e =>  ({
				          left: e.clientX - dialog.$el[0].getBoundingClientRect().left,
				          top:  e.clientY - dialog.$el[0].getBoundingClientRect().top
				        }))
				      	.flatMap(imageOffset => 
			      			 mouseMoveEm.takeUntil(mouseUpEm)
			      			 .map(pos => ({
						        top:  pos.clientY - imageOffset.top,
						        left: pos.clientX - imageOffset.left
						     }))
				      	);

				  mousedrag.distinctUntilChanged().subscribe(pos => {
			        dialog.$el[0].style.top  = pos.top  + 'px';
			        dialog.$el[0].style.left = pos.left + 'px';
			        if (id) sessionStorage.setItem(id, JSON.stringify(pos))
			      });
			  }
	       }
	}
});


class jbDialogs {
	constructor() {
	 	this.dialogs = []
	}
	addDialog(dialog,context) {
		var self = this;
		dialog.context = context;
		this.dialogs.forEach(d=>
			d.em.next({ type: 'new-dialog', dialog: dialog }));
		this.dialogs.push(dialog);
		if (dialog.modal)
			$('body').prepend('<div class="modal-overlay"></div>');

		jb_ui.apply(context);

		dialog.close = function(args) {
			dialog.em.next({type: 'close'});
			dialog.em.complete();
			var index = self.dialogs.indexOf(dialog);
			if (index != -1)
				self.dialogs.splice(index, 1);
			if (dialog.onOK && args && args.OK) 
				try { 
					dialog.onOK(context);
				} catch (e) {
					console.log(e);
				}
			if (dialog.modal)
				$('.modal-overlay').first().remove();
			jb_ui.apply(context);
		}
	}
	closeAll() {
		this.dialogs.forEach(d=>
			d.close());
	}
}

jbart.jb_dialogs = new jbDialogs;

})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.type('divider.style');

jb.component('divider', {
    type: 'control',
    params: [
        { id: 'style', type: 'divider.style', defaultValue: { $: 'divider.br' }, dynamic: true },
        { id: 'title', as: 'string', defaultValue: 'divider' },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx => 
        jb_ui.ctrl(ctx)
})

jb.component('divider.br', {
    type: 'divider.style',
    params: [
    ],
    impl :{$: 'customStyle', 
        template: '<div></div>',
        css: `{ border-top-color: rgba(0,0,0,0.12); display: block; border-top-width: 1px; border-top-style: solid;margin-top: 10px; margin-bottom: 10px;} `
    }
})

jb.component('divider.flex-auto-grow', {
    type: 'divider.style',
    impl :{$: 'customStyle', 
        template: '<div></div>',
        css: `{ flex-grow: 10 } `
    }
})

})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.type('editable-boolean.style');
jb.type('editable-boolean.yes-no-settings');

jb.component('editable-boolean',{
  type: 'control',
  params: [
    { id: 'databind', as: 'ref'},
    { id: 'style', type: 'editable-boolean.style', defaultValue: { $: 'editable-boolean.checkbox' }, dynamic: true },
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'textForTrue', as: 'string', defaultValue: 'yes' },
    { id: 'textForFalse', as: 'string', defaultValue: 'no' },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: (ctx) => {
    var ctx2 = ctx.setVars({ field: jb_ui.twoWayBind(ctx.params.databind) });
  	return jb_ui.ctrl(ctx2).jbExtend({
  		beforeInit: function(cmp) {
        ctx2.vars.field.bindToCmp(cmp, ctx2);

        cmp.toggle = () =>  {
          cmp.jbModel = !cmp.jbModel; 
          ctx2.vars.field.writeValue(cmp.jbModel);
        }

  			cmp.text = () => 
          cmp.jbModel ? ctx.params.textForTrue : ctx.params.textForFalse;
  		}
  	});
  }
})


})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.type('editable-text.style');

jb.component('editable-text',{
  type: 'control',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'databind', as: 'ref'},
    { id: 'updateOnBlur', as: 'boolean', type: 'boolean' },
    { id: 'style', type: 'editable-text.style', defaultValue: { $: 'editable-text.input' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx => 
  	jb_ui.ctrl(ctx.setVars({ field: jb_ui.twoWayBind(ctx.params.databind,ctx.params.updateOnBlur) }))
});

jb.component('editable-text.bindField', {
  type: 'feature',
  impl: ctx => ({
   	init: cmp => 
  		cmp.ctx.vars.field.bindToCmp(cmp, cmp.ctx)
  })
})

jb.component('editable-text.input', {
  type: 'editable-text.style',
  impl :{$: 'customStyle', 
      features :{$: 'editable-text.bindField' },
      template: `<div><input %$field.modelExp%></div>`,
	  css: 'input {height: 16px}'
	}
})

jb.component('editable-text.textarea', {
	type: 'editable-text.style',
	impl :{$: 'customStyle', 
      features :{$: 'editable-text.bindField' },
      template: '<div><textarea %$field/modelExp%></textarea></div>',
	}
})


})
jbLoadModules(['jb-core','jb-ui','jb-ui/jb-rx']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'], jb_rx = loadedModules['jb-ui/jb-rx'];
jb.component('group.wait', {
  type: 'feature',
  params: [ 
    { id: 'for', essential: true },
    { id: 'loadingControl', type: 'control', defaultValue: { $:'label', title: 'loading ...'} , dynamic: true },
    { id: 'error', type: 'control', defaultValue: { $:'label', title: 'error: %$error%', css: '{color: red; font-weight: bold}'} , dynamic: true },
    { id: 'resource', as: 'string' },
    { id: 'mapToResource', dynamic: true, defaultValue: '%%' },
  ],
  impl: function(context,waitFor,loading,error) { 
    return {
      beforeInit: function(cmp) {
          var waiting = cmp.jbWait();
          cmp.jbGroupChildrenEm = jb_rx.observableFromCtx(context.setData(waitFor))
            .flatMap(x=>{
                var data = context.params.mapToResource(x);
                jb.writeToResource(context.params.resource,data,context);
                return [context.vars.$model.controls(cmp.ctx.setData(data))];
              })
            .do(x=>
              jb_ui.delayOutsideAngular(context,() => 
                waiting.ready()))
            .startWith([loading(context)])
            .catch(e=> 
              jb_rx.Observable.of([error(context.setVars({error:e}))]));
      },
      observable: () => {} // to create jbEmitter
  }}
})

// bind data and watch the data to refresh the control
jb.component('group.data', {
  type: 'feature',
  params: [
    { id: 'data', essential: true, dynamic: true, as: 'ref' },
    { id: 'itemVariable', as: 'string' },
    { id: 'watch', type: 'boolean', as: 'boolean', defaultValue: true }
  ],
  impl: function(context, data_ref, itemVariable,watch) {
    return {
      beforeInit: function(cmp) {
          var dataEm = cmp.jbEmitter
              .filter(x => x == 'check')
              .map(()=> 
                jb.val(data_ref())) 
              .distinctUntilChanged(jb_compareArrays)
              .map(val=> {
                  var ctx2 = (cmp.refreshCtx ? cmp.refreshCtx(cmp.ctx) : cmp.ctx);
//                  var ctx3 = itemVariable ? ctx2.setVars(jb.obj(itemVariable,val)) : ctx2;
                  return context.vars.$model.controls(ctx2)
              })

          cmp.jbGroupChildrenEm = watch ? dataEm : dataEm.take(1);
      },
      extendCtx: ctx => {
          var val = data_ref();
          var res = ctx.setData(val);
          if (itemVariable)
            res = res.setVars(jb.obj(itemVariable,val));
          return res;
      },
      observable: () => {} // to create jbEmitter
  }}
})

jb.component('group.watch', {
  type: 'feature',
  params: [
    { id: 'data', essential: true, dynamic: true },
  ],
  impl: (context, data) => ({
      beforeInit: function(cmp) {
          cmp.jbWatchGroupChildrenEm = (cmp.jbWatchGroupChildrenEm || jb_rx.Observable.of())
              .merge(cmp.jbEmitter
                .filter(x => x == 'check')
                .map(()=> 
                  jb.val(data())) 
                .filter(x=>x != null)
                .distinctUntilChanged(jb_compareArrays)
                .map(val=> {
                    var ctx2 = (cmp.refreshCtx ? cmp.refreshCtx(cmp.ctx) : cmp.ctx);
                    return context.vars.$model.controls(ctx2)
                })
            )
      },
      observable: () => {} // to create jbEmitter
  })
})

// static if - to watch condition, parent component need to be refreshed
jb.component('group-item.if', {
  type: 'feature',
  params: [
    { id: 'showCondition', type: 'boolean', as: 'boolean', essential: true },
  ],
  impl: (context, condition) => ({
    invisible: !condition
  })
})



jb.component('feature.init', {
  type: 'feature',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: (ctx,action) => ({init: cmp => 
      action(cmp.ctx)
  })
})

jb.component('feature.ng-attach-object', {
  type: 'feature',
  params: [
    { id: 'data', as: 'single', dynamic: true }
  ],
  impl: (ctx,data) => 
    ({init: cmp => {
        var obj = data(cmp.ctx);
        if (cmp.constructor && cmp.constructor.prototype && obj) {
          jb.extend(cmp,obj);
          jb.extend(cmp.constructor.prototype,obj.constructor.prototype || {});
        }
    }})
})

jb.component('feature.disableChangeDetection', {
  type: 'feature',
  impl: (ctx) => ({
      disableChangeDetection: true })
})

jb.component('feature.onEnter', {
  type: 'feature',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: ctx => ({ 
      host: {
        '(keydown)': 'keydownSrc.next($event)',
        'tabIndex': '0',
      },
      init: cmp=> {
        cmp.keydownSrc = cmp.keydownSrc || new jb_rx.Subject();
        cmp.keydown = cmp.keydownSrc
          .takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') );

        cmp.keydown.filter(e=> e.keyCode == 13)
            .subscribe(()=>
              jb_ui.wrapWithLauchingElement(ctx.params.action, cmp.ctx, cmp.elementRef)())
      },
      observable: () => {},
  })
})


jb.component('ngAtts', {
  type: 'feature',
  params: [
    { id: 'atts', as: 'single' }
  ],
  impl: (ctx,atts) => 
    ({atts:atts})
})

jb.component('feature.afterLoad', {
  type: 'feature',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: function(context) { return  { 
    afterViewInit: cmp => jb.delay(1).then(() => context.params.action(cmp.ctx))
  }}
})

jb.component('feature.emitter',{
  type: 'feature',
  params: [
    { id: 'varName', as: 'string'},
  ],
  impl: function(context,varName) { return  { 
    extendCtx: (ctx,cmp) => 
      ctx.setVars(jb.obj(varName,cmp.jbEmitter)),
    observable: (obs,ctx) => {},
  }}
})

jb.component('var',{
  type: 'feature',
  params: [
    { id: 'name', as: 'string'},
    { id: 'value', dynamic: true },
  ],
  impl: (context,name,value) => 
    jb.extend({}, name && {
      extendCtx: ctx =>
        ctx.setVars(jb.obj(name,value(ctx)))
    })
})

jb.component('hidden', {
  type: 'feature',
  params: [
    { id: 'showCondition', type: 'boolean', essential: true, dynamic: true },
  ],
  impl: function(context,showCondition) { return {
      init: function(cmp) {
        cmp.jb_hidden = () =>
          !showCondition(cmp.ctx)
      },
      atts: { '[hidden]': 'jb_hidden()'}
    }
  }
})

jb.component('field.style-on-focus', {
  type: 'feature',
  params: [
    { id: 'style', type: 'style', essential: true, dynamic: true },
  ],
  impl: ctx => ({
    extendComp: { jb_styleOnFocus: ctx.profile.style }
  })
})


jb.component('feature.keyboard-shortcut', {
  type: 'feature',
  params: [
    { id: 'key', as: 'string', description: 'e.g. Alt+C' },
    { id: 'action', type: 'action', dynamic: true }
  ],
  impl: (context,key,action) => 
    ({
      init: function(cmp) {
            var doc = cmp.elementRef.nativeElement.ownerDocument;
            $(doc).keydown(event => {
                var keyCode = key.split('+').pop().charCodeAt(0);
                if (key == 'Delete') keyCode = 46;

                var helper = (key.match('([A-Za-z]*)+') || ['',''])[1];
                if (helper == 'Ctrl' && !event.ctrlKey) return
                if (helper == 'Alt' && !event.altKey) return
                if (event.keyCode == keyCode)
                action();
            })
          }
    })
})

})
jbLoadModules(['jb-core','jb-ui','jb-ui/jb-rx']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'], jb_rx = loadedModules['jb-ui/jb-rx'];

jb.component('field.default', {
  type: 'feature',
  params: [
    { id: 'value', type: 'data'},
  ],
  impl: function(context,defaultValue) {
    var field = context.vars.field;
    if (field && field.getValue() == null)
      field.writeValue(defaultValue)
  }
})

jb.component('field.subscribe', {
  type: 'feature',
  params: [
    { id: 'action', type: 'action', essential: true, dynamic: true },
    { id: 'includeFirst', type: 'boolean', as: 'boolean'},
  ],
  impl: (context,action,includeFirst) => ({
    init: cmp => {
      var field = context.vars.field;
      var includeFirstEm = includeFirst ? jb_rx.Observable.of(field.getValue()) : jb_rx.Observable.of();
      field && field.observable(cmp)
            .merge(includeFirstEm)
            .filter(x=>x)
            .subscribe(x=>
              action(context.setData(x)));
    }
  })
})

jb.component('field.onChange', {
  type: 'feature',
  params: [
    { id: 'action', type: 'action[]', essential: true, dynamic: true }
  ],
  impl: ctx => ({ 
    init: cmp =>
      cmp.onChange = () => 
        ctx.params.action(cmp.ctx)
  })
})


jb.component('field.toolbar', {
  type: 'feature',
  params: [
    { id: 'toolbar', type: 'control', essential: true, dynamic: true },
  ],
  impl: (context,toolbar) => ({
    extendComp: { jb_toolbar: toolbar() }
  })
})

})
jbLoadModules(['jb-core','jb-ui','jb-ui/jb-rx']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'], jb_rx = loadedModules['jb-ui/jb-rx'];

jb.type('group.style');

jb.component('group',{
  type: 'control',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'style', type: 'group.style', defaultValue: { $: 'group.section' }, essential: true , dynamic: true },
    { id: 'controls', type: 'control[]', essential: true, flattenArray: true, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: function(context) { 
    return jb_ui.ctrl(context).jbExtend({
      beforeInit: cmp => {
        cmp.ctrls = [];
        cmp.jbToExtend = cmp.jbToExtend || {};
        cmp.extendChild = function(index,options) {
          if (options)
            cmp.jbToExtend[index] = options;
        }

        cmp.initGroup = function() {
          cmp.title = context.params.title(context);
          (cmp.jbGroupChildrenEm || jb_rx.Observable.of(context.params.controls(cmp.ctx)))
              .merge(cmp.jbWatchGroupChildrenEm || jb_rx.Observable.of())
              .takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') )
              .subscribe(comps=> {
                  cmp.ctrls = [];
                  cmp.jb_disposable && cmp.jb_disposable.forEach(d=>d());
                  jb.logPerformance('group-change');
                  comps.forEach((comp,i)=>{
                    if (!comp || comp.invisible)
                      return;
                    if (cmp.jbToExtend[i])
                       comp.jbExtend(cmp.jbToExtend[i]);
                    if (!comp.jb_title)
                      debugger;
                    cmp.ctrls.push({ title: comp.jb_title ? comp.jb_title() : '' , comp: comp } );
                  })
                })
            }
      },
      observable: () => {} // to create jbEmitter
    })
  }
})

jb.component('group.dynamic-sub-titles', {
  type: 'feature',
  impl: ctx => ({
    doCheck: cmp => 
      (cmp.ctrls || []).forEach(ctrl=>
        ctrl.title = ctrl.comp.jb_title ? ctrl.comp.jb_title() : '')
  })
})

jb.component('dynamic-controls', {
  type: 'control',
  params: [
    { id: 'controlItems', type: 'data', as: 'array', essential: true, dynamic: true },
    { id: 'genericControl', type: 'control', essential: true, dynamic: true },
    { id: 'itemVariable', as: 'string', defaultValue: 'controlItem'}
  ],
  impl: function(context,controlItems,genericControl,itemVariable) {
    return controlItems()
      .map(controlItem => jb_tosingle(genericControl(
        jb.ctx(context,{data: controlItem, vars: jb.obj(itemVariable,controlItem)})))
      )
  }
})

jb.component('group.initGroup', {
  type: 'feature',
  impl: ctx => 
    jb.obj('init', cmp => cmp.initGroup())
})

// ** sample style 

jb.component('group.section', {
  type: 'group.style',
  impl :{$: 'customStyle',
    template: '<section class="jb-group"><jb_comp *ngFor="let ctrl of ctrls" [comp]="ctrl.comp" [flatten]="true"></jb_comp></section>',
    features :{$: 'group.initGroup'}
  }
})

jb.component('wait', {
  type: 'control',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'for', essential: true },
    { id: 'resource', as: 'string' },
    { id: 'dataVariable', as: 'string' },
    { id: 'mapToResource', dynamic: true, defaultValue: '%%' },
    { id: 'control', type: 'control' , dynamic: true },
    { id: 'loadingControl', type: 'control', defaultValue: { $:'label', title: 'loading ...'} , dynamic: true },
    { id: 'errorControl', type: 'control', defaultValue: { $:'label', title: 'error: %$error%', css: '{color: red; font-weight: bold}'} , dynamic: true },
  ],
  impl :{$: 'group', 
      controls :{$: 'group',
          controls :{$call: 'control' },
          features :{$: 'var', name: '%$dataVariable%', value: '%%'}
      },
      features :{$: 'group.wait', 
        for :{$call: 'for' }, 
        resource: '%$resource%', 
        mapToResource :{$call: 'mapToResource' }, 
        loadingControl :{$call: 'loadingControl' }, 
        error :{$call: 'errorControl' }, 
      }
  }
})

})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.type('image.style');

jb.component('image',{
	type: 'control',
	params: [
		{ id: 'url', as: 'string', dynamic:true },
		{ id: 'imageWidth', as: 'number' },
		{ id: 'imageHeight', as: 'number' },
		{ id: 'width', as: 'number' },
		{ id: 'height', as: 'number' },
		{ id: 'units', as: 'string', defaultValue : 'px'},
		{ id: 'style', type: 'image.style', dynamic: true, defaultValue: { $: 'image.default' } },
		{ id: 'features', type: 'feature[]', dynamic: true }
	],
	impl: function(context) {
		return jb_ui.ctrl(context).jbExtend({ init: function(cmp) {
			var image = context.params;
			var units = image.units;
			if (image.width) cmp.width = image.width + units;
			if (image.height) cmp.height = image.height + units;
			if (image.imageWidth) cmp.imageWidth = image.imageWidth + units;
			if (image.imageHeight) cmp.imageHeight = image.imageHeight + units;
			cmp.url = image.url();
		}},context);
	}
})

jb.component('image.default', {
	type: 'image.style',
	impl: {$: 'customStyle',
			template: `<div [style.width]="width" [style.height]="height" [style.background-image]="">
			               <img [style.width]="imageWidth" [style.height]="imageHeight" src="{{url}}"/>
			           </div>`,
		}
})

})
jbLoadModules(['jb-core','jb-ui','jb-ui/jb-rx']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'], jb_rx = loadedModules['jb-ui/jb-rx'];

jb.type('itemlist.heading','inject headings to itemlist');
jb.type('itemlist-heading.style');

jb.component('itemlist-with-groups', {
  type: 'control',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'array' , dynamic: true, essential: true },
    { id: 'controls', type: 'control[]', essential: true, dynamic: true },
    { id: 'style', type: 'itemlist.style', dynamic: true , defaultValue: { $: 'itemlist.ul-li' } },
    { id: 'groupBy', type: 'itemlist.group-by', essential: true, dynamic: true },
    { id: 'headingCtrl', type: 'control', dynamic: true , defaultValue: {$: 'label', title: '%title%' } },
    { id: 'watchItems', type: 'boolean', as: 'boolean', defaultValue: true },
    { id: 'itemVariable', as: 'string', defaultValue: 'item' },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl :{$: 'group', 
    title: '%$title%',
    style :{$call: 'style'},
    controls :{$: 'dynamic-controls', 
      controlItems : '%$items_array%',
      genericControl :{$if: '%heading%', 
        then: {$call: 'headingCtrl'},
        else: {$call: 'controls'}, 
      },
      itemVariable: '%$itemVariable%'
    },
    features :[
      {$call: 'features'},
      {$: 'itemlist.watch-items-with-heading', 
        items: {$call: 'items'}, 
        groupBy: {$call: 'groupBy'}, 
        watch: '%$watchItems%', 
        itemsArrayVariable: 'items_array' 
      }, 
    ]
  }
})

jb.component('itemlist.watch-items-with-heading', {
  type: 'feature',
  params: [
    { id: 'items', essential: true, dynamic: true },
    { id: 'itemsArrayVariable', as: 'string' },
    { id: 'watch', type: 'boolean', as: 'boolean', defaultValue: true },
    { id: 'groupBy', type: 'itemlist.group-by', essential: true, dynamic: true },
  ],
  impl: function(context, items, itemsArrayVariable,watch,groupBy) {
    return {
      beforeInit: function(cmp) {
          var itemsEm = cmp.jbEmitter
              .filter(x => x == 'check')
              .map(x=>
                items(cmp.ctx))
              .filter(items=> 
                !jb_compareArrays(items,cmp.original_items)) // compare before injecting headings
              .do(items => 
                cmp.original_items = items)
              .map(items => 
                groupBy(cmp.ctx.setData(items)) || items
               )
              .do(items => 
                cmp.items_with_headings = items)
              .map(items=> {
                  cmp.items = items.filter(item=>!item.heading);
                  var ctx2 = (cmp.refreshCtx ? cmp.refreshCtx(cmp.ctx) : cmp.ctx).setData(items);
                  var ctx3 = itemsArrayVariable ? ctx2.setVars(jb.obj(itemsArrayVariable,items)) : ctx2;
                  var ctrls = context.vars.$model.controls(ctx3);
                  return ctrls;
              });

          cmp.jbGroupChildrenEm = watch ? itemsEm : itemsEm.take(1);
      },
      observable: () => {} // to create jbEmitter
  }}
})

jb.component('itemlist-default-heading', {
    type: 'control',
    impl :{$: 'label', title: '%title%' }
})

// ************* itemlist.group-by ****************

jb.component('itemlist-heading.group-by', {
  type: 'itemlist.group-by',
  params: [
    { id: 'itemToGroupID', dynamic: true, defaultValue: { $: 'prefix', separator: '.' } },
    { id: 'promoteGroups', type: 'data[]', as: 'array' },
  ],
  impl: (ctx,itemToGroupID,promoteGroups) => {
      var items = ctx.data.map(item=>({ item: item, groupId: itemToGroupID(ctx.setData(item)) }));
      var groups = {};
      items.forEach(item=>{
        groups[item.groupId] = groups[item.groupId] || [];
        groups[item.groupId].push(item.item);
      })
      var groups_ar = jb.entries(groups).map(x=>x[0]);
      groups_ar.sort(); // lexical sort before to ensure constant order
      groups_ar.sort((x1,x2) => promoteGroups.indexOf(x1) - promoteGroups.indexOf(x2));

      var result = [].concat.apply([],groups_ar.map(group => 
        [{ title: group, heading: true }].concat(groups[group]) ));
      return result;
    }
})


})
jbLoadModules(['jb-core','jb-ui','jb-ui/jb-rx']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'], jb_rx = loadedModules['jb-ui/jb-rx'];

jb.component('itemlist', {
  type: 'control',
  params: [
    { id: 'title', as: 'string' },
    { id: 'items', as: 'array' , dynamic: true, essential: true },
    { id: 'controls', type: 'control[]', essential: true, dynamic: true },
    { id: 'style', type: 'itemlist.style', dynamic: true , defaultValue: { $: 'itemlist.ul-li' } },
    { id: 'watchItems', type: 'boolean', as: 'boolean', defaultValue: true },
    { id: 'itemVariable', as: 'string', defaultValue: 'item' },
    { id: 'features', type: 'feature[]', dynamic: true, flattenArray: true },
  ],
  impl :{$: 'group', 
    title: '%$title%',
    style :{$call: 'style'},
    controls :{$: 'dynamic-controls', 
      controlItems : '%$items_array%',
      genericControl :{$call: 'controls'},
      itemVariable: '%$itemVariable%'
    },
    features :[
      {$call: 'features'},
      {$: 'itemlist.init', items: {$call: 'items'}, watch: '%$watchItems%', itemsArrayVariable: 'items_array' }, 
    ]
  }
})

jb.component('itemlist.init', {
  type: 'feature',
  params: [
    { id: 'items', essential: true, dynamic: true },
    { id: 'itemsArrayVariable', as: 'string' },
    { id: 'watch', type: 'boolean', as: 'boolean', defaultValue: true }
  ],
  impl: function(context, items, itemsArrayVariable,watch) {
    return {
      beforeInit: function(cmp) {
          var itemsEm = cmp.jbEmitter
              .filter(x => x == 'check')
              .map(x=>
                items(cmp.ctx))
              .do(items => 
                cmp.items = items)
              .filter(items=>
                ! jb_compareArrays(items,(cmp.ctrls || []).map(ctrl => ctrl.comp.ctx.data))
                )
              .map(items=> {
                  var ctx2 = (cmp.refreshCtx ? cmp.refreshCtx(cmp.ctx) : cmp.ctx).setData(items);
                  var ctx3 = itemsArrayVariable ? ctx2.setVars(jb.obj(itemsArrayVariable,items)) : ctx2;
                  var ctrls = context.vars.$model.controls(ctx3);
                  return ctrls;
              });

          cmp.jbGroupChildrenEm = watch ? itemsEm : itemsEm.take(1);

          cmp.ctrlOfItem = item =>
            context.vars.$model.controls(ctx3)
      },
      observable: () => {} // to create jbEmitter
  }}
})

jb.component('itemlist.ul-li', {
  type: 'group.style',
  impl :{$: 'customStyle',
    features :{$: 'group.initGroup'},
    template: `<div><ul class="jb-itemlist">
      <li *ngFor="let ctrl of ctrls" class="jb-item" [class.heading]="ctrl.comp.ctx.data.heading">
        <jb_comp [comp]="ctrl.comp" [flatten]="true"></jb_comp>
      </li>
      </ul></div>`,
    css: 'ul, li { list-style: none; padding: 0; margin: 0;}'
  }
})

jb.component('itemlist.divider', {
  type: 'feature',
  params: [
    { id: 'space', as: 'number', defaultValue: 5}
  ],
  impl : (ctx,space) =>
    ({css: `.jb-item:not(:first-of-type) { border-top: 1px solid rgba(0,0,0,0.12); padding-top: ${space}px }`})
})

// ****************** Selection ******************

jb.component('itemlist.selection', {
  type: 'feature',
  params: [
    { id: 'databind', as: 'ref' },
    { id: 'onSelection', type: 'action', dynamic: true },
    { id: 'onDoubleClick', type: 'action', dynamic: true },
    { id: 'autoSelectFirst', type: 'boolean'}
  ],
  impl: ctx => ({
    init: cmp => {
        cmp.clickSrc = new jb_rx.Subject();
        cmp.click = cmp.clickSrc
          .takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') )
          .do(()=>{
            if (cmp.selected && cmp.selected.heading)
              cmp.selected = null;
            })
          .filter(()=>
            cmp.selected);

        var doubleClick = cmp.click.buffer(cmp.click.debounceTime(250))
          .filter(buff => buff.length === 2)

        var databindEm = cmp.jbEmitter.filter(x => x == 'check')
            .map(()=> 
              jb.val(ctx.params.databind))
            .filter(x=>
              x != cmp.selected)
            .distinctUntilChanged();

        var selectionEm = cmp.jbEmitter.filter(x => x == 'check')
            .map(()=> cmp.selected)
            .filter(x=>x) 
            .distinctUntilChanged()
            .skip(1);

        doubleClick.subscribe(()=>
          ctx.params.onDoubleClick(ctx.setData(cmp.selected)));

        selectionEm.subscribe( selected => {
          if (jb.val(ctx.params.databind) != selected)
            jb.writeValue(ctx.params.databind,selected);
          ctx.params.onSelection(ctx.setData(cmp.selected))
        });

        databindEm.subscribe(x=>
            cmp.selected = x);
    },
    afterViewInit: cmp => {
        if (ctx.params.autoSelectFirst && cmp.items[0] && !jb.val(ctx.params.databind)) {
            cmp.selected = cmp.items[0];
            jb.writeValue(ctx.params.databind,cmp.selected);
        }
    },
    innerhost: {
      '.jb-item': {
        '[class.active]': 'active == ctrl.comp.ctx.data',
        '[class.selected]': 'selected == ctrl.comp.ctx.data',
        '(mouseenter)': 'active = ctrl.comp.ctx.data',
        '(mouseleave)': 'active = null',
        '(click)': 'selected = ctrl.comp.ctx.data ; clickSrc.next($event)'
      }
    },
    css: `.jb-item.selected { background: #bbb; color: #fff }
    .jb-item.active:not(.heading) { background: #337AB7; color: #fff }
    `,
    observable: () => {} // create jbEmitter
  })
})

jb.component('itemlist.keyboard-selection', {
  type: 'feature',
  params: [
    { id: 'onKeyboardSelection', type: 'action', dynamic: true },
    { id: 'autoFocus', type: 'boolean' }
  ],
  impl: function(context) {
    return {
      init: function(cmp) {
        cmp.keydownSrc = new jb_rx.Subject();
        cmp.keydown = cmp.keydownSrc
          .takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') );

        if (context.params.autoFocus)
            setTimeout(()=> 
              cmp.elementRef.nativeElement.focus(),1);

        cmp.keydown.filter(e=>
              e.keyCode == 38 || e.keyCode == 40)
            .map(event => {
              event.stopPropagation();
              var diff = event.keyCode == 40 ? 1 : -1;
              var items = cmp.items;
              return items[(items.indexOf(cmp.selected) + diff + items.length) % items.length] || cmp.selected;
        }).subscribe(x=>
          cmp.selected = x)
      },
      host: {
        '(keydown)': 'keydownSrc.next($event)',
        'tabIndex' : '0'
      }
    }
  }
})

jb.component('itemlist.drag-and-drop', {
  type: 'feature',
  params: [
  ],
  impl: ctx => ({
      init: function(cmp) {
        var drake = dragula($(cmp.elementRef.nativeElement).findIncludeSelf('.jb-itemlist').get(), {
          moves: el => $(el).hasClass('jb-item')
        });

        drake.on('drag', function(el, source) { 
          el.dragged = { 
            obj: cmp.active,
            remove: obj => cmp.items.splice(cmp.items.indexOf(obj), 1)
          }
        });
        drake.on('drop', (dropElm, target, source,sibling) => {
            dropElm.dragged && dropElm.dragged.remove(dropElm.dragged.obj);
            if (!sibling)
              cmp.items.push(dropElm.dragged.obj)
            else
              cmp.items.splice($(sibling).index()-1,0,dropElm.dragged.obj)
            dropElm.dragged = null;
        });
      }
    })
})

})
jbLoadModules(['jb-core','jb-ui','jb-ui/jb-rx']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'], jb_rx = loadedModules['jb-ui/jb-rx'];

jb.type('itemlog.style');

jb.component('itemlog',{
	type: 'control',
	params: [
		{ id: 'title', as: 'string' },
		{ id: 'items', as: 'observable' , dynamic: true, essential: true },
    { id: 'controls', type: 'control[]', essential: true, dynamic: true},
		{ id: 'style', type: 'itemlog.style', dynamic: true , defaultValue: { $: 'itemlog.div' } },
    { id: 'itemVariable', as: 'string', defaultValue: 'item' },
    { id: 'counter',as : 'ref'},
		{ id: 'features', type: 'feature[]', dynamic: true },
	],
	impl: function(context) {
    return jb_ui.ctrl(context).jbExtend({
        beforeInit: cmp => {
          cmp.items = [];
          cmp.itemToComp = item => 
            context.params.controls(item.setVars(jb.obj(context.params.itemVariable,item.data))) [0];

          context.params.items(context).subscribe(itemCtx=>  {
              cmp.items.unshift(itemCtx);
              if (context.params.counter)
                jb.writeValue(context.params.counter,cmp.items.length)
          })
      }
    });
	}
})

jb.component('itemlog.div', {
  type: 'group.style',
  impl :{$: 'customStyle',
    template: `<div class="jb-group jb-itemlog"><div jb-item *ngFor="let item of items">
        <jb_comp [comp]="itemToComp(item)" flatten="true"></jb_comp>
      </div></div>`
  }
})

})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.component('label', {
    type: "control",
    params: [
        { id: 'title', essential: true, defaultValue: 'hello', dynamic: true },
        { id: 'style', type: 'label.style', defaultValue: { $: 'label.span' }, dynamic: true },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx => {
        return jb_ui.ctrl(ctx.setVars({title: ctx.params.title() }))
    }
})

jb.type('label.style');

jb.component('label.bind-title', {
  type: 'feature',
  impl: ctx => ({
    doCheck: function(cmp) {
      cmp.title = ctx.vars.$model.title(cmp.ctx);
    }
  })
})

jb.component('label.span', {
    type: 'label.style',
    impl :{$: 'customStyle', 
        template: '<span>{{title}}</span>',
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.static-span', {
    type: 'label.style',
    impl :{$: 'customStyle', 
        template: '<span>%$title%</span>'
    }
})

jb.component('label.p', {
    type: 'label.style',
    impl :{$: 'customStyle', 
        template: '<p>{{title}}</p>',
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.h1', {
    type: 'label.style',
    impl :{$: 'customStyle', 
        template: '<h1>{{title}}</h1>',
        features :{$: 'label.bind-title' }
    }
})

jb.component('label.h2', {
    type: 'label.style',
    impl :{$: 'customStyle', 
        template: '<h2>{{title}}</h2>',
        features :{$: 'label.bind-title' }
    }
});




})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.component('markdown', {
    type: 'control',
    params: [
        { id: 'markdown', as: 'string', essential: true, dynamic: true },
        { id: 'style', type: 'markdown.style', defaultValue: { $: 'markdown.showdown' }, dynamic: true },
        { id: 'title', as: 'string', defaultValue: 'markdown' },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: ctx =>
        jb_ui.ctrl(ctx)
})

jb.type('markdown.style');

jb.component('markdown.showdown', {
    type: 'markdown.style',
    impl: ctx => ({
        template: '<div [innerHTML]="markdownHtml"></div>',
        init: function(cmp) {
            cmp.markdownHtml = '';
        },
        doCheck: function(cmp) {
          var new_markdown = ctx.vars.$model.markdown(cmp.ctx);
          if (cmp.markdown != new_markdown) {
              cmp.markdown = new_markdown;
              cmp.markdownHtml = new showdown.Converter({tables:true})
                    .makeHtml(new_markdown);
          }
        }
    })
})


})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.type('picklist.style');
jb.type('picklist.options');

jb.component('picklist', {
  type: 'control',
  params: [
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'databind', as: 'ref'},
    { id: 'options', type: 'picklist.options', dynamic: true, essential: true, defaultValue: {$ : 'picklist.optionsByComma'} },
    { id: 'style', type: 'picklist.style', defaultValue: { $: 'picklist.native' }, dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx => {
    ctx = ctx.setVars({ field: jb_ui.twoWayBind(ctx.params.databind) });
    return jb_ui.ctrl(ctx).jbExtend({
      beforeInit: function(cmp) {
        ctx.vars.field.bindToCmp(cmp, ctx);

        cmp.recalcOptions = function() {
          cmp.options = ctx.params.options(ctx);
          var groupsHash = {};
          cmp.groups = [];
          cmp.options.forEach(o=>{
            var groupId = groupOfOpt(o);
            var group = groupsHash[groupId] || { options: [], text: groupId};
            if (!groupsHash[groupId]) {
              cmp.groups.push(group);
              groupsHash[groupId] = group;
            }
            group.options.push({text: o.text.split('.').pop(), code: o.code });
          })
        }
        cmp.recalcOptions();
      },
     observable: () => {} // to create jbEmitter
    },ctx);
  }
})

function groupOfOpt(opt) {
  if (!opt.group && opt.text.indexOf('.') == -1)
    return '';
  return opt.group || opt.text.split('.').shift();
}

jb.component('picklist.dynamic-options', {
  type: 'feature',
  params: [
    { id: 'recalcEm', as: 'observable'}
  ],
  impl: (ctx,recalcEm) => ({
    init: cmp => 
      recalcEm
        .takeUntil( cmp.jbEmitter )
        .subscribe(e=>
            cmp.recalcOptions()) 
  })
})

// ********* options

jb.component('picklist.optionsByComma',{
  type: 'picklist.options',
  params: [ 
    { id: 'options', as: 'string', essential: true},
    { id: 'allowEmptyValue', type: 'boolean' },
  ],
  impl: function(context,options,allowEmptyValue) {
    var emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat((options||'').split(',').map(function(code) { 
      return { code: code, text: code }
    }))
  }
});

jb.component('picklist.options',{
  type: 'picklist.options',
  params: [ 
    { id: 'options', as: 'array', essential: true},
    { id: 'allowEmptyValue', type: 'boolean' },
  ],
  impl: function(context,options,allowEmptyValue) {
    var emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat(options.map(function(code) { return { code: code, text: code } } ));
  }
})

jb.component('picklist.coded-options',{
  type: 'picklist.options',
  params: [ 
    { id: 'options', as: 'array',essential: true },
    { id: 'code', as: 'string', dynamic:true , essential: true }, 
    { id: 'text', as: 'string', dynamic:true, essential: true } ,
    { id: 'allowEmptyValue', type: 'boolean' },
  ],
  impl: function(context,options,code,text,allowEmptyValue) {
    var emptyValue = allowEmptyValue ? [{code:'',value:''}] : [];
    return emptyValue.concat(options.map(function(option) { 
      return { 
        code: code(null,option), text: text(null,option) 
      }
    }))
  }
})

})
jbLoadModules(['jb-core','jb-ui','jb-ui/jb-rx']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'], jb_rx = loadedModules['jb-ui/jb-rx'];

jb.component('pulldown.menu-item-separator', {
	type: 'control',
	impl: ctx => 
		jb_ui.Comp({ jbTemplate: '<div></div>', css: '{ margin: 6px 0; border-bottom: 1px solid #EBEBEB}'},ctx)
})

jb.component('pulldown.menu-item-group', {
	type: 'control',
	params: [
		{ id: 'title', as: 'string', dynamic: true, essential: true },
	],
	impl: ctx => 
		jb_ui.Comp({ template: '<div class="pulldown-menu-separator"></div>'},ctx)
})

jb.component('pulldown.menu-item', {
	type: 'control',
	params: [
		{ id: 'title', as: 'string', dynamic: true, essential: true },
		{ id: 'icon', as: 'string' },
		{ id: 'shortcut', as: 'string' },
		{ id: 'action', type: 'action', dynamic: true },
	    { id: 'style', type: 'pulldown-menu-item.style', defaultValue: { $: 'pulldown-menu-item.default' }, dynamic: true },
		{ id: 'features', type: 'feature[]', dynamic: true },
		{ id: '$click', type: 'boolean'},
	],
	  impl: function(context,title,icon,shortcut) {
	    if (context.params.$click) try { context.params.action() } catch (e) { jb.logException(e) } // for test debug
	    return jb_ui.ctrl(context).jbExtend({
	      beforeInit: function(cmp) {
	        cmp.title = title();
	        cmp.icon = icon;
	        cmp.shortcut = shortcut;
	        cmp.clicked = jb_ui.wrapWithLauchingElement(() => {
	        	context.vars.$dialog && context.vars.$dialog.close(); // close dialog
	        	context.params.action();
	        } , context, cmp.elementRef);
	      }
	    })
	  }
	// impl :{$: 'button',
	// 	title: '%$title%',
	// 	style :{$: 'pulldown_button.menuButton', icon: '{%$icon%}' },
	// 	action: [
	// 	  { $: 'closeContainingPopup' },
	// 	  { $call: 'action' }
	// 	],
	// 	features :{$call: 'features' },
	// 	$click : '%$$click%'
	// }
})

jb.component('pulldown-menu-item.default', {
  type: 'button.style',
  params: [
	  { id: 'icon', as: 'string' }
  ],
  impl :{$: 'customStyle',
  	template: `<div><div class="line noselect" (click)="clicked()">
  		<i class="material-icons">{{icon}}</i><span class="title">{{title}}</span><span class="shortcut">{{shortcut}}</span>
  		</div></div>`,
	css: `.line { display: flex; width1: 100%; cursor: pointer; background: #fff; font: 13px Arial; height: 24px}
		  .line.selected { background: #d8d8d8 }	
		  i { width: 24px; padding-left: 3px; padding-top: 3px; font-size:16px; }
		  span { padding-top: 3px }
          .title { display: block; text-align: left; } 
		  .shortcut { margin-left: auto; text-align: right; padding-right: 15px }
		  .line:hover { background: #eee; }
		`
	}
})

jb.component('pulldown.topMenuItem', {
	type: 'control',
	params: [
		{ id: 'title', dynamic: true, as: 'string' },
		{ id: 'style', type: 'pulldownTopMenuItem.style', dynamic: true, defaultValue: { $: 'pulldownTopMenuItem.default' } },
		{ id: 'controls', type: 'control[]', dynamic: true, flattenArray: true },
		{ id: 'open', type: 'boolean'},
	],
	impl: function(context) { 
		var openPopup = function(ctx,cmp) {
			return ctx.setVars({
				popupWidth: ctx.vars.$launchingElement.$el.outerWidth()
			}).run({
				$: 'openDialog', 
				style :{$: 'pulldownPopup.mainMenuPopup' }, 
				content :{$: 'group', 
					controls: ctx => 
						context.params.controls(ctx) 
				}
			})
		}

		return jb_ui.ctrl(context).jbExtend({
			init: function(cmp) {
				cmp.mouseEnter = function() {
					if ($('.pulldown-mainmenu-popup')[0]) 
						cmp.openPopup();
				}
				cmp.title = context.params.title();
				cmp.openPopup = jb_ui.wrapWithLauchingElement(openPopup, context, cmp.elementRef); 

				if (context.params.open)
					cmp.openPopup();
			}
		},context)
	}
})

jb.type('pulldownTopMenuItem.style');

jb.component('pulldownTopMenuItem.default',{
	type: 'pulldownTopMenuItem.style',
	impl :{$: 'customStyle',
			template: '<button class="pulldown-top-menu-item" (mouseEnter)="mouseEnter()" (click)="openPopup()">{{title}}</button>',
	}
})

jb.component('pulldownPopup.mainMenuPopup',{
	type: 'dialog.style',
	impl :{$: 'customStyle',
			template: `<div class="jb-dialog jb-popup pulldown-mainmenu-popup">
							<jb_comp [comp]="contentComp" class="dialog-content"></jb_comp>
							<div class="pulldown-menu-remove-top-border"></div>
						</div>`, 
			css: '.pulldown-menu-remove-top-border { width: %$popupWidth%px }',
			features: [
					{ $: 'dialog-feature.uniqueDialog', id: 'pulldown main menu popup', remeberLastLocation: false },
					{ $: 'dialog-feature.maxZIndexOnClick' },
					{ $: 'dialog-feature.closeWhenClickingOutside' },
					{ $: 'dialog-feature.cssClassOnLaunchingControl' },
					{ $: 'dialog-feature.nearLauncherLocation' }
			]
	}
})

jb.component('pulldownPopup.contextMenuPopup',{
	type: 'dialog.style',
	impl :{$: 'customStyle',
			template: '<div class="jb-dialog jb-popup pulldown-mainmenu-popup"><jb_comp [comp]="contentComp" class="dialog-content"></jb_comp></div>',
			features: [
				{ $: 'dialog-feature.uniqueDialog', id: 'pulldown context menu popup', remeberLastLocation: false },
				{ $: 'dialog-feature.maxZIndexOnClick' },
				{ $: 'dialog-feature.closeWhenClickingOutside' },
				{ $: 'dialog-feature.cssClassOnLaunchingControl' },
				{ $: 'dialog-feature.nearLauncherLocation' }
			]
	}
})

jb.component('group.menu-keyboard-selection', {
  type: 'feature',
  params: [
    { id: 'autoFocus', type: 'boolean' }
  ],
  impl: ctx => 
  	({
	  observable: () => {},
      init: function(cmp) {
        cmp.keydownSrc = new jb_rx.Subject();
        cmp.keydown = cmp.keydownSrc
          .takeUntil( cmp.jbEmitter.filter(x=>x =='destroy') );

        if (ctx.params.autoFocus)
            setTimeout(()=> {
              cmp.elementRef.nativeElement.focus();
              $(cmp.elementRef.nativeElement).find('>*').first()
              	.addClass('selected')
              	.find('>*').addClass('selected'); // adding selected class at the inner componenet level
            })
        cmp.keydown
        	.filter(e=>e.keyCode == 13)
            .subscribe(e => {
	            var selected = $(cmp.elementRef.nativeElement).find('>.selected');
            	var selectedCtx = (cmp.ctrls[selected.index()] || {}).comp.ctx;
            	if (selectedCtx && selectedCtx.params.action)
					jb_ui.wrapWithLauchingElement(selectedCtx.params.action, selectedCtx, 
						$(cmp.elementRef.nativeElement).find('>.selected')[0])()
            })

        cmp.keydown
        	.filter(e=>e.keyCode == 27)
            .subscribe(e => 
            	ctx.run({$:'closeContainingPopup'}))

        cmp.keydown
        	.filter(e=>e.keyCode == 38 || e.keyCode == 40)
            .subscribe(e => {
              e.stopPropagation();
              var diff = event.keyCode == 40 ? 1 : -1;
              var elems = $(cmp.elementRef.nativeElement).find('>*');
              var selected = $(cmp.elementRef.nativeElement).find('>.selected');
              var newSelected = elems[selected.index()+diff] || selected;
              $(cmp.elementRef.nativeElement).find('>*,>*>*').removeClass('selected');
              $(newSelected).addClass('selected');
              $(newSelected).find('>*').addClass('selected'); /// adding the selected class at the inner componenet level
        })
      },
      host: {
        '(keydown)': 'keydownSrc.next($event)',
        'tabIndex' : '0',
      }
    })
})

})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.type('sidenav.style');

jb.component('sidenav',{
  type: 'control',
  params: [
    { id: 'controls', type: 'control[]', essential: true, flattenArray: true, dynamic: true },
    { id: 'title', as: 'string' , dynamic: true },
    { id: 'style', type: 'sidenav.style', defaultValue: { $: 'sidenav.md' }, essential: true , dynamic: true },
    { id: 'features', type: 'feature[]', dynamic: true },
  ],
  impl: ctx =>
    jbart.comps.group.impl(ctx)
})

jb.component('sidenav.md', {
  type: 'sidenav.style',
  params: [
    { id: 'width', as: 'number' },
    { id: 'align', options: 'start,end', as: 'string'},
    { id: 'mode', options: 'over,push,side', as: 'string'},
    { id: 'opened', as: 'boolean', type: 'boolean' }
  ],
  impl :{$: 'customStyle',
    template: `<md-sidenav-layout>
      <md-sidenav>
        <jb_comp *ngFor="let ctrl of ctrls" [comp]="ctrl.comp" [flatten]="true" align="%$align%" mode="%$mode%"></jb_comp>
      </md-sidenav>
      </md-sidenav-layout>`,
    css: `md-sidenav { width: %$width%px }`,
    features :{$: 'group.initGroup'}
  }
})

})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.component('customStyle', {
	typePattern: /.*-style/,
	params: [
		{ id: 'template', as: 'string', essential: true},
		{ id: 'css', as: 'string'},
    	{ id: 'features', type: 'feature[]', dynamic: true },
		{ id: 'methods', as: 'object'},
		{ id: 'atts', as: 'object'},
		{ id: 'directives', ignore: true }
	],
	impl: function (context,template,css,features,methods,atts,noViewEncapsulation) {
		var defaultOptions = {directives: jb.entries(jbart.ng.directives)
			.map(x=>x[0])
		};
		var options = jb.extend({
				jbTemplate: template,
				css: css,
				atts: atts,
				directives: context.profile.directives,
				featuresOptions: features()
			},methods);
		jb.extend(options,defaultOptions);

		return options;
	}
})

jb.component('custom-control', {
	type: 'control',
	params: [
		{ id: 'title', as: 'string', dynamic: true },
		{ id: 'html', as: 'string', essential: true, defaultValue: '<div></div>'},
		{ id: 'css', as: 'string'},
		{ id: 'options', as: 'object'},
    	{ id: 'features', type: 'feature[]', dynamic: true },
		{ id: 'directives', ignore: true },
	],
	impl: (ctx,title,html,css,options,features) => {
		var defaultOptions = {directives: jb.entries(jbart.ng.directives)
			.map(x=>x[0])
		};
		jbart.ctxDictionary[ctx.id] = ctx;
		return jb_ui.Comp(jb.extend({ 
			jbTemplate: `<div jb-ctx="${ctx.id}">${html}</div>`, //jb_ui.parseHTML(`<div>${html || ''}</div>`).innerHTML, 
			css: css, 
			featuresOptions: features(),
			directives: ctx.profile.directives,
		},defaultOptions,options),ctx)
	}
})

})
jbLoadModules(['jb-core','jb-ui','jb-ui/jb-rx']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'], jb_rx = loadedModules['jb-ui/jb-rx'];

jb.component('tabs', {
	type: 'control',
	params: [
		{ id: 'tabs', type: 'control[]', essential: true, flattenArray: true, dynamic: true },
		{ id: 'style', type: 'tabs.style', dynamic: true, defaultValue: { $: 'tabs.simple' } },
		{ id: 'features', type: 'feature[]', dynamic: true },
	],
  impl: function(context) { 
    return jb_ui.ctrl(context).jbExtend({
      beforeInit: cmp => {
      	cmp.empty = jb_ui.Comp({ template: '<div></div>'},context);
      	cmp.selectedTab = 0;

      	cmp.selectedTabContent = () => 
      		[cmp.comps[cmp.selectedTab] || cmp.empty];

        cmp.initTabs = function() {
          (cmp.jbGroupChildrenEm || jb_rx.Observable.of(context.params.tabs(cmp.ctx)))
              .merge(cmp.jbWatchGroupChildrenEm || jb_rx.Observable.of())
              .subscribe(comps=> {
              	cmp.comps = comps;
                cmp.jb_disposable && cmp.jb_disposable.forEach(d=>d());
                cmp.titles = comps.map(comp=>
                	comp.jb_title ? comp.jb_title() : '')
              })
        }
      }
    })
  }
})

jb.component('tabs.initTabs', {
  type: 'feature',
  impl: ctx => 
    ({init: cmp => cmp.initTabs()})
})

jb.type('tabs.style');


jb.component('tabs.simple', {
	type: 'tabs.style',
  	impl :{$: 'customStyle',
	    template: `<div class="jb-tab">
	    	<div class="tab-titles">
	    		<button *ngFor="let title of titles; let i = index" md-button (click)="selectedTab = i" [ngClass]="{'selected': i==selectedTab}">{{title}}</button>
	        </div>
	        <jb_comp *ngFor="let comp of selectedTabContent()" [comp]="comp"></jb_comp>
	      </div>`,
	     css: `.selected { border-bottom: 1px solid black }`,
	    features :{$: 'tabs.initTabs'},
  	}
})

// jb.component('tabs.accordion',{
// 	type: 'tabs.style',
// 	impl :{$: 'group', 
// 		cssClass: 'jb-accordion',
// 		controls: ctx => jb_rx.concat(ctx.vars.$model.tabs()),
// 		style :{$: 'group-expandable-subgroups' } 
// 	}
// }) 

})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.type('text.style');

jb.component('text', {
    type: 'control',
    params: [
        { id: 'text', essential: true, dynamic: true },
        { id: 'style', type: 'text.style', defaultValue: { $: 'text.multi-line' }, dynamic: true },
        { id: 'title', as: 'string', defaultValue: 'text' },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: (ctx,text) => 
        jb_ui.ctrl(ctx.setVars({text: ctx.params.text()}))
})

jb.component('text.bind-text', {
  type: 'feature',
  impl: ctx => ({
    doCheck: function(cmp) {
      cmp.text = ctx.vars.$model.text(cmp.ctx);
    }
  })
})


jb.component('text.multi-line', {
    type: 'text.style',
    params: [
        { id: 'rows',as: 'number', defaultValue: '8'},
        { id: 'cols',as: 'number', defaultValue: '80'},
    ],
    impl :{$: 'customStyle', 
        template: '<div><textarea readonly cols="%$cols%" rows="%$rows%">{{text}}</textarea></div>',
        features :{$: 'text.bind-text'}
    }
})

jb.component('text.paragraph', {
    type: 'text.style',
    impl :{$: 'customStyle', 
        template: '<p>{{text}}</p>',
        features :{$: 'text.bind-text' }
    }
})

jb.component('rich-text', {
    type: 'control',
    params: [
        { id: 'text', essential: true, as: 'string', dynamic: true },
        { id: 'title', as: 'string', defaultValue: 'rich-text', dynamic: true },
        { id: 'style', type: 'rich-text.style', defaultValue: { $: 'rich-text.html' }, dynamic: true },
        { id: 'features', type: 'feature[]', dynamic: true },
    ],
    impl: (ctx,text,title) => 
        jb_ui.ctrl(ctx.setVars({text: text(), title: title() }))
})

jb.component('rich-text.html', {
    type: 'rich-text.style',
    impl :{$: 'customStyle', 
        template: '%$text%',
    }
})

jb.component('rich-text.html-in-section', {
    type: 'rich-text.style',
    impl :{$: 'customStyle', 
        template: `<section>
                    <div class="title">%$title%</div>
                    %$text%
                </section>`,
    }
})

})
jbLoadModules(['jb-core','jb-ui']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'];

jb.type('theme');

jb.component('group.theme', {
  type: 'feature',
  params: [
    { id: 'theme', type: 'theme' },
  ],
  impl: (context,theme) => ({
    extendCtx: (ctx,cmp) => 
      ctx.setVars(theme)
  })
})

jb.component('theme.material-design', {
  type: 'theme',
  impl: () => ({
  	'$theme.editable-text': 'editable-text.md-input'
  })
})

})
jbLoadModules(['jb-core','jb-ui','jb-ui/jb-rx','jb-ui/jb-ui-utils']).then(loadedModules => { var jb = loadedModules['jb-core'].jb, jb_ui = loadedModules['jb-ui'], jb_rx = loadedModules['jb-ui/jb-rx'];
	var utils = loadedModules['jb-ui/jb-ui-utils'];

jb.component('add-css-class',{
	type: 'action',
	params: [
		{ id: 'cssClass', as: 'string' }
	],
	impl: function(context,cssClass) {
		if (context.vars.control && context.vars.control.$el) 
			context.vars.control.$el.addClass(cssClass);
	}
});

jb.component('url-param',{
	type: 'data',
	params: [
		{ id: 'param', as: 'string' }
	],
	impl: function(context,param) {
		return ui_utils.urlParam(param);
	}
});


jb.component('sessionStorage',{
	type: 'data',
	params: [
		{ id: 'key', as: 'string'}
	],
	impl: function(context,key) {
		return {
			$jb_val: function(value) {
				if (typeof value == 'undefined') 
					return sessionStorage[key];
				else
					sessionStorage[key]=jb.tostring(value);
			}
		}
	}
});

jb.component('goto-url', {
	type: 'action',
	description: 'navigate/open a new web page, change href location',
	params: [
		{ id: 'url', as:'string', essential: true },
		{ id: 'target', type:'enum', values: ['new tab','self'], defaultValue:'new tab', as:'string'}
	],
	impl: function(context,url,target) {
		var _target = (target == 'new tab') ? '_blank' : '_self';
		window.open(url,_target);
	}
})

jb.component('apply', {
	type: 'action',
	impl: jb_ui.apply
})

jb.component('search-filter',{
	type: 'aggregator',
	params: [
		{ id: 'pattern', as: 'string' }
	],
	impl: (context,pattern) =>
		context.data.filter(item => {
			var itemText = JSON.stringify(item).toLowerCase();
			return !pattern || itemText.indexOf(pattern.toLowerCase()) != -1;
		})
})

jb.component('new-instance', {
	type: 'data',
	params: [
		{ id: 'module', as: 'string', essential: true },
		{ id: 'class', as: 'string', essential: true},
		// todo - constructor
	],
	impl: (ctx,module,_class) => {
		try {
			return new (jb.entries(System._loader.modules).filter(p=>p[0].indexOf(module) != -1)[0][1].module[_class])()
		} catch (e) {
			return;
		}
	}
})

jb.component('injector-get', {
	type: 'data',
	params: [
		{ id: 'provider', as: 'string', essential: true },
	],
	impl: (ctx,providerId) => {
		var provider = jbart.ng.providers[providerId];
		if (provider)
			return ctx.vars.injector.get(provider);
		jb.logError('injector-get: provider ' + providerId + ' is not registered. Use jb_ui.registerProviders to register it');
	}
})

})