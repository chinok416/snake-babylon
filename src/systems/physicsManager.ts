// Инициализация физического движка Havok и настройка масок коллизий

import HavokPhysics from '@babylonjs/havok';
import { HavokPlugin, Scene, Vector3 } from '@babylonjs/core';

export class PhysicsManager {
    async init(scene: Scene) {
        try{
            const havokInstance = await HavokPhysics();
            const havokPlugin = new HavokPlugin(true, havokInstance);
            scene.enablePhysics(new Vector3(0, -6, 0), havokPlugin);
        } catch (err) {
            console.log('Ошибка подключения Havok', err)
            throw err
        }
    }
}