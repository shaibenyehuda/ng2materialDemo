System.register(['jb-core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.open-context-viewer', {
                type: 'action',
                impl: { $: 'openDialog',
                    title: 'Context Viewer',
                    style: { $: 'dialog.studio-floating', id: 'studio-context-viewer', width: 300 },
                    content: { $: 'studio.context-viewer' },
                }
            });
            jb_core_1.jb.component('studio.context-viewer', {
                type: 'control',
                impl: { $: 'studio.data-browse', data: '%$globals/last_pick_selection%', title: 'context' },
            });
        }
    }
});

System.register(['jb-core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.open-resource', {
                type: 'action',
                params: [
                    { id: 'resource', type: 'data' },
                    { id: 'id', as: 'string' }
                ],
                impl: { $: 'openDialog',
                    title: '%$id%',
                    style: { $: 'dialog.studio-floating', id: 'resource %$id%', width: 500 },
                    content: { $: 'tree', cssClass: 'jb-control-tree',
                        nodeModel: { $: 'tree.json-read-only',
                            object: '%$resource%', rootPath: '%$id%'
                        },
                        features: [
                            { $: 'tree.selection' },
                            { $: 'tree.keyboard-selection' }
                        ]
                    },
                }
            });
        }
    }
});

System.register(['jb-core', './studio-tgp-model', './studio-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, studio_tgp_model_1, studio_utils_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.editSource', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string', defaultValue: { $: 'studio.currentProfilePath' } }
                ],
                impl: {
                    $: 'openDialog',
                    title: { $: 'studio.short-title', path: '%$path%' },
                    style: { $: 'dialog.studio-floating', id: 'edit source', width: 600 },
                    features: { $: 'css', css: '.jb-dialog-content-parent {overflow-y: hidden}' },
                    content: { $: 'editable-text',
                        databind: { $: 'studio.profile-as-text', path: '%$path%' },
                        style: { $: 'editable-text.codemirror', mode: 'javascript' },
                        features: { $: 'studio.undo-support', path: '%$path%' },
                    }
                }
            });
            jb_core_1.jb.component('studio.profile-as-text', {
                type: 'data',
                params: [
                    { id: 'path', as: 'string', dynamic: true },
                ],
                impl: function (ctx) { return ({
                    $jb_val: function (value) {
                        var path = ctx.params.path();
                        if (!path)
                            return;
                        if (typeof value == 'undefined') {
                            var val = studio_tgp_model_1.model.val(path);
                            if (typeof val == 'string')
                                return val;
                            return jb_core_1.jb.prettyPrint(val);
                        }
                        else {
                            var newVal = value.match(/^\s*({|\[)/) ? studio_utils_1.evalProfile(value) : value;
                            if (newVal != null)
                                studio_tgp_model_1.model.modify(studio_tgp_model_1.model.writeValue, path, { value: newVal }, ctx);
                        }
                    }
                }); }
            });
            jb_core_1.jb.component('studio.string-property-ref', {
                type: 'data',
                params: [
                    { id: 'path', as: 'string' },
                ],
                impl: function (context, path, stringOnly) { return ({
                    $jb_val: function (value) {
                        if (typeof value == 'undefined') {
                            return studio_tgp_model_1.model.val(path);
                        }
                        else {
                            studio_tgp_model_1.model.modify(studio_tgp_model_1.model.writeValue, path, { value: newVal }, context);
                        }
                    }
                }); }
            });
            jb_core_1.jb.component('studio.goto-sublime', {
                type: 'control',
                params: [
                    { id: 'path', as: 'string' },
                ],
                impl: { $: 'dynamic-controls',
                    controlItems: { $: 'studio.goto-targets', path: '%$path%' },
                    genericControl: { $: 'pulldown.menu-item',
                        title: { $pipeline: [
                                '%$controlItem%',
                                { $: 'split', separator: '~', part: 'first' },
                                'goto sublime: %%'
                            ] },
                        action: { $: 'studio.open-sublime-editor', path: '%$controlItem%' }
                    }
                },
            });
            jb_core_1.jb.component('studio.goto-targets', {
                params: [
                    { id: 'path', as: 'string' },
                ],
                impl: function (ctx, path) {
                    return [studio_tgp_model_1.model.compName(path), path]
                        .filter(function (x) { return x; })
                        .map(function (x) {
                        return x.split('~')[0];
                    })
                        .filter(jb_unique(function (x) { return x; }));
                }
            });
            jb_core_1.jb.component('studio.open-sublime-editor', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' },
                ],
                impl: function (ctx, path) {
                    path && $.ajax("/?op=gotoSource&comp=" + path.split('~')[0]);
                }
            });
        }
    }
});

System.register(['jb-core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('dialog.studio-jb-editor-popup', {
                type: 'dialog.style',
                impl: { $: 'customStyle',
                    template: "<div class=\"jb-dialog jb-popup\">\n              <button class=\"dialog-close\" (click)=\"dialogClose()\">&#215;</button>\n              <jb_comp [comp]=\"contentComp\" class=\"dialog-content\"></jb_comp>\n            </div>",
                    css: "{ background: #fff; position: absolute }\n        .dialog-close {\n            position: absolute; \n            cursor: pointer; \n            right: -7px; top: -22px; \n            font: 21px sans-serif; \n            border: none; \n            background: transparent; \n            color: #000; \n            text-shadow: 0 1px 0 #fff; \n            font-weight: 700; \n            opacity: .2;\n        }\n        .dialog-close:hover { opacity: .5 }\n        ",
                    features: [
                        { $: 'dialog-feature.maxZIndexOnClick' },
                        { $: 'dialog-feature.closeWhenClickingOutside' },
                        { $: 'dialog-feature.nearLauncherLocation' },
                        { $: 'dialog-feature.uniqueDialog', id: 'studio-jb-editor-popup' },
                        { $: 'css.box-shadow',
                            blurRadius: 5,
                            spreadRadius: 0,
                            shadowColor: '#000000',
                            opacity: 0.75,
                            horizontal: 0,
                            vertical: 0,
                        }
                    ]
                }
            });
            jb_core_1.jb.component('dialog.studio-suggestions-popup', {
                type: 'dialog.style',
                impl: { $: 'customStyle',
                    template: "<div class=\"jb-dialog jb-popup\">\n              <jb_comp [comp]=\"contentComp\" class=\"dialog-content\"></jb_comp>\n            </div>",
                    css: "{ background: #fff; position: absolute; padding: 3px 5px }",
                    features: [
                        { $: 'dialog-feature.maxZIndexOnClick' },
                        { $: 'dialog-feature.closeWhenClickingOutside' },
                        { $: 'dialog-feature.cssClassOnLaunchingControl' },
                        { $: 'dialog-feature.nearLauncherLocation' },
                        //        { $: 'studio.fix-suggestions-margin' } ,
                        { $: 'dialog-feature.uniqueDialog', id: 'studio-suggestions-popup' },
                        { $: 'css.box-shadow',
                            blurRadius: 5,
                            spreadRadius: 0,
                            shadowColor: '#000000',
                            opacity: 0.75,
                            horizontal: 0,
                            vertical: 0,
                        }
                    ]
                }
            });
        }
    }
});
// jb.component('studio.fix-suggestions-margin', {
//   type: 'dialog-feature',
//   impl: ctx => {
//     var e = ctx.exp('%$jbEditEvent%');
//     var temp = $('<span></span>').css('font',$(e.input).css('font')).css('width','100%')
//       .css('z-index','-1000').text($(e.input).val().substr(0,e.pos)).appendTo('body');
//     var offset = temp.width();
//     temp.remove();
//     return {
//       css: `{ margin-left: ${offset}px }`
//     }
//   }
// })
// jb.component('editable-text.studio-jb-edit-input',{
//   type: 'editable-text.style',
//   impl :{$: 'customStyle', 
//    features :{$: 'editable-text.bindField' },
//    template: `<span><md-input [(ngModel)] = "jbModel" placeholder=""></md-input></span>`,
//       css: 'md-input { width: 220px }',
//       directives: 'MdInput'
//   }
// })

System.register(['jb-core', 'jb-ui', './studio-tgp-model'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, jb_ui, studio_tgp_model_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (jb_ui_1) {
                jb_ui = jb_ui_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.open-jb-editor', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'openDialog',
                    content: { $: 'studio.jb-editor', path: '%$path%' },
                    style: { $: 'dialog.studio-floating',
                        id: 'jb editor',
                        width: '700',
                        height: '400'
                    },
                    menu: { $: 'button',
                        style: { $: 'button.md-icon', icon: 'menu' },
                        action: { $: 'studio.open-jb-editor-menu', path: '%$globals/jb_editor_selection%' }
                    },
                    title: 'Inteliscript'
                }
            });
            jb_core_1.jb.component('studio.jb-editor', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'group',
                    title: 'main',
                    style: { $: 'layout.horizontal', spacing: 3 },
                    controls: [
                        { $: 'tree',
                            cssClass: 'jb-editor jb-control-tree studio-control-tree',
                            nodeModel: { $: 'studio.jb-editor.nodes', path: '%$path%' },
                            features: [
                                { $: 'tree.selection',
                                    databind: '%$globals/jb_editor_selection%',
                                    onDoubleClick: { $: 'studio.open-jb-edit-property',
                                        path: '%$globals/jb_editor_selection%'
                                    },
                                    autoSelectFirst: true
                                },
                                { $: 'tree.keyboard-selection',
                                    onEnter: { $: 'studio.open-jb-edit-property',
                                        path: '%$globals/jb_editor_selection%'
                                    },
                                    onRightClickOfExpanded: { $: 'studio.open-jb-editor-menu', path: '%%' },
                                    autoFocus: true
                                },
                                { $: 'tree.drag-and-drop' },
                                { $: 'tree.keyboard-shortcut',
                                    key: 'Ctrl+Up',
                                    action: { $: 'studio.move-in-array', path: '%%', moveUp: true }
                                },
                                { $: 'tree.keyboard-shortcut',
                                    key: 'Ctrl+Down',
                                    action: { $: 'studio.move-in-array', path: '%%', moveUp: false }
                                },
                                { $: 'tree.keyboard-shortcut',
                                    key: 'Ctrl+C',
                                    action: { $: 'studio.copy', path: '%%' }
                                },
                                { $: 'tree.keyboard-shortcut',
                                    key: 'Ctrl+V',
                                    action: { $: 'studio.paste', path: '%%' }
                                },
                                { $: 'tree.keyboard-shortcut',
                                    key: 'Ctrl+Z',
                                    action: { $: 'studio.undo', path: '%%' }
                                },
                                { $: 'tree.keyboard-shortcut',
                                    key: 'Ctrl+Y',
                                    action: { $: 'studio.redo', path: '%%' }
                                },
                                { $: 'tree.keyboard-shortcut',
                                    key: 'Delete',
                                    action: { $: 'studio.delete', path: '%%' }
                                },
                                { $: 'studio.control-tree.refreshPathChanges' },
                                { $: 'css.width', width: '500' },
                                { $: 'feature.studio-auto-fix-path', path: '%$globals/jb_editor_selection%' }
                            ]
                        },
                        { $: 'group',
                            title: 'watch selection',
                            controls: [
                                { $: 'group',
                                    title: 'hide if selection empty',
                                    controls: [
                                        { $: 'group',
                                            title: 'watch selection content',
                                            controls: { $: 'group',
                                                title: 'wait for probe',
                                                controls: { $: 'itemlist',
                                                    items: '%$probeResult/finalResult%',
                                                    controls: [
                                                        { $: 'group',
                                                            title: 'in/out',
                                                            controls: [
                                                                { $: 'studio.data-browse',
                                                                    data: '%in/data%',
                                                                    title: 'in'
                                                                },
                                                                { $: 'studio.data-browse',
                                                                    data: '%out%',
                                                                    title: 'out'
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                },
                                                features: { $: 'group.wait',
                                                    for: { $: 'studio.probe', path: '%$globals/jb_editor_selection%' },
                                                    loadingControl: { $: 'label', title: 'calculating...' },
                                                    resource: 'probeResult'
                                                }
                                            },
                                            features: { $: 'group.watch',
                                                data: { $: 'pipeline',
                                                    items: [
                                                        { $: 'stringify',
                                                            value: { $: 'studio.val',
                                                                path: '%$globals/jb_editor_selection%'
                                                            }
                                                        },
                                                        '%$globals/jb_editor_selection%:%%'
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    features: { $: 'group-item.if',
                                        showCondition: '%$globals/jb_editor_selection%'
                                    }
                                }
                            ],
                            features: { $: 'group.watch', data: '%$globals/jb_editor_selection%' }
                        }
                    ],
                }
            });
            jb_core_1.jb.component('studio.data-browse', {
                type: 'control',
                params: [
                    { id: 'data', },
                    { id: 'title', as: 'string' }
                ],
                impl: { $: 'group',
                    title: '%$title%',
                    controls: { $: 'tree', cssClass: 'jb-control-tree',
                        nodeModel: { $: 'tree.json-read-only',
                            object: '%$data%', rootPath: '%$title%'
                        },
                        features: [
                            { $: 'tree.selection' },
                            { $: 'tree.keyboard-selection' },
                        ]
                    },
                }
            });
            jb_core_1.jb.component('studio.jb-editor.nodes', {
                type: 'tree.nodeModel',
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return new studio_tgp_model_1.TgpModel(path, 'jb-editor');
                }
            });
            jb_core_1.jb.component('studio.open-jb-edit-property', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'openDialog',
                    style: { $: 'dialog.studio-jb-editor-popup' },
                    content: { $: 'studio.jb-floating-input', path: '%$path%' },
                    features: [
                        { $: 'dialog-feature.autoFocusOnFirstInput' },
                        { $: 'dialog-feature.onClose',
                            action: { $: 'toggleBooleanValue', of: '%$globals/jb_preview_result_counter%' }
                        }
                    ]
                }
            });
            jb_core_1.jb.component('studio.profile-value-as-text', {
                type: 'data',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: function (context, path) { return ({
                    $jb_val: function (value) {
                        if (typeof value == 'undefined') {
                            var val = studio_tgp_model_1.model.val(path);
                            if (val == null)
                                return '';
                            if (typeof val == 'string')
                                return val;
                            if (studio_tgp_model_1.model.compName(path))
                                return '=' + studio_tgp_model_1.model.compName(path);
                        }
                        else if (value.indexOf('=') != 0)
                            studio_tgp_model_1.model.modify(studio_tgp_model_1.model.writeValue, path, { value: value }, context);
                    }
                }); }
            });
            jb_core_1.jb.component('studio.open-jb-editor-menu', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'openDialog',
                    style: { $: 'pulldownPopup.contextMenuPopup' },
                    content: { $: 'studio.jb-editor-menu', path: '%$path%' },
                    features: { $: 'css.margin', top: '17', left: '31' }
                }
            });
            jb_core_1.jb.component('studio.jb-editor-menu', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'group',
                    controls: [
                        { $: 'dynamic-controls',
                            controlItems: { $: 'studio.more-params', path: '%$path%' },
                            genericControl: { $: 'pulldown.menu-item',
                                title: {
                                    $pipeline: [
                                        '%$controlItem%',
                                        { $: 'suffix', separator: '~' }
                                    ]
                                },
                                action: { $: 'runActions',
                                    $vars: { nextPath: '%$path%~%$controlItem%' },
                                    actions: [
                                        { $: 'studio.add-property', path: '%$controlItem%' },
                                        { $: 'closeContainingPopup' },
                                        { $: 'writeValue',
                                            to: '%$globals/jb_editor_selection%',
                                            value: '%$nextPath%'
                                        },
                                        { $: 'studio.open-jb-editor-menu', path: '%$nextPath%' }
                                    ]
                                }
                            }
                        },
                        { $: 'divider',
                            style: { $: 'divider.br' },
                            title: 'divider'
                        },
                        { $: 'pulldown.menu-item',
                            $vars: {
                                compName: { $: 'studio.comp-name', path: '%$path%' }
                            },
                            title: 'Goto %$compName%',
                            action: { $: 'studio.open-jb-editor', path: '%$compName%' },
                            features: { $: 'hidden', showCondition: '%$compName%' }
                        },
                        { $: 'studio.goto-sublime', path: '%$path%' },
                        { $: 'pulldown.menu-item-separator' },
                        { $: 'pulldown.menu-item',
                            title: 'Delete',
                            icon: 'delete',
                            shortcut: 'Delete',
                            action: [
                                { $: 'writeValue', to: '%$TgpTypeCtrl.expanded%', value: false },
                                { $: 'studio.delete', path: '%$path%' }
                            ]
                        },
                        { $: 'pulldown.menu-item',
                            title: 'Copy',
                            icon: 'copy',
                            shortcut: 'Ctrl+C',
                            action: { $: 'studio.copy', path: '%$path%' }
                        },
                        { $: 'pulldown.menu-item',
                            title: 'Paste',
                            icon: 'paste',
                            shortcut: 'Ctrl+V',
                            action: { $: 'studio.paste', path: '%$path%' }
                        },
                        { $: 'pulldown.menu-item',
                            title: 'Undo',
                            icon: 'undo',
                            shortcut: 'Ctrl+Z',
                            action: { $: 'studio.undo' }
                        },
                        { $: 'pulldown.menu-item',
                            title: 'Redo',
                            icon: 'redo',
                            shortcut: 'Ctrl+Y',
                            action: { $: 'studio.redo' }
                        },
                        { $: 'divider',
                            style: { $: 'divider.br' },
                            title: 'divider'
                        },
                        { $: 'pulldown.studio-wrap-with',
                            path: '%$path%',
                            type: 'data',
                            components: { $: 'list', items: ['pipeline', 'list', 'firstSucceeding'] }
                        },
                        { $: 'pulldown.studio-wrap-with',
                            path: '%$path%',
                            type: 'boolean',
                            components: { $: 'list', items: ['and', 'or', 'not'] }
                        },
                        { $: 'pulldown.studio-wrap-with',
                            path: '%$path%',
                            type: 'action',
                            components: { $: 'list', items: ['runActions', 'runActionOnItems'] }
                        },
                        { $: 'pulldown.menu-item',
                            title: 'Add property',
                            action: { $: 'openDialog',
                                id: 'add property',
                                style: { $: 'dialog.md-dialog-ok-cancel',
                                    okLabel: 'OK',
                                    cancelLabel: 'Cancel'
                                },
                                content: { $: 'group',
                                    controls: [
                                        { $: 'editable-text',
                                            title: 'name',
                                            databind: '%$dialogData/name%',
                                            style: { $: 'editable-text.md-input' }
                                        }
                                    ],
                                    features: { $: 'css.padding', top: '9', left: '19' }
                                },
                                title: 'Add Property',
                                onOK: { $: 'writeValue',
                                    to: { $: 'studio.ref', path: '%$path%~%$dialogData/name%' },
                                    value: ''
                                },
                                modal: 'true'
                            }
                        }
                    ],
                    features: { $: 'group.menu-keyboard-selection', autoFocus: true }
                }
            });
            jb_core_1.jb.component('pulldown.studio-wrap-with', {
                type: 'control',
                params: [
                    { id: 'path', as: 'string' },
                    { id: 'type', as: 'string' },
                    { id: 'components', as: 'array' },
                ],
                impl: { $: 'dynamic-controls',
                    controlItems: {
                        $if: { $: 'studio.is-of-type', path: '%$path%', type: '%$type%' },
                        then: '%$components%',
                        else: []
                    },
                    genericControl: { $: 'pulldown.menu-item',
                        title: 'Wrap with %$controlItem%',
                        action: [
                            { $: 'studio.wrap', path: '%$path%', compName: '%$controlItem%' },
                            { $: 'studio.expand-and-select-first-child-in-jb-editor' }
                        ]
                    },
                }
            });
            jb_core_1.jb.component('studio.expand-and-select-first-child-in-jb-editor', {
                type: 'action',
                impl: function (ctx) {
                    var ctxOfTree = ctx.vars.$tree ? ctx : jbart.ctxDictionary[$('.jb-editor').attr('jb-ctx')];
                    var tree = ctxOfTree.vars.$tree;
                    // if (!tree) {
                    //   var ctxId = $('.jb-editor').attr('jb-ctx');
                    //   var ctx = jbart.ctxDictionary[ctxId];
                    //   tree = ctx && ctx.vars.$tree;
                    // }
                    if (!tree)
                        return;
                    tree.expanded[tree.selected] = true;
                    jb_core_1.jb.delay(100).then(function () {
                        var firstChild = tree.nodeModel.children(tree.selected)[0];
                        if (firstChild) {
                            tree.selectionEmitter.next(firstChild);
                            tree.regainFocus && tree.regainFocus();
                            jb_ui.apply(ctx);
                        }
                    });
                }
            });
        }
    }
});

