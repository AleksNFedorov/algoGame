/// <reference path="../lib/phaser.d.ts" />
/// <reference path="../lib/gameconfig.d.ts" />

declare var store: Store;
declare var globalConfig: GameConfig.Config;
declare var _LTracker:any;
declare var log:any;

module Common {
    
    export enum LevelStageState {PAUSED = 0, RUNNING = 1, CREATED = 2, END = 3, UNKNOWN = 4}
    export enum ModalWindows {OBJECTIVES = 0, PRACTISE_DONE = 1, EXAM_DONE = 2}
    
    /*
        All game elements, element id should be here to show description info for it.
    */
    export enum GameElements {
        MENU_BUTTON_MENU = 2,
        MENU_BUTTON_DESCRIPTION = 3,
        MENU_BUTTON_OBJECTIVES = 4,
        MENU_BUTTON_PRACTISE = 5,
        MENU_BUTTON_EXAM = 6,
        PROGRESS_STEP = 7,
        PROGRESS_COMPLETE = 8,
        CONTROL_PANEL_BUTTON_PLAY = 9,
        CONTROL_PANEL_BUTTON_PAUSE = 10,
        CONTROL_PANEL_BUTTON_STOP = 11,
        CONTROL_PANEL_TEXT = 12,
        GAME_AREA = 13,
        LEVEL_BUTTON = 14,
    }
    
        
    //Key info stored on borwser local store
    export class LevelSave {
        public practiseDone: number = 0;
        public practisePassed: boolean = false;
        public examDone: number = 0;
        public examPassed: boolean = false;
    }
    
    //Info to distirbute across game components when level type (practise, exam) initialized.
    //Used to sync all parts with key game values like steps count, step wait interval.
    export class GamePlayInfo {
        
        private _stepWaitTime: number;
        private _totalItertions: number;
        private _doneIterations: number;
        
        constructor(stepWaitTime: number, totalIterations: number, doneIterations: number) {
            this._stepWaitTime = stepWaitTime;
            this._totalItertions = totalIterations;
            this._doneIterations = doneIterations;
        }
        
        public get stepWaitTime(): number {
            return this._stepWaitTime;
        }
        
        public get totalItertions(): number {
            return this._totalItertions;
        }
        
        public get doneIterations(): number {
            return this._doneIterations;
        }
        
    }
    
    // Abstract algorithm step, represents single step of given algorithm.
    // Particular algorithm should use it of extend.
    export class AlgorithmStep {
        private _isLast: boolean = false;
        private _stepNumber: number = -1;
        
        constructor(isLast: boolean, stepNumber: number) {
            this._isLast = isLast;
            this._stepNumber = stepNumber;
        }
        
        public get isLast(): boolean {
            return this._isLast;
        }
        
        public get stepNumber(): number {
            return this._stepNumber;
        }
    }
    
    //Shows element info widget near the target element, used to icon with I (info) symbol. 
    //Need to attract play attention to target element
    export interface InfoWidget {
        showFor(element: any): void;
        getElementId(): number;
    }
    
    //Event generated by some component and processed by another,
    //just a wrapper around key EventBus parameters
    export class GameEvent {
        constructor(
            public eventId: string, 
            public caller: any, 
            public param?: any) {}
    }
    
    //Used to save/restore element state without to repect to particular UI element type
    //Scenario: when modal window shown it is need to save state and disable element
    //after window hides - state should be restored to initial
    export interface GameUIObjectWithState {
        worldPosition: PIXI.Point;
        width: number;
        height: number;
        
        saveStateAndDisable(): void;
        restoreState(): void;
        destroy(): void;
    }

    
    export class AlgoGame extends Phaser.Game {
    
        private _eventBus:EventBusClass;
        private _store: Store = store;
        private _config: GameConfig.Config = globalConfig;

        constructor(gameWidth: number, gameHeight: number, mode: number, tag: string) {
            super(gameWidth, gameHeight, mode, tag);
            this._eventBus = new EventBusClass();
        }
        
        public dispatch(eventId: string, caller: any, param?: any): void {
            var state: State = <State> this.state.states[this.state.current];
            state.dispatch(eventId, caller, param);
        }
        
        get store() : Store {
            return this._store;   
        }
        
        get eventBus(): EventBusClass {
            return this._eventBus;
        }
        
        get config(): GameConfig.Config {
            return this._config;
        }
        
        public get levelStageState(): LevelStageState {
            var state: State = <State> this.state.states[this.state.current];
            return state.levelStageState;
        }
    }

    //Core class for all componets who need listen to events and generate own.
    export class GameEventComponent {
        
        protected _game: AlgoGame;
        private _listeners: Phaser.ArraySet = new Phaser.ArraySet([]);

        constructor(game: AlgoGame) {
            this._game = game;
            this.initEventListners();
        }
        
        protected initEventListners(): void {}

        dispatchEvent(event: any, param1: any) {}

        addEventListener(eventId: string): void {
        
            if (!this._listeners.exists(eventId)) {
                this._game.eventBus.addEventListener(eventId, this.dispatchEvent, this);  
                this._listeners.add(eventId);
            } else {
                console.log("Event listener exists [" + eventId + "] ")
            }                
        }
        
