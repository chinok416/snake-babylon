import { 
    Color3, 
    MeshBuilder, 
    PhysicsAggregate,  
    PhysicsBody,  
    PhysicsShapeType, 
    StandardMaterial, 
    Vector3, 
    type Mesh, 
    type Scene 
} from "@babylonjs/core";



export default class FragmentsPool{
    private mesh: Mesh[];
    private bodies: PhysicsBody[];
    private scene: Scene;
    // private material: StandardMaterial;

    constructor(scene: Scene, color: Color3) {
        this.scene = scene;
        this.mesh = [];
        this.bodies = [];

        for (let num=0; num<6; num++){
            // Создание фрагмента
            const snakeFragment = MeshBuilder.CreateBox('snakeFragment', {width:2, height:1, depth:1.5}, this.scene);
            // Позиционирование осколков случайным образом относительно сегмента змейки
            snakeFragment.position = new Vector3(0, -100, 0);
            // Материал фрагмента
            const snakeFragmentMaterial = new StandardMaterial('snakeFragmentMaterial', this.scene);
            snakeFragmentMaterial.diffuseColor = color;
            snakeFragmentMaterial.specularColor = new Color3(0.4, 0.4, 0.4);
            snakeFragmentMaterial.emissiveColor = new Color3(0.0, 0.0, 0.0);
            snakeFragmentMaterial.ambientColor = new Color3(0.15, 0.15, 0.15);
            snakeFragment.material = snakeFragmentMaterial;
            snakeFragment.setEnabled(false);
        
            // Создание физики фрагмента
            const snakeFragmentPhysicsBody = new PhysicsAggregate(snakeFragment, PhysicsShapeType.BOX, {mass: 1})
            const fragmentShape = snakeFragmentPhysicsBody.shape;
            fragmentShape.filterMembershipMask = 0b0000;  
            fragmentShape.filterCollideMask = 0b0010;

            this.mesh.push(snakeFragment);
            this.bodies.push(snakeFragmentPhysicsBody.body);
        }
    }

    // активация осколков
    // активация осколков
activate(position: Vector3, impulseStreight: number = 10): void{
    this.mesh.forEach((fragment, index) => {
        const safeY = Math.max(position.y, 1) + 2;
        const newPosition = new Vector3(
            position.x + (Math.random() * 4 - 2),
            safeY,
            position.z + (Math.random() * 4 - 2),
        );
        // Перемещаем меш
        fragment.position = newPosition;
        //  ПЕРЕСОЗДАЁМ физическое тело в новой позиции
        const oldBody = this.bodies[index];
        const newPhysicsAggregate = new PhysicsAggregate(fragment, PhysicsShapeType.BOX, {mass: 1});
        this.bodies[index] = newPhysicsAggregate.body;
        //  Настраиваем маски коллизий
        const fragmentShape = newPhysicsAggregate.shape;
        fragmentShape.filterMembershipMask = 0b0000;
        fragmentShape.filterCollideMask = 0b0010;
        //  Показываем
        fragment.setEnabled(true);
        //  Устанавливаем скорость разлёта
        const velocityVector = new Vector3(
            Math.random() * 20 - 10,  
            Math.random() * 10 + 5,   
            Math.random() * 20 - 10
        );
        newPhysicsAggregate.body.setLinearVelocity(velocityVector);
    })
}

    // Деактивация осколков
    deactivate(){
        this.mesh.forEach((fragment, index) => {
            fragment.setEnabled(false);

            // Сбрасываем скорость
            const body = this.bodies[index];
            body.setLinearVelocity(Vector3.Zero());
            body.setAngularVelocity(Vector3.Zero());
        })
    }


}