System.register(['jb-core', 'jb-ui', '@angular/platform-browser', '@angular/core', './studio-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var jb_core_1, jb_ui, platform_browser_1, core_1, studio_utils_1;
    function waitForIframeLoad(iframe) {
        if (!iframe)
            debugger;
        return new Promise(function (resolve, fail) {
            var counter = 300;
            var intervalID = setInterval(function () {
                if (jb_core_1.jb.path(iframe, ['contentWindow', 'jbart', 'widgetLoaded'])) {
                    window.clearInterval(intervalID);
                    resolve();
                }
                if (--counter <= 0) {
                    window.clearInterval(intervalID);
                    fail();
                }
            }, 100);
        });
    }
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (jb_ui_1) {
                jb_ui = jb_ui_1;
            },
            function (platform_browser_1_1) {
                platform_browser_1 = platform_browser_1_1;
            },
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            }],
        execute: function() {
            //jbart.studio = jbart.studio || {}
            jb_core_1.jb.component('studio.all', {
                type: 'control',
                impl: { $: 'group',
                    style: { $: 'layout.vertical', spacing: '0' },
                    controls: [
                        { $: 'group',
                            title: 'top bar',
                            style: { $: 'layout.horizontal', spacing: '3' },
                            controls: [
                                { $: 'image',
                                    url: '/projects/studio/css/logo90.png',
                                    imageHeight: '90',
                                    units: 'px',
                                    style: { $: 'image.default' }
                                },
                                { $: 'group',
                                    url: '/projects/studio/css/logo470x200.png',
                                    title: 'title and menu',
                                    style: { $: 'layout.vertical', spacing: '14' },
                                    controls: [
                                        { $: 'label',
                                            title: 'message',
                                            style: { $: 'customStyle',
                                                template: '<span class="studio-message">{{title}}</span> ',
                                                css: "{ position: absolute;\n                    color: white;  padding: 20px;  background: #327DC8;\n                    width: 1000px;\n                    margin-top: -100px;\n                    }\n                    ",
                                                features: { $: 'label.bind-title' }
                                            }
                                        },
                                        { $: 'label',
                                            title: { $: 'replace', text: '{%$globals/project%}', find: '_', replace: ' ' },
                                            style: { $: 'label.span' },
                                            features: { $: 'css',
                                                css: '{ font: 20px Arial; margin-left: 6px; margin-top: 20px}'
                                            }
                                        },
                                        { $: 'group',
                                            style: { $: 'layout.horizontal', spacing: 3 },
                                            controls: [
                                                { $: 'studio.main-menu' },
                                                { $: 'studio.toolbar' }
                                            ]
                                        }
                                    ],
                                    features: { $: 'css', css: '{ padding-left: 18px; width: 100% }' }
                                }
                            ],
                            features: { $: 'css', css: '{ height: 90px; border-bottom: 1px #d9d9d9 solid}' }
                        },
                        { $: 'group',
                            cssClass: 'studio-widget-placeholder',
                            title: 'preview',
                            controls: { $: 'studio.renderWidget' }
                        },
                        { $: 'group',
                            cssClass: 'studio-footer',
                            title: 'pages',
                            style: { $: 'layout.horizontal' },
                            controls: [
                                { $: 'button',
                                    title: 'new page',
                                    action: { $: 'studio.openNewPage' },
                                    style: { $: 'button.md-icon-12', icon: 'add' },
                                    features: { $: 'css', css: 'button {margin-top: 2px}' }
                                },
                                { $: 'itemlist',
                                    items: { $: 'studio.project-pages' },
                                    controls: { $: 'label',
                                        cssClass: 'studio-page',
                                        title: { $: 'extractSuffix', separator: '.' }
                                    },
                                    features: [
                                        { $: 'itemlist.selection',
                                            databind: '%$globals/page%',
                                            onSelection: { $: 'onNextTimer',
                                                action: [
                                                    { $: 'writeValue',
                                                        to: '%$globals/profile_path%',
                                                        value: '{%$globals/project%}.{%$globals/page%}'
                                                    },
                                                    { $: 'studio.open-properties' },
                                                    { $: 'studio.open-control-tree' }
                                                ]
                                            },
                                            autoSelectFirst: true
                                        },
                                        { $: 'css',
                                            css: "{ list-style: none; padding: 0; margin: 0; margin-left: 20px; font-family: \"Arial\"}\n                  li { list-style: none; display: inline-block; padding: 6px 10px; font-size: 12px; border: 1px solid transparent; cursor: pointer;}\n                  li label { cursor: inherit; }\n                  li.selected { background: #fff;  border: 1px solid #ccc;  border-top: 1px solid transparent; color: inherit;  }"
                                        }
                                    ]
                                }
                            ],
                            features: [
                                { $: 'group.wait',
                                    for: { $: 'studio.waitForPreviewIframe' },
                                    loadingControl: { $label: '...' }
                                },
                                { $: 'feature.afterLoad',
                                    action: {
                                        $runActions: [
                                            { $: 'studio.waitForPreviewIframe' },
                                            { $: 'studio.setPreviewSize', width: 1280, height: 520 }
                                        ]
                                    }
                                }
                            ]
                        }
                    ],
                    features: [
                        { $: 'group.watch', data: '%$globals/project%' },
                        { $: 'feature.init',
                            action: { $: 'rx.urlPath',
                                params: ['project', 'page', 'profile_path'],
                                databind: '%$globals%',
                                base: 'studio',
                                zoneId: 'studio.all'
                            }
                        }
                    ]
                }
            });
            jb_core_1.jb.component('studio.jbart-logo', {
                type: 'control',
                impl: { $: 'custom-control',
                    template: '<div style="padding: 60px 30px 30px 30px;background-color: #327DC8;zoom: 20%;"> <span style="position: absolute;margin-top:20px;margin-left:50px; color: white; font-size: 127px; font-family: Times New Roman, Times, serif">jB</span>  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="215px" height="228px" viewBox="0 0 215 228" preserveAspectRatio="xMidYMid meet" zoomAndPan="disable" xmlns:svg="http://www.w3.org/2000/svg"> <polygon points="106 0 0   38 17  178 106 228" fill="#DE3641"></polygon> <polygon points="106 0 215 38 198 178 106 228" fill="#B13138"></polygon> </svg> </div>'
                }
            });
            jb_core_1.jb.component('studio.currentProfilePath', {
                impl: { $firstSucceeding: ['%$simulateProfilePath%', '%$globals/profile_path%', '%$globals/project%.%$globals/page%'] }
            });
            jb_core_1.jb.component('studio.is-single-test', {
                type: 'boolean',
                impl: function (ctx) {
                    var page = location.href.split('/')[6];
                    var profile_path = location.href.split('/')[7];
                    return page == 'tests' && profile_path && profile_path.slice(-6) != '.tests';
                }
            });
            jb_core_1.jb.component('studio.cmps-of-project', {
                type: 'data',
                params: [
                    { id: 'project', as: 'string' }
                ],
                impl: function (ctx, prj) {
                    return Object.getOwnPropertyNames(jbart.previewjbart.comps)
                        .filter(function (id) { return id.split('.')[0] == prj; });
                }
            });
            jb_core_1.jb.component('studio.project-pages', {
                type: 'data',
                impl: { $pipeline: [
                        { $: 'studio.cmps-of-project', project: '%$globals/project%' },
                        { $filter: { $: 'studio.is-of-type', type: 'control', path: '%%' } },
                        { $: 'suffix', separator: '.' }
                    ] }
            });
            jb_core_1.jb.component('studio.renderWidget', {
                type: 'control',
                impl: function (ctx) {
                    var previewIframe = (function () {
                        function previewIframe(sanitizer, elementRef) {
                            this.sanitizer = sanitizer;
                            this.elementRef = elementRef;
                        }
                        previewIframe.prototype.ngOnInit = function () {
                            var cmp = this;
                            cmp.project = ctx.exp('%$globals/project%');
                            cmp.project_url = cmp.sanitizer.bypassSecurityTrustResourceUrl('/project/' + cmp.project + '?cacheKiller=' + ('' + Math.random()).slice(10));
                            if (!cmp.project)
                                debugger;
                            var iframe = cmp.elementRef.nativeElement.firstElementChild;
                            window.jb_studio_window = true; // let studio widgets run in a special mode
                            waitForIframeLoad(iframe).then(function () {
                                var w = iframe.contentWindow;
                                w.jbart.studioWindow = window;
                                w.jbart.studioGlobals = ctx.exp('{%$globals%}');
                                w.jbart.modifyOperationsEm = studio_utils_1.modifyOperationsEm;
                                w.jbart.studioActivityEm = studio_utils_1.studioActivityEm;
                                w.jbart.studioModifiedCtrlsEm = jbart.modifiedCtrlsEm;
                                w.jbart.profileFromPath = jbart.profileFromPath;
                                jbart.previewWindow = w;
                                jbart.previewjbart = w.jbart;
                                jbart.preview_jbart_widgets = w.jbart_widgets;
                                document.title = cmp.project + ' with jBart';
                                //						jbart.previewjbart.comps[cmp.project + '.tests'] = jbart.previewjbart.comps['ui-tests.show-project-tests'];
                                // forward the studio zone to the preview widget so it will be updated
                                jb_ui.getZone('studio.all').then(function (zone) {
                                    zone.onStable.subscribe(function () {
                                        w.jbart.studioGlobals = ctx.exp('{%$globals%}');
                                        studio_utils_1.studioActivityEm.next();
                                        //console.log('studio.all stable');
                                        // refresh preview
                                        jb_core_1.jb.entries(w.jbart.zones).forEach(function (x) { return x[1].run(function () { }); });
                                        //w.setTimeout(()=>{},1); 
                                    });
                                });
                                jb_core_1.jb.trigger(jbart, 'preview_loaded');
                            });
                        };
                        previewIframe = __decorate([
                            core_1.Component({
                                selector: 'previewIframe',
                                template: "<iframe sandbox=\"allow-same-origin allow-forms allow-scripts\" style=\"box-shadow:  2px 2px 6px 1px gray; margin-left: 2px; margin-top: 2px\"\n\t\t\t\t\tseamless=\"\" id=\"jb-preview\" frameborder=\"0\" [src]=\"project_url\"></iframe>",
                            }), 
                            __metadata('design:paramtypes', [platform_browser_1.DomSanitizationService, core_1.ElementRef])
                        ], previewIframe);
                        return previewIframe;
                    }());
                    previewIframe.jb_title =
                        function () { return 'previewIframe'; };
                    return previewIframe;
                }
            });
            jb_core_1.jb.component('studio.setPreviewSize', {
                type: 'action',
                params: [
                    { id: 'width', as: 'number' },
                    { id: 'height', as: 'number' },
                ],
                impl: function (ctx, width, height) {
                    if (width)
                        $('#jb-preview').width(width);
                    if (height)
                        $('#jb-preview').height(height);
                }
            });
            jb_core_1.jb.component('studio.waitForPreviewIframe', {
                type: 'action',
                impl: function (context) {
                    if (jbart.previewjbart)
                        return;
                    return new Promise(function (resolve) {
                        return jb_core_1.jb.bind(jbart, 'preview_loaded', resolve);
                    });
                }
            });
        }
    }
});

System.register(['jb-core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.main-menu', {
                type: 'control',
                impl: { $: 'group',
                    style: { $: 'layout.horizontal', spacing: 3 },
                    controls: [
                        { $: 'pulldown.topMenuItem',
                            title: 'File',
                            controls: [
                                { $: 'pulldown.menu-item',
                                    title: 'New Project',
                                    icon: 'new',
                                    shortcut: '',
                                    action: { $: 'studio.saveComponents' }
                                },
                                { $: 'pulldown.menu-item',
                                    title: 'Open Project ...',
                                    action: { $: 'studio.open-project' }
                                },
                                { $: 'pulldown.menu-item',
                                    title: 'Save',
                                    icon: 'save',
                                    action: { $: 'studio.saveComponents' },
                                    shortcut: 'Ctrl+S'
                                },
                                { $: 'pulldown.menu-item',
                                    title: 'Force Save',
                                    icon: 'save',
                                    action: { $: 'studio.saveComponents', force: true }
                                },
                                { $: 'pulldown.menu-item',
                                    title: 'Source ...',
                                    action: { $: 'studio.open-source-dialog' }
                                }
                            ]
                        },
                        { $: 'pulldown.topMenuItem',
                            title: 'View',
                            controls: [
                                { $: 'pulldown.menu-item',
                                    title: 'Refresh Preview',
                                    spritePosition: '10,0',
                                    action: { $: 'studio.refreshPreview' }
                                },
                                { $: 'pulldown.menu-item',
                                    title: 'Redraw Studio',
                                    spritePosition: '10,0',
                                    action: { $: 'studio.redrawStudio' }
                                },
                                { $: 'pulldown.menu-item',
                                    title: 'Edit source',
                                    spritePosition: '3,0',
                                    action: { $: 'studio.editSource' }
                                },
                                { $: 'pulldown.menu-item',
                                    title: 'Outline',
                                    spritePosition: '5,0',
                                    action: { $: 'studio.open-control-tree' }
                                },
                                { $: 'pulldown.menu-item',
                                    title: 'jbEditor',
                                    spritePosition: '6,0',
                                    action: { $: 'studio.openjbEditor' }
                                }
                            ]
                        },
                        { $: 'pulldown.topMenuItem',
                            title: 'Insert',
                            controls: [
                                { $: 'pulldown.menu-item', title: 'Field' },
                                { $: 'pulldown.menu-item', title: 'Control' },
                                { $: 'pulldown.menu-item', title: 'Group' }
                            ]
                        },
                        { $: 'pulldown.topMenuItem',
                            title: 'Data',
                            controls: [
                                { $: 'dynamic-controls',
                                    controlItems: function (ctx) {
                                        var res = jb_path(jbart, ['previewWindow', 'jbart_widgets', ctx.exp('%$globals/project%'), 'resources']);
                                        return Object.getOwnPropertyNames(res)
                                            .filter(function (x) { return x != 'window'; });
                                    },
                                    genericControl: { $: 'pulldown.menu-item',
                                        action: { $: 'studio.open-resource',
                                            resource: function (ctx) {
                                                return jb_path(jbart, ['previewWindow', 'jbart_widgets', ctx.exp('%$globals/project%'), 'resources', ctx.exp('%$controlItem%')]);
                                            },
                                            id: '%$controlItem%'
                                        },
                                        title: '%$controlItem%'
                                    }
                                },
                                { $: 'pulldown.menu-item-separator' },
                                { $: 'pulldown.menu-item',
                                    action: { $: 'studio.addDataResource' },
                                    title: 'Add Data Resource...'
                                }
                            ]
                        },
                        { $: 'pulldown.topMenuItem',
                            title: 'Tests',
                            controls: [
                                { $: 'dynamic-controls',
                                    controlItems: function (ctx) {
                                        var res = jb_path(jbart, ['previewWindow', 'jbart_widgets', ctx.exp('%$globals/project%'), 'tests']);
                                        return Object.getOwnPropertyNames(res)
                                            .filter(function (x) { return x != 'window'; });
                                    },
                                    genericControl: { $: 'pulldown.menu-item',
                                        action: { $: 'studio.run-test',
                                            resource: function (ctx) {
                                                return jb_path(jbart, ['previewWindow', 'jbart_widgets', ctx.exp('%$globals/project%'), 'tests', ctx.exp('%$controlItem%')]);
                                            },
                                            id: '%$controlItem%'
                                        },
                                        title: '%$controlItem%'
                                    }
                                },
                                { $: 'pulldown.menu-item-separator' },
                                { $: 'pulldown.menu-item',
                                    action: { $: 'studio.add-test' },
                                    title: 'Add Test...'
                                },
                                { $: 'pulldown.menu-item',
                                    action: { $: 'studio.run-all-tests' },
                                    title: 'Run All Tests...'
                                }
                            ]
                        }
                    ]
                }
            });
        }
    }
});

System.register(['jb-core', './studio-tgp-model'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, studio_tgp_model_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.short-title', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) { return studio_tgp_model_1.model.shortTitle(path); }
            });
            jb_core_1.jb.component('studio.val', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return studio_tgp_model_1.model.val(path);
                }
            });
            jb_core_1.jb.component('studio.is-primitive-value', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return typeof studio_tgp_model_1.model.val(path) == 'string';
                }
            });
            jb_core_1.jb.component('studio.is-of-type', {
                params: [
                    { id: 'path', as: 'string', essential: true },
                    { id: 'type', as: 'string', essential: true },
                ],
                impl: function (context, path, _type) {
                    return studio_tgp_model_1.model.isOfType(path, _type);
                }
            });
            jb_core_1.jb.component('studio.PTs-of-type', {
                params: [
                    { id: 'type', as: 'string', essential: true },
                ],
                impl: function (context, _type) {
                    return studio_tgp_model_1.model.PTsOfType(_type);
                }
            });
            jb_core_1.jb.component('studio.short-title', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return studio_tgp_model_1.model.shortTitle(path);
                }
            });
            jb_core_1.jb.component('studio.has-param', {
                params: [
                    { id: 'path', as: 'string' },
                    { id: 'param', as: 'string' },
                ],
                impl: function (context, path, param) {
                    return studio_tgp_model_1.model.paramDef(path + '~' + param);
                }
            });
            jb_core_1.jb.component('studio.non-control-children', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return studio_tgp_model_1.model.children(path, 'non-controls');
                }
            });
            jb_core_1.jb.component('studio.array-children', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return studio_tgp_model_1.model.children(path, 'array');
                }
            });
            jb_core_1.jb.component('studio.comp-name', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) { return studio_tgp_model_1.model.compName(path) || ''; }
            });
            jb_core_1.jb.component('studio.param-def', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) { return studio_tgp_model_1.model.paramDef(path); }
            });
            jb_core_1.jb.component('studio.enum-options', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return ((studio_tgp_model_1.model.paramDef(path) || {}).options || '').split(',').map(function (x) { return { code: x, text: x }; });
                }
            });
            jb_core_1.jb.component('studio.prop-name', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return studio_tgp_model_1.model.propName(path);
                }
            });
            jb_core_1.jb.component('studio.more-params', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return studio_tgp_model_1.model.jbEditorMoreParams(path);
                }
            });
            jb_core_1.jb.component('studio.comp-name-ref', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return {
                        $jb_val: function (value) {
                            if (typeof value == 'undefined')
                                return studio_tgp_model_1.model.compName(path);
                            else
                                studio_tgp_model_1.model.modify(studio_tgp_model_1.model.setComp, path, { comp: value }, context);
                        }
                    };
                }
            });
            jb_core_1.jb.component('studio.insert-comp', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' },
                    { id: 'comp', as: 'string' },
                ],
                impl: function (context, path, comp) {
                    return studio_tgp_model_1.model.modify(studio_tgp_model_1.model.insertComp, path, { comp: comp }, context);
                }
            });
            jb_core_1.jb.component('studio.wrap', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' },
                    { id: 'compName', as: 'string' }
                ],
                impl: function (context, path, compName) {
                    return studio_tgp_model_1.model.modify(studio_tgp_model_1.model.wrap, path, { compName: compName }, context);
                }
            });
            jb_core_1.jb.component('studio.wrap-with-group', {
                type: 'action',
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return studio_tgp_model_1.model.modify(studio_tgp_model_1.model.wrapWithGroup, path, {}, context);
                }
            });
            jb_core_1.jb.component('studio.add-property', {
                type: 'action',
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return studio_tgp_model_1.model.modify(studio_tgp_model_1.model.addProperty, path, {}, context);
                }
            });
            // jb.component('studio.wrap-with-pipeline', {
            // 	type: 'action',
            // 	params: [ {id: 'path', as: 'string' } ],
            // 	impl: (context,path) => 
            // 		model.modify(model.wrapWithPipeline, path, {},context)
            // })
            jb_core_1.jb.component('studio.duplicate', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' },
                ],
                impl: function (context, path) {
                    return studio_tgp_model_1.model.modify(studio_tgp_model_1.model.duplicate, path, {}, context);
                }
            });
            jb_core_1.jb.component('studio.move-in-array', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' },
                    { id: 'moveUp', type: 'boolean', as: 'boolean' }
                ],
                impl: function (context, path, moveUp) {
                    return studio_tgp_model_1.model.modify(studio_tgp_model_1.model.moveInArray, path, { moveUp: moveUp }, context, true);
                }
            });
            jb_core_1.jb.component('studio.new-array-item', {
                type: 'action',
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return studio_tgp_model_1.model.modify(studio_tgp_model_1.model.addArrayItem, path, {}, context, true);
                }
            });
            jb_core_1.jb.component('studio.add-array-item', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' },
                    { id: 'toAdd' }
                ],
                impl: function (context, path, toAdd) {
                    return studio_tgp_model_1.model.modify(studio_tgp_model_1.model.addArrayItem, path, { toAdd: toAdd }, context, true);
                }
            });
            jb_core_1.jb.component('studio.delete', {
                type: 'action',
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) { return studio_tgp_model_1.model.modify(studio_tgp_model_1.model._delete, path, {}, context, true); }
            });
            jb_core_1.jb.component('studio.make-local', {
                type: 'action',
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) { return studio_tgp_model_1.model.modify(studio_tgp_model_1.model.makeLocal, path, { ctx: context }, context, true); }
            });
        }
    }
});

System.register(['jb-core', './studio-tgp-model', './studio-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, studio_tgp_model_1, studio_utils_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.open-new-control-dialog', {
                impl: { $: 'studio.open-new-tgp-dialog',
                    type: 'control',
                    title: 'new control',
                    onOK: [
                        { $: 'studio.onNextModifiedPath',
                            action: [
                                { $: 'studio.openModifiedPath' },
                                { $: 'studio.refreshPreview' }
                            ]
                        },
                        { $: 'studio.insert-comp',
                            path: { $: 'studio.currentProfilePath' },
                            comp: '%%'
                        }
                    ]
                }
            });
            jb_core_1.jb.component('studio.open-new-tgp-dialog', {
                type: 'action',
                params: [
                    { id: 'type', as: 'string' },
                    { id: 'title', as: 'string' },
                    { id: 'onOK', type: 'action', dynamic: true },
                ],
                impl: { $: 'openDialog',
                    style: { $: 'dialog.studio-floating' },
                    content: { $: 'group',
                        title: 'itemlist-with-find',
                        style: { $: 'layout.vertical', spacing: 3 },
                        controls: [
                            { $: 'editable-text',
                                title: 'search',
                                databind: '%$globals/ctrl_pattern%',
                                style: { $: 'editable-text.md-input' }
                            },
                            { $: 'itemlist-with-groups',
                                items: { $pipeline: [
                                        { $: 'studio.PTs-of-type', type: '%$type%' },
                                        { $: 'search-filter', pattern: '%$globals/ctrl_pattern%' }
                                    ] },
                                controls: [
                                    { $: 'button',
                                        title: '%%',
                                        action: [
                                            { $: 'closeContainingPopup' },
                                            { $call: 'onOK' },
                                        ],
                                        style: { $: 'customStyle',
                                            template: '<div><button md-button (click)="clicked()">{{title}}</button></div>',
                                            css: 'button { width: 300px; text-align: left }',
                                            directives: 'MdButton'
                                        }
                                    }
                                ],
                                groupBy: { $: 'itemlist-heading.group-by' },
                                headingCtrl: { $: 'label',
                                    title: '%title%',
                                    style: { $: 'label.h2' },
                                    features: [{ $: 'css.margin', top: '10' }]
                                },
                                features: { $: 'css.height', height: '400', overflow: 'scroll', minMax: '' }
                            }
                        ],
                        features: [{ $: 'css.margin', top: '10', left: '20' }]
                    },
                    title: '%$title%',
                    modal: true,
                    features: [
                        { $: 'css.height', height: '420', overflow: 'hidden' },
                        { $: 'css.width', width: '350', overflow: 'hidden' },
                        { $: 'dialog-feature.dragTitle', id: 'new %$type%' },
                        { $: 'dialog-feature.nearLauncherLocation', offsetLeft: 0, offsetTop: 0 }
                    ]
                }
            });
            jb_core_1.jb.component('studio.onNextModifiedPath', {
                type: 'action',
                params: [
                    { id: 'action', type: 'action', dynamic: true, essential: true }
                ],
                impl: function (ctx, action) {
                    return studio_utils_1.modifyOperationsEm.take(1)
                        .subscribe(function (e) {
                        return action(ctx.setVars({ modifiedPath: e.args.modifiedPath }));
                    });
                }
            });
            jb_core_1.jb.component('studio.openModifiedPath', {
                type: 'action',
                impl: { $runActions: [
                        { $: 'writeValue', to: '%$globals/profile_path%', value: '%$modifiedPath%' },
                        { $: 'studio.open-properties' },
                        { $: 'studio.open-control-tree' },
                    ] }
            });
            jb_core_1.jb.component('studio.openNewPage', {
                type: 'action',
                impl: { $: 'openDialog',
                    modal: true,
                    title: 'New Page',
                    style: { $: 'dialog.md-dialog-ok-cancel',
                        features: { $: 'dialog-feature.autoFocusOnFirstInput' }
                    },
                    content: { $: 'group',
                        controls: [
                            { $: 'editable-text',
                                databind: '%$dialogData/name%',
                                features: { $: 'onEnter',
                                    action: { $: 'closeContainingPopup' }
                                },
                                title: 'page name',
                                style: { $: 'editable-text.md-input' }
                            }
                        ],
                        features: { $: 'css.padding', top: '14', left: '11' },
                        style: { $: 'group.div' }
                    },
                    onOK: function (ctx) {
                        var id = ctx.exp('%$globals/project%.%$dialogData/name%');
                        var profile = {
                            type: 'control',
                            impl: { $: 'group', title: ctx.exp('%$dialogData/name%') }
                        };
                        studio_tgp_model_1.model.modify(studio_tgp_model_1.model.newComp, id, { profile: profile }, ctx);
                        ctx.run({ $: 'writeValue', to: '%$globals/page%', value: '%$dialogData/name%' });
                        ctx.run({ $: 'writeValue', to: '%$globals/profile_path%', value: id });
                    }
                }
            });
        }
    }
});

