import { Color4, ParticleSystem, Scene, Texture, Vector3 } from "@babylonjs/core";

export default class DustPool {
    // Пул систем частиц для переиспользования
    private pool: ParticleSystem[] = [];
    private scene: Scene;

    // Индекс для кругового поиска свободной системы
    private currentIndex: number = 0;

    // Массив для отслеживания времени последнего использования каждой системы (в миллисекундах)
    private lastUsedTimes: number[] = [];

    // Кулдаун: минимальное количество времени (в миллисекундах) между повторным использованием одной системы
    private readonly TIME_COOLDOWN = 166; // ~10 кадров при 60 FPS

    constructor(scene: Scene, poolSize: number) {
        this.scene = scene;
        
        // Инициализируем массив времен с очень маленьким значением, чтобы все системы были доступны сразу
        this.lastUsedTimes = new Array(poolSize).fill(0);

        for (let i = 0; i < poolSize; i++) {
            const system = new ParticleSystem('dustParticle', 100, this.scene);

            // Настройка текстуры и режима смешивания (STANDARD для реалистичной пыли без пересвета)
            system.particleTexture = new Texture('/textures/RocketSmokeAlpha.png', this.scene);
            system.blendMode = ParticleSystem.BLENDMODE_STANDARD;

            // Параметры размера частиц
            system.minSize = 0.8;
            system.maxSize = 1.2;

            // Параметры скорости разлёта
            system.minEmitPower = 4;
            system.maxEmitPower = 6;

            // Частота эмиттации (частиц в секунду)
            system.emitRate = 80;

            // Время жизни частиц (короткое для пыли)
            system.minLifeTime = 0.05;
            system.maxLifeTime = 0.1;

            // Цвета частиц (серая пыль с градиентом)
            system.color1 = new Color4(0.7, 0.7, 0.7, 1.0);
            system.color2 = new Color4(0.5, 0.5, 0.5, 1.0);
            system.colorDead = new Color4(0.3, 0.3, 0.3, 0.0);

            // Направление разлёта (вверх и в стороны)
            system.direction1 = new Vector3(-1, 1, -1);
            system.direction2 = new Vector3(1, 2, 1);

            // Автоматическая остановка системы через 100мс (равно maxLifeTime)
            // Это гарантирует, что эмиттация прекратится и частицы умрут
            system.targetStopDuration = 0.1;
            system.disposeOnStop = false; // Не удалять систему после остановки для переиспользования

            this.pool.push(system);
        }
    }

    // Запуск эффекта пыли в указанной точке
    public emitDust(position: Vector3): void {
        const currentTime = Date.now();
        let attempts = 0;
        let system: ParticleSystem | undefined;

        // Круговой поиск свободной системы с проверкой кулдауна
        while (attempts < this.pool.length) {
            const idx = this.currentIndex;
            this.currentIndex = (this.currentIndex + 1) % this.pool.length;
            attempts++;

            // Проверяем, прошло ли достаточно времени с последнего использования
            if (currentTime - this.lastUsedTimes[idx] >= this.TIME_COOLDOWN) {
                system = this.pool[idx];
                this.lastUsedTimes[idx] = currentTime; // Обновляем время использования
                break;
            }
        }

        // Если все системы "горячие" (не прошли кулдаун), пропускаем кадр
        if (!system) return;

        // Жесткий сброс системы: остановка, очистка, установка новой позиции и запуск
        system.stop();
        system.reset();
        system.emitter.copyFromFloats(position.x, position.y, position.z);
        system.start();
    }
}