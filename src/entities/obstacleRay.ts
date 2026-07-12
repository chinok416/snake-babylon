// File: obstacleRay.ts

import { Color3, Ray, RayHelper, Scene, Vector3 } from "@babylonjs/core";
import type { SnakeSegment } from "./snakeSegment"; // Тип для сегмента
import type DustPool from "./dustPool";            // Тип для пула пыли

export default class ObstacleRay{
    private ray: Ray; 
    private rayHelper: RayHelper; // Визуализация луча (для отладки)
    private scene: Scene;
    private dustPool: DustPool;

    // Создание луча
    constructor(scene: Scene, origin: Vector3, direction: Vector3, length: number, dustPool: DustPool){
        this.scene = scene;
        // Создаём луч: начинается в origin, направлен в direction, длиной length
        this.ray = new Ray(origin, direction, length);
        
        // Создаём визуализатор луча (красная линия)
        this.rayHelper = RayHelper.CreateAndShow(this.ray, this.scene, new Color3(1, 0, 0));
        
        this.dustPool = dustPool;
    }

    // Проверка на пересечение с сегментами змейки
    startChecking(segments: SnakeSegment[]){
        // Подписываемся на событие "перед рендерингом" - будет вызываться каждый кадр
        this.scene.onBeforeRenderObservable.add(()=>{
            // Проходим по всем сегментам из переданного массива
            for (let segment of segments) {
                // Проверяем флаг разрушения. Если сегмент уже разрушен,
                // не пытаемся его снова проверять или разрушать.
                if (segment['destructionFlag'] === true) {
                    continue; // Переходим к следующему сегменту в цикле
                }
                // Проверяем, пересекается ли луч с мешем сегмента
                const result = this.ray.intersectsMesh(segment.getMesh(), false);
                
                if (result.hit) { // Если пересечение произошло
                    console.log("[obstacleRay] Луч поппал в сегмент")
                    // Вызываем разрушение сегмента (включает пыль, осколки, скрытие, флаг)
                    segment.destroy();
                    break; // Прерываем цикл, чтобы не обрабатывать остальные сегменты в этом кадре
                }
            }
        })
    }
}