System.register(['jb-core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.open-project', {
                type: 'action',
                impl: { $: 'openDialog',
                    title: 'Open project',
                    style: { $: 'dialog.md-dialog-ok-cancel', okLabel: 'OK', cancelLabel: 'Cancel' },
                    content: { $: 'studio.choose-project' }
                }
            });
            jb_core_1.jb.component('studio.choose-project', {
                type: 'control',
                impl: { $: 'group',
                    features: [
                        { $: 'group.wait',
                            for: { $: 'http.get', url: '/?op=projects' },
                            resource: 'projects',
                            mapToResource: '%projects%'
                        },
                        { $: 'css.padding', top: '15', left: '15' }
                    ],
                    title: 'itemlist-with-find',
                    controls: [
                        { $: 'editable-text',
                            databind: '%$globals/project_pattern%',
                            title: 'search',
                            style: { $: 'editable-text.md-input', width: '260' }
                        },
                        { $: 'itemlist',
                            items: { $pipeline: [
                                    '%$projects%',
                                    { $: 'search-filter', pattern: '%$globals/project_pattern%' }
                                ] },
                            itemVariable: 'project',
                            style: { $: 'itemlist.ul-li' },
                            controls: { $: 'button',
                                title: '%$project%',
                                style: { $: 'button.md-flat' },
                                action: { $: 'runActions',
                                    actions: { $: 'runActions',
                                        actions: [
                                            { $: 'goto-url',
                                                target: 'new tab',
                                                url: '/project/studio/%$project%'
                                            },
                                            { $: 'closeContainingPopup' }
                                        ]
                                    }
                                },
                                features: { $: 'css', css: '!button { text-align: left; width: 250px }' }
                            }
                        }
                    ]
                }
            });
        }
    }
});
// style :{$: 'customStyle', 
//   template: '<span><button md-button (click)="clicked()">{{title}}</button></span>', 
//   directives: 'MdButton', 
//   css: 'button { width: 260px; text-align: left }'
// }, 

System.register(['jb-core', 'jb-ui/jb-rx', './studio-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, jb_rx, studio_utils_1;
    var pathFixer, FixReplacingPathsObj;
    function parentPath(path) {
        return path.split('~').slice(0, -1).join('~');
    }
    exports_1("parentPath", parentPath);
    function profileRefFromPath(path) {
        if (path.indexOf('~') == -1)
            return {
                $jb_val: function (value) {
                    if (typeof value == 'undefined')
                        return profileFromPath(path);
                    else
                        studio_utils_1.findjBartToLook(path).comps[path].impl = value;
                }
            };
        var ref = {
            path: path,
            $jb_val: function (value) {
                if (typeof value == 'undefined')
                    return profileFromPath(this.path);
                // if (profileFromPath(parentPath(this.path)) == profileFromPath(this.path)) // flatten one-item array
                // 	var actual_path = parentPath(this.path);
                // else
                // 	var actual_path = this.path;
                var parent = profileFromPath(parentPath(this.path));
                parent[this.path.split('~').pop()] = value;
            }
        };
        studio_utils_1.pathChangesEm.subscribe(function (fixer) { return ref.path = fixer.fix(ref.path); });
        return ref;
    }
    exports_1("profileRefFromPath", profileRefFromPath);
    function profileFromPath(path, silent) {
        var id = path.split('~')[0];
        var comp = studio_utils_1.jbart_base().comps[id] || jbart.comps[id];
        comp = comp && comp.impl;
        if (!comp) {
            jb_core_1.jb.logError('profileFromPath: can not find path ', path);
            return;
        }
        var innerPath = path.split('~').slice(1).join('~');
        if (!innerPath)
            return comp;
        return comp && innerPath.split('~').reduce(function (obj, p) {
            if (!obj && !silent)
                jb_core_1.jb.logError('profileFromPath: non existing path ' + path + ' property: ' + p);
            // if (obj && p == '0' && obj[p] == null) // flatten one-item array
            // 	return obj;
            if (obj == null)
                return null;
            else if (obj[p] == null)
                return obj['$' + p];
            else
                return obj[p];
        }, comp);
    }
    exports_1("profileFromPath", profileFromPath);
    function profileRefFromPathWithNotification(path, ctx) {
        var _ref = profileRefFromPath(path);
        return {
            $jb_val: function (value) {
                if (typeof value == 'undefined')
                    return _ref.$jb_val(value);
                if (_ref.$jb_val() == value)
                    return;
                var comp = path.split('~')[0];
                var before = studio_utils_1.compAsStr(comp);
                _ref.$jb_val(value);
                studio_utils_1.notifyModification(path, before, ctx, this.ngPath);
            }
        };
    }
    function closest(path) {
        if (!path)
            return '';
        var _path = path;
        while (profileFromPath(_path, true) == null && Number(_path.split('~').pop()))
            _path = _path.replace(/([0-9]+)$/, function (x, y) { return Number(y) - 1; });
        while (profileFromPath(_path, true) == null && _path.indexOf('~') != -1)
            _path = parentPath(_path);
        if (profileFromPath(_path, true))
            return _path;
    }
    // ***************** path fixers after changes **************************
    function fixMovePaths(from, to) {
        //	console.log('fixMovePath',from,to);
        var parent_path = parentPath(to);
        var depth = parent_path.split('~').length;
        var index = Number(to.split('~').pop()) || 0;
        studio_utils_1.pathChangesEm.next({ from: from, to: to,
            fix: function (pathToFix) {
                if (!pathToFix)
                    return;
                if (pathToFix.indexOf(from) == 0) {
                    //				console.log('fixMovePath - action',pathToFix, 'to',to + pathToFix.substr(from.length));
                    return to + pathToFix.substr(from.length);
                }
                else {
                    var fixed1 = fixIndexOfPath(pathToFix, from, -1);
                    return fixIndexOfPath(fixed1, to, 1);
                }
            }
        });
    }
    function fixSetCompPath(comp) {
        studio_utils_1.pathChangesEm.next({
            fix: function (pathToFix) {
                return pathToFix.indexOf(comp) == 0 ? closest(pathToFix) : pathToFix;
            }
        });
    }
    function fixIndexPaths(path, diff) {
        studio_utils_1.pathChangesEm.next({ fix: function (pathToFix) {
                return fixIndexOfPath(pathToFix, path, diff);
            }
        });
    }
    function fixReplacingPaths(path1, path2) {
        studio_utils_1.pathChangesEm.next(new FixReplacingPathsObj(path1, path2));
    }
    function fixIndexOfPath(pathToFix, changedPath, diff) {
        var parent_path = parentPath(changedPath);
        var depth = parent_path.split('~').length;
        if (pathToFix.indexOf(parent_path) == 0 && pathToFix.split('~').length > depth) {
            var index = Number(changedPath.split('~').pop()) || 0;
            var elems = pathToFix.split('~');
            var indexToFix = Number(elems[depth]);
            if (indexToFix >= index) {
                elems[depth] = Math.max(0, indexToFix + diff);
            }
            return elems.join('~');
        }
        return pathToFix;
    }
    function fixArrayWrapperPath() {
        studio_utils_1.pathChangesEm.next(function (pathToFix) {
            var base = pathToFix.split('~')[0];
            var first = jb_core_1.jb.val(profileRefFromPath(base));
            var res = pathToFix.split('~')[0];
            pathToFix.split('~').slice(1).reduce(function (obj, prop) {
                if (!obj || (obj[prop] == null && prop == '0'))
                    return;
                if (Array.isArray(obj) && isNaN(Number(prop))) {
                    res += '~0~' + prop;
                    debugger;
                }
                else
                    res += '~' + prop;
                return obj[prop];
            }, first);
            return res;
        });
    }
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (jb_rx_1) {
                jb_rx = jb_rx_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            }],
        execute: function() {
            jbart.profileFromPath = profileFromPath;
            exports_1("pathFixer", pathFixer = {
                fixIndexPaths: fixIndexPaths,
                fixReplacingPaths: fixReplacingPaths,
                fixMovePaths: fixMovePaths,
                fixArrayWrapperPath: fixArrayWrapperPath,
                fixSetCompPath: fixSetCompPath
            });
            FixReplacingPathsObj = (function () {
                function FixReplacingPathsObj(path1, path2) {
                    this.path1 = path1;
                    this.path2 = path2;
                }
                FixReplacingPathsObj.prototype.fix = function (pathToFix) {
                    if (pathToFix.indexOf(this.path1) == 0)
                        return pathToFix.replace(this.path1, this.path2);
                    else if (pathToFix.indexOf(this.path2) == 0)
                        return pathToFix.replace(this.path2, this.path1);
                    return pathToFix;
                };
                return FixReplacingPathsObj;
            }());
            // ******* components ***************
            jb_core_1.jb.component('studio.ref', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (context, path) {
                    return profileRefFromPathWithNotification(path, context);
                }
            });
            jb_core_1.jb.component('studio.fix-to-closest-path', {
                params: [{ id: 'path', as: 'ref' }],
                impl: function (ctx, pathRef) {
                    var path = jb_core_1.jb.val(pathRef);
                    var closest_path = closest(path);
                    if (path && path != closest_path) {
                        jb_core_1.jb.writeValue(pathRef, closest_path);
                    }
                }
            });
            jb_core_1.jb.component('group.studio-watch-path', {
                type: 'feature',
                params: [
                    { id: 'path', essential: true, as: 'ref' },
                ],
                impl: function (context, path_ref) { return ({
                    beforeInit: function (cmp) {
                        cmp.jbWatchGroupChildrenEm = (cmp.jbWatchGroupChildrenEm || jb_rx.Observable.of())
                            .merge(cmp.jbEmitter
                            .filter(function (x) { return x == 'check'; })
                            .merge(studio_utils_1.pathChangesEm.map(function (fixer) {
                            return jb_core_1.jb.writeValue(path_ref, fixer.fix(jb_core_1.jb.val(path_ref)));
                        }))
                            .map(function () { return jb_core_1.jb.val(path_ref); })
                            .distinctUntilChanged()
                            .map(function (val) {
                            var ctx2 = (cmp.refreshCtx ? cmp.refreshCtx(cmp.ctx) : cmp.ctx);
                            return context.vars.$model.controls(ctx2);
                        }));
                    },
                    observable: function () { } // to create jbEmitter
                }); }
            });
            jb_core_1.jb.component('feature.studio-auto-fix-path', {
                type: 'feature',
                params: [
                    { id: 'path', essential: true, as: 'ref' },
                ],
                impl: function (context, path_ref) {
                    return ({
                        beforeInit: function (cmp) {
                            studio_utils_1.pathChangesEm
                                .takeUntil(cmp.jbEmitter.filter(function (x) { return x == 'destroy'; }))
                                .subscribe(function (fixer) {
                                return jb_core_1.jb.writeValue(path_ref, fixer.fix(jb_core_1.jb.val(path_ref)));
                            });
                        },
                        observable: function () { } // to create jbEmitter
                    });
                }
            });
        }
    }
});

System.register(['jb-core', 'jb-ui', 'jb-ui/jb-rx', './studio-tgp-model'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, jb_ui, jb_rx, studio_tgp_model_1;
    function pathFromElem(_window, profElem) {
        return _window.jbart.ctxDictionary[profElem.attr('jb-ctx')].path;
        //profElem.attr('jb-path');
    }
    function eventToProfileElem(e, _window) {
        var $el = $(_window.document.elementFromPoint(e.pageX - $(_window).scrollLeft(), e.pageY - $(_window).scrollTop()));
        if (!$el[0])
            return;
        return $($el.get().concat($el.parents().get()))
            .filter(function (i, e) {
            return $(e).attr('jb-ctx');
        })
            .first();
    }
    function showBox(cmp, profElem, _window, previewOffset) {
        if (profElem.offset() == null || $('#jb-preview').offset() == null)
            return;
        cmp.top = previewOffset + profElem.offset().top;
        cmp.left = profElem.offset().left;
        if (profElem.outerWidth() == $(_window.document.body).width())
            cmp.width = (profElem.outerWidth() - 10);
        else
            cmp.width = profElem.outerWidth();
        cmp.height = profElem.outerHeight();
        cmp.title = studio_tgp_model_1.model.shortTitle(pathFromElem(_window, profElem));
        var $el = $(cmp.elementRef.nativeElement);
        var $titleText = $el.find('.title .text');
        console.log('selected', profElem.outerWidth(), profElem.outerHeight());
        Array.from(profElem.parents())
            .forEach(function (el) { return console.log('parent', $(el).outerWidth(), $(el).outerHeight()); });
        var same_size_parents = Array.from(profElem.parents())
            .filter(function (el) {
            return profElem.outerWidth() >= $(el).outerWidth() && profElem.outerHeight() >= $(el).outerHeight();
        })
            .filter(function (el) {
            return $(el).attr('jb-ctx');
        })
            .map(function (el) {
            return studio_tgp_model_1.model.shortTitle(pathFromElem(_window, $(el)));
        })
            .join(', ');
        $el.find('.title .text').text(cmp.title + same_size_parents);
        cmp.titleBelow = top - $titleText.outerHeight() - 6 < $(_window).scrollTop();
        cmp.titleTop = cmp.titleBelow ? cmp.top + cmp.height : cmp.top - $titleText.outerHeight() - 6;
        cmp.titleLeft = cmp.left + (cmp.width - $titleText.outerWidth()) / 2;
        $el.find('.title .triangle').css({ marginLeft: $titleText.outerWidth() / 2 - 6 });
    }
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (jb_ui_1) {
                jb_ui = jb_ui_1;
            },
            function (jb_rx_1) {
                jb_rx = jb_rx_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.pick', {
                type: 'action',
                params: [
                    { id: 'from', options: 'studio,preview', as: 'string', defaultValue: 'preview' },
                    { id: 'onSelect', type: 'action', dynamic: true }
                ],
                impl: { $: 'openDialog',
                    $vars: {
                        pickSelection: { path: '' }
                    },
                    style: { $: 'dialog.studio-pick-dialog', from: '%$from%' },
                    content: { $: 'label', title: '' },
                    onOK: function (ctx) {
                        return ctx.componentContext.params.onSelect(ctx.setData(ctx.vars.pickSelection.ctx));
                    }
                }
            });
            jb_core_1.jb.component('dialog.studio-pick-dialog', {
                hidden: true,
                type: 'dialog.style',
                params: [
                    { id: 'from', as: 'string' },
                ],
                impl: { $: 'customStyle',
                    template: "<div class=\"jb-dialog\">\n<div class=\"edge top\" [style.width]=\"width+'px'\" [style.top]=\"top+'px'\" [style.left]=\"left+'px'\"></div>\n<div class=\"edge left\" [style.height]=\"height+'px'\" [style.top]=\"top+'px'\" [style.left]=\"left+'px'\"></div>\n<div class=\"edge right\" [style.height]=\"height+'px'\" [style.top]=\"top+'px'\" [style.left]=\"left+width+'px'\"></div>\n<div class=\"edge bottom\" [style.width]=\"width+'px'\" [style.top]=\"top+height+'px'\" [style.left]=\"left+'px'\"></div>\n<div class=\"title\" [class.bottom]=\"titleBelow\" [style.top]=\"titleTop+'px'\" [style.left]=\"titleLeft+'px'\">\n\t<div class=\"text\">{{title}}</div>\n\t<div class=\"triangle\"></div>\n</div>\n\n</div>",
                    css: "\n.edge { \n\tz-index: 6001;\n\tposition: absolute;\n\tbackground: red;\n\tbox-shadow: 0 0 1px 1px gray;\n\twidth: 1px; height: 1px;\n\tcursor: pointer;\n}\n.title {\n\tz-index: 6001;\n\tposition: absolute;\n\tfont: 14px arial; padding: 0; cursor: pointer;\n\ttransition:top 100ms, left 100ms;\n}\n.title .triangle {\twidth:0;height:0; border-style: solid; \tborder-color: #e0e0e0 transparent transparent transparent; border-width: 6px; margin-left: 14px;}\n.title .text {\tbackground: #e0e0e0; font: 14px arial; padding: 3px; }\n.title.bottom .triangle { background: #fff; border-color: transparent transparent #e0e0e0 transparent; transform: translateY(-28px);}\n.title.bottom .text { transform: translateY(6px);}\n\t\t\t\t",
                    features: [
                        { $: 'dialog-feature.studio-pick', from: '%$from%' },
                    ]
                }
            });
            jb_core_1.jb.component('dialog-feature.studio-pick', {
                type: 'dialog-feature',
                params: [
                    { id: 'from', as: 'string' },
                ],
                impl: function (ctx) {
                    return ({
                        init: function (cmp) {
                            var _window = ctx.params.from == 'preview' ? jbart.previewWindow : window;
                            var previewOffset = ctx.params.from == 'preview' ? $('#jb-preview').offset().top : 0;
                            cmp.titleBelow = false;
                            var mouseMoveEm = jb_rx.Observable.fromEvent(_window.document, 'mousemove');
                            var userPick = jb_rx.Observable.fromEvent(document, 'mousedown')
                                .merge(jb_rx.Observable.fromEvent((jbart.previewWindow || {}).document, 'mousedown'));
                            var keyUpEm = jb_rx.Observable.fromEvent(document, 'keyup')
                                .merge(jb_rx.Observable.fromEvent((jbart.previewWindow || {}).document, 'keyup'));
                            mouseMoveEm
                                .takeUntil(keyUpEm.filter(function (e) {
                                return e.keyCode == 27;
                            })
                                .merge(userPick))
                                .do(function (e) {
                                if (e.keyCode == 27)
                                    ctx.vars.$dialog.close({ OK: false });
                            })
                                .map(function (e) {
                                return eventToProfileElem(e, _window);
                            })
                                .filter(function (x) { return x && x.length > 0; })
                                .do(function (profElem) {
                                ctx.vars.pickSelection.ctx = _window.jbart.ctxDictionary[profElem.attr('jb-ctx')];
                                showBox(cmp, profElem, _window, previewOffset);
                                jb_ui.apply(ctx);
                            })
                                .last()
                                .subscribe(function (x) {
                                ctx.vars.$dialog.close({ OK: true });
                            });
                        }
                    });
                }
            });
            jb_core_1.jb.component('studio.highlight-in-preview', {
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: function (ctx, path) {
                    var _window = jbart.previewWindow || window;
                    if (!_window)
                        return;
                    var elems = Array.from(_window.document.querySelectorAll('[jb-ctx]'))
                        .filter(function (e) {
                        return _window.jbart.ctxDictionary[e.getAttribute('jb-ctx')].path == path;
                    });
                    if (elems.length == 0)
                        elems = Array.from(document.querySelectorAll('[jb-ctx]'))
                            .filter(function (e) {
                            return jbart.ctxDictionary[e.getAttribute('jb-ctx')].path == path;
                        });
                    var boxes = [];
                    //		$('.jbstudio_highlight_in_preview').remove();
                    elems.forEach(function (elem) {
                        var $box = $('<div class="jbstudio_highlight_in_preview"/>');
                        $box.css({ position: 'absolute', background: 'rgb(193, 224, 228)', border: '1px solid blue', opacity: '1', zIndex: 5000 }); // cannot assume css class in preview window
                        var offset = $(elem).offset();
                        $box.css('left', offset.left).css('top', offset.top).width($(elem).outerWidth()).height($(elem).outerHeight());
                        if ($box.width() == $(_window.document.body).width())
                            $box.width($box.width() - 10);
                        boxes.push($box[0]);
                    });
                    $(_window.document.body).append($(boxes));
                    $(boxes).css({ opacity: 0.5 }).
                        fadeTo(1500, 0, function () {
                        $(boxes).remove();
                    });
                }
            });
        }
    }
});

