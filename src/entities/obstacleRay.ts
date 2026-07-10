import { Color3, Ray, RayHelper, Scene, Vector3 } from "@babylonjs/core";
import type { SnakeSegment } from "./snakeSegment";
import type DustPool from "./dustPool";


export default class ObstacleRay{

    private ray: Ray; 
    private rayHelper: RayHelper;
    private scene: Scene;
    private dustPool: DustPool;

    // Создание луча
    constructor(scene: Scene, origin: Vector3, direction: Vector3, length: number, dustPool: DustPool){
        this.scene = scene;
        this.ray = new Ray(origin, direction, length);
        this.rayHelper = RayHelper.CreateAndShow(this.ray, this.scene, new Color3(1, 0, 0));
        this.dustPool = dustPool;
    }
    // Проверка на пересечение
    startChecking(segments: SnakeSegment[]){
        this.scene.onBeforeRenderObservable.add(()=>{
            for (let segment of segments) {
                const result = this.ray.intersectsMesh(segment.getMesh(), false);
                if (result.hit) {
                    console.log("[obstacleRay] Луч поппал в сегмент")
                    this.dustPool.emitDust(segment.getMesh().position);
                    segment.destroy();
                    segment.getMesh().setEnabled(false);

                    break;
                }
            }
        })
    }
}