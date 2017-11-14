import { ElementRef, EventEmitter, Renderer, Renderer2, OnInit, AfterContentInit, DoCheck } from '@angular/core';
import { Platform } from 'ionic-angular';
import { ViewMetadata } from './common';
import 'rxjs/Rx';
import { IonPullDownTabComponent } from "./ion-pulldown-tab";
export interface HeaderMetadata {
    height: number;
    posY: number;
    lastPosY: number;
    defaultHeight?: number;
}
export interface HeaderTab {
    x?: number;
    y?: number;
    lowerLeftRadius?: number;
    lowerRightRadius?: number;
    backgroundColor?: string;
    color?: string;
    content?: string;
}
export declare enum IonPullDownHeaderState {
    Collapsed = 0,
    Expanded = 1,
    Minimized = 2,
}
export declare enum IonPullDownHeaderBehavior {
    Hide = 0,
    Expand = 1,
}
export declare class IonPullDownComponent implements OnInit, AfterContentInit, DoCheck {
    private platform;
    private el;
    private renderer;
    private rd;
    state: IonPullDownHeaderState;
    stateChange: EventEmitter<IonPullDownHeaderState>;
    initialState: IonPullDownHeaderState;
    defaultBehavior: IonPullDownHeaderBehavior;
    maxHeight: number;
    onExpand: EventEmitter<any>;
    onCollapse: EventEmitter<any>;
    onMinimize: EventEmitter<any>;
    onStateChange: EventEmitter<any>;
    childHeader: any;
    tab: IonPullDownTabComponent;
    protected _headerMeta: HeaderMetadata;
    protected _currentViewMeta: ViewMetadata;
    protected _oldState: IonPullDownHeaderState;
    constructor(platform: Platform, el: ElementRef, renderer: Renderer, rd: Renderer2);
    ngOnInit(): void;
    ngAfterContentInit(): void;
    readonly expandedHeight: number;
    computeDefaults(): void;
    computeHeights(isInit?: boolean): void;
    updateUI(isInit?: boolean): void;
    expand(): void;
    collapse(isInit?: boolean): void;
    minimize(): void;
    onTap(e: any): void;
    ngDoCheck(): void;
}