System.register(['jb-core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.open-multiline-edit', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: {
                    $: 'openDialog',
                    style: { $: 'dialog.studio-multiline-edit' },
                    content: { $: 'editable-text',
                        databind: { $: 'studio.ref', path: '%$path%' },
                        style: { $: 'editable-text.codemirror',
                            mode: { $: 'studio.code-mirror-mode', path: '%$path%' }
                        },
                        features: { $: 'studio.undo-support', path: '%$path%' },
                    }
                }
            });
            jb_core_1.jb.component('dialog.studio-floating', {
                type: 'dialog.style',
                params: [
                    { id: 'id', as: 'string' },
                    { id: 'width', as: 'number', default: 300 },
                    { id: 'height', as: 'number', default: 100 },
                ],
                impl: { $: 'customStyle',
                    template: "<div class=\"jb-dialog jb-default-dialog\">\n\t\t\t\t      \t\t  <div class=\"dialog-title noselect\">{{title}}</div>\n\t\t\t\t      \t\t  <jb_comp *ngIf=\"hasMenu\" class=\"dialog-menu\" [comp]=\"menuComp\"></jb_comp>\n\t\t\t\t\t\t\t  <button class=\"dialog-close\" (click)=\"dialogClose()\">&#215;</button>\n\t\t\t\t\t\t\t  <div class=\"jb-dialog-content-parent\">\n \t\t\t\t\t\t\t\t<jb_comp [comp]=\"contentComp\" class=\"dialog-content\"></jb_comp>\n\t\t\t\t\t\t  \t  </div>\n\t\t\t\t\t\t</div>",
                    features: [
                        { $: 'dialog-feature.dragTitle', id: '%$id%' },
                        { $: 'dialog-feature.uniqueDialog', id: '%$id%', remeberLastLocation: true },
                        { $: 'dialog-feature.maxZIndexOnClick', minZIndex: 5000 },
                        { $: 'studio-dialog-feature.studioPopupLocation' },
                    ],
                    css: "{ position: fixed;\n\t\t\t\t\t\tbackground: #F9F9F9; \n\t\t\t\t\t\twidth: %$width%px; \n\t\t\t\t\t\tmax-width: 800px;\n\t\t\t\t\t\tmin-height: %$height%px; \n\t\t\t\t\t\toverflow: auto;\n\t\t\t\t\t\tborder-radius: 4px; \n\t\t\t\t\t\tpadding: 0 12px 12px 12px; \n\t\t\t\t\t\tbox-shadow: 0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 13px 19px 2px rgba(0, 0, 0, 0.14), 0px 5px 24px 4px rgba(0, 0, 0, 0.12)\n\t\t\t\t}\n\t\t\t\t.dialog-title { background: none; padding: 10px 5px; }\n\t\t\t\t.jb-dialog-content-parent { padding: 8px; overflow-y: auto; max-height: 500px }\n\t\t\t\t.dialog-close {\n\t\t\t\t\t\tposition: absolute; \n\t\t\t\t\t\tcursor: pointer; \n\t\t\t\t\t\tright: 4px; top: 4px; \n\t\t\t\t\t\tfont: 21px sans-serif; \n\t\t\t\t\t\tborder: none; \n\t\t\t\t\t\tbackground: transparent; \n\t\t\t\t\t\tcolor: #000; \n\t\t\t\t\t\ttext-shadow: 0 1px 0 #fff; \n\t\t\t\t\t\tfont-weight: 700; \n\t\t\t\t\t\topacity: .2;\n\t\t\t\t}\n\t\t\t\t.dialog-menu {\n\t\t\t\t\t\tposition: absolute; \n\t\t\t\t\t\tcursor: pointer; \n\t\t\t\t\t\tright: 24px; top: 0; \n\t\t\t\t\t\tfont: 21px sans-serif; \n\t\t\t\t\t\tborder: none; \n\t\t\t\t\t\tbackground: transparent; \n\t\t\t\t\t\tcolor: #000; \n\t\t\t\t\t\ttext-shadow: 0 1px 0 #fff; \n\t\t\t\t\t\tfont-weight: 700; \n\t\t\t\t\t\topacity: .2;\n\t\t\t\t}\n\t\t\t\t.dialog-close:hover { opacity: .5 }"
                }
            });
            jb_core_1.jb.component('studio-dialog-feature.studioPopupLocation', {
                type: 'dialog-feature',
                impl: function (context) {
                    return {
                        afterViewInit: function (cmp) {
                            var dialog = cmp.dialog;
                            if (!sessionStorage[dialog.id])
                                dialog.$el.addClass(dialog.id).addClass('default-location');
                        }
                    };
                }
            });
            jb_core_1.jb.component('studio.code-mirror-mode', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (ctx, path) {
                    if (path.match(/css/))
                        return 'css';
                    if (path.match(/template/) || path.match(/html/))
                        return 'htmlmixed';
                    return 'javascript';
                }
            });
            jb_core_1.jb.component('studio.open-responsive-phone-popup', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'openDialog',
                    style: { $: 'dialog.studio-floating', id: 'responsive' },
                    content: { $: 'tabs',
                        tabs: { $: 'dynamic-controls',
                            controlItems: {
                                $asIs: [
                                    {
                                        width: { min: 320, max: 479, default: 400 },
                                        height: { min: 300, max: 700, default: 600 },
                                        id: 'phone'
                                    },
                                    {
                                        width: { min: 480, max: 1024, default: 600 },
                                        height: { min: 300, max: 1440, default: 850 },
                                        id: 'tablet'
                                    },
                                    {
                                        width: { min: 1024, max: 2048, default: 1280 },
                                        height: { min: 300, max: 1440, default: 520 },
                                        id: 'desktop'
                                    }
                                ]
                            },
                            genericControl: { $: 'group',
                                controls: [
                                    { $: 'editable-number',
                                        databind: '%$globals/responsive/{%$controlItem/id%}/width%',
                                        min: '%$controlItem/width/min%',
                                        max: '%$controlItem/width/max%',
                                        title: 'width',
                                        style: { $: 'editable-number.slider' },
                                        features: [
                                            { $: 'field.default', value: '%$controlItem/width/default%' },
                                            { $: 'field.subscribe',
                                                action: { $: 'studio.setPreviewSize', width: '%%' },
                                                includeFirst: true
                                            }
                                        ]
                                    },
                                    { $: 'editable-number',
                                        databind: '%$globals/responsive/{%$controlItem/id%}/height%',
                                        min: '%$controlItem/height/min%',
                                        max: '%$controlItem/height/max%',
                                        title: 'height',
                                        style: { $: 'editable-number.slider' },
                                        features: [
                                            { $: 'field.default', value: '%$controlItem/height/default%' },
                                            { $: 'field.subscribe',
                                                action: { $: 'studio.setPreviewSize', height: '%%' },
                                                includeFirst: true
                                            }
                                        ]
                                    }
                                ],
                                title: '%$controlItem/id%',
                                style: { $: 'property-sheet.titles-above' },
                                features: [{ $: 'css', css: '{ padding-left: 12px; padding-top: 7px }' }]
                            },
                        },
                        style: { $: 'tabs.md-tabs' }
                    },
                    title: 'responsive'
                }
            });
        }
    }
});

System.register(['jb-core', 'jb-ui/jb-rx', './studio-tgp-model', './studio-utils', './studio-path'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, jb_rx, studio_tgp_model_1, studio_utils_1, studio_path_1;
    var Probe;
    function testControl(ctx, forTests) {
        // test the control as a dialog
        return new Promise(function (resolve, reject) {
            var _win = ctx.win();
            var dialog = {
                id: 'test-control',
                em: new jb_rx.Subject(),
                comp: ctx.runItself().jbExtend({
                    observable: function (cmp_obs, cmp) {
                        return cmp_obs
                            .filter(function (e) {
                            return e == 'ready' || e == 'destroy';
                        })
                            .take(1)
                            .catch(function (e) {
                            debugger;
                            dialog.close();
                            resolve();
                        })
                            .subscribe(function (x) {
                            if (!forTests)
                                jb_core_1.jb.delay(1, ctx).then(function () { return dialog.close(); }); // delay to avoid race conditin with itself
                            //            console.log('close test dialog',ctx.id);
                            resolve({ element: cmp.elementRef.nativeElement });
                        });
                    },
                    css: '{display: none}'
                })
            };
            //    console.log('add test dialog');
            _win.jbart.jb_dialogs.addDialog(dialog, ctx);
            //    console.log('create test dialog',ctx.id);
            _win.setTimeout(function () { }, 1); // refresh
        });
    }
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (jb_rx_1) {
                jb_rx = jb_rx_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            },
            function (studio_path_1_1) {
                studio_path_1 = studio_path_1_1;
            }],
        execute: function() {
            Probe = (function () {
                function Probe(ctx, forTests) {
                    this.forTests = forTests;
                    if (ctx.probe)
                        debugger;
                    this.context = ctx.ctx({});
                    this.probe = {};
                    this.context.probe = this;
                    this.circuit = this.context.profile;
                }
                Probe.prototype.runCircuit = function (pathToTrace) {
                    var _this = this;
                    this.pathToTrace = pathToTrace;
                    this.probe[this.pathToTrace] = [];
                    this.probe[this.pathToTrace].visits = 0;
                    return this.simpleRun().then(function (res) {
                        return _this.handleGaps().then(function (res2) {
                            return jb_core_1.jb.extend({ finalResult: _this.probe[_this.pathToTrace] }, res, res2);
                        });
                    });
                };
                Probe.prototype.simpleRun = function () {
                    var _win = jbart.previewWindow || window;
                    if (studio_tgp_model_1.model.isCompNameOfType(jb_core_1.jb.compName(this.circuit), 'control')) {
                        return testControl(this.context, this.forTests);
                    }
                    else if (!studio_tgp_model_1.model.isCompNameOfType(jb_core_1.jb.compName(this.circuit), 'action')) {
                        return Promise.resolve(_win.jb_run(this.context));
                    }
                };
                Probe.prototype.handleGaps = function () {
                    if (this.probe[this.pathToTrace].length == 0) {
                        // find closest path
                        var _path = studio_path_1.parentPath(this.pathToTrace);
                        while (!this.probe[_path] && _path.indexOf('~') != -1)
                            _path = studio_path_1.parentPath(_path);
                        if (this.probe[_path])
                            this.probe[this.pathToTrace] = this.probe[_path];
                    }
                    return Promise.resolve();
                };
                Probe.prototype.record = function (context, parentParam) {
                    var path = context.path;
                    var input = context.ctx({});
                    var out = input.runItself(parentParam, { noprobe: true });
                    if (!this.probe[path]) {
                        this.probe[path] = [];
                        this.probe[path].visits = 0;
                    }
                    this.probe[path].visits++;
                    var found;
                    this.probe[path].forEach(function (x) {
                        found = jb_compareArrays(x.in.data, input.data) ? x : found;
                    });
                    if (found)
                        found.counter++;
                    else
                        this.probe[path].push({ in: input, out: jb_val(out), counter: 0 });
                    return out;
                };
                return Probe;
            }());
            exports_1("Probe", Probe);
            jb_core_1.jb.component('studio.probe', {
                type: 'data',
                params: [{ id: 'path', as: 'string', dynamic: true }],
                impl: function (ctx, path) {
                    var context = ctx.exp('%$globals/last_pick_selection%');
                    if (!context) {
                        var _jbart = studio_utils_1.jbart_base();
                        var _win = jbart.previewWindow || window;
                        var circuit = ctx.exp('%$circuit%') || ctx.exp('%$globals/project%.%$globals/page%');
                        context = _win.jb_ctx(_jbart.initialCtx, { profile: { $: circuit }, comp: circuit, path: '', data: null });
                    }
                    return new Probe(context).runCircuit(path());
                }
            });
            // watch & fix path changes
            studio_utils_1.pathChangesEm.subscribe(function (fixer) {
                var ctx = jbart.initialCtx && jbart.initialCtx.exp('%$globals/last_pick_selection%');
                if (ctx && ctx.path)
                    ctx.path = fixer.fix(ctx.path);
            });
        }
    }
});

System.register(['jb-core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.property-toobar-feature', {
                type: 'feature',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'field.toolbar',
                    toolbar: { $: 'studio.property-toobar', path: '%$path%' }
                }
            });
            jb_core_1.jb.component('studio.property-toobar-feature2', {
                type: 'feature',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'field.toolbar', $trace1: true,
                    toolbar: { $: 'studio.property-toobar', path: '%$path%', $trace1: true }
                }
            });
            jb_core_1.jb.component('studio.property-toobar', {
                type: 'control',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'group',
                    style: { $: 'layout.horizontal' },
                    controls: [
                        { $: 'button',
                            title: 'Customize style',
                            style: { $: 'button.md-icon-12', icon: 'build' },
                            action: [{ $: 'studio.make-local', path: '%$path%' }, { $: 'studio.open-style-editor', path: '%$path%' }],
                            features: { $: 'hidden',
                                showCondition: {
                                    $and: [
                                        { $: 'endsWith', endsWith: '~style', text: '%$path%' },
                                        { $: 'notEquals',
                                            item1: { $: 'studio.comp-name', path: '%$path%' },
                                            item2: 'customStyle'
                                        }
                                    ]
                                }
                            }
                        },
                        { $: 'button',
                            title: 'style editor',
                            action: { $: 'studio.open-style-editor', path: '%$path%' },
                            style: { $: 'button.md-icon-12', icon: 'build' },
                            features: { $: 'hidden',
                                showCondition: { $: 'equals',
                                    item1: { $: 'studio.comp-name', path: '%$path%' },
                                    item2: 'customStyle'
                                }
                            }
                        },
                        { $: 'button',
                            title: 'multiline edit',
                            style: { $: 'button.md-icon-12', icon: 'build' },
                            features: { $: 'hidden',
                                showCondition: { $: 'equals',
                                    item1: { $pipeline: [{ $: 'studio.param-def', path: '%$path%' }, '%as%'] },
                                    item2: 'string'
                                }
                            },
                            action: { $: 'studio.open-multiline-edit', path: '%$path%' }
                        },
                        { $: 'button',
                            title: 'more...',
                            style: { $: 'button.md-icon-12', icon: 'more_vert' },
                            action: { $: 'studio.open-property-menu', path: '%$path%' }
                        }
                    ]
                }
            });
            jb_core_1.jb.component('studio.open-property-menu', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'openDialog',
                    $vars: {
                        compName: { $: 'studio.comp-name', path: '%$path%' }
                    },
                    style: { $: 'pulldownPopup.contextMenuPopup' },
                    content: { $: 'group',
                        controls: [
                            { $: 'pulldown.menu-item',
                                title: 'style editor',
                                action: { $: 'studio.open-style-editor', path: '%$path%' },
                                features: { $: 'hidden',
                                    showCondition: { $: 'endsWith', endsWith: '~style', text: '%$path%' }
                                }
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Goto %$compName%',
                                features: { $: 'hidden', showCondition: '%$compName%' },
                                action: { $: 'studio.goto-path', path: '%$compName%' }
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Inteliscript editor',
                                icon: 'code',
                                action: { $: 'studio.open-jb-editor', path: '%$path%' }
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Javascript editor',
                                icon: 'code',
                                action: { $: 'studio.editSource', path: '%$path%' }
                            },
                            { $: 'studio.goto-sublime', path: '%$path%' },
                            { $: 'pulldown.menu-item',
                                title: 'Delete',
                                icon: 'delete',
                                shortcut: 'Delete',
                                action: [
                                    { $: 'writeValue', to: '%$TgpTypeCtrl.expanded%', value: false },
                                    { $: 'studio.delete', path: '%$path%' }
                                ]
                            }
                        ]
                    }
                }
            });
        }
    }
});

