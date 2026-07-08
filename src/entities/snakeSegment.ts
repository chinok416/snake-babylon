// Один сегмент змейки: меш, физическое тело, материал и metadata

import { 
    Color3, 
    Material,
    Mesh, 
    MeshBuilder, 
    PhysicsAggregate, 
    PhysicsBody, 
    PhysicsShapeType, 
    Scene, 
    StandardMaterial, 
    Vector3 
} from "@babylonjs/core"

export class SnakeSegment{
    private scene: Scene
    private mesh: Mesh;
    private material: StandardMaterial;
    private physicsAggregate: PhysicsAggregate;
    // Массивы мешей и физических тел осколков
    private fragmentsMesh: Mesh[];
    private fragmentsPhysics: PhysicsBody[];
    // флаг разрушения сегмента
    private destructionFlag: boolean = false;

    constructor(scene: Scene, position: Vector3, color: Color3, id:string){
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


        // Массив осколков
        this.fragmentsMesh = [];
        // Массив физических тел осколков
        this.fragmentsPhysics = [];


        const shape = this.physicsAggregate.shape;
        shape.filterMembershipMask = 0b0001;  // Группа сегментов
        shape.filterCollideMask = 0b0010; 

    }
    // Создание фрагментов в момент уничтожения сегмента змейки
    createFragments(): Mesh[]{
        let meshArr = [];
        let position = this.mesh.position;
        for (let num=0; num<6; num++){
            // Создание фрагмента
            const snakeFragment = MeshBuilder.CreateBox('snakeFragment', {width:2, height:1, depth:1.5}, this.scene);
            // Позиционирование осколков случайным образом относительно сегмента змейки
            snakeFragment.position = new Vector3(
                position.x + (Math.random() * 4 - 2),
                position.y + (Math.random() * 2),
                position.z + (Math.random() * 4 - 2)
            )
            // Материал фрагмента
            const snakeFragmentMaterial = new StandardMaterial('snakeFragmentMaterial', this.scene);
            snakeFragmentMaterial.diffuseColor = this.material.diffuseColor;
            snakeFragmentMaterial.specularColor = new Color3(0.4, 0.4, 0.4);
            snakeFragmentMaterial.emissiveColor = new Color3(0.0, 0.0, 0.0);
            snakeFragmentMaterial.ambientColor = new Color3(0.15, 0.15, 0.15);
            snakeFragment.material = snakeFragmentMaterial;
            snakeFragment.setEnabled(false);

            // Создание физики фрагмента
            const snakeFragmentPhysicsBody = new PhysicsAggregate(snakeFragment, PhysicsShapeType.BOX, {mass: 1})
            this.fragmentsPhysics.push(snakeFragmentPhysicsBody.body);
            meshArr.push(snakeFragment);
        }

        // Скрытие семента змейки
        this.mesh.setEnabled(false);

        // Отображение фрагментов
            meshArr.forEach((fragment=>{
                fragment.setEnabled(true)
        }))

        // Создание импульсов для осколков
        this.fragmentsPhysics.forEach((item, index)=>{
            const fragmentMesh = meshArr[index];
            const fragmentMeshLocation = fragmentMesh.position;
            const impulseVector = new Vector3(
                Math.random() * 20 - 10,  
                Math.random() * 10 + 5,   
                Math.random() * 20 - 10
            )
            item.applyImpulse(impulseVector, fragmentMeshLocation);
        })
        return meshArr;
    }

    // Работа с коллизиями
    createCollisions(): void{
        console.log('Начало работы коллизий')
        const physicsBody = this.getPhysicsBody();
        physicsBody.setCollisionCallbackEnabled(true);
        const observable = physicsBody.getCollisionObservable();
        const observer = observable.add((collisionEvent)=>{
            console.log('IMPULSE', collisionEvent.impulse);

            if (collisionEvent.impulse > 3 && !this.destructionFlag) {
                this.fragmentsMesh = this.createFragments();
                this.destructionFlag = true
                observer.remove();
                console.log("СИЛЬНАЫЙ УДАР - РАЗРУШЕНИЕ");
            }
        })
    }
    
    // Возврат меша
    getMesh(): Mesh{
        return this.mesh;
    }
    // Возврат физического тела
    getPhysicsBody(): PhysicsBody{
        return this.physicsAggregate.body;
    }

    
}

