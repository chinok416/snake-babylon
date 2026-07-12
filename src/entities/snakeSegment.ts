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
import type DustPool from "../systems/dustPool";
import FragmentsPool from "../systems/fragmentsPool";

export class SnakeSegment {
    private scene: Scene
    private mesh: Mesh;
    private material: StandardMaterial;
    private physicsAggregate: PhysicsAggregate;
    private destructionFlag: boolean = false; // Флаг разрушения сегмента
    private dustPool: DustPool;
    private fragmentsPool: FragmentsPool;

    constructor(scene: Scene, position: Vector3, color: Color3, id: string, dustPool: DustPool) {
        this.scene = scene
        
        // Создание меша (параллелепипед)
        this.mesh = MeshBuilder.CreateBox('SnakeBox', { width: 4, height: 2, depth: 1.5 }, scene);
        this.mesh.position = position;
        
        // Создание материала и настройка цветов
        this.material = new StandardMaterial('snakeMaterial', scene);
        this.material.diffuseColor = color;
        this.material.specularColor = new Color3(0.4, 0.4, 0.4);
        this.material.emissiveColor = new Color3(0.0, 0.0, 0.0);
        this.material.ambientColor = new Color3(0.15, 0.15, 0.15);
        this.mesh.material = this.material;
        
        // Создание физического тела
        this.physicsAggregate = new PhysicsAggregate(this.mesh, PhysicsShapeType.BOX, { mass: 1 });
        
        // Использование metadata для хранения идентификатора сегмента
        this.mesh.metadata = { id };
        this.dustPool = dustPool;
        
        // Настройка масок коллизий
        const shape = this.physicsAggregate.shape;
        shape.filterMembershipMask = 0b0001;  // Группа сегментов змейки
        shape.filterCollideMask = 0b0110;     // Столкновение с полом (0b0010) и стенами (0b0100)
        
        // Создание пула осколков для эффекта разрушения
        this.fragmentsPool = new FragmentsPool(this.scene, color);
    }

    // Настройка обработки коллизий для сегмента
    createCollisions(groundBody: PhysicsBody): void {
        const physicsBody = this.getPhysicsBody();
        physicsBody.setCollisionCallbackEnabled(true);
        const observable = physicsBody.getCollisionObservable();
        
        // Переменная для отслеживания последней позиции создания пыли
        let lastDustPosition: Vector3 | null = null;
        
        // Минимальное расстояние между эффектами пыли (в единицах сцены)
        // Предотвращает спам частицами при постоянном контакте
        const minDistanceForDust = 2.0;
        
        const observer = observable.add((collisionEvent) => {
            // Если сегмент уже разрушен, игнорируем коллизии
            if (this.destructionFlag) return;
            
            // Определяем второе тело в коллизии
            const otherBody = collisionEvent.collider === physicsBody 
                ? collisionEvent.collidedAgainst 
                : collisionEvent.collider;
            
            const isGround = otherBody === groundBody;
            
            // Создание пыли при любом контакте с землей
            if (isGround) {
                // Используем точку контакта если доступна, иначе позицию сегмента
                const dustPosition = collisionEvent.point || this.mesh.position;
                
                // Проверяем, достаточно ли сместился сегмент с последнего создания пыли
                if (!lastDustPosition || Vector3.Distance(dustPosition, lastDustPosition) > minDistanceForDust) {
                    this.dustPool.emitDust(dustPosition);
                    lastDustPosition = dustPosition.clone(); // Сохраняем позицию для следующего сравнения
                }
            }
            
            // Разрушение сегмента только при сильном ударе о землю (импульс > 5)
            if (isGround && collisionEvent.impulse > 5 && !this.destructionFlag) {
                this.fragmentsPool.activate(this.mesh.position, collisionEvent.impulse);
                this.mesh.setEnabled(false);
                this.destructionFlag = true;
                observer.remove(); // Отписываемся от коллизий после разрушения
                console.log("Разрушение");
            } 
        });
    }

    // Возврат меша сегмента
    getMesh(): Mesh {
        return this.mesh;
    }
    
    // Возврат физического тела сегмента
    getPhysicsBody(): PhysicsBody {
        return this.physicsAggregate.body;
    }
    
    // Метод программного уничтожения сегмента (например, при попадании луча)
    destroy(): void {
        const position = this.mesh.position;
        this.dustPool.emitDust(position);
        this.fragmentsPool.activate(position, 10);
        this.mesh.setEnabled(false);
        this.destructionFlag = true;
    }
}