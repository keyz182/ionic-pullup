import { EventEmitter, ElementRef, Renderer } from '@angular/core';
import { Platform } from 'ionic-angular';
import { ViewMetadata } from './common';
export interface FooterMetadata {
    height: number;
    posY: number;
    lastPosY: number;
    defaultHeight?: number;
}
export interface FooterTab {
    x?: number;
    y?: number;
    upperLeftRadius?: number;
    upperRightRadius?: number;
    backgroundColor?: string;
    color?: string;
    content?: string;
}
export declare enum IonPullUpFooterState {
    Collapsed = 0,
    Expanded = 1,
    Minimized = 2,
}
export declare enum IonPullUpFooterBehavior {
    Hide = 0,
    Expand = 1,
}
export declare class IonPullUpComponent {
    private platform;
    private el;
    private renderer;
    state: IonPullUpFooterState;
    stateChange: EventEmitter<IonPullUpFooterState>;
    initialState: IonPullUpFooterState;
    defaultBehavior: IonPullUpFooterBehavior;
    maxHeight: number;
    onExpand: EventEmitter<any>;
    onCollapse: EventEmitter<any>;
    onMinimize: EventEmitter<any>;
    childFooter: any;
    protected _footerMeta: FooterMetadata;
    protected _currentViewMeta: ViewMetadata;
    protected _oldState: IonPullUpFooterState;
    constructor(platform: Platform, el: ElementRef, renderer: Renderer);
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
    onDrag(e: any): void;
    ngDoCheck(): void;
}