System.register(['jb-core', './studio-tgp-model', './studio-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, studio_tgp_model_1, studio_utils_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.open-properties', {
                type: 'action',
                impl: { $: 'openDialog',
                    title: { $pipeline: [
                            { $: 'object',
                                title: { $: 'studio.short-title',
                                    path: { $: 'studio.currentProfilePath' }
                                },
                                comp: { $: 'studio.comp-name',
                                    path: { $: 'studio.currentProfilePath' }
                                }
                            },
                            'Properties of %comp% %title%'
                        ] },
                    style: { $: 'dialog.studio-floating', id: 'studio-properties', width: '500' },
                    content: { $: 'studio.properties',
                        path: { $: 'studio.currentProfilePath' }
                    },
                }
            });
            jb_core_1.jb.component('studio.open-source-dialog', {
                type: 'action',
                impl: { $: 'openDialog',
                    modal: true,
                    title: 'Source',
                    style: { $: 'dialog.md-dialog-ok-cancel' },
                    content: { $: 'text',
                        text: { $: 'studio.comp-source' },
                        style: { $: 'text.codemirror' }
                    },
                }
            });
            jb_core_1.jb.component('studio.properties', {
                type: 'control',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'group',
                    style: { $: 'group.studio-properties-accordion' },
                    controls: [
                        { $: 'group',
                            title: { $pipeline: [
                                    { $: 'studio.val', path: '%$path%' },
                                    { $: 'count',
                                        items: { $pipeline: [
                                                { $: 'objectProperties' },
                                                { $: 'filter',
                                                    filter: { $: 'notEquals', item1: '%%', item2: 'features' }
                                                },
                                                { $: 'filter',
                                                    filter: { $: 'notEquals', item1: '%%', item2: '$' }
                                                },
                                                { $: 'filter',
                                                    filter: { $: 'notEquals', item1: '%%', item2: 'controls' }
                                                }
                                            ] }
                                    },
                                    'Properties (%%)'
                                ] },
                            style: { $: 'property-sheet.studio-properties' },
                            controls: { $: 'dynamic-controls',
                                controlItems: { $pipeline: [
                                        { $: 'studio.non-control-children', path: '%$path%' },
                                        { $: 'filter',
                                            filter: { $: 'not',
                                                of: { $: 'endsWith', endsWith: '~features', text: '%%' }
                                            }
                                        }
                                    ] },
                                genericControl: { $: 'studio.property-field', path: '%$controlItem%' }
                            },
                            features: { $: 'group.studio-watch-path', path: '%$path%' }
                        },
                        { $: 'group',
                            title: { $pipeline: [
                                    { $: 'studio.val', path: '%$path%' },
                                    { $: 'count', items: '%features%' },
                                    'Features (%%)'
                                ] },
                            features: { $: 'group.studio-watch-path', path: '%$path%' },
                            controls: { $: 'studio.property-array', path: '%$path%~features' }
                        }
                    ],
                    features: [
                        { $: 'css.width', width: '502' },
                        { $: 'group.dynamic-sub-titles' },
                        { $: 'css.margin', left: '-10' },
                        { $: 'hidden',
                            showCondition: { $: 'studio.has-param', param: 'features', path: '%$path%' }
                        }
                    ]
                }
            });
            jb_core_1.jb.component('studio.properties-in-tgp', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'group',
                    style: { $: 'property-sheet.studio-properties' },
                    features: { $: 'group.studio-watch-path', path: '%$path%' },
                    controls: { $: 'dynamic-controls',
                        controlItems: { $: 'studio.non-control-children', path: '%$path%' },
                        genericControl: { $: 'studio.property-field', path: '%$controlItem%' }
                    }
                }
            });
            jb_core_1.jb.component('studio.property-field', {
                type: 'control',
                params: [
                    { id: 'path', as: 'string' },
                ],
                impl: function (context, path) {
                    var fieldPT = 'studio.property-label';
                    var val = studio_tgp_model_1.model.val(path);
                    var valType = typeof val;
                    var paramDef = studio_tgp_model_1.model.paramDef(path);
                    if (!paramDef)
                        jb_core_1.jb.logError('property-field: no param def for path ' + path);
                    if (valType == 'function')
                        fieldPT = 'studio.property-javascript';
                    else if (paramDef.as == 'number')
                        fieldPT = 'studio.property-slider';
                    else if (paramDef.options)
                        fieldPT = 'studio.property-enum';
                    else if (['data', 'boolean'].indexOf(paramDef.type || 'data') != -1) {
                        if (studio_tgp_model_1.model.compName(path) || valType == 'object')
                            fieldPT = 'studio.property-script';
                        else if (paramDef.type == 'boolean' && (valType == 'boolean' || val == null))
                            fieldPT = 'studio.property-boolean';
                        else
                            fieldPT = 'studio.property-primitive';
                    }
                    else if ((paramDef.type || '').indexOf('[]') != -1 && isNaN(Number(path.split('~').pop())))
                        fieldPT = 'studio.property-script';
                    else
                        fieldPT = 'studio.property-tgp';
                    return context.run({ $: fieldPT, path: path });
                }
            });
            jb_core_1.jb.component('studio.property-label', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'label',
                    title: { $: 'studio.prop-name', path: '%$path%' },
                }
            });
            jb_core_1.jb.component('studio.property-primitive2', {
                type: 'control',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'editable-text',
                    style: { $: 'editable-text.studio-primitive-text' },
                    title: { $: 'studio.prop-name', path: '%$path%' },
                    databind: { $: 'studio.ref', path: '%$path%' },
                    features: [
                        { $: 'studio.undo-support', path: '%$path%' },
                        { $: 'studio.property-toobar-feature', path: '%$path%' },
                    ]
                }
            });
            jb_core_1.jb.component('studio.property-script', {
                type: 'control',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'group',
                    title: { $: 'studio.prop-name', path: '%$path%' },
                    features: [
                        { $: 'studio.undo-support', path: '%$path%' },
                        { $: 'studio.property-toobar-feature', path: '%$path%' },
                    ],
                    controls: { $: 'button',
                        title: { $: 'studio.data-script-summary', path: '%$path%' },
                        action: { $: 'studio.open-jb-editor', path: '%$path%' },
                        style: { $: 'button.studio-script' }
                    }
                }
            });
            jb_core_1.jb.component('studio.data-script-summary', {
                type: 'data',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: function (ctx, path) {
                    var val = studio_tgp_model_1.model.val(path);
                    if (studio_tgp_model_1.model.compName(path))
                        return studio_tgp_model_1.model.compName(path);
                    if (Array.isArray(val))
                        return jb_core_1.jb.prettyPrint(val);
                    if (typeof val == 'function')
                        return 'javascript';
                }
            });
            jb_core_1.jb.component('studio.property-boolean', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'editable-boolean',
                    style: { $: 'editable-boolean.studio-slide-toggle' },
                    title: { $: 'studio.prop-name', path: '%$path%' },
                    databind: { $: 'studio.ref', path: '%$path%' },
                    features: [
                        { $: 'studio.undo-support', path: '%$path%' },
                        { $: 'studio.property-toobar-feature', path: '%$path%' }
                    ],
                }
            });
            jb_core_1.jb.component('studio.property-enum', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'picklist',
                    style: { $: 'picklist.studio-enum' },
                    title: { $: 'studio.prop-name', path: '%$path%' },
                    databind: { $: 'studio.ref', path: '%$path%' },
                    options: { $: 'studio.enum-options', path: '%$path%' },
                }
            });
            jb_core_1.jb.component('studio.property-slider', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'editable-number',
                    $vars: {
                        paramDef: { $: 'studio.param-def', path: '%$path%' }
                    },
                    title: { $: 'studio.prop-name', path: '%$path%' },
                    databind: { $: 'studio.ref', path: '%$path%' },
                    style: { $: 'editable-number.slider', width: '120' },
                    min: '%$paramDef/min%',
                    max: '%$paramDef/max%',
                    step: '%$paramDef/step%',
                    features: { $: 'css', css: '{ margin-left: -5px; }' },
                }
            });
            jb_core_1.jb.component('studio.property-tgp', {
                type: 'control',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'group',
                    $vars: {
                        tgpCtrl: { $: 'object', expanded: true }
                    },
                    title: { $: 'studio.prop-name', path: '%$path%' },
                    features: [
                        { $: 'studio.property-toobar-feature', path: '%$path%' },
                        { $: 'studio.bindto-modifyOperations',
                            data: '%$tgpCtrl/expanded%',
                            path: '%$path%'
                        }
                    ],
                    controls: [
                        { $: 'group',
                            style: { $: 'layout.horizontal' },
                            controls: [
                                { $: 'editable-boolean',
                                    databind: '%$tgpCtrl/expanded%',
                                    style: { $: 'editable-boolean.expand-collapse' },
                                    features: [
                                        { $: 'css',
                                            css: '{ position: absolute; margin-left: -20px; margin-top: 2px }'
                                        },
                                        { $: 'hidden',
                                            showCondition: {
                                                $and: [
                                                    { $notEmpty: { $: 'studio.non-control-children', path: '%$path%' } },
                                                    { $notEmpty: { $: 'studio.val', path: '%$path%' } },
                                                    { $: 'notEquals',
                                                        item1: { $: 'studio.comp-name', path: '%$path%' },
                                                        item2: 'customStyle'
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                },
                                { $: 'picklist',
                                    databind: { $: 'studio.comp-name-ref', path: '%$path%' },
                                    options: { $: 'studio.tgp-path-options', path: '%$path%' },
                                    style: { $: 'picklist.groups' },
                                    features: [
                                        { $: 'css',
                                            css: 'select { padding: 0 0; width: 150px; font-size: 12px; height: 23px;}'
                                        },
                                        { $: 'picklist.dynamic-options',
                                            recalcEm: function (ctx) {
                                                return studio_utils_1.modifyOperationsEm.filter(function (e) { return e.newComp; });
                                            }
                                        }
                                    ]
                                }
                            ],
                            features: { $: 'css', css: '{ position: relative }' }
                        },
                        { $: 'group',
                            controls: { $: 'studio.properties-in-tgp', path: '%$path%' },
                            features: [
                                { $: 'group.watch',
                                    data: { $: 'studio.comp-name', path: '%$path%' }
                                },
                                { $: 'hidden',
                                    showCondition: {
                                        $and: [
                                            '%$tgpCtrl.expanded%',
                                            { $notEmpty: { $: 'studio.non-control-children', path: '%$path%' } },
                                            { $notEmpty: { $: 'studio.val', path: '%$path%' } },
                                            { $: 'notEquals',
                                                item1: { $: 'studio.comp-name', path: '%$path%' },
                                                item2: 'customStyle'
                                            }
                                        ]
                                    }
                                },
                                { $: 'css',
                                    css: '{ margin-top: 9px; margin-left: -83px; margin-bottom: 4px;}'
                                }
                            ]
                        }
                    ]
                }
            });
            jb_core_1.jb.component('studio.property-custom-style', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'group',
                    title: { $: 'studio.prop-name', path: '%$path%' },
                    features: [
                        { $: 'studio.property-toobar-feature', path: '%$path%' },
                    ],
                    controls: { $: 'picklist',
                        databind: { $: 'studio.comp-name-ref', path: '%$path%' },
                        options: { $: 'studio.tgp-path-options', path: '%$path%' },
                        style: { $: 'picklist.groups' },
                        features: [
                            { $: 'css',
                                css: 'select { padding: 0 0; width: 150px; font-size: 12px; height: 23px;}'
                            },
                            { $: 'picklist.dynamic-options',
                                recalcEm: function (ctx) {
                                    return studio_utils_1.modifyOperationsEm.filter(function (e) { return e.newComp; });
                                }
                            }
                        ],
                    }
                }
            });
            jb_core_1.jb.component('studio.property-tgp-in-array', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'group',
                    $vars: {
                        tgpCtrl: { $: 'object', expanded: false }
                    },
                    controls: [
                        { $: 'group',
                            style: { $: 'layout.horizontal' },
                            controls: [
                                { $: 'editable-boolean',
                                    databind: '%$tgpCtrl/expanded%',
                                    style: { $: 'editable-boolean.expand-collapse' },
                                    features: [
                                        { $: 'studio.bindto-modifyOperations',
                                            path: '%$path%',
                                            data: '%$tgpCtrl/expanded%'
                                        },
                                        { $: 'css',
                                            css: '{ position: absolute; margin-left: -20px; margin-top: 2px }'
                                        },
                                        { $: 'hidden',
                                            showCondition: {
                                                $notEmpty: { $: 'studio.non-control-children', path: '%$path%' }
                                            }
                                        }
                                    ]
                                },
                                { $: 'picklist',
                                    databind: { $: 'studio.comp-name-ref', path: '%$path%' },
                                    options: { $: 'studio.tgp-path-options', path: '%$path%' },
                                    style: { $: 'picklist.groups' },
                                    features: [
                                        { $: 'css',
                                            css: 'select { padding: 0 0; width: 150px; font-size: 12px; height: 23px;}'
                                        }
                                    ]
                                },
                                { $: 'studio.property-toobar', path: '%$path%' }
                            ],
                            features: [{ $: 'css', css: '{ position: relative; margin-left2: -80px }' }]
                        },
                        { $: 'group',
                            controls: { $: 'studio.properties-in-tgp', path: '%$path%' },
                            features: [
                                { $: 'group.watch',
                                    data: { $: 'studio.comp-name', path: '%$path%' }
                                },
                                { $: 'hidden', showCondition: '%$tgpCtrl.expanded%' },
                                { $: 'css',
                                    css: '{ margin-top: 9px; margin-left2: -100px; margin-bottom: 4px;}'
                                }
                            ]
                        }
                    ],
                    features: [
                        { $: 'studio.bindto-modifyOperations',
                            path: '%$path%',
                            data: '%$tgpCtrl/expanded%'
                        },
                        { $: 'css', css: '{ position: relative; margin-left: -80px }' }
                    ]
                }
            });
            jb_core_1.jb.component('studio.property-array', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'group',
                    $vars: {
                        arrayCtrl: { $: 'object', expanded: true }
                    },
                    style: { $: 'layout.vertical', spacing: '7' },
                    controls: [
                        { $: 'group',
                            title: 'items',
                            controls: [
                                { $: 'itemlist',
                                    items: { $: 'studio.array-children', path: '%$path%' },
                                    controls: { $: 'group',
                                        style: { $: 'property-sheet.studio-plain' },
                                        controls: { $: 'studio.property-tgp-in-array', path: '%$arrayItem%' }
                                    },
                                    itemVariable: 'arrayItem',
                                    features: [
                                        { $: 'hidden', showCondition: true },
                                        { $: 'itemlist.divider' },
                                        { $: 'itemlist.drag-and-drop' }
                                    ]
                                }
                            ]
                        },
                        { $: 'button',
                            title: 'new feature',
                            action: { $: 'studio.open-new-tgp-dialog',
                                type: 'feature',
                                title: 'new feature',
                                onOK: { $: 'studio.add-array-item',
                                    path: '%$path%',
                                    toAdd: { $object: { $: '%%' } }
                                }
                            },
                            style: { $: 'button.href' },
                            features: { $: 'css.margin', top: '20', left: '20' }
                        }
                    ],
                    features: []
                }
            });
            jb_core_1.jb.component('studio.tgp-path-options', {
                type: 'picklist.options',
                params: [
                    { id: 'path', as: 'string' },
                ],
                impl: function (context, path) {
                    return [{ code: '', text: '' }]
                        .concat(studio_tgp_model_1.model.PTsOfPath(path).map(function (op) { return ({ code: op, text: op }); }));
                }
            });
            jb_core_1.jb.component('studio.tgp-type-options', {
                type: 'picklist.options',
                params: [
                    { id: 'type', as: 'string' }
                ],
                impl: function (context, type) {
                    return studio_tgp_model_1.model.PTsOfType(type).map(function (op) { return ({ code: op, text: op }); });
                }
            });
            jb_core_1.jb.component('studio.undo-support', {
                type: 'feature',
                params: [
                    { id: 'path', essential: true, as: 'string' },
                ],
                impl: function (ctx, path) {
                    return ({
                        // saving state on focus and setting the change on blur
                        init: function (cmp) {
                            var before = studio_utils_1.compAsStrFromPath(path);
                            if (cmp.codeMirror) {
                                cmp.codeMirror.on('focus', function () {
                                    return before = studio_utils_1.compAsStrFromPath(path);
                                });
                                cmp.codeMirror.on('blur', function () {
                                    if (before != studio_utils_1.compAsStrFromPath(path))
                                        studio_utils_1.notifyModification(path, before, ctx);
                                });
                            }
                            else {
                                $(cmp.elementRef.nativeElement).findIncludeSelf('input')
                                    .focus(function (e) {
                                    before = studio_utils_1.compAsStrFromPath(path);
                                })
                                    .blur(function (e) {
                                    if (before != studio_utils_1.compAsStrFromPath(path))
                                        studio_utils_1.notifyModification(path, before, ctx);
                                });
                            }
                        }
                    });
                }
            });
            jb_core_1.jb.component('studio.bindto-modifyOperations', {
                type: 'feature',
                params: [
                    { id: 'path', essential: true, as: 'string' },
                    { id: 'data', as: 'ref' }
                ],
                impl: function (context, path, data_ref) { return ({
                    init: function (cmp) {
                        return studio_utils_1.modifyOperationsEm
                            .takeUntil(cmp.jbEmitter.filter(function (x) { return x == 'destroy'; }))
                            .filter(function (e) {
                            return e.path == path;
                        })
                            .subscribe(function (e) {
                            return jb_core_1.jb.writeValue(data_ref, true);
                        });
                    },
                    observable: function () { } // to create jbEmitter
                }); }
            });
        }
    }
});

System.register(['jb-core', './studio-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, studio_utils_1;
    var modified;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            }],
        execute: function() {
            modified = {};
            studio_utils_1.modifyOperationsEm.subscribe(function (e) {
                var comp = e.comp;
                if (!modified[comp]) {
                    modified[comp] = { original: e.before || '' };
                }
            });
            jb_core_1.jb.component('studio.saveComponents', {
                params: [
                    { id: 'force', as: 'boolean', type: 'boolean' }
                ],
                impl: { $rxLog: { $rxPipe: [
                            function (ctx) { return jb_core_1.jb.entries(modified).map(function (x) {
                                return ({ key: x[0], val: x[1] });
                            }); },
                            function (ctx) {
                                var comp = ctx.data.key;
                                studio_utils_1.message('saving ' + comp);
                                if (ctx.exp('%$force%') && !ctx.data.val.original)
                                    ctx.data.val.original = "jb.component('" + comp + "', {";
                                return $.ajax({
                                    url: "/?op=saveComp&comp=" + comp + "&project=" + ctx.exp('%$globals/project%') + "&force=" + ctx.exp('%$force%'),
                                    type: 'POST',
                                    data: JSON.stringify({ original: ctx.data.val && ctx.data.val.original, toSave: studio_utils_1.compAsStr(comp) }),
                                    headers: { 'Content-Type': 'text/plain' }
                                }).then(function (result) {
                                    studio_utils_1.message((result.type || '') + ': ' + (result.desc || '') + (result.message || ''), result.type != 'success');
                                    if (result.type == 'success')
                                        delete modified[comp];
                                }, function (e) {
                                    studio_utils_1.message('error saving: ' + e);
                                    jb_core_1.jb.logException(e, 'error while saving ' + comp);
                                });
                            }
                        ] },
                    $vars: {
                        force: '%$force%'
                    }
                }
            });
        }
    }
});

System.register(['jb-core', './studio-tgp-model'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, studio_tgp_model_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.open-style-editor', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'openDialog',
                    $vars: {
                        styleSource: { $: 'studio.style-source', path: '%$path%' }
                    },
                    title: 'Style Editor - %$styleSource/path%',
                    style: { $: 'dialog.studio-floating', id: 'style editor' },
                    content: { $: 'studio.style-editor', path: '%$path%' },
                    menu: { $: 'button',
                        title: 'style menu',
                        style: { $: 'button.md-icon', icon: 'menu' },
                        action: { $: 'studio.open-style-menu', path: '%$path%' }
                    }
                }
            });
            jb_core_1.jb.component('studio.open-style-menu', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'openDialog',
                    style: { $: 'pulldownPopup.contextMenuPopup' },
                    content: { $: 'group',
                        controls: [
                            { $: 'pulldown.menu-item',
                                title: 'Clone as local style',
                                icon: 'build',
                                action: [
                                    { $: 'studio.make-local', path: '%$path%' },
                                    { $: 'studio.open-style-editor', path: '%$styleSource/innerPath%' },
                                    { $: 'studio.open-properties' },
                                ],
                                features: { $: 'hidden', showCondition: "%$styleSource/type% == 'global'" },
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Extract style as a reusable component',
                                icon: 'build',
                                action: { $: 'studio.open-make-global-style', path: '%$path%' },
                                features: { $: 'hidden', showCondition: "%$styleSource/type% == 'inner'" },
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Format css',
                                action: { $: 'writeValue',
                                    to: { $: 'studio.profile-as-text', path: '%$styleSource/path%~css', stringOnly: true },
                                    value: { $: 'studio.format-css',
                                        css: { $: 'studio.profile-as-text', path: '%$styleSource/path%~css' }
                                    }
                                }
                            }
                        ]
                    }
                }
            });
            jb_core_1.jb.component('studio.style-editor', {
                type: 'control',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'group',
                    style: { $: 'property-sheet.titles-above' },
                    controls: [
                        { $: 'editable-text',
                            title: 'css',
                            databind: { $: 'studio.profile-as-text', path: '%$styleSource/path%~css', stringOnly: true },
                            features: { $: 'studio.undo-support', path: '%styleSource/path%' },
                            style: { $: 'editable-text.codemirror', mode: 'css', height: 300 }
                        },
                        { $: 'editable-text',
                            title: 'template',
                            databind: { $: 'studio.profile-as-text', path: '%$styleSource/path%~template', stringOnly: true },
                            style: { $: 'editable-text.codemirror', mode: 'htmlmixed', height: '200' },
                            features: { $: 'studio.undo-support', path: '%$styleSource/path%' }
                        }
                    ]
                }
            });
            jb_core_1.jb.component('studio.style-source', {
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: function (ctx, path) {
                    return studio_tgp_model_1.model.getStyleComp(path);
                }
            });
            jb_core_1.jb.component('studio.format-css', {
                params: [
                    { id: 'css', as: 'string' }
                ],
                impl: function (ctx, css) {
                    return css
                        .replace(/{\s*/g, '{ ')
                        .replace(/;\s*/g, ';\n')
                        .replace(/}[^$]/mg, '}\n\n')
                        .replace(/^\s*/mg, '');
                }
            });
            jb_core_1.jb.component('studio.open-make-global-style', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'openDialog',
                    modal: true,
                    title: 'Style Name',
                    style: { $: 'dialog.md-dialog-ok-cancel',
                        features: { $: 'dialog-feature.autoFocusOnFirstInput' }
                    },
                    content: { $: 'editable-text',
                        databind: '%$dialogData/name%',
                        features: { $: 'feature.onEnter', action: { $: 'closeContainingPopup' } }
                    },
                    onOK: function (ctx) {
                        debugger;
                        var path = ctx.componentContext.params.path;
                        var id = ctx.exp('%$globals/project%.%$dialogData/name%');
                        var profile = {
                            type: studio_tgp_model_1.model.paramDef(path).type,
                            impl: studio_tgp_model_1.model.val(path)
                        };
                        studio_tgp_model_1.model.modify(studio_tgp_model_1.model.newComp, id, { profile: profile }, ctx);
                        studio_tgp_model_1.model.modify(studio_tgp_model_1.model.writeValue, path, { value: { $: id } }, ctx);
                    }
                }
            });
            jb_core_1.jb.component('studio.custom-style-make-local', {
                params: [
                    { id: 'template', as: 'string' },
                    { id: 'css', as: 'string' },
                ],
                impl: { $: 'object', template: '%$template%', css: '%$css%' }
            });
        }
    }
});