        removeEventListener(eventId: string): void {
            this._game.eventBus.removeEventListener(eventId, this.dispatchEvent, this);  
        }
        
        destroy(): void {
            for(var eventId of this._listeners.list) {
                this.removeEventListener(eventId);
            }
        }

        getCallbackForEventId(eventId: string, param?: any) {
            
            return function() {
                console.log("Event created " + eventId);
                this._game.dispatch(eventId, this, param);
            }.bind(this);
        }
    }
    
    //Core class for composite elements - containers, 
    // dispatches enable, disable and show info game events
    export class GameComponentContainer extends GameEventComponent {
    
        private _componentElements: GameUIObjectWithState[] = [];

        constructor(game: AlgoGame) {
            super(game);
        }
        
        protected initEventListners(): void {
            this.addEventListener(Events.STAGE_INFO_SHOW);
            this.addEventListener(Events.GAME_DISABLE_ALL);
            this.addEventListener(Events.GAME_ENABLE_ALL);
        }
        
        protected addGameElement(elementId: GameElements, element: GameUIObjectWithState): void {
            this._componentElements[elementId] = element;
        } 
        
    
        protected isCurrentState(state: LevelStageState): boolean {
            return this._game.levelStageState === state;
        }
        
        protected isNotCurrentState(state: LevelStageState): boolean {
            return this._game.levelStageState != state;
        }

        dispatchEvent(event: any, param1: any) {
            switch(event.type) {
                case Events.GAME_DISABLE_ALL:
                    for(var uiElementIndex in this._componentElements) {
                        var uiElement = this._componentElements[uiElementIndex];
                        uiElement.saveStateAndDisable();
                    }
                    break;
                case Events.GAME_ENABLE_ALL:
                    for(var uiElementIndex in this._componentElements) {
                        var uiElement = this._componentElements[uiElementIndex];
                        uiElement.restoreState();
                    }
                    break;
                case Events.STAGE_INFO_SHOW:
                    var infoWidget: InfoWidget = <InfoWidget> param1;
                    var element = this._componentElements[infoWidget.getElementId()];
                    if (element != null) {
                        infoWidget.showFor(element);
                    }                        
                    break;
            }
        }

        destroy(): void {
            super.destroy();         
            for (var key in this._componentElements) {
               var value = this._componentElements[key];
               value.destroy();
            }
        }
    }
    
    //Extend this class if component need 
    //an access to stage config and stage client save
    export class GameContainerWithStoreSupport extends GameComponentContainer {
    
        private _levelSave: LevelSave;
        protected stateConfig: GameConfig.StageConfig;

        constructor(game: AlgoGame) {
            super(game);
        }
        
        protected initEventListners(): void {
            super.initEventListners();
            this.addEventListener(Events.STAGE_INITIALIZED);
        }
        
        dispatchEvent(event: any, param1: any) {
            super.dispatchEvent(event, param1);
            switch(event.type) {
                case Events.STAGE_INITIALIZED:
                    this.stateConfig = <GameConfig.StageConfig>param1;
                        this._levelSave = this._game.store.get(this.stateConfig.level)
                            || new LevelSave();
                    break;
            }
        }

        protected get levelSave(): LevelSave {
            return this._levelSave;
        }
        
        protected saveState(): void  {
          this._game.store.set(this.stateConfig.level, this._levelSave);
        }

    }
    
    export class Text extends Phaser.Text implements GameUIObjectWithState {
        constructor(game: AlgoGame, x: number, y: number, text: string, fontSettings: any) {
            super(game, x, y, text, fontSettings);
        }
        
        saveStateAndDisable(): void {};
        restoreState(): void {};
        
    }
    
    export class Button extends Phaser.Button implements GameUIObjectWithState {
        
        private _activeFrames: number[];
        private _inactiveFrame: number;
        private _callback: Function;
        private _savedEnabled: boolean;
        
        constructor(game:AlgoGame, frames:number[]) {
            super(game, 0,0, Constants.MENU_BUTTON_ATTLAS,
            this.onButtonDown, this, 
            frames[0],
            frames[1],
            frames[2],
            frames[3]
            );
            this._activeFrames = frames;
            this._inactiveFrame = frames[4];
        }
        
        activate(): void {
            this.input.enabled = true;
            this.setFrames(
                this._activeFrames[0], 
                this._activeFrames[1], 
                this._activeFrames[2],
                this._activeFrames[3]
                );
        }
        
        deactivate():void {
            this.input.enabled = false;
            this.setFrames(
                this._inactiveFrame, 
                this._inactiveFrame, 
                this._inactiveFrame, 
                this._inactiveFrame
            );
        }
        
        public saveStateAndDisable(): void {
            this._savedEnabled = this.input.enabled;
            this.deactivate();
        }
        
        public restoreState(): void {
            if (this._savedEnabled) {
                this.activate();
            } 
        }
        
        private onButtonDown(): void {
            this._callback();
        }
        
        set callback(callback: Function) {
            this._callback = callback;
        }
    }
}