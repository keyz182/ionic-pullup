/*
ionic-pullup v2 for Ionic/Angular 2
 
Copyright 2016 Ariel Faur (https://github.com/arielfaur)
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, Renderer, ViewChild, Renderer2 } from '@angular/core';
import { Platform } from 'ionic-angular';
import 'rxjs/Rx';
import { IonPullDownTabComponent } from "./ion-pulldown-tab";
export var IonPullDownHeaderState;
(function (IonPullDownHeaderState) {
    IonPullDownHeaderState[IonPullDownHeaderState["Collapsed"] = 0] = "Collapsed";
    IonPullDownHeaderState[IonPullDownHeaderState["Expanded"] = 1] = "Expanded";
    IonPullDownHeaderState[IonPullDownHeaderState["Minimized"] = 2] = "Minimized";
})(IonPullDownHeaderState || (IonPullDownHeaderState = {}));
export var IonPullDownHeaderBehavior;
(function (IonPullDownHeaderBehavior) {
    IonPullDownHeaderBehavior[IonPullDownHeaderBehavior["Hide"] = 0] = "Hide";
    IonPullDownHeaderBehavior[IonPullDownHeaderBehavior["Expand"] = 1] = "Expand";
})(IonPullDownHeaderBehavior || (IonPullDownHeaderBehavior = {}));
var IonPullDownComponent = (function () {
    function IonPullDownComponent(platform, el, renderer, rd) {
        this.platform = platform;
        this.el = el;
        this.renderer = renderer;
        this.rd = rd;
        this.stateChange = new EventEmitter();
        this.onExpand = new EventEmitter();
        this.onCollapse = new EventEmitter();
        this.onMinimize = new EventEmitter();
        this.onStateChange = new EventEmitter();
        this.el.nativeElement.draggable = 'true';
        this._headerMeta = {
            height: 0,
            posY: 0,
            lastPosY: 0
        };
        this._currentViewMeta = {};
        // sets initial state
        this.initialState = this.initialState || IonPullDownHeaderState.Collapsed;
        this.defaultBehavior = this.defaultBehavior || IonPullDownHeaderBehavior.Expand;
        this.maxHeight = this.maxHeight || 0;
    }
    IonPullDownComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.debug('ionic-pulldown => Initializing header...');
        window.addEventListener("orientationchange", function () {
            console.debug('ionic-pulldown => Changed orientation => updating');
            _this.updateUI();
        });
        this.platform.resume.subscribe(function () {
            console.debug('ionic-pulldown => Resumed from background => updating');
            _this.updateUI();
        });
    };
    IonPullDownComponent.prototype.ngAfterContentInit = function () {
        var component = this;
        var hammerOpts = {};
        if (navigator.userAgent.match(/Android/i)) {
            hammerOpts['inputClass'] = window['Hammer'].TouchInput;
        }
        function handler(event) {
            switch (event.type) {
                case 'panstart':
                    console.log(component.childHeader);
                    component.renderer.setElementStyle(component.childHeader.nativeElement, 'transition', 'none');
                    break;
                case 'pan':
                case 'pan-up':
                case 'pan-down':
                    event.preventDefault();
                    var delta = event.deltaY;
                    var xlate = component._headerMeta.lastPosY - delta;
                    if (xlate < 0 || xlate > component._headerMeta.height)
                        return;
                    component._headerMeta.posY = xlate;
                    component.renderer.setElementStyle(component.childHeader.nativeElement, '-webkit-transform', 'translate3d(0, ' + -xlate + 'px, 0)');
                    component.renderer.setElementStyle(component.childHeader.nativeElement, 'transform', 'translate3d(0, ' + -xlate + 'px, 0)');
                    break;
                case 'panend':
                    component.renderer.setElementStyle(component.childHeader.nativeElement, 'transition', '300ms ease-in-out');
                    // Check if within buffer of top/bottom
                    if (component._headerMeta.posY < (component._headerMeta.height * (1 / 5))) {
                        component.expand();
                        component.state = IonPullDownHeaderState.Expanded;
                    }
                    else if (component._headerMeta.posY > (component._headerMeta.height * (4 / 5))) {
                        component.collapse();
                        component.state = (component.initialState === IonPullDownHeaderState.Minimized) ? IonPullDownHeaderState.Minimized : IonPullDownHeaderState.Collapsed;
                    }
                    else {
                        component._headerMeta.posY = (component._headerMeta.height / 2);
                        component.renderer.setElementStyle(component.childHeader.nativeElement, '-webkit-transform', 'translate3d(0, ' + -component._headerMeta.posY + 'px, 0)');
                        component.renderer.setElementStyle(component.childHeader.nativeElement, 'transform', 'translate3d(0, ' + -component._headerMeta.posY + 'px, 0)');
                    }
                    component._headerMeta.lastPosY = component._headerMeta.posY;
                    console.log('this._headerMeta.posY : ' + component._headerMeta.posY);
                    console.log('this._headerMeta.height : ' + component._headerMeta.height);
                    break;
                default:
                    break;
            }
        }
        var toolbar = this.el.nativeElement.querySelector('ion-toolbar');
        var pulldown = this.el.nativeElement.querySelector('ion-pulldown-tab');
        var toolbarhammer = new window['Hammer'](toolbar, hammerOpts);
        var pulldownhammer = new window['Hammer'](pulldown, hammerOpts);
        toolbarhammer.get('pan').set({ threshold: 0 });
        pulldownhammer.get('pan').set({ threshold: 0 });
        toolbarhammer.on('pan panstart panend pan-up pan-down', handler);
        pulldownhammer.on('pan panstart panend pan-up pan-down', handler);
        this.computeDefaults();
        this.state = IonPullDownHeaderState.Collapsed;
        this.updateUI(true); // need to indicate whether it's first run to avoid emitting events twice due to change detection
    };
    Object.defineProperty(IonPullDownComponent.prototype, "expandedHeight", {
        get: function () {
            return window.innerHeight - this._currentViewMeta.footerHeight - this._currentViewMeta.tabsHeight - this._headerMeta.defaultHeight;
        },
        enumerable: true,
        configurable: true
    });
    IonPullDownComponent.prototype.computeDefaults = function () {
        this._headerMeta.defaultHeight = this.childHeader.nativeElement.offsetHeight;
        // TODO: still need to test with tabs template (not convinced it is a valid use case...)
        this._currentViewMeta.tabs = this.el.nativeElement.closest('ion-tabs');
        this._currentViewMeta.tabsHeight = this._currentViewMeta.tabs ? this._currentViewMeta.tabs.querySelector('.tabbar').offsetHeight : 0;
        console.debug(this._currentViewMeta.tabsHeight ? 'ionic-pullup => Tabs detected' : 'ionic.pullup => View has no tabs');
        //this._currentViewMeta.hasBottomTabs = this._currentViewMeta.tabs && this._currentViewMeta.tabs.classList.contains('tabs-bottom');
        this._currentViewMeta.header = document.querySelector('ion-header');
        this._currentViewMeta.headerHeight = this._currentViewMeta.header ? this._currentViewMeta.header.offsetHeight : 0;
        this._currentViewMeta.footer = document.querySelector('ion-footer');
        this._currentViewMeta.footerHeight = this._currentViewMeta.footer ? this._currentViewMeta.footer.offsetHeight : 0;
    };
    IonPullDownComponent.prototype.computeHeights = function (isInit) {
        if (isInit === void 0) { isInit = false; }
        this._headerMeta.height = this.maxHeight > 0 ? this.maxHeight : this.expandedHeight;
        this.renderer.setElementStyle(this.childHeader.nativeElement, 'height', this._headerMeta.height + 'px');
        // TODO: implement minimize mode
        //this.renderer.setElementStyle(this.el.nativeElement, 'min-height', this._headerMeta.height + 'px');
        //if (this.initialState == IonPullDownHeaderState.Minimized) {
        //  this.minimize()
        //} else {
        this.collapse(isInit);
        //}
    };
    IonPullDownComponent.prototype.updateUI = function (isInit) {
        var _this = this;
        if (isInit === void 0) { isInit = false; }
        setTimeout(function () {
            _this.computeHeights(isInit);
        }, 300);
        this.renderer.setElementStyle(this.childHeader.nativeElement, 'transition', 'none'); // avoids flickering when changing orientation
    };
    IonPullDownComponent.prototype.expand = function () {
        this._headerMeta.lastPosY = -4;
        this._headerMeta.posY = -4;
        this.renderer.setElementStyle(this.childHeader.nativeElement, '-webkit-transform', 'translate3d(0, -4px, 0)');
        this.renderer.setElementStyle(this.childHeader.nativeElement, 'transform', 'translate3d(0, -4px, 0)');
        this.renderer.setElementStyle(this.childHeader.nativeElement, 'transition', '300ms ease-in-out');
        this.onExpand.emit(null);
        this.onStateChange.emit(null);
        console.log('this._headerMeta.lastPosY : ' + this._headerMeta.lastPosY);
        console.log(this.childHeader);
    };
    IonPullDownComponent.prototype.collapse = function (isInit) {
        if (isInit === void 0) { isInit = false; }
        this._headerMeta.lastPosY = this._headerMeta.height; // + this._headerMeta.defaultHeight;
        this._headerMeta.posY = this._headerMeta.lastPosY; // + this._headerMeta.defaultHeight;
        this.renderer.setElementStyle(this.childHeader.nativeElement, '-webkit-transform', 'translate3d(0, -' + this._headerMeta.lastPosY + 'px, 0)');
        this.renderer.setElementStyle(this.childHeader.nativeElement, 'transform', 'translate3d(0, -' + this._headerMeta.lastPosY + 'px, 0)');
        if (!isInit)
            this.onCollapse.emit(null);
        if (!isInit)
            this.onStateChange.emit(null);
        console.log('this._headerMeta.lastPosY : ' + this._headerMeta.lastPosY);
        console.log(this.childHeader);
    };
    IonPullDownComponent.prototype.minimize = function () {
        this._headerMeta.lastPosY = this._headerMeta.height;
        this.renderer.setElementStyle(this.childHeader.nativeElement, '-webkit-transform', 'translate3d(0, ' + this._headerMeta.lastPosY + 'px, 0)');
        this.renderer.setElementStyle(this.childHeader.nativeElement, 'transform', 'translate3d(0, ' + this._headerMeta.lastPosY + 'px, 0)');
        this.onMinimize.emit(null);
        this.onStateChange.emit(null);
        console.log(this.childHeader);
    };
    IonPullDownComponent.prototype.onTap = function (e) {
        e.preventDefault();
        if (this.state == IonPullDownHeaderState.Collapsed) {
            if (this.defaultBehavior == IonPullDownHeaderBehavior.Hide)
                this.state = IonPullDownHeaderState.Minimized;
            else
                this.state = IonPullDownHeaderState.Expanded;
        }
        else {
            if (this.state == IonPullDownHeaderState.Minimized) {
                if (this.defaultBehavior == IonPullDownHeaderBehavior.Hide)
                    this.state = IonPullDownHeaderState.Collapsed;
                else
                    this.state = IonPullDownHeaderState.Expanded;
            }
            else {
                // header is expanded
                this.state = this.initialState == IonPullDownHeaderState.Minimized ? IonPullDownHeaderState.Minimized : IonPullDownHeaderState.Collapsed;
            }
        }
    };
    IonPullDownComponent.prototype.ngDoCheck = function () {
        var _this = this;
        if (!Object.is(this.state, this._oldState)) {
            switch (this.state) {
                case IonPullDownHeaderState.Collapsed:
                    this.collapse();
                    break;
                case IonPullDownHeaderState.Expanded:
                    this.expand();
                    break;
                case IonPullDownHeaderState.Minimized:
                    this.minimize();
                    break;
            }
            this._oldState = this.state;
            // TODO: fix hack due to BUG (https://github.com/angular/angular/issues/6005)
            window.setTimeout(function () {
                _this.stateChange.emit(_this.state);
            });
        }
    };
    return IonPullDownComponent;
}());
export { IonPullDownComponent };
IonPullDownComponent.decorators = [
    { type: Component, args: [{
                selector: 'ion-pulldown',
                changeDetection: ChangeDetectionStrategy.OnPush,
                template: "\n        <ion-header #header>\n            <ng-content></ng-content>\n        </ion-header>\n    "
            },] },
];
/** @nocollapse */
IonPullDownComponent.ctorParameters = function () { return [
    { type: Platform, },
    { type: ElementRef, },
    { type: Renderer, },
    { type: Renderer2, },
]; };
IonPullDownComponent.propDecorators = {
    'state': [{ type: Input },],
    'stateChange': [{ type: Output },],
    'initialState': [{ type: Input },],
    'defaultBehavior': [{ type: Input },],
    'maxHeight': [{ type: Input },],
    'onExpand': [{ type: Output },],
    'onCollapse': [{ type: Output },],
    'onMinimize': [{ type: Output },],
    'onStateChange': [{ type: Output },],
    'childHeader': [{ type: ViewChild, args: ['header',] },],
    'tab': [{ type: ViewChild, args: [IonPullDownTabComponent,] },],
};
//# sourceMappingURL=ion-pulldown.js.map