// Управление змейкой: создание сегментов и соединение их констрейнтами

import { BallAndSocketConstraint, Color3, PhysicsBody, PhysicsMotionType, PointerDragBehavior, Vector3, type Scene } from "@babylonjs/core";
import { SnakeSegment } from "./snakeSegment";
import type DustPool from "../systems/dustPool";


export class Snake {
    private snakeSegments: SnakeSegment[];
    private dustPool: DustPool;

    constructor(scene: Scene, groundBody: PhysicsBody, dustPool: DustPool){
        // создание сегментов
        const segment1 = new SnakeSegment(scene, new Vector3(-21, 2, 0), new Color3(0.1, 0.5, 0.15), 'segment-1', dustPool);
        const segment2 = new SnakeSegment(scene, new Vector3(-17, 2, 0), new Color3(0.1, 0.5, 0.15), 'segment-2', dustPool);
        const segment3 = new SnakeSegment(scene, new Vector3(-13, 2, 0), new Color3(0.1, 0.5, 0.15), 'segment-3', dustPool);
        const segment4 = new SnakeSegment(scene, new Vector3(-9, 2, 0), new Color3(0.1, 0.5, 0.15), 'segment-4', dustPool);
        
        this.snakeSegments = [segment1, segment2, segment3, segment4];
        this.snakeSegments.forEach(fragment=>{
            fragment.createCollisions(groundBody);
        })

        // получение тел
        const body1 = segment1.getPhysicsBody();
        const body2 = segment2.getPhysicsBody();
        const body3 = segment3.getPhysicsBody();
        const body4 = segment4.getPhysicsBody();

        // Ограничения
        const constraint1 = new BallAndSocketConstraint(
            new Vector3(2, 0, 0), 
            new Vector3(-2, 0, 0), 
            new Vector3(0, 1, 0), 
            new Vector3(0, 1, 0) ,
            scene
        );
        
        body1.addConstraint(body2, constraint1);

        const constraint2 = new BallAndSocketConstraint(
            new Vector3(2, 0, 0), 
            new Vector3(-2, 0, 0), 
            new Vector3(0, 1, 0), 
            new Vector3(0, 1, 0) ,
            scene
        );
        body2.addConstraint(body3, constraint2);

        const constraint3 = new BallAndSocketConstraint(
            new Vector3(2, 0, 0), 
            new Vector3(-2, 0, 0), 
            new Vector3(0, 1, 0), 
            new Vector3(0, 1, 0) ,
            scene
        );
        body3.addConstraint(body4, constraint3);


        this.snakeSegments.forEach((segment)=>{
            const mesh = segment.getMesh();
            const body = segment.getPhysicsBody();

            const dragBehavior = new PointerDragBehavior({
                dragPlaneNormal: new Vector3(0, 1, 0)
            })
            // Начало перетаскивания
            dragBehavior.onDragStartObservable.add(()=>{
                body.setMotionType(PhysicsMotionType.STATIC)
                body.disablePreStep = false;
            })
            
            // Конец перетаскивания
            dragBehavior.onDragEndObservable.add(()=>{
                    body.setMotionType(PhysicsMotionType.DYNAMIC)
                    body.disablePreStep = true;
            })
            mesh.addBehavior(dragBehavior);
        })
    }

    getSegments(){
        return this.snakeSegments;
    }
}