System.register(['jb-core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('editable-text.studio-primitive-text', {
                type: 'editable-text.style',
                impl: { $: 'customStyle',
                    features: { $: 'editable-text.bindField' },
                    template: "<div><input %$field.modelExp%></div>",
                    css: "\ninput { display: block; width: 146px; height: 19px; padding-left: 2px;\n\tfont-size: 12px; color: #555555; background-color: #fff; \n\tborder: 1px solid #ccc; border-radius: 4px;\n\tbox-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); \n\ttransition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; \n}\ninput:focus { border-color: #66afe9; outline: 0; \n\tbox-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }\ninput::placeholder { color: #999; opacity: 1; }\ninput[disabled], input[readonly] { background-color: #eeeeee; opacity: 1; }\n\t  \tinput.focused {width: 300px; transition: width: 1s}"
                }
            });
            jb_core_1.jb.component('button.studio-script', {
                type: 'editable-text.style',
                impl: { $: 'customStyle',
                    template: '<div [title]="title" (click)="clicked()"><div class="inner-text">{{title}}</div></div>',
                    css: ".inner-text {\n  white-space: nowrap; overflow-x: hidden;\n  display: inline; height: 16px; \n  padding-left: 4px; padding-top: 2px;\n  font: 12px \"arial\"; color: #555555; \n}\n\n{\n  width: 149px;\n  border: 1px solid #ccc; border-radius: 4px;\n  cursor: pointer;\n  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); \n  background: #eee;\n  white-space: nowrap; overflow-x: hidden;\n  text-overflow: ellipsis;\n}",
                }
            });
            jb_core_1.jb.component('editable-boolean.studio-slide-toggle', {
                type: 'editable-boolean.style',
                impl: { $: 'customStyle',
                    template: "<div><md-slide-toggle color=\"primary\" class=\"studio-slide-toggle\" %$field.modelExp% >{{text()}}</md-slide-toggle></div>",
                    css: "\n      .studio-slide-toggle { margin: 0 !important; width: 153px; }\n  .studio-slide-toggle.md-primary.md-checked .md-slide-toggle-thumb {\n    background-color: #1f1f1f !important}\n  .studio-slide-toggle.md-primary.md-checked .md-slide-toggle-bar {\n    background-color: #858585 !important; opacity: 0.5 }\n  .studio-slide-toggle.md-primary.md-slide-toggle-focused .md-ink-ripple {\n    opacity: 1; background-color: #858585 !important; \n    background-color-old: rgba(0, 150, 136, 0.26); }\n      ",
                    directives: 'MdSlideToggle'
                }
            });
            jb_core_1.jb.component('picklist.studio-enum', {
                type: 'picklist.style',
                impl: { $: 'customStyle',
                    template: "<div><select %$field.modelExp%>\n                    <option *ngFor=\"let option of options\" [value]=\"option.code\">{{option.text}}</option>\n                 </select></div>",
                    css: "\nselect { display: block; padding: 0; width: 150px; font-size: 12px; height: 23px;\n\tcolor: #555555; background-color: #fff; \n\tborder: 1px solid #ccc; border-radius: 4px;\n\tbox-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); \n\ttransition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s; \n}\nselect:focus { border-color: #66afe9; outline: 0; \n\tbox-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6); }\nselect::placeholder { color: #999; opacity: 1; }\nselect[disabled], select[readonly] { background-color: #eeeeee; opacity: 1; }\n    "
                }
            });
            jb_core_1.jb.component('property-sheet.studio-properties', {
                type: 'group.style',
                impl: { $: 'customStyle',
                    features: { $: 'group.initGroup' },
                    methods: {
                        afterViewInit: function (ctx) {
                            return function (cmp) {
                                return jb_core_1.jb.delay(1).then(function () {
                                    return $(cmp.elementRef.nativeElement).find('input,select')
                                        .focus(function (e) {
                                        $(e.target).parents().filter('.property').siblings().find('input').removeClass('focused');
                                        $(e.target).addClass('focused');
                                    });
                                });
                            };
                        }
                    },
                    template: "<div>\n      <div *ngFor=\"let ctrl of ctrls\" class=\"property\" \n          (mouseenter)=\"ctrl.hover=true\" (mouseleave)=\"ctrl.hover=false\">\n        <label class=\"property-title\">{{ctrl.comp.jb_title()}}</label>\n        <div class=\"input-and-toolbar\">\n          <jb_comp [comp]=\"ctrl.comp\"></jb_comp>\n          <jb_comp [hidden]=\"!ctrl.hover\" [comp]=\"ctrl.comp.jb_toolbar\" class=\"toolbar\"></jb_comp>\n        </div>\n      </div>\n      </div>\n    ",
                    css: ".property { margin-bottom: 5px; display: flex }\n      .property:last-child { margin-bottom:0px }\n      .input-and-toolbar { display: flex; }\n      .toolbar { height: 16px; margin-left: 10px }\n      .property>.property-title {\n        min-width: 90px;\n        width: 90px;\n        overflow:hidden;\n        text-overflow:ellipsis;\n        vertical-align:top;\n        margin-top:2px;\n        font-size:14px;\n        margin-right: 10px;\n        margin-left: 7px;\n      },\n      .property>*:last-child { margin-right:0 }"
                }
            });
            jb_core_1.jb.component('property-sheet.studio-plain', {
                type: 'group.style',
                impl: { $: 'customStyle',
                    features: { $: 'group.initGroup' },
                    template: "<div>\n      <div *ngFor=\"let ctrl of ctrls\" class=\"property\">\n        <label class=\"property-title\">{{ctrl.comp.jb_title()}}</label>\n        <div class=\"input-and-toolbar\">\n          <jb_comp [comp]=\"ctrl.comp\"></jb_comp>\n          <jb_comp [comp]=\"ctrl.comp.jb_toolbar\" class=\"toolbar\"></jb_comp>\n        </div>\n      </div>\n      </div>\n    ",
                    css: ".property { margin-bottom: 5px; display: flex }\n      .property:last-child { margin-bottom:0px }\n      .input-and-toolbar { display: flex; }\n      .toolbar { height: 16px; margin-left: 10px }\n      .property>.property-title {\n        min-width: 90px;\n        width: 90px;\n        overflow:hidden;\n        text-overflow:ellipsis;\n        vertical-align:top;\n        margin-top:2px;\n        font-size:14px;\n        margin-right: 10px;\n        margin-left: 7px;\n      },\n      .property>*:last-child { margin-right:0 }"
                }
            });
            jb_core_1.jb.component('editable-boolean.studio-expand-collapse-in-toolbar', {
                type: 'editable-boolean.style',
                impl: { $: 'customStyle',
                    template: "<div><button md-icon-button md-button (click)=\"toggle()\" title=\"{{yesNo ? 'collapse' : 'expand'}}\">\n      \t<i class=\"material-icons\">{{yesNo ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}}</i>\n      \t</button></div>",
                    css: "button { width: 24px; height: 24px; padding: 0; margin-top: -3px;}\n     \t.material-icons { font-size:12px;  }\n      "
                }
            });
            jb_core_1.jb.component('editable-boolean.studio-expand-collapse-in-array', {
                type: 'editable-boolean.style',
                impl: { $: 'customStyle',
                    template: "<div><button md-icon-button md-button (click)=\"toggle()\" title=\"{{yesNo ? 'collapse' : 'expand'}}\">\n      \t<i class=\"material-icons\">{{yesNo ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}}</i>\n      \t</button></div>",
                    css: "button { width: 24px; height: 24px; padding: 0; }\n     \t.material-icons { font-size:12px;  }\n      "
                }
            });
            // jb.component('button.studio-edit-js', {
            //   type: 'button.style',
            //   impl :{$: 'customStyle',  
            //   	template: '<div><button (click)="clicked()" [title]="title">{}</button></div>',
            //   	css: `{ margin-top: -2px; margin-left: -3px; margin-right: -5px;}
            //   		 button { cursor: pointer; 
            //             font: 12px sans-serif; 
            //             border: none; 
            //             background: transparent; 
            //             color: #91B193; 
            //             text-shadow: 0 1px 0 #fff; 
            //             font-weight: 700; 
            //             opacity: .8;
            //         }
            //         button:hover { opacity: 1 }`
            //   }
            // })
            // jb.component('button.studio-delete', {
            //   type: 'button.style',
            //   impl :{$: 'customStyle',  
            //       template: '<div><button (click)="clicked()" [title]="title">&#215;</button></div>',
            //       css: `{ margin-left: -4px; margin-top: -1px }
            //       button {
            //             cursor: pointer; 
            //             font: 16px sans-serif; 
            //             border: none; 
            //             background: transparent; 
            //             color: #000; 
            //             text-shadow: 0 1px 0 #fff; 
            //             font-weight: 700; 
            //             opacity: .2;
            //         }
            //         button:hover { opacity: .5 }`
            //   }
            // })
            jb_core_1.jb.component('dialog.studio-multiline-edit', {
                type: 'dialog.style',
                impl: { $: 'customStyle',
                    template: "<div class=\"jb-dialog jb-popup\">\n\t\t\t\t\t\t\t<button class=\"dialog-close\" (click)=\"dialogClose()\">&#215;</button>\n\t\t\t\t\t\t\t<jb_comp [comp]=\"contentComp\" class=\"dialog-content\"></jb_comp>\n\t\t\t\t\t\t</div>",
                    css: "{ background: #fff; position: absolute; min-width: 280px; min-height: 200px;\n\t\t\t\t\tbox-shadow: 2px 2px 3px #d5d5d5; padding: 3px; border: 1px solid rgb(213, 213, 213)\n\t\t\t\t  }\n\t\t\t\t.dialog-close {\n\t\t\t\t\t\tposition: absolute; \n\t\t\t\t\t\tcursor: pointer; \n\t\t\t\t\t\tright: -7px; top: -22px; \n\t\t\t\t\t\tfont: 21px sans-serif; \n\t\t\t\t\t\tborder: none; \n\t\t\t\t\t\tbackground: transparent; \n\t\t\t\t\t\tcolor: #000; \n\t\t\t\t\t\ttext-shadow: 0 1px 0 #fff; \n\t\t\t\t\t\tfont-weight: 700; \n\t\t\t\t\t\topacity: .2;\n\t\t\t\t}\n\t\t\t\t.dialog-close:hover { opacity: .5 }\n\t\t\t\t",
                    features: [
                        { $: 'dialog-feature.maxZIndexOnClick' },
                        { $: 'dialog-feature.closeWhenClickingOutside' },
                        { $: 'dialog-feature.cssClassOnLaunchingControl' },
                        { $: 'dialog-feature.studio-position-under-property' }
                    ]
                }
            });
            jb_core_1.jb.component('dialog-feature.studio-position-under-property', {
                type: 'dialog-feature',
                impl: function (context, offsetLeft, offsetTop) {
                    return {
                        afterViewInit: function (cmp) {
                            if (!context.vars.$launchingElement)
                                return console.log('no launcher for dialog');
                            var $control = context.vars.$launchingElement.$el.parents('.input-and-toolbar');
                            var pos = $control.offset();
                            var $jbDialog = $(cmp.elementRef.nativeElement).findIncludeSelf('.jb-dialog');
                            $jbDialog.css('left', pos.left + "px")
                                .css('top', pos.top + "px")
                                .css('display', 'block');
                        }
                    };
                }
            });
            jb_core_1.jb.component('group.studio-properties-accordion', {
                type: 'group.style',
                impl: { $: 'customStyle',
                    template: "<section class=\"jb-group\">\n      <div *ngFor=\"let ctrl of ctrls\" class=\"accordion-section\">\n        <div class=\"header\">\n          <div class=\"title\">{{ctrl.title}}</div>\n          <div class=\"expand\" (click)=\"toggle(ctrl)\" title=\"{{expand_title(ctrl)}}\">\n                <i *ngIf=\"ctrl.show\" class=\"material-icons\">keyboard_arrow_down</i>\n                <i *ngIf=\"!ctrl.show\" class=\"material-icons\">keyboard_arrow_right</i>\n          </div>\n        </div><div class=\"content\">\n          <jb_comp *ngIf=\"ctrl.show\" [comp]=\"ctrl.comp\"></jb_comp>\n        </div>\n      </div>\n  </section>",
                    methods: {
                        init: function (ctx) {
                            return function (cmp) {
                                cmp.expand_title = function (ctrl) {
                                    return ctrl.show ? 'collapse' : 'expand';
                                };
                                cmp.toggle = function (newCtrl) {
                                    return cmp.ctrls.forEach(function (ctrl) {
                                        return ctrl.show = ctrl == newCtrl ? !ctrl.show : false;
                                    });
                                };
                            };
                        },
                        afterViewInit: function (ctx) {
                            return function (cmp) {
                                if (cmp.ctrls && cmp.ctrls[0])
                                    cmp.ctrls[0].show = true;
                            };
                        }
                    },
                    css: ".header { display: flex; flex-direction: row; }\nbutton:hover { background: none }\nbutton { margin-left: auto }\ni { color: #; cursor: pointer }\n.title { margin: 5px } \n.content { padding-top: 2px }\n.header { background: #eee; margin-bottom: 2px; display: flex; justify-content: space-between } \n",
                    features: { $: 'group.initGroup' }
                }
            });
        }
    }
});

System.register(['jb-core', 'jb-ui', 'jb-ui/jb-rx', './studio-tgp-model', './studio-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, jb_ui, jb_rx, studio_tgp_model_1, studio_utils_1;
    var suggestions, ValueOption, CompOption;
    function rev(str) {
        return str.split('').reverse().join('');
    }
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (jb_ui_1) {
                jb_ui = jb_ui_1;
            },
            function (jb_rx_1) {
                jb_rx = jb_rx_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.property-primitive', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'group',
                    title: { $: 'studio.prop-name', path: '%$path%' },
                    controls: [
                        { $: 'editable-text',
                            title: '%',
                            databind: { $: 'studio.ref', path: '%$path%' },
                            style: { $: 'editable-text.studio-primitive-text' },
                            features: [
                                { $: 'studio.undo-support', path: '%$path%' },
                                { $: 'studio.property-toobar-feature', path: '%$path%' }
                            ]
                        },
                        { $: 'itemlist-with-groups',
                            items: '%$suggestionCtx/options%',
                            controls: { $: 'label',
                                title: '%text%',
                                features: { $: 'css.padding', top: '', left: '3', bottom: '' }
                            },
                            watchItems: true,
                            features: [
                                { $: 'itemlist.studio-suggestions-options' },
                                { $: 'itemlist.selection', autoSelectFirst: true },
                                { $: 'hidden', showCondition: '%$suggestionCtx/show%' },
                                { $: 'css.height', height: '500', overflow: 'auto', minMax: 'max' },
                                { $: 'css.width', width: '300', overflow: 'auto' },
                                { $: 'css',
                                    css: '{ position: absolute; z-index:1000; background: white }'
                                },
                                { $: 'css.border', width: '1', color: '#cdcdcd' },
                                { $: 'css.padding', top: '2', left: '3', selector: 'li' }
                            ]
                        }
                    ],
                    features: [
                        { $: 'group.studio-suggestions', path: '%$path%', expressionOnly: true },
                        { $: 'studio.property-toobar-feature', path: '%$path%' }
                    ]
                }
            });
            jb_core_1.jb.component('studio.jb-floating-input', {
                type: 'control',
                params: [{ id: 'path', as: 'string' }],
                impl: { $: 'group',
                    controls: [
                        { $: 'editable-text',
                            databind: { $: 'studio.profile-value-as-text', path: '%$path%' },
                            updateOnBlur: true,
                            style: { $: 'editable-text.md-input', width: '400' },
                            features: [
                                { $: 'studio.undo-support', path: '%$path%' },
                                { $: 'css.padding', left: '4', right: '4' }
                            ]
                        },
                        { $: 'itemlist-with-groups',
                            items: '%$suggestionCtx/options%',
                            controls: { $: 'label', title: '%text%' },
                            watchItems: true,
                            features: [
                                { $: 'itemlist.studio-suggestions-options' },
                                { $: 'itemlist.selection',
                                    onDoubleClick: function (ctx) {
                                        return ctx.data.paste(ctx);
                                    },
                                    autoSelectFirst: true
                                },
                                { $: 'hidden', showCondition: '%$suggestionCtx/show%' },
                                { $: 'css.height', height: '500', overflow: 'auto', minMax: 'max' },
                                { $: 'css.padding', top: '3', left: '3', selector: 'li' }
                            ]
                        }
                    ],
                    features: { $: 'group.studio-suggestions',
                        path: '%$path%',
                        closeFloatingInput: [
                            { $: 'closeContainingPopup', OK: true },
                            { $: 'tree.regain-focus' }
                        ]
                    }
                }
            });
            suggestions = (function () {
                function suggestions(input, expressionOnly) {
                    this.input = input;
                    this.expressionOnly = expressionOnly;
                    this.pos = input.selectionStart;
                    this.text = input.value.substr(0, this.pos).trim();
                    this.text_with_open_close = this.text.replace(/%([^%;{}\s><"']*)%/g, function (match, contents) {
                        return '{' + contents + '}';
                    });
                    this.exp = rev((rev(this.text_with_open_close).match(/([^\}%]*%)/) || ['', ''])[1]);
                    this.exp = this.exp || rev((rev(this.text_with_open_close).match(/([^\}=]*=)/) || ['', ''])[1]);
                    this.tail = rev((rev(this.exp).match(/([^%.\/=]*)(\/|\.|%|=)/) || ['', ''])[1]);
                    this.tailSymbol = this.text_with_open_close.slice(-1 - this.tail.length).slice(0, 1); // % or /
                    if (this.tailSymbol == '%' && this.exp.slice(0, 2) == '%$')
                        this.tailSymbol = '%$';
                    this.base = this.exp.slice(0, -1 - this.tail.length) + '%';
                    this.inputVal = input.value;
                    this.inputPos = input.selectionStart;
                }
                suggestions.prototype.suggestionsRelevant = function () {
                    return (this.inputVal.indexOf('=') == 0 && !this.expressionOnly)
                        || ['%', '%$', '/', '.'].indexOf(this.tailSymbol) != -1;
                };
                suggestions.prototype.adjustPopupPlace = function (cmp, options) {
                    // var temp = $('<span></span>').css('font',$(this.input).css('font')).css('width','100%')
                    //   .css('z-index','-1000').text($(this.input).val().substr(0,this.pos)).appendTo('body');
                    // var offset = temp.width();
                    // temp.remove();
                    // var dialogEl = $(cmp.elementRef.nativeElement).parents('.jb-dialog');
                    // dialogEl.css('margin-left', `${offset}px`)
                    //   .css('display', options.length ? 'block' : 'none');
                };
                suggestions.prototype.extendWithOptions = function (probeCtx, path) {
                    var _this = this;
                    this.options = [];
                    probeCtx = probeCtx || (jbart.previewjbart || jbart).initialCtx;
                    var vars = jb_core_1.jb.entries(jb_core_1.jb.extend({}, (probeCtx.componentContext || {}).params, probeCtx.vars, probeCtx.resources))
                        .map(function (x) { return new ValueOption('$' + x[0], x[1], _this.pos, _this.tail); })
                        .filter(function (x) { return x.toPaste.indexOf('$$') != 0; })
                        .filter(function (x) { return ['$ngZone', '$window'].indexOf(x.toPaste) == -1; });
                    if (this.inputVal.indexOf('=') == 0 && !this.expressionOnly)
                        this.options = studio_tgp_model_1.model.PTsOfPath(path).map(function (compName) {
                            var name = compName.substring(compName.indexOf('.') + 1);
                            var ns = compName.substring(0, compName.indexOf('.'));
                            return new CompOption(compName, compName, ns ? name + " (" + ns + ")" : name, studio_utils_1.getComp(compName).description || '');
                        });
                    else if (this.tailSymbol == '%')
                        this.options = [].concat.apply([], jb_core_1.jb.toarray(probeCtx.exp('%%'))
                            .map(function (x) {
                            return jb_core_1.jb.entries(x).map(function (x) { return new ValueOption(x[0], x[1], _this.pos, _this.tail); });
                        }))
                            .concat(vars);
                    else if (this.tailSymbol == '%$')
                        this.options = vars;
                    else if (this.tailSymbol == '/' || this.tailSymbol == '.')
                        this.options = [].concat.apply([], jb_core_1.jb.toarray(probeCtx.exp(this.base))
                            .map(function (x) { return jb_core_1.jb.entries(x).map(function (x) { return new ValueOption(x[0], x[1], _this.pos, _this.tail); }); }));
                    this.options = this.options
                        .filter(jb_unique(function (x) { return x.toPaste; }))
                        .filter(function (x) { return x.toPaste != _this.tail; })
                        .filter(function (x) {
                        return _this.tail == '' || typeof x.toPaste != 'string' || (x.description + x.toPaste).toLowerCase().indexOf(_this.tail) != -1;
                    });
                    if (this.tail)
                        this.options.sort(function (x, y) { return (y.toPaste.toLowerCase().indexOf(_this.tail) == 0 ? 1 : 0) - (x.toPaste.toLowerCase().indexOf(_this.tail) == 0 ? 1 : 0); });
                    this.key = this.options.map(function (o) { return o.toPaste; }).join(',');
                    return this;
                };
                return suggestions;
            }());
            exports_1("suggestions", suggestions);
            ValueOption = (function () {
                function ValueOption(toPaste, value, pos, tail) {
                    this.toPaste = toPaste;
                    this.value = value;
                    this.pos = pos;
                    this.tail = tail;
                    this.text = this.toPaste + this.valAsText();
                }
                ValueOption.prototype.valAsText = function () {
                    var val = this.value;
                    if (typeof val == 'string' && val.length > 20)
                        return " (" + val.substring(0, 20) + "...)";
                    else if (typeof val == 'string' || typeof val == 'number' || typeof val == 'boolean')
                        return " (" + val + ")";
                    return "";
                };
                ValueOption.prototype.paste = function (ctx) {
                    var toPaste = this.toPaste + (typeof this.value == 'object' ? '/' : '%');
                    var input = ctx.vars.suggestionCtx.input;
                    var pos = this.pos + 1;
                    input.value = input.value.substr(0, this.pos - this.tail.length) + toPaste + input.value.substr(pos);
                    jb_core_1.jb.delay(1, ctx).then(function () {
                        input.selectionStart = pos + toPaste.length;
                        input.selectionEnd = input.selectionStart;
                    });
                };
                ValueOption.prototype.writeValue = function (ctx) {
                    var input = ctx.vars.suggestionCtx.input;
                    var script_ref = ctx.run({ $: 'studio.ref', path: '%$suggestionCtx.path%' });
                    jb_core_1.jb.writeValue(script_ref, input.value);
                };
                return ValueOption;
            }());
            CompOption = (function () {
                function CompOption(toPaste, value, text, description) {
                    this.toPaste = toPaste;
                    this.value = value;
                    this.text = text;
                    this.description = description;
                }
                CompOption.prototype.paste = function (ctx) {
                    ctx.vars.suggestionCtx.input.value = '=' + this.toPaste;
                    ctx.vars.suggestionCtx.closeAndWriteValue();
                };
                CompOption.prototype.writeValue = function (ctx) {
                    ctx.run({ $: 'writeValue', to: { $: 'studio.comp-name-ref', path: '%$suggestionCtx.path%' }, value: this.toPaste });
                    ctx.run({ $: 'studio.expand-and-select-first-child-in-jb-editor' });
                };
                return CompOption;
            }());
            jb_core_1.jb.component('group.studio-suggestions', {
                type: 'feature',
                params: [
                    { id: 'path', as: 'string' },
                    { id: 'closeFloatingInput', type: 'action', dynamic: true },
                    { id: 'expressionOnly', type: 'boolean', as: 'boolean' }
                ],
                impl: function (ctx) {
                    var suggestionCtx = { path: ctx.params.path, options: [], show: false };
                    return {
                        observable: function () { },
                        extendCtx: function (ctx2) {
                            return ctx2.setVars({ suggestionCtx: suggestionCtx });
                        },
                        afterViewInit: function (cmp) {
                            var input = $(cmp.elementRef.nativeElement).findIncludeSelf('input')[0];
                            if (!input)
                                return;
                            suggestionCtx.input = input;
                            var inputClosed = cmp.jbEmitter.filter(function (x) { return x == 'destroy'; });
                            cmp.keyEm = jb_rx.Observable.fromEvent(input, 'keydown')
                                .takeUntil(inputClosed);
                            suggestionCtx.keyEm = cmp.keyEm;
                            suggestionCtx.closeAndWriteValue = function () {
                                ctx.params.closeFloatingInput();
                                var option = input.value.indexOf('=') == 0 ? new CompOption(input.value.substr(1)) : new ValueOption();
                                option.writeValue(cmp.ctx);
                            };
                            cmp.keyEm.filter(function (e) { return e.keyCode == 13; })
                                .subscribe(function (e) {
                                if (!suggestionCtx.show || suggestionCtx.options.length == 0)
                                    suggestionCtx.closeAndWriteValue();
                            });
                            cmp.keyEm.filter(function (e) { return e.keyCode == 27; })
                                .subscribe(function (e) {
                                ctx.params.closeFloatingInput();
                            });
                            suggestionCtx.suggestionEm = cmp.keyEm
                                .filter(function (e) { return e.keyCode != 38 && e.keyCode != 40; })
                                .delay(1) // we use keydown - let the input fill itself
                                .debounceTime(20) // solves timing of closing the floating input
                                .filter(function (e) {
                                return suggestionCtx.show = new suggestions(input, ctx.params.expressionOnly).suggestionsRelevant();
                            })
                                .map(function (e) {
                                return input.value;
                            })
                                .distinctUntilChanged()
                                .flatMap(function (e) {
                                return getProbe().then(function (res) {
                                    return res && res.finalResult && res.finalResult[0] && res.finalResult[0].in;
                                });
                            })
                                .map(function (probeCtx) {
                                return new suggestions(input, ctx.params.expressionOnly).extendWithOptions(probeCtx, ctx.params.path);
                            })
                                .distinctUntilChanged(function (e1, e2) {
                                return e1.key == e2.key;
                            });
                            function getProbe() {
                                return cmp.probeResult || ctx.run({ $: 'studio.probe', path: ctx.params.path });
                            }
                        }
                    };
                }
            });
            jb_core_1.jb.component('itemlist.studio-suggestions-options', {
                type: 'feature',
                params: [],
                impl: function (ctx) {
                    return ({
                        afterViewInit: function (cmp) {
                            var suggestionCtx = ctx.vars.suggestionCtx;
                            //        cmp.changeDt.detach();
                            jb_core_1.jb.delay(1, ctx).then(function () {
                                var keyEm = suggestionCtx.keyEm;
                                keyEm.filter(function (e) {
                                    return e.keyCode == 13;
                                }) // ENTER
                                    .subscribe(function () {
                                    suggestionCtx.show = false;
                                    if (cmp.selected && cmp.selected.paste)
                                        cmp.selected.paste(ctx);
                                    jb_ui.apply(ctx);
                                });
                                keyEm.filter(function (e) { return e.keyCode == 27; }) // ESC
                                    .subscribe(function (x) {
                                    return suggestionCtx.show = false;
                                });
                                keyEm.filter(function (e) {
                                    return e.keyCode == 38 || e.keyCode == 40;
                                })
                                    .subscribe(function (e) {
                                    var diff = e.keyCode == 40 ? 1 : -1;
                                    var items = cmp.items; //.filter(item=>!item.heading);
                                    cmp.selected = items[(items.indexOf(cmp.selected) + diff + items.length) % items.length] || cmp.selected;
                                    // cmp.changeDt.markForCheck();
                                    // cmp.changeDt.detectChanges();
                                    e.preventDefault();
                                });
                                suggestionCtx.suggestionEm.subscribe(function (e) {
                                    suggestionCtx.show = e.options.length > 0;
                                    suggestionCtx.options = e.options;
                                    cmp.selected = e.options[0];
                                    cmp.changeDt.markForCheck();
                                    cmp.changeDt.detectChanges();
                                });
                            });
                        },
                    });
                }
            });
        }
    }
});

