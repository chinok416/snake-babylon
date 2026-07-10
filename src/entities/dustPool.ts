import {  Color4, ParticleSystem, Scene, Texture, Vector3 } from "@babylonjs/core"




export default class DustPool {

    // Массив(пул) частиц
    private pool: ParticleSystem[] = [];
    private scene: Scene;
    private lastEmitTime: number = 0;  
    private emitCooldown: number = 100;  // Минимум 200мс между вызовами

    constructor (scene: Scene, poolSize: number) {
        this.scene = scene;
        this.pool = []

        for (let i=0; i < poolSize; i++){
            const myParticleSystem = new ParticleSystem('dustPerticle', 100, this.scene);
            // Текстура частиц
            myParticleSystem.particleTexture = new Texture('/textures/RocketSmokeAlpha.png', this.scene);
            // Временное положение частиц
            myParticleSystem.emitter = new Vector3(0, 0, 0);
            // Размер частиц
            myParticleSystem.minSize = 0.2;
            myParticleSystem.maxSize = 0.8;
            // Скорость частиц
            myParticleSystem.minEmitPower = 0.5;
            myParticleSystem.maxEmitPower = 2;
            // Вращение частиц
            myParticleSystem.minAngularSpeed = 0;
            myParticleSystem.maxAngularSpeed = Math.PI;
            // Количество частиц
            myParticleSystem.emitRate = 200;
            // Время жизни
            myParticleSystem.minLifeTime = 0.3;
            myParticleSystem.maxLifeTime = 0.6;
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
        if (now - this.lastEmitTime < this.emitCooldown) {
            return;  // Пропускаем вызов
        }
        this.lastEmitTime = now;
        
        const system = this.getAvailable()
        if (system) {
            system.emitter = position;
            system.reset();
            system.start();
            setTimeout(() => {
                system.stop();
                // Принудительный сброс через 500мс
                setTimeout(() => {
                    system.reset();
                }, 300);
            }, 50);
        } 
    }
    
};