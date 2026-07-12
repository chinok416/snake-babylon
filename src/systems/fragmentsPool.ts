import {
    Color3,
    Mesh,
    MeshBuilder,
    PhysicsAggregate,
    PhysicsBody,
    PhysicsShapeType,
    Scene,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";

export default class FragmentsPool {
    private meshes: Mesh[];
    private aggregates: PhysicsAggregate[]; // Храним агрегаты
    private scene: Scene;
    private activeFlags: boolean[]; // Отслеживание активности осколков

    constructor(scene: Scene, color: Color3) {
        this.scene = scene;
        this.meshes = [];
        this.aggregates = [];
        this.activeFlags = [];

        for (let num = 0; num < 6; num++) {
            // Создаём меш
            const fragmentMesh = MeshBuilder.CreateBox('snakeFragment', { width: 2, height: 1, depth: 1.5 }, this.scene);
            // Стартовая позиция — на уровне пола (Y=0), чтобы физика не тянула его вниз
            fragmentMesh.position = new Vector3(0, 0, 0);

            // Настраиваем материал
            const fragmentMaterial = new StandardMaterial('snakeFragmentMaterial', this.scene);
            fragmentMaterial.diffuseColor = color;
            fragmentMaterial.specularColor = new Color3(0.4, 0.4, 0.4);
            fragmentMaterial.emissiveColor = new Color3(0.0, 0.0, 0.0);
            fragmentMaterial.ambientColor = new Color3(0.15, 0.15, 0.15);
            fragmentMesh.material = fragmentMaterial;

            // Скрываем по умолчанию
            fragmentMesh.setEnabled(false);

            // Создаём физический агрегат (тело + форма) — ОДИН РАЗ
            const fragmentAggregate = new PhysicsAggregate(fragmentMesh, PhysicsShapeType.BOX, { mass: 1 });

            // Настраиваем маски коллизий ОДИН РАЗ
            const shape = fragmentAggregate.shape;
            shape.filterMembershipMask = 0b0001;  // Группа "осколки"
            shape.filterCollideMask = 0b0010;    // Столкнётся с полом (группа 0b0010)

            // Сохраняем
            this.meshes.push(fragmentMesh);
            this.aggregates.push(fragmentAggregate);
            this.activeFlags.push(false); // Изначально все осколки неактивны
        }
    }

    // Активация осколков: только перемещаем меш и включаем его
    activate(position: Vector3, impulseStrength: number = 10): void {
        // Находим неактивные осколки и активируем их
        for (let i = 0; i < this.meshes.length; i++) {
            if (!this.activeFlags[i]) {
                const fragmentMesh = this.meshes[i];
                
                // Вычисляем безопасную Y-позицию
                const safeY = Math.max(position.y, 1) + 2;

                // Вычисляем новую позицию
                const newPosition = new Vector3(
                    position.x + (Math.random() * 4 - 2),
                    safeY,
                    position.z + (Math.random() * 4 - 2)
                );

                // --- КЛЮЧЕВОЙ ШАГ ---
                // 1. Перемещаем меш в новую позицию
                fragmentMesh.position = newPosition;

                // 2. Получаем старое тело (созданное в конструкторе)
                const body = this.aggregates[i].body;

                // 3. Сбрасываем скорость
                body.setLinearVelocity(Vector3.Zero());
                body.setAngularVelocity(Vector3.Zero());

                // 4. Показываем меш — теперь он будет двигаться вместе с телом
                fragmentMesh.setEnabled(true);

                // 5. Применяем скорость разлёта (Y всегда > 0 — вверх!)
                const velocityVector = new Vector3(
                    Math.random() * 20 - 10,
                    Math.random() * 10 + 5,  // [5, 15] — гарантированно вверх
                    Math.random() * 20 - 10
                );
                body.setLinearVelocity(velocityVector);
                
                // Отмечаем осколок как активный
                this.activeFlags[i] = true;
                // --- КОНЕЦ КЛЮЧЕВОГО ШАГА ---
            }
        }
    }

    // Деактивация конкретного осколка
    private deactivateFragment(index: number): void {
        if (index >= 0 && index < this.meshes.length) {
            const fragmentMesh = this.meshes[index];
            fragmentMesh.setEnabled(false);
            
            const body = this.aggregates[index].body;
            body.setLinearVelocity(Vector3.Zero());
            body.setAngularVelocity(Vector3.Zero());
            
            this.activeFlags[index] = false;
        }
    }

    // Деактивация всех осколков
    deactivate(): void {
        for (let i = 0; i < this.meshes.length; i++) {
            this.deactivateFragment(i);
        }
    }

    // Метод для периодической проверки и деактивации осколков, которые остановились
    update(): void {
        for (let i = 0; i < this.meshes.length; i++) {
            if (this.activeFlags[i]) {
                const body = this.aggregates[i].body;
                // Проверяем, движется ли осколок (маленькая скорость)
                const velocity = body.getLinearVelocity();
                if (velocity.lengthSquared() < 0.01) { // Порог остановки
                    // Через некоторое время после остановки деактивируем осколок
                    setTimeout(() => {
                        this.deactivateFragment(i);
                    }, 2000); // Деактивировать через 2 секунды после остановки
                }
            }
        }
    }

    dispose(): void {
        this.aggregates.forEach(agg => agg.dispose());
        this.meshes = [];
        this.aggregates = [];
        this.activeFlags = [];
    }
}