System.register(['jb-core', './studio-probe', './studio-suggestions', './studio-tgp-model'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, studio_probe_1, studio_suggestions_1, studio_tgp_model_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (studio_probe_1_1) {
                studio_probe_1 = studio_probe_1_1;
            },
            function (studio_suggestions_1_1) {
                studio_suggestions_1 = studio_suggestions_1_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('suggestions-test', {
                type: 'test',
                params: [
                    { id: 'expression', as: 'string' },
                    { id: 'selectionStart', as: 'number', defaultValue: -1 },
                    { id: 'path', as: 'string', defaultValue: 'suggestions-test.default-probe~title' },
                    { id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean' },
                ],
                impl: { $: 'data-test',
                    calculate: function (ctx) {
                        var params = ctx.componentContext.params;
                        var selectionStart = params.selectionStart == -1 ? params.expression.length : params.selectionStart;
                        var circuit = params.path.split('~')[0];
                        var probeRes = new studio_probe_1.Probe(jb_core_1.jb.ctx(ctx, { profile: { $: circuit }, comp: circuit, path: '', data: null }), true)
                            .runCircuit(params.path);
                        return probeRes.then(function (res) {
                            var probeCtx = res.finalResult[0] && res.finalResult[0].in;
                            var obj = new studio_suggestions_1.suggestions({ value: params.expression, selectionStart: selectionStart })
                                .extendWithOptions(probeCtx, probeCtx.path);
                            return JSON.stringify(JSON.stringify(obj.options.map(function (x) { return x.text; })));
                        });
                    },
                    expectedResult: { $call: 'expectedResult' }
                },
            });
            jb_core_1.jb.component('studio-tree-children-test', {
                type: 'test',
                params: [
                    { id: 'path', as: 'string' },
                    { id: 'childrenType', as: 'string', type: ',jb-editor' },
                    { id: 'expectedResult', type: 'boolean', dynamic: true, as: 'boolean' }
                ],
                impl: { $: 'data-test',
                    calculate: function (ctx) {
                        var params = ctx.componentContext.params;
                        var mdl = new studio_tgp_model_1.TgpModel('', params.childrenType);
                        var titles = mdl.children(params.path)
                            .map(function (path) {
                            return mdl.title(path, true);
                        });
                        return JSON.stringify(titles);
                    },
                    expectedResult: { $call: 'expectedResult' }
                },
            });
            jb_core_1.jb.component('jb-path-test', {
                type: 'test',
                params: [
                    { id: 'controlWithMark', type: 'control', dynamic: true },
                    { id: 'staticPath', as: 'string' },
                    { id: 'expectedDynamicCounter', as: 'number' },
                    { id: 'probeCheck', type: 'boolean', dynamic: true, as: 'boolean' }
                ],
                impl: function (ctx, control, staticPath, expectedDynamicCounter, probeCheck) {
                    // var probProf = findProbeProfile(control.profile);
                    // if (!probProf)
                    //   return failure('no prob prof');
                    // ********** dynamic counter
                    var testId = ctx.vars.testID;
                    var full_path = testId + '~' + staticPath;
                    var probeRes = new studio_probe_1.Probe(jb_core_1.jb.ctx(ctx, { profile: control.profile, comp: testId, path: '' }), true)
                        .runCircuit(full_path);
                    return probeRes.then(function (res) {
                        try {
                            var match = Array.from(res.element.querySelectorAll('[jb-ctx]'))
                                .filter(function (e) {
                                var ctx2 = jbart.ctxDictionary[e.getAttribute('jb-ctx')];
                                return ctx2.path == full_path || (ctx2.componentContext && ctx2.componentContext.callerPath == full_path);
                            });
                            if (match.length != expectedDynamicCounter)
                                return failure('dynamic counter', 'jb-path error: ' + staticPath + ' found ' + (match || []).length + ' times. expecting ' + expectedDynamicCounter + ' occurrences');
                            if (!res.finalResult[0] || !probeCheck(res.finalResult[0].in))
                                return failure('probe');
                        }
                        catch (e) {
                            return failure('exception');
                        }
                        return success();
                    });
                    function failure(part, reason) { return { id: testId, title: testId + '- ' + part, success: false, reason: reason }; }
                    ;
                    function success() { return { id: testId, title: testId, success: true }; }
                    ;
                }
            });
        }
    }
});
// function findProbeProfile(parent) {
//   if (parent.$mark)
//     return parent;
//   if (typeof parent == 'object')
//     return jb.entries(parent)
//     .map(e=>({
//       prop: e[0],
//       res: findProbeProfile(e[1])
//     }))
//     .map(e=>
//       (e.res == 'markInString') ? ({$parent: parent, $prop: e.prop}) : e.res)
//     .filter(x=>x)[0];
//   if (typeof parent == 'string' && parent.indexOf('$mark:') == 0)
//     return 'markInString';
// }

System.register(['jb-core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            }],
        execute: function() {
            if (window.jbartTest) {
                // jb.resource('ui-tests','UrlPathEm',{ $: 'rx.urlPath', base: 'ui-tests', zoneId: 'single-test', 
                // 	params: [ 'test','project', 'page', 'profile_path' ] , databind: '{%$globals%}' } );
                jb_core_1.jb.resource('ui-tests', 'WidgetLoaded', { $: 'rx.subject' });
            }
            jb_tests('studio-tests', {
                'studio-label': { $: 'studio-test',
                    control: { $: 'label', title: 'Hello World2' },
                    expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
                },
                'studio-codemirror': { $: 'studio-test',
                    page: 'main',
                    control: { $: 'editable-text',
                        databind: { $: 'studio.profile-as-text' },
                        style: { $: 'editable-text.codemirror' }
                    },
                    expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
                },
                'studio-control-tree': { $: 'studio-test',
                    page: 'group1',
                    profile_path: 'hello-world.group1',
                    control: { $: 'studio.control-tree' },
                    expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
                },
                'studio-properties': { $: 'studio-test',
                    page: 'group1',
                    profile_path: 'hello-world.group1',
                    control: { $: 'studio.properties', path: '%$globals/profile_path%' },
                    expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
                },
                'studio-property-Primitive': { $: 'studio-test',
                    page: 'main',
                    profile_path: 'hello-world.main',
                    control: { $: 'studio.property-Primitive', path: 'hello-world.main~title' },
                    expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
                },
                'studio-property-TgpType': { $: 'studio-test',
                    page: 'group1',
                    profile_path: 'hello-world.group1',
                    control: { $: 'studio.property-TgpType', path: 'hello-world.group1~style' },
                    expectedHtmlResult: { $: 'contains', text: 'Hello World2' }
                },
            });
        }
    }
});

System.register(['jb-core', './studio-path', './studio-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, studio_path_1, studio_utils_1;
    var TgpModel, model;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (studio_path_1_1) {
                studio_path_1 = studio_path_1_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            }],
        execute: function() {
            // The jbart control model return string paths and methods to fix them on change
            TgpModel = (function () {
                function TgpModel(rootPath, childrenType) {
                    this.rootPath = rootPath;
                    this.childrenType = childrenType;
                }
                TgpModel.prototype.val = function (path) {
                    return studio_path_1.profileFromPath(path);
                };
                TgpModel.prototype.subNodes = function (path, childrenType) {
                    if (childrenType == 'jb-editor')
                        return this.jbEditorSubNodes(path);
                    var val = studio_path_1.profileFromPath(path);
                    if (childrenType == 'controls') {
                        return [].concat.apply([], this.controlParams(path).map(function (prop) {
                            return childPath(prop);
                        }))
                            .concat(this.innerControlPaths(path));
                    }
                    else if (childrenType == 'non-controls') {
                        return this.nonControlParams(path).map(function (prop) { return path + '~' + prop; });
                    }
                    else if (childrenType == 'array') {
                        if (!val)
                            return [];
                        else if (!Array.isArray(val))
                            return [path];
                        else
                            return val.map(function (inner, i) { return path + '~' + i; });
                    }
                    function childPath(prop) {
                        if (Array.isArray(val[prop]))
                            return val[prop].map(function (inner, i) { return path + '~' + prop + '~' + i; });
                        else
                            return [path + '~' + prop];
                    }
                };
                TgpModel.prototype.innerControlPaths = function (path) {
                    var _this = this;
                    var out = ['action~content'] // add more inner paths here
                        .map(function (x) { return path + '~' + x; })
                        .filter(function (p) {
                        return _this.paramType(p) == 'control';
                    });
                    return out;
                };
                TgpModel.prototype.jbEditorSubNodes = function (path) {
                    var val = studio_path_1.profileFromPath(path);
                    if (!val || typeof val != 'object')
                        return [];
                    var compName = jb_core_1.jb.compName(val);
                    var comp = studio_utils_1.getComp(compName);
                    if (Array.isArray(val))
                        return Object.getOwnPropertyNames(val)
                            .map(function (x) { return x == 'length' ? val.length : x; })
                            .map(function (k) { return path + '~' + k; });
                    else if (val['$' + compName]) {
                        var arr = val['$' + compName];
                        var res_path = path + '~$' + compName;
                        if (Array.isArray(arr))
                            return Object.getOwnPropertyNames(arr)
                                .map(function (x) { return x == 'length' ? arr.length : x; })
                                .map(function (k) { return res_path + '~' + k; });
                        return [res_path];
                    }
                    else if (comp) {
                        var composite = (comp.params || [])
                            .filter(function (p) {
                            return p.composite;
                        })
                            .map(function (p) { return flattenArray(p.id); });
                        return (composite[0] || []).concat((comp.params || [])
                            .filter(function (p) { return !p.composite; })
                            .map(function (p) { return ({ path: path + '~' + p.id, param: p }); })
                            .filter(function (e) { return studio_path_1.profileFromPath(e.path) != null || e.param.essential; })
                            .map(function (e) { return e.path; }));
                    }
                    function flattenArray(prop) {
                        var innerVal = val[prop];
                        if (Array.isArray(innerVal))
                            return Object.getOwnPropertyNames(innerVal)
                                .map(function (x) { return x == 'length' ? innerVal.length : x; })
                                .map(function (k) { return path + '~' + prop + '~' + k; });
                        else
                            return [path + '~' + prop];
                    }
                };
                TgpModel.prototype.jbEditorMoreParams = function (path) {
                    var val = studio_path_1.profileFromPath(path);
                    var comp = studio_utils_1.getComp(jb_core_1.jb.compName(val || {}));
                    if (comp) {
                        var existing = this.jbEditorSubNodes(path);
                        return (comp.params || [])
                            .map(function (p) { return path + '~' + p.id; })
                            .filter(function (p) { return existing.indexOf(p) == -1; });
                    }
                    return [];
                };
                TgpModel.prototype.jbEditorTitle = function (path, collapsed) {
                    var val = studio_path_1.profileFromPath(path);
                    var compName = jb_core_1.jb.compName(val || {});
                    var prop = path.split('~').pop();
                    if (!isNaN(Number(prop)))
                        prop = path.split('~').slice(-2).join('[') + ']';
                    if (Array.isArray(val) && this.paramType(path) == 'data')
                        compName = "pipeline (" + val.length + ")";
                    if (Array.isArray(val) && this.paramType(path) == 'action')
                        compName = "actions (" + val.length + ")";
                    if (compName)
                        return prop + ("= <span class=\"treenode-val\">" + compName + "</span>");
                    else if (typeof val == 'string')
                        return prop + (collapsed ? ": <span class=\"treenode-val\" title=\"" + val + "\">" + val + "</span>" : '');
                    return prop + (Array.isArray(val) ? " (" + val.length + ")" : '');
                };
                TgpModel.prototype.title = function (path, collapsed) {
                    collapsed = collapsed || !this.isArray(path);
                    var val = studio_path_1.profileFromPath(path);
                    if (path.indexOf('~') == -1)
                        return path;
                    if (this.childrenType == 'jb-editor')
                        return this.jbEditorTitle(path, collapsed);
                    return (val && val.title) || (val && jb_core_1.jb.compName(val)) || path.split('~').pop();
                };
                TgpModel.prototype.icon = function (path) {
                    if (studio_path_1.parentPath(path)) {
                        var parentVal = studio_path_1.profileFromPath(studio_path_1.parentPath(path));
                        if (Array.isArray(parentVal) && path.split('~').pop() == parentVal.length)
                            return 'add';
                    }
                    if (this.paramType(path) == 'control') {
                        if (studio_path_1.profileFromPath(path + '~style', true) && this.compName(path + '~style') == 'layout.horizontal')
                            return 'view_column';
                        return 'folder_open'; //'view_headline' , 'folder_open'
                    }
                    var comp2icon = {
                        label: 'font_download',
                        button: 'crop_landscape',
                        tab: 'tab',
                        image: 'insert_photo',
                        'custom-control': 'build',
                        'editable-text': 'data_usage',
                        'editable-boolean': 'radio_button',
                        'editable-number': 'donut_large',
                    };
                    var compName = this.compName(path);
                    if (comp2icon[compName])
                        return comp2icon[compName];
                    if (this.isOfType(path, 'action'))
                        return 'play_arrow';
                    return 'radio_button_unchecked';
                };
                TgpModel.prototype.compName = function (path) {
                    var val = studio_path_1.profileFromPath(path);
                    return val && jb_core_1.jb.compName(val);
                };
                TgpModel.prototype.isOfType = function (path, type) {
                    var paramDef = this.paramDef(path);
                    if (paramDef)
                        return (paramDef.type || 'data').split(',').indexOf(type) != -1;
                    return this.isCompNameOfType(this.compName(path), type);
                };
                TgpModel.prototype.isCompNameOfType = function (name, type) {
                    var _jbart = studio_utils_1.jbart_base().comps[name] ? studio_utils_1.jbart_base() : jbart;
                    if (name && _jbart.comps[name]) {
                        while (!_jbart.comps[name].type && jb_core_1.jb.compName(jbart.comps[name].impl))
                            name = jb_core_1.jb.compName(_jbart.comps[name].impl);
                        return (_jbart.comps[name].type || '').indexOf(type) == 0;
                    }
                };
                TgpModel.prototype.shortTitle = function (path) {
                    return this.title(path, false);
                };
                // differnt from children() == 0, beacuse in the control tree you can drop into empty group
                TgpModel.prototype.isArray = function (path) {
                    if (this.childrenType == 'jb-editor')
                        return (this.children(path) || []).length > 0;
                    return this.controlParam(path) || this.innerControlPaths(path).length > 0;
                };
                TgpModel.prototype.modify = function (op, path, args, ctx, delayed) {
                    var comp = path.split('~')[0];
                    var before = studio_utils_1.getComp(comp) && studio_utils_1.compAsStr(comp);
                    var res = op.call(this, path, args);
                    if (res && res.newPath)
                        path = res.newPath;
                    jb_core_1.jb.delay(delayed ? 1 : 0).then(function () {
                        studio_utils_1.modifyOperationsEm.next({
                            comp: comp,
                            before: before,
                            after: studio_utils_1.compAsStr(comp),
                            path: path,
                            args: args,
                            ctx: ctx,
                            //				jbart: findjBartToLook(path),
                            newComp: before ? false : true
                        });
                    });
                };
                TgpModel.prototype._delete = function (path, args) {
                    var prop = path.split('~').pop();
                    var parent = studio_path_1.profileFromPath(studio_path_1.parentPath(path));
                    if (Array.isArray(parent)) {
                        var index = Number(prop);
                        parent.splice(index, 1);
                        if (!args || !args.noFixer)
                            studio_path_1.pathFixer.fixIndexPaths(path, -1);
                    }
                    else {
                        // if (parent[prop] === undefined) { // array type with one element
                        // 	var pathToDelete = parentPath(path);
                        // 	var parent = profileFromPath(parentPath(pathToDelete));
                        // 	var prop = pathToDelete.split('~').pop();
                        // }
                        delete parent[prop];
                    }
                };
                // modify operations - must have same interface: path,args
                TgpModel.prototype.move = function (path, args) {
                    var dragged = studio_path_1.profileFromPath(args.dragged);
                    var arr = this.getOrCreateArray(path);
                    if (arr) {
                        var ctrlParam = this.controlParam(path);
                        this._delete(args.dragged, { noFixer: true });
                        var index = (args.index == -1) ? arr.length : args.index;
                        arr.splice(index, 0, dragged);
                        studio_path_1.pathFixer.fixMovePaths(args.dragged, path + '~' + ctrlParam + '~' + index);
                    }
                };
                TgpModel.prototype.moveInArray = function (path, args) {
                    var arr = studio_path_1.profileFromPath(studio_path_1.parentPath(path));
                    if (Array.isArray(arr)) {
                        var index = Number(path.split('~').pop());
                        var base = args.moveUp ? index - 1 : index;
                        if (base < 0 || base >= arr.length - 1)
                            return; // the + elem
                        arr.splice(base, 2, arr[base + 1], arr[base]);
                        studio_path_1.pathFixer.fixReplacingPaths(studio_path_1.parentPath(path) + '~' + base, studio_path_1.parentPath(path) + '~' + (base + 1));
                    }
                };
                TgpModel.prototype.writeValue = function (path, args) {
                    jb_core_1.jb.writeValue(studio_path_1.profileRefFromPath(path), args.value);
                };
                TgpModel.prototype.newComp = function (path, args) {
                    jbart.previewjbart.comps[path] = jbart.previewjbart.comps[path] || args.profile;
                };
                TgpModel.prototype.wrapWithGroup = function (path) {
                    var result = { $: 'group', controls: [studio_path_1.profileFromPath(path)] };
                    jb_core_1.jb.writeValue(studio_path_1.profileRefFromPath(path), result);
                };
                TgpModel.prototype.wrap = function (path, args) {
                    var compDef = studio_utils_1.getComp(args.compName);
                    var firstParam = ((compDef || {}).params || [])[0];
                    if (firstParam) {
                        var result = jb_core_1.jb.extend({ $: args.compName }, jb_core_1.jb.obj(firstParam.id, [studio_path_1.profileFromPath(path)]));
                        jb_core_1.jb.writeValue(studio_path_1.profileRefFromPath(path), result);
                    }
                };
                TgpModel.prototype.getStyleComp = function (path) {
                    var style = this.val(path);
                    var compName = jb_core_1.jb.compName(style);
                    if (compName == 'customStyle')
                        return { type: 'inner', path: path, style: style };
                    var comp = compName && studio_utils_1.getComp(compName);
                    if (jb_core_1.jb.compName(comp.impl) == 'customStyle')
                        return { type: 'global', path: compName, style: comp.impl, innerPath: path };
                };
                TgpModel.prototype.addProperty = function (path) {
                    var parent = studio_path_1.profileFromPath(studio_path_1.parentPath(path));
                    if (this.paramType(path) == 'data')
                        return jb_core_1.jb.writeValue(studio_path_1.profileRefFromPath(path), '');
                    var param = this.paramDef(path);
                    jb_core_1.jb.writeValue(studio_path_1.profileRefFromPath(path), param.defaultValue || { $: '' });
                };
                TgpModel.prototype.duplicate = function (path) {
                    var prop = path.split('~').pop();
                    var val = studio_path_1.profileFromPath(path);
                    var arr = this.getOrCreateArray(studio_path_1.parentPath(studio_path_1.parentPath(path)));
                    if (Array.isArray(arr)) {
                        var clone = studio_utils_1.evalProfile(jb_core_1.jb.prettyPrint(val));
                        var index = Number(prop);
                        arr.splice(index, 0, clone);
                        if (index < arr.length - 2)
                            studio_path_1.pathFixer.fixIndexPaths(path, 1);
                    }
                };
                TgpModel.prototype.setComp = function (path, args) {
                    var compName = args.comp;
                    var comp = compName && studio_utils_1.getComp(compName);
                    if (!compName || !comp)
                        return;
                    var result = { $: compName };
                    var existing = studio_path_1.profileFromPath(path);
                    (comp.params || []).forEach(function (p) {
                        if (p.composite)
                            result[p.id] = [];
                        if (existing && existing[p.id])
                            result[p.id] = existing[p.id];
                        if (p.defaultValue && typeof p.defaultValue != 'object')
                            result[p.id] = p.defaultValue;
                        if (p.defaultValue && typeof p.defaultValue == 'object' && (p.forceDefaultCreation || Array.isArray(p.defaultValue)))
                            result[p.id] = JSON.parse(JSON.stringify(p.defaultValue));
                    });
                    jb_core_1.jb.writeValue(studio_path_1.profileRefFromPath(path), result);
                };
                TgpModel.prototype.insertComp = function (path, args) {
                    var compName = args.comp;
                    var comp = compName && studio_utils_1.getComp(compName);
                    if (!compName || !comp)
                        return;
                    var result = { $: compName };
                    // copy default values
                    (comp.params || []).forEach(function (p) {
                        if (p.defaultValue)
                            result[p.id] = JSON.parse(JSON.stringify(p.defaultValue));
                    });
                    // find group parent that can insert the control
                    var group_path = path;
                    while (!this.controlParam(group_path) && group_path)
                        group_path = studio_path_1.parentPath(group_path);
                    var arr = this.getOrCreateArray(group_path);
                    if (arr) {
                        arr.push(result);
                        args.modifiedPath = [group_path, this.controlParam(group_path), arr.length - 1].join('~');
                    }
                };
                TgpModel.prototype.makeLocal = function (path) {
                    var compName = this.compName(path);
                    var comp = compName && studio_utils_1.getComp(compName);
                    if (!compName || !comp || typeof comp.impl != 'object')
                        return;
                    var res = JSON.stringify(comp.impl, function (key, val) { return typeof val === 'function' ? '' + val : val; }, 4);
                    var profile = studio_path_1.profileFromPath(path);
                    // inject conditional param values
                    (comp.params || [])
                        .forEach(function (p) {
                        var pUsage = '%$' + p.id + '%';
                        var pVal = '' + (profile[p.id] || p.defaultValue || '');
                        res = res.replace(new RegExp('{\\?(.*?)\\?}', 'g'), function (match, condition_exp) {
                            if (condition_exp.indexOf(pUsage) != -1)
                                return pVal ? condition_exp : '';
                            return match;
                        });
                    })(comp.params || [])
                        .forEach(function (p) {
                        var pVal = '' + (profile[p.id] || p.defaultValue || ''); // only primitives
                        res = res.replace(new RegExp("%\\$" + p.id + "%", 'g'), pVal);
                    });
                    jb_core_1.jb.writeValue(studio_path_1.profileRefFromPath(path), studio_utils_1.evalProfile(res));
                };
                TgpModel.prototype.children = function (path, childrenType) {
                    childrenType = childrenType || this.childrenType || 'controls';
                    this.cache = this.cache || {};
                    var res = this.subNodes(path, childrenType);
                    if (!jb_core_1.jb.compareArrays(res, this.cache[path]))
                        this.cache[path] = res;
                    return this.cache[path];
                };
                TgpModel.prototype.paramDef = function (path) {
                    if (!studio_path_1.parentPath(path))
                        return;
                    if (!isNaN(Number(path.split('~').pop())))
                        path = studio_path_1.parentPath(path);
                    var parent_prof = studio_path_1.profileFromPath(studio_path_1.parentPath(path), true);
                    var compDef = parent_prof && studio_utils_1.getComp(jb_core_1.jb.compName(parent_prof));
                    var params = (compDef || {}).params || [];
                    var paramName = path.split('~').pop();
                    return params.filter(function (p) { return p.id == paramName; })[0] || {};
                };
                TgpModel.prototype.paramType = function (path) {
                    return (this.paramDef(path) || {}).type || 'data';
                };
                TgpModel.prototype.PTsOfPath = function (path) {
                    return this.PTsOfType(this.paramType(path), studio_utils_1.findjBartToLook(path));
                };
                TgpModel.prototype.PTsOfType = function (type, jbartToLook) {
                    var single = /([^\[]*)([])?/;
                    var types = [].concat.apply([], (type || '').split(',')
                        .map(function (x) {
                        return x.match(single)[1];
                    })
                        .map(function (x) {
                        return x == 'data' ? ['data', 'aggregator'] : [x];
                    }));
                    var comp_arr = types.map(function (t) {
                        return jb_entries((jbartToLook || studio_utils_1.jbart_base()).comps)
                            .filter(function (c) {
                            return (c[1].type || 'data').split(',').indexOf(t) != -1
                                || (c[1].typePattern && t.match(c[1].typePattern.match));
                        })
                            .map(function (c) { return c[0]; });
                    });
                    return comp_arr.reduce(function (all, ar) { return all.concat(ar); }, []);
                };
                TgpModel.prototype.controlParam = function (path) {
                    return this.controlParams(path)[0];
                };
                TgpModel.prototype.controlParams = function (path) {
                    var prof = studio_path_1.profileFromPath(path, true);
                    if (!prof)
                        return [];
                    var params = (studio_utils_1.getComp(jb_core_1.jb.compName(prof)) || {}).params || [];
                    return params.filter(function (p) { return (p.type || '').indexOf('control') != -1; }).map(function (p) { return p.id; });
                };
                TgpModel.prototype.nonControlParams = function (path) {
                    var prof = studio_path_1.profileFromPath(path);
                    if (!prof)
                        return [];
                    var params = (studio_utils_1.getComp(jb_core_1.jb.compName(prof)) || {}).params || [];
                    return params.filter(function (p) {
                        return (p.type || '').indexOf('control') == -1;
                    })
                        .map(function (p) { return p.id; });
                };
                TgpModel.prototype.getOrCreateArray = function (path) {
                    var val = studio_path_1.profileFromPath(path);
                    var prop = this.controlParam(path);
                    if (!prop)
                        return console.log('pushing to non array');
                    if (val[prop] === undefined)
                        val[prop] = [];
                    if (!Array.isArray(val[prop]))
                        val[prop] = [val[prop]];
                    return val[prop];
                };
                TgpModel.prototype.addArrayItem = function (path, args) {
                    var val = studio_path_1.profileFromPath(path);
                    var toAdd = args.toAdd || { $: '' };
                    if (Array.isArray(val)) {
                        val.push(toAdd);
                        return { newPath: path + '~' + (val.length - 1) };
                    }
                    else if (!val) {
                        jb_core_1.jb.writeValue(studio_path_1.profileRefFromPath(path), toAdd);
                    }
                    else {
                        jb_core_1.jb.writeValue(studio_path_1.profileRefFromPath(path), [val].concat(toAdd));
                        return { newPath: path + '~1' };
                    }
                };
                TgpModel.prototype.propName = function (path) {
                    if (!isNaN(Number(path.split('~').pop())))
                        return studio_path_1.parentPath(path).split('~').pop().replace(/s$/, '');
                    var paramDef = this.paramDef(path);
                    var val = studio_path_1.profileFromPath(path);
                    if ((paramDef.type || '').indexOf('[]') != -1) {
                        var length = this.subNodes(path, 'array').length;
                        if (length)
                            return path.split('~').pop() + ' (' + length + ')';
                    }
                    return path.split('~').pop();
                };
                return TgpModel;
            }());
            exports_1("TgpModel", TgpModel);
            exports_1("model", model = new TgpModel(''));
        }
    }
});

