/// <reference path="../../components/common.ts" />

module BinarySearch {
    
    export enum Operation {Less = 1, Greater = 2, Equals = 3, NotEquals = 4, Unknown = 5}
    
    export class BinarySearchAction implements Common.GamePlayAction {
        constructor(public index: number){};
    }

    class BinarySearchStep extends Common.AlgorithmStep {
        
        private _startIndex: number;
        private _endIndex: number;
        private _elementIndex: number;
        private _operation: Operation = Operation.Unknown;
      
        constructor(isLast: boolean, stepNumber: number,
                elementIndex: number,
                startIndex: number,
                endIndex: number,
                operation: Operation
            ) {
            super(isLast, stepNumber);
            this._startIndex = startIndex;
            this._endIndex = endIndex;
            this._elementIndex = elementIndex;
            this._operation = operation;
        }
        
        public get startIndex(): number {
            return this._startIndex;
        }
        
        public get endIndex(): number {
            return this._endIndex;  
        }
        
        public get elementIndex(): number {
            return this._elementIndex;  
        }
        
        public get operation(): Operation {
            return this._operation;  
        }
        
        public toString(): string {
          return "[" + this._elementIndex + "][" + this._startIndex + "][" + this._endIndex + "]";  
        }
        
    }

    class BinarySearchAlgorithm extends Common.Algorithm {
        
        private _stepIndex: number = 0;
        private _elementToFindIndex: number;
        
        constructor(config: any) {
            super(config);
        }
        
        protected runAlgorithm(): BinarySearchStep[] {
            var steps: BinarySearchStep[] = [];
            this._elementToFindIndex = this.defineElementToFind();
            var step = new BinarySearchStep(false, -1,  -1, 0, this.sequence.length - 1, Operation.Unknown);
            while(!step.isLast) {
                step = this.evaluateNextStep(step);
                steps.push(step);
            }             
            return steps;
        }
        
        private evaluateNextStep(step: BinarySearchStep): BinarySearchStep {
            
            this._stepIndex++;
        
            var pivotIndex: number = Math.floor((step.endIndex + step.startIndex) / 2);
            var pivotElement = this.sequence[pivotIndex];
            var elementToFind = this.sequence[this._elementToFindIndex];
        
            var nextStep: BinarySearchStep;
            if (pivotElement == elementToFind) {
                
                nextStep = new BinarySearchStep(true, this._stepIndex, 
                    pivotIndex, 
                    pivotIndex, 
                    pivotIndex, 
                    Operation.Equals);
                    
            } else if(step.startIndex == step.endIndex) {
                
        	    nextStep = new BinarySearchStep(true, this._stepIndex,
        	        pivotIndex, 
        	        pivotIndex,
        	        pivotIndex,
        	        Operation.NotEquals);
        	        
            } else if (pivotElement > elementToFind) {
                
                nextStep = new BinarySearchStep(false, this._stepIndex,
                    pivotIndex, 
                    step.startIndex, 
                    pivotIndex - 1, 
                    Operation.Less);
                
        	} else if(pivotElement < elementToFind) {
        	    
            	nextStep = new BinarySearchStep(false, this._stepIndex, 
            	pivotIndex, 
            	pivotIndex + 1, 
            	step.endIndex,
            	Operation.Greater);
            	
            } else {
            	console.log('Unknown state');
            }
        
            return nextStep;
        }

        private defineElementToFind(): number {
    
            var arrayMiddleElement = Math.floor(this.sequence.length/2);
            var index = -1;
            if (Math.random() > .5 ) {
                //Left side
                index = BinarySearchAlgorithm.getRandomInteger(0, Math.floor(arrayMiddleElement) - 2);
            } else {
                index = BinarySearchAlgorithm.getRandomInteger(Math.floor(arrayMiddleElement) + 2, this.sequence.length - 1);
            }
            
            console.log(`Element to find index ${index}`);
            
            return index;
        }

        public get elementToFindIndex(): number {
          return this._elementToFindIndex;  
        }
        
    }
    
    class BoxLine extends Common.LineGameArena <BinarySearchAction>{
        
        constructor(game: Common.AlgoGame, boxClickedCallback:Function, sequence: number[], elementToFindIndex: number) {
            super(game, boxClickedCallback, sequence);
            this.selectBox(elementToFindIndex);
        }
        
        protected onBoxClickPressed(index: number): void {
            this.onAction(new BinarySearchAction(index));
        }
    }

    export class BinarySearchPractiseGamePlay extends Common.PractiseGamePlay<BinarySearchAction, BinarySearchAlgorithm> {
        
        protected _boxLine: BoxLine;
        
        protected onInit(): void {
            this._boxLine = new BoxLine(this._game,     
                this.boxClicked.bind(this), 
                this._algorithm.sequence, 
                this._algorithm.elementToFindIndex);
        }
        
        protected createAlgorithm(config: any): BinarySearchAlgorithm {
            return new BinarySearchAlgorithm(config);
        }
        
        protected clickBox() {
            this.boxClicked(new BinarySearchAction(this.getCurrentStep().elementIndex), false);
        }

        protected isCorrectStep(action: BinarySearchAction): boolean {
            var step: BinarySearchStep = this.getCurrentStep();
            return action.index === step.elementIndex;
        }
        
        protected onCorrectAction(): void {
            var step: BinarySearchStep = this.getCurrentStep();
            this._boxLine.hideBoxesOutOf(step.startIndex, step.endIndex);
        }
        
        protected destroyTempObjects():void {
            super.destroyTempObjects();
            if (this._boxLine != null) {
                this._boxLine.destroy();            
            }
        }
        
        protected getCurrentStep(): BinarySearchStep {
            return <BinarySearchStep>this._algorithmStep;
        }
    }

    
    export class BinarySearchExamGamePlay extends Common.ExamGamePlay<BinarySearchAction, BinarySearchAlgorithm> {
    
        protected _boxLine: BoxLine;
        
        protected onInit(): void {
            this._boxLine = new BoxLine(this._game,     
                this.boxClicked.bind(this), 
                this._algorithm.sequence, 
                this._algorithm.elementToFindIndex);
        }

        
        protected createAlgorithm(config: any): BinarySearchAlgorithm {
            return new BinarySearchAlgorithm(config);
        }
        
        protected clickBox() {
            this.boxClicked(new BinarySearchAction(-2), false);
        }

        protected isCorrectStep(action: BinarySearchAction): boolean {
            var step: BinarySearchStep = this.getCurrentStep();
            return action.index === step.elementIndex;
        }
        
        protected onCorrectAction(): void {
            var step: BinarySearchStep = this.getCurrentStep();
            this._boxLine.hideBoxesOutOf(step.startIndex, step.endIndex);
            this._boxLine.selectBox(step.elementIndex);
        }
        
        protected destroyTempObjects():void {
            super.destroyTempObjects();
            if (this._boxLine != null) {
                this._boxLine.destroy();            
            }
        }
        
        protected getCurrentStep(): BinarySearchStep {
            return <BinarySearchStep>this._algorithmStep;
        }        
    }
}

