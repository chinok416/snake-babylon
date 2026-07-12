import { Color4, ParticleSystem, Scene, Texture, Vector3 } from "@babylonjs/core";

export default class DustPool {
    // Массив(пул) частиц
    private pool: ParticleSystem[] = [];
    private scene: Scene;
    private lastEmitTime: number = 0;  
    private emitCooldown: number = 100;  // Минимум 100мс между вызовами (увеличено)
    private isEmitting: boolean = false; // Флаг для предотвращения частых вызовов

    constructor(scene: Scene, poolSize: number) {
        this.scene = scene;
        for (let i = 0; i < poolSize; i++) {
            const myParticleSystem = new ParticleSystem('dustParticle', 100, this.scene);
            // Текстура частиц
            myParticleSystem.particleTexture = new Texture('/textures/RocketSmokeAlpha.png', this.scene);
            myParticleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;
            // Временное положение частиц
            myParticleSystem.emitter = new Vector3(0, 0, 0);
            // Размер частиц (уменьшены)
            myParticleSystem.minSize = 0.8;
            myParticleSystem.maxSize = 1.2;
            // Скорость частиц (увеличены)
            myParticleSystem.minEmitPower = 4;
            myParticleSystem.maxEmitPower = 6;
            // Вращение частиц
            myParticleSystem.minAngularSpeed = 0;
            myParticleSystem.maxAngularSpeed = Math.PI;
            // Количество частиц (уменьшено)
            myParticleSystem.emitRate = 80;
            // Время жизни (уменьшено)
            myParticleSystem.minLifeTime = 0.05;
            myParticleSystem.maxLifeTime = 0.1;
            // Цвета частиц (серая пыль)
            myParticleSystem.color1 = new Color4(0.7, 0.7, 0.7, 1.0);  // Светло-серый
            myParticleSystem.color2 = new Color4(0.5, 0.5, 0.5, 1.0);  // Серый
            myParticleSystem.colorDead = new Color4(0.3, 0.3, 0.3, 0.0); // Тёмно-серый, прозрачный
             // Направление разлёта (вверх и в стороны)
            myParticleSystem.direction1 = new Vector3(-1, 1, -1);
            myParticleSystem.direction2 = new Vector3(1, 2, 1);
            // Добавление в пул
            this.pool.push(myParticleSystem)
        }
    }

    getAvailable(): ParticleSystem | null {
        // return this.pool.find(s => !s.isAlive()) || null;
        // const busyCount = this.pool.filter(s => s.isAlive() ).length;
        for (let system of this.pool){
            // Проверяем, не используется ли система (isAlive может быть неточным при stop/reset)
            // Лучше полагаться на наш флаг isEmitting и cooldown
            // Но оставим проверку на всякий случай, если флаг не сработает
            if (!system.isAlive()) {
                return system;
            } 
        }
        return null;
    }

    // Запустить пыль в точке
    emitDust(position: Vector3):void {
        const now = Date.now();
        // ← Проверка: не слишком ли часто вызываем?
        if (now - this.lastEmitTime < this.emitCooldown || this.isEmitting) {
            return;  // Пропускаем вызов, если кулдаун активен или уже запущена система
        }
        this.lastEmitTime = now;
        this.isEmitting = true; // Устанавливаем флаг, чтобы заблокировать новые вызовы

        const system = this.getAvailable()
        if (system) {
            system.emitter = position;
            system.reset();
            system.start();

            // Проблема была в stop/reset внутри setTimeout
            // Новый подход: ждём, пока частицы исчезнут, и снимаем флаг
            // Увеличиваем таймаут, чтобы он был больше maxLifeTime
            setTimeout(() => {
                // system.stop(); // Не вызываем stop, чтобы избежать зависания
                // Просто сбрасываем флаг, чтобы разрешить новый вызов
                this.isEmitting = false;
                // system.reset(); // Не вызываем reset сразу после stop, это может вызвать конфликт
                // Вместо этого, reset вызывается перед start в следующем вызове emitDust
            }, 150); // 150 мс > maxLifeTime (100 мс), должно быть достаточно
        } else {
            // Если не нашли доступную систему, всё равно снимаем флаг, чтобы не застрять
            this.isEmitting = false;
        }
    }
}