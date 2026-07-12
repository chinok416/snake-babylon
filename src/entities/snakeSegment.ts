// Один сегмент змейки: меш, физическое тело, материал и metadata

import { 
    Color3, 
    Mesh, 
    MeshBuilder, 
    PhysicsAggregate, 
    PhysicsBody, 
    PhysicsShapeType, 
    Scene, 
    StandardMaterial, 
    Vector3
} from "@babylonjs/core"


import type DustPool from "./dustPool";
import FragmentsPool from "./fragmentsPool";

export class SnakeSegment{
    private scene: Scene
    private mesh: Mesh;
    private material: StandardMaterial;
    private physicsAggregate: PhysicsAggregate;
    private destructionFlag: boolean = false;
    private dustPool: DustPool;
    private fragmentsPool: FragmentsPool;

    

    constructor(scene: Scene, position: Vector3, color: Color3, id:string, dustPool: DustPool){
        this.scene = scene
        // Создание меша
        this.mesh = MeshBuilder.CreateBox('SnakeBox', {width:4, height:2, depth:1.5}, scene);
        this.mesh.position = position;
        // Создание цветов
        this.material = new StandardMaterial('snakeMaterial', scene);
        this.material.diffuseColor = color;
        this.material.specularColor = new Color3(0.4, 0.4, 0.4);
        this.material.emissiveColor = new Color3(0.0, 0.0, 0.0);
        this.material.ambientColor = new Color3(0.15, 0.15, 0.15);
        this.mesh.material = this.material;
        // Создание физического тела
        this.physicsAggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.BOX, {mass:1});
        // Использование metadata, присваивание конкретному сегменту id
        this.mesh.metadata = {id};
        this.dustPool = dustPool;
        // Массски коллизий
        const shape = this.physicsAggregate.shape;
        shape.filterMembershipMask = 0b0001;  // Группа сегментов
        shape.filterCollideMask = 0b0110; 
        // Пул осколков
        this.fragmentsPool = new FragmentsPool(this.scene, color);
    }
    
    // Работа с коллизиями
    createCollisions(groundBody: PhysicsBody): void{
        // console.log('Начало работы коллизий');
        const physicsBody = this.getPhysicsBody();
        physicsBody.setCollisionCallbackEnabled(true);
        const observable = physicsBody.getCollisionObservable();
        const observer = observable.add((collisionEvent)=>{
            if (this.destructionFlag) {
                return;  // Если сегмент разрушен — не создаём пыль
            }

        // Запускаем пыль в точке столкновения
        if (collisionEvent.point) {
            // console.log("[snakeSegment] вызываем пыль в точке столкновения: ", collisionEvent.point)
            this.dustPool.emitDust(collisionEvent.point);
        }
        
        // Определяем второе тело
        const otherBody = collisionEvent.collider === physicsBody 
            ? collisionEvent.collidedAgainst 
            : collisionEvent.collider;
        
        // Разрушение только при ударе о пол
        if (otherBody === groundBody && collisionEvent.impulse > 5 && !this.destructionFlag) {

            const position = this.mesh.position;

            this.dustPool.emitDust(position);
            this.fragmentsPool.activate(position, collisionEvent.impulse);
            this.mesh.setEnabled(false);
            this.destructionFlag = true;
            observer.remove();
            console.log("Разрушение")
        } 
    });
}
    // Возврат меша
    getMesh(): Mesh{
        return this.mesh;
    }
    // Возврат физического тела
    getPhysicsBody(): PhysicsBody{
        return this.physicsAggregate.body;
    }

    destroy(): void {
    const position = this.mesh.position;
    this.dustPool.emitDust(position);
    this.fragmentsPool.activate(position, 10);  
    this.mesh.setEnabled(false);
    this.destructionFlag = true;
}
    
}

