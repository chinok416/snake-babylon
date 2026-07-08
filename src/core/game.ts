// Созданние сцены, сущностей и их связка
import {
    Scene, 
    Engine,
    Vector3,
    FreeCamera,
    HemisphericLight,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsShapeType,
} from '@babylonjs/core'

import { PhysicsManager } from '../systems/physicsManager';
import { Snake } from '../entities/snake';


export class Game {
    engine: Engine;
    scene: Scene;
    canvas: HTMLCanvasElement;
    physicsManager: PhysicsManager;
    snake: Snake

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas; 
        this.engine = new Engine(this.canvas, true);
        this.scene = this.createScene();
        this.physicsManager = new PhysicsManager();    
    }

    // Создание сцены
    createScene(): Scene{
        // Сцена, камера
        const scene = new Scene(this.engine);
        const camera = new FreeCamera('Camera', new Vector3(0, 5, -15), this.scene);
        camera.attachControl();

        // Освещение
        const hemilight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), this.scene);
        hemilight.intensity = 0.5;

        return scene
    }

    // Запуск сцены
    async start(): Promise<void>{
        // Инициализируем физику
        try{
            await this.physicsManager.init(this.scene);
        }
        catch (err){
            console.log('Оибка инициализации физики', err)
        }
        // Создание пола с его физикой
        const ground = MeshBuilder.CreateGround('ground', {width: 30, height:30}, this.scene);
        const groundPhysics = new PhysicsAggregate(ground, PhysicsShapeType.BOX, {mass: 0}, this.scene)
        const groundShape = groundPhysics.shape;
        groundShape.filterMembershipMask = 0b0010;  // Группа пола
        groundShape.filterCollideMask = 0b0011;
        
        this.snake = new Snake(this.scene);
        
        this.engine.runRenderLoop(()=>{
            this.scene.render();
        })
        window.addEventListener('resize', ()=>this.engine.resize());
    }

}