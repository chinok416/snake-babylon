// Управление змейкой: создание сегментов и соединение их констрейнтами

import { BallAndSocketConstraint, Color3, PointerDragBehavior, Vector3, type Scene } from "@babylonjs/core";
import { SnakeSegment } from "./snakeSegment";


export class Snake {
    snakeSegments: SnakeSegment[];

    constructor(scene: Scene){
        // создание сегментов
        const segment1 = new SnakeSegment(scene, new Vector3(0, 15, 0), new Color3(0.1, 0.5, 0.15), 'segment-1');
        const segment2 = new SnakeSegment(scene, new Vector3(4, 15, 0), new Color3(0.1, 0.5, 0.15), 'segment-2');
        const segment3 = new SnakeSegment(scene, new Vector3(8, 15, 0), new Color3(0.1, 0.5, 0.15), 'segment-3');
        const segment4 = new SnakeSegment(scene, new Vector3(12, 15, 0), new Color3(0.1, 0.5, 0.15), 'segment-4');
        
        this.snakeSegments = [segment1, segment2, segment3, segment4];
        this.snakeSegments.forEach(fragment=>{
            fragment.createCollisions();
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

            const dragBehover = new PointerDragBehavior({
                dragPlaneNormal: new Vector3(0, 1, 0)
            })
            // Начало перетаскивания
            dragBehover.onDragStartObservable.add(()=>{
                this.snakeSegments.forEach(seg=>{
                    seg.getPhysicsBody().disablePreStep = false;
                })
            })
            
            // Конец перетаскивания
            dragBehover.onDragEndObservable.add(()=>{
                this.snakeSegments.forEach(seg=>{
                    seg.getPhysicsBody().disablePreStep = true;
                })
            })
            mesh.addBehavior(dragBehover);
        })
    
    }
}

