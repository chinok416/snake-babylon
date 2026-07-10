// Финишная зона: зелёный полупрозрачный куб и детекция пересечения с сегментами
import { Color3, Material, MeshBuilder, PhysicsAggregate, PhysicsShape, PhysicsShapeType, StandardMaterial, Texture, Vector3, type Mesh, type Scene } from "@babylonjs/core";

export default class FinishZone{

    private mesh: Mesh;
    private material: StandardMaterial;
    private physicsAggregate: PhysicsAggregate;

    constructor(scene: Scene) {
        // Финишный куб
        this.mesh =  MeshBuilder.CreateBox('finishBox', {width:6, height:6, depth:6}, scene);
        this.mesh.position = new Vector3(21, 2, 21);
        this.material = new StandardMaterial('finishBoxMaterial', scene);
        this.material.diffuseColor = new Color3(0.82, 0.94, 0.75);
        this.material.specularColor = new Color3(0.4, 0.4, 0.4);
        this.material.emissiveColor = new Color3(0.0, 0.0, 0.0);
        this.material.ambientColor = new Color3(0.15, 0.15, 0.15);
        this.material.alpha = 0.5;
        this.mesh.material = this.material;
        this.physicsAggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.BOX, {mass:0}, scene);

        const shape = this.physicsAggregate.shape;
        shape.filterMembershipMask = 0b100;
        shape.filterCollideMask = 0b001;
    }
    // Коллизия на финиш
    createCollisions(){
        let finishFlag = false;
        const physicsBody = this.physicsAggregate.body;
        physicsBody.setCollisionCallbackEnabled(true);
        const observable = physicsBody.getCollisionObservable();
        const observer = observable.add((collisiumEvent)=>{
            if (collisiumEvent.impulse > 0 && finishFlag === false) {
                finishFlag = true;
                alert('Поздравляю! Вы достигли финиша')
            }

        })
    }

}


