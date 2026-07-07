// Один сегмент змейки: меш, физическое тело, материал и metadata

import { Color3, Mesh, MeshBuilder, PhysicsAggregate, PhysicsBody, PhysicsShapeType, Scene, StandardMaterial, Vector3 } from "@babylonjs/core"

class SnakeSegment{
    private mesh: Mesh;
    private material: StandardMaterial;
    private physicsAggregate: PhysicsAggregate;

    constructor(scene: Scene, position: Vector3, color: Color3, id:string){
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

        const shape = this.physicsAggregate.shape;
        shape.filterMembershipMask = 0b0001;  // Группа сегментов
        shape.filterCollideMask = 0b0010; 

    }

    
    

    getMesh(): Mesh{
        return this.mesh;
    }
    getPhysicsBody(): PhysicsBody{
        return this.physicsAggregate.body
    }

    
}

export {SnakeSegment}