System.register(['jb-core'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.pickAndOpen', {
                type: 'action',
                params: [
                    { id: 'from', options: 'studio,preview', as: 'string', defaultValue: 'preview' }
                ],
                impl: { $: 'studio.pick',
                    from: '%$from%',
                    onSelect: [
                        { $: 'writeValue', to: '%$globals/profile_path%', value: '%path%' },
                        { $: 'writeValue', to: '%$globals/last_pick_selection%', value: '%%' },
                        { $: 'studio.open-control-tree' },
                        { $: 'studio.open-properties' },
                    ],
                }
            });
            jb_core_1.jb.component('studio.toolbar', {
                type: 'control',
                impl: { $: 'group',
                    style: { $: 'studio-toolbar' },
                    controls: [
                        { $: 'label',
                            title: '',
                            features: { $: 'css', css: '{ width: 170px }' }
                        },
                        { $: 'button',
                            title: 'Select',
                            action: { $: 'studio.pickAndOpen' },
                            style: { $: 'button.md-icon',
                                css: '{transform: scaleX(-1)}',
                                icon: 'call_made'
                            }
                        },
                        { $: 'button',
                            title: 'Save',
                            action: { $: 'studio.saveComponents' },
                            style: { $: 'button.md-icon', icon: 'save' }
                        },
                        { $: 'button',
                            title: 'Refresh Preview',
                            action: { $: 'studio.refreshPreview' },
                            style: { $: 'button.md-icon', icon: 'refresh' }
                        },
                        { $: 'button',
                            title: 'Javascript',
                            action: { $: 'studio.editSource' },
                            style: { $: 'button.md-icon', icon: 'code' }
                        },
                        { $: 'button',
                            title: 'Outline',
                            action: { $: 'studio.open-control-tree' },
                            style: { $: 'button.md-icon', icon: 'format_align_left' }
                        },
                        { $: 'button',
                            title: 'Properties',
                            action: { $: 'studio.open-properties' },
                            style: { $: 'button.md-icon', icon: 'storage' }
                        },
                        { $: 'button',
                            title: 'jbEditor',
                            action: { $: 'studio.open-jb-editor', path: '%$globals/profile_path%' },
                            style: { $: 'button.md-icon', icon: 'build' }
                        },
                        { $: 'button',
                            title: 'show data',
                            action: { $: 'studio.showProbeData' },
                            style: { $: 'button.md-icon', icon: 'input' }
                        },
                        { $: 'button',
                            title: 'insert control',
                            action: { $: 'studio.open-new-control-dialog' },
                            style: { $: 'button.md-icon', icon: 'add' },
                        },
                        { $: 'button',
                            title: 'responsive-phone',
                            action: { $: 'studio.open-responsive-phone-popup' },
                            style: { $: 'button.md-icon', icon: 'tablet_android' }
                        }
                    ],
                    features: [
                        { $: 'feature.keyboard-shortcut',
                            key: 'Alt+C',
                            action: { $: 'studio.pickAndOpen' }
                        },
                        { $: 'feature.keyboard-shortcut',
                            key: 'Alt+R',
                            action: { $: 'studio.redraw' }
                        },
                        { $: 'feature.keyboard-shortcut',
                            key: 'Alt+N',
                            action: { $: 'studio.pickAndOpen', from: 'studio' }
                        }
                    ]
                }
            });
            jb_core_1.jb.component('studio_button.toolbarButton', {
                type: 'button.style',
                params: [
                    { id: 'spritePosition', as: 'string', defaultValue: '0,0' }
                ],
                impl: function (context, spritePosition) {
                    return {
                        jbTemplate: '<button (click)="clicked()"><span style="background-position: {{pos}}" title="{{title}}"></span></button>',
                        cssClass: "studio-btn-toolbar",
                        init: function (cmp) {
                            cmp.pos = spritePosition.split(',').map(function (item) { return (-parseInt(item) * 16) + 'px'; }).join(' ');
                        }
                    };
                }
            });
            //            position: absolute; top: 60px; height: 33px; left: 0px;right:0; 
            jb_core_1.jb.component('studio-toolbar', {
                type: 'group.style',
                impl: { $: 'customStyle',
                    features: { $: 'group.initGroup' },
                    template: '<section class="jb-group"><jb_comp *ngFor="let ctrl of ctrls" [comp]="ctrl.comp" [flatten]="true"></jb_comp></section>',
                    css: "{ \n            display: flex;\n            height: 33px; \n            width: 100%;\n        }\n        * { margin-right: 0 }"
                }
            });
        }
    }
});

System.register(['jb-core', './studio-tgp-model', './studio-utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, studio_tgp_model_1, studio_utils_1;
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            }],
        execute: function() {
            jb_core_1.jb.component('studio.open-control-tree', {
                type: 'action',
                impl: { $: 'openDialog',
                    title: 'Outline',
                    style: { $: 'dialog.studio-floating', id: 'studio-outline', width: 300 },
                    content: { $: 'studio.control-tree' },
                    menu: { $: 'button',
                        style: { $: 'button.md-icon', icon: 'menu' },
                        action: { $: 'studio.open-tree-menu', path: '%$globals/profile_path%' }
                    }
                }
            });
            jb_core_1.jb.component('studio.open-tree-menu', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' }
                ],
                impl: { $: 'openDialog',
                    style: { $: 'pulldownPopup.contextMenuPopup' },
                    content: { $: 'group',
                        controls: [
                            { $: 'pulldown.menu-item',
                                title: 'Insert',
                                action: { $: 'studio.open-new-control-dialog' }
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Wrap with group',
                                action: { $: 'studio.wrap-with-group', path: '%$path%' }
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Duplicate',
                                action: { $: 'studio.duplicate', path: '%$path%' }
                            },
                            { $: 'pulldown.menu-item-separator' },
                            { $: 'pulldown.menu-item',
                                title: 'inteliscript editor',
                                action: { $: 'studio.open-jb-editor', path: '%$path%' }
                            },
                            { $: 'pulldown.menu-item',
                                title: 'context viewer',
                                action: { $: 'studio.open-context-viewer', path: '%$path%' }
                            },
                            { $: 'pulldown.menu-item',
                                title: 'javascript editor',
                                action: { $: 'studio.editSource', path: '%$path%' }
                            },
                            { $: 'pulldown.menu-item',
                                $vars: {
                                    compName: { $: 'studio.comp-name', path: '%$path%' }
                                },
                                title: 'Goto %$compName%',
                                features: { $: 'hidden', showCondition: '%$compName%' },
                                action: { $: 'studio.goto-path', path: '%$compName%' }
                            },
                            { $: 'studio.goto-sublime', path: '%$path%' },
                            { $: 'pulldown.menu-item-separator' },
                            { $: 'pulldown.menu-item',
                                title: 'Delete',
                                icon: 'delete',
                                shortcut: 'Delete',
                                action: [
                                    { $: 'writeValue', to: '%$TgpTypeCtrl.expanded%', value: false },
                                    { $: 'studio.delete', path: '%$path%' }
                                ]
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Copy',
                                icon: 'copy',
                                shortcut: 'Ctrl+C',
                                action: { $: 'studio.copy', path: '%$path%' }
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Paste',
                                icon: 'paste',
                                shortcut: 'Ctrl+V',
                                action: { $: 'studio.paste', path: '%$path%' }
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Undo',
                                icon: 'undo',
                                shortcut: 'Ctrl+Z',
                                action: { $: 'studio.undo' }
                            },
                            { $: 'pulldown.menu-item',
                                title: 'Redo',
                                icon: 'redo',
                                shortcut: 'Ctrl+Y',
                                action: { $: 'studio.redo' }
                            }
                        ]
                    }
                }
            });
            jb_core_1.jb.component('studio.control-tree', {
                type: 'control',
                impl: {
                    $: 'tree', cssClass: 'jb-control-tree studio-control-tree',
                    nodeModel: { $: 'studio.control-tree.nodes' },
                    features: [
                        { $: 'tree.selection',
                            autoSelectFirst: true,
                            databind: '%$globals/profile_path%',
                            onSelection: { $: 'studio.highlight-in-preview',
                                path: { $: 'studio.currentProfilePath' }
                            },
                            onDoubleClick: [
                                { $: 'studio.open-properties' },
                                { $: 'studio.highlight-in-preview', path: { $: 'studio.currentProfilePath' } },
                            ],
                        },
                        { $: 'tree.keyboard-selection', onEnter: { $: 'studio.open-properties' } },
                        { $: 'tree.drag-and-drop' },
                        { $: 'tree.keyboard-shortcut', key: 'Ctrl+C', action: { $: 'studio.copy', path: '%%' } },
                        { $: 'tree.keyboard-shortcut', key: 'Ctrl+V', action: { $: 'studio.paste', path: '%%' } },
                        { $: 'tree.keyboard-shortcut', key: 'Ctrl+Z', action: { $: 'studio.undo', path: '%%' } },
                        { $: 'tree.keyboard-shortcut', key: 'Ctrl+Y', action: { $: 'studio.redo', path: '%%' } },
                        { $: 'tree.keyboard-shortcut', key: 'Delete', action: { $: 'studio.delete', path: '%%' } },
                        { $: 'studio.control-tree.refreshPathChanges' },
                    ]
                }
            });
            jb_core_1.jb.component('studio.control-tree.nodes', {
                type: 'tree.nodeModel',
                impl: function (context) {
                    var currentPath = context.run({ $: 'studio.currentProfilePath' });
                    var compPath = currentPath.split('~')[0] || '';
                    return new studio_tgp_model_1.TgpModel(compPath);
                }
            });
            // after model modifications the paths of the selected and expanded nodes may change and the tree should fix it.
            jb_core_1.jb.component('studio.control-tree.refreshPathChanges', {
                type: 'feature',
                impl: function (context) {
                    var tree = context.vars.$tree;
                    if (jbart._refreshPathTreeObserver)
                        jbart._refreshPathTreeObserver.unsubscribe();
                    jbart._refreshPathTreeObserver = studio_utils_1.pathChangesEm.subscribe(function (fixer) {
                        var new_expanded = {};
                        Object.getOwnPropertyNames(tree.expanded).filter(function (path) { return tree.expanded[path]; })
                            .forEach(function (path) { return new_expanded[fixer.fix(path)] = true; });
                        tree.expanded = new_expanded;
                        tree.selected = fixer.fix(tree.selected);
                    });
                }
            });
        }
    }
});

System.register(['jb-core', 'jb-ui', './studio-utils', './studio-path'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, jb_ui, studio_utils_1, studio_path_1;
    var Undo, undo;
    function doSetComp(jbart_base, id, comp) {
        jbart_base.comps[id] = comp;
        studio_path_1.pathFixer.fixSetCompPath(id);
    }
    function setComp(code, jbart_base) {
        var fixed = code.replace(/^jb.component\(/, 'doSetComp(jbart_base,');
        try {
            return eval("(" + fixed + ")");
        }
        catch (e) {
            jb_core_1.jb.logException(e, 'set comp:' + code);
        }
    }
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (jb_ui_1) {
                jb_ui = jb_ui_1;
            },
            function (studio_utils_1_1) {
                studio_utils_1 = studio_utils_1_1;
            },
            function (studio_path_1_1) {
                studio_path_1 = studio_path_1_1;
            }],
        execute: function() {
            Undo = (function () {
                function Undo() {
                    var _this = this;
                    this.history = [];
                    this.index = 0;
                    this.clipboard = null;
                    studio_utils_1.modifyOperationsEm.subscribe(function (change) {
                        _this.history.push(change);
                        _this.index = _this.history.length;
                    });
                }
                Undo.prototype.undo = function (ctx) {
                    if (this.index > 0) {
                        this.index--;
                        var change = this.history[this.index];
                        setComp(change.before, change.ctx.win().jbart);
                        jb_ui.apply(ctx);
                    }
                };
                Undo.prototype.redo = function (ctx) {
                    if (this.index < this.history.length) {
                        var change = this.history[this.index];
                        setComp(change.after, change.ctx.win().jbart);
                        this.index++;
                        jb_ui.apply(ctx);
                    }
                };
                Undo.prototype.copy = function (ctx, path) {
                    this.clipboard = ctx.run({ $: 'studio.profile-as-text', path: path }, { as: 'string' });
                };
                Undo.prototype.paste = function (ctx, path) {
                    if (this.clipboard != null) {
                        var ref = ctx.run({ $: 'studio.profile-as-text', path: path });
                        jb_core_1.jb.writeValue(ref, this.clipboard);
                    }
                };
                return Undo;
            }());
            undo = new Undo();
            jb_core_1.jb.component('studio.undo', {
                impl: function (ctx) { return undo.undo(ctx); }
            });
            jb_core_1.jb.component('studio.redo', {
                impl: function (ctx) { return undo.redo(ctx); }
            });
            jb_core_1.jb.component('studio.copy', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (ctx, path) {
                    return undo.copy(ctx, path);
                }
            });
            jb_core_1.jb.component('studio.paste', {
                params: [{ id: 'path', as: 'string' }],
                impl: function (ctx, path) {
                    return undo.paste(ctx, path);
                }
            });
        }
    }
});

System.register(['jb-core', 'jb-ui/jb-rx', './studio-tgp-model', './studio-path'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var jb_core_1, jb_rx, studio_tgp_model_1, studio_path_1;
    var modifyOperationsEm, studioActivityEm, pathChangesEm;
    function notifyModification(path, before, ctx, ngPath) {
        var comp = path.split('~')[0];
        modifyOperationsEm.next({ comp: comp, before: before, after: compAsStr(comp), path: path, ctx: ctx, jbart: findjBartToLook(path), ngPath: ngPath });
    }
    exports_1("notifyModification", notifyModification);
    function message(message, error) {
        $('.studio-message').text(message); // add animation
        $('.studio-message').css('background', error ? 'red' : '#327DC8');
        $('.studio-message').css('animation', '');
        jb_core_1.jb.delay(1).then(function () {
            return $('.studio-message').css('animation', 'slide_from_top 5s ease');
        });
    }
    exports_1("message", message);
    function jbart_base() {
        return jbart.previewjbart || jbart;
    }
    exports_1("jbart_base", jbart_base);
    function findjBartToLook(path) {
        var id = path.split('~')[0];
        if (jbart_base().comps[id])
            return jbart_base();
        if (jbart.comps[id])
            return jbart;
    }
    exports_1("findjBartToLook", findjBartToLook);
    function getComp(id) {
        return jbart_base().comps[id] || jbart.comps[id];
    }
    exports_1("getComp", getComp);
    function compAsStr(id) {
        return jb_prettyPrintComp(id, getComp(id));
    }
    exports_1("compAsStr", compAsStr);
    function compAsStrFromPath(path) {
        return compAsStr(path.split('~')[0]);
    }
    exports_1("compAsStrFromPath", compAsStrFromPath);
    function evalProfile(prof_str) {
        try {
            return eval('(' + prof_str + ')');
        }
        catch (e) {
            jb_core_1.jb.logException(e, 'eval profile:' + prof_str);
        }
    }
    exports_1("evalProfile", evalProfile);
    return {
        setters:[
            function (jb_core_1_1) {
                jb_core_1 = jb_core_1_1;
            },
            function (jb_rx_1) {
                jb_rx = jb_rx_1;
            },
            function (studio_tgp_model_1_1) {
                studio_tgp_model_1 = studio_tgp_model_1_1;
            },
            function (studio_path_1_1) {
                studio_path_1 = studio_path_1_1;
            }],
        execute: function() {
            exports_1("modifyOperationsEm", modifyOperationsEm = new jb_rx.Subject());
            exports_1("studioActivityEm", studioActivityEm = new jb_rx.Subject());
            exports_1("pathChangesEm", pathChangesEm = new jb_rx.Subject());
            jbart.modifiedCtrlsEm = modifyOperationsEm.flatMap(function (x) {
                var path_parts = x.path.split('~');
                var sub_paths = path_parts.map(function (e, i) {
                    return path_parts.slice(0, i + 1).join('~');
                }).reverse();
                var firstCtrl = sub_paths
                    .filter(function (p) {
                    return studio_tgp_model_1.model.isCompNameOfType(jb_core_1.jb.compName(studio_path_1.profileFromPath(p)), 'control');
                })[0];
                return firstCtrl ? [{ path: firstCtrl, ngPath: x.ngPath }] : [];
            });
            // ********* Components ************
            jb_core_1.jb.component('studio.message', {
                type: 'action',
                params: [{ id: 'message', as: 'string' }],
                impl: function (ctx, message) {
                    return message(message);
                }
            });
            jb_core_1.jb.component('studio.refreshPreview', {
                type: 'action',
                impl: function () {
                    var previewjBart = jbart.previewjbart ? jbart.previewjbart : jbart;
                    previewjBart.previewRefreshCounter = (previewjBart.previewRefreshCounter || 0) + 1;
                    if (jbart.studioActivityEm)
                        jbart.studioActivityEm.next();
                }
            });
            jb_core_1.jb.component('studio.redrawStudio', {
                type: 'action',
                impl: function () {
                    return jbart.redrawStudio && jbart.redrawStudio();
                }
            });
            jb_core_1.jb.component('studio.goto-path', {
                type: 'action',
                params: [
                    { id: 'path', as: 'string' },
                ],
                impl: { $runActions: [
                        { $: 'writeValue', to: '%$globals/profile_path%', value: '%$path%' },
                        { $: 'studio.open-properties' },
                        { $: 'studio.open-control-tree' }
                    ] }
            });
            jb_core_1.jb.component('studio.project-source', {
                params: [
                    { id: 'project', as: 'string', defaultValue: '%$globals/project%' }
                ],
                impl: function (context, project) {
                    if (!project)
                        return;
                    var comps = jb_core_1.jb.entries(jbart_base().comps).map(function (x) { return x[0]; }).filter(function (x) { return x.indexOf(project) == 0; });
                    return comps.map(function (comp) { return compAsStr(comp); }).join('\n\n');
                }
            });
            jb_core_1.jb.component('studio.comp-source', {
                params: [
                    { id: 'comp', as: 'string', defaultValue: { $: 'studio.currentProfilePath' } }
                ],
                impl: function (context, comp) {
                    return compAsStr(comp.split('~')[0]);
                }
            });
        }
    }
});
