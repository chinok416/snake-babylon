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
import finishZone from '../entities/finishZone';
import ObstacleRay from '../entities/obstacleRay';
import DustPool from '../entities/dustPool';


export class Game {
    private engine: Engine;
    private scene: Scene;
    private canvas: HTMLCanvasElement;
    private physicsManager: PhysicsManager;
    private snake: Snake;

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
        const camera = new FreeCamera('Camera', new Vector3(0, 70, 15), this.scene);
        camera.setTarget(new Vector3(0, 0, 0))
        camera.attachControl();

        // Освещение
        const hemilight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), this.scene);
        hemilight.intensity = 0.5;

        return scene
    }

    // Создания пола и стен
    createGroundAndWalls(){
        // ПОЛ
        // Создание меша и физики пола
        const ground = MeshBuilder.CreateGround('ground', {width: 50, height:50}, this.scene);
        ground.metadata = {type: 'ground'}
        const groundPhysics = new PhysicsAggregate(ground, PhysicsShapeType.BOX, {mass: 0}, this.scene)
        const groundShape = groundPhysics.shape;
        groundShape.filterMembershipMask = 0b0010;  // Группа пола
        groundShape.filterCollideMask = 0b0001;


        // СТЕНЫ
        // Создание меша и физики северной стены
        const NorthWall = MeshBuilder.CreateBox('NorthWall', {width: 50, height:6, depth:2}, this.scene);
        NorthWall.position = new Vector3(0, 3, 25);
        const NorthWallPhysics = new PhysicsAggregate(NorthWall, PhysicsShapeType.BOX, {mass:0});
        const NorthWallShape = NorthWallPhysics.shape
        NorthWallShape.filterMembershipMask = 0b0010;
        NorthWallShape.filterCollideMask = 0b0001;

        // Создание меша и физики южной стены
        const SouthWall = MeshBuilder.CreateBox('SouthWall', {width: 50, height:6, depth:2}, this.scene);
        SouthWall.position = new Vector3(0, 3, -25)
        const SouthWallPhysics = new PhysicsAggregate(SouthWall, PhysicsShapeType.BOX, {mass:0});
        const SouthWallShape = SouthWallPhysics.shape
        SouthWallShape.filterMembershipMask = 0b0010;
        SouthWallShape.filterCollideMask = 0b0001;

        // Создание меша и физики западной стены
        const EastWall = MeshBuilder.CreateBox('EastWall', {width: 50, height:6, depth:2}, this.scene);
        EastWall.position = new Vector3(26, 3, 0)
        EastWall.rotation = new Vector3(0, Math.PI / 2, 0); 
        const EastWallPhysics = new PhysicsAggregate(EastWall, PhysicsShapeType.BOX, {mass:0});
        const EastWallShape = EastWallPhysics.shape
        EastWallShape.filterMembershipMask = 0b0010;
        EastWallShape.filterCollideMask = 0b0001;
        
        // Создание меша и физики восточной стены
        const WestWall = MeshBuilder.CreateBox('WestWall', {width: 50, height:6, depth:2}, this.scene);
        WestWall.position = new Vector3(-26, 3, 0);
        WestWall.rotation = new Vector3(0, Math.PI / 2, 0);
        const WestWallPhysics = new PhysicsAggregate(WestWall, PhysicsShapeType.BOX, {mass:0});
        const WestWallShape = WestWallPhysics.shape
        WestWallShape.filterMembershipMask = 0b0010;
        WestWallShape.filterCollideMask = 0b0001;

        // this.snake = new Snake(this.scene, groundPhysics.body);

        return groundPhysics.body
    }

    // Запуск сцены
    async start(): Promise<void>{
        // Инициализируем физику
        try{
            await this.physicsManager.init(this.scene);
        }
        catch (err){
            console.log('Ошибка инициализации физики', err)
        }
        // Создание арены
        const groundPhysicsBody = this.createGroundAndWalls()
        
        // Создание финишного кубика
        const finish = new finishZone(this.scene);
        finish.createCollisions()

        // создание пыли
        const dustPool = new DustPool(this.scene, 100);
        // Создание змейки
        this.snake = new Snake(this.scene, groundPhysicsBody, dustPool);
        
        const segments = this.snake.getSegments()

        // Создание лучей
        const ray1 = new ObstacleRay(
            this.scene, 
            new Vector3(0, 10, 0),
            new Vector3(0, -1, 0),
            10,
            dustPool
        )
        ray1.startChecking(segments)
        const ray2 = new ObstacleRay(
            this.scene, 
            new Vector3(15, 10, 15),
            new Vector3(0, -1, 0),
            10, 
            dustPool
        )
        ray2.startChecking(segments);

        
        this.engine.runRenderLoop(()=>{
            this.scene.render();
        })
        window.addEventListener('resize', ()=>this.engine.resize());
    }

}