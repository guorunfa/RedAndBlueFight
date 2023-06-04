import { _decorator, Component, Node, Vec3, instantiate, ParticleSystem } from 'cc';
import { PrefabManager } from './PrefabManager';
const { ccclass, property } = _decorator;

export enum EffectType {
    BOOM_1,
    BOOM_2,
    BOOM_3,
    FIRE,
    FIRE_BLUE,
    FIRE_RED
}

@ccclass('EffectManager')
export class EffectManager {
    public static effectParent: Node;
    public static playEfect(type: EffectType, pos: Vec3) {
        let effect: Node;
        switch (type) {
            case EffectType.BOOM_1:
                effect = instantiate(PrefabManager.prefab_effect_boom_1);
                break;
            case EffectType.BOOM_2:
                effect = instantiate(PrefabManager.prefab_effect_boom_2);
                break;
            case EffectType.BOOM_3:
                effect = instantiate(PrefabManager.prefab_effect_boom_3);
                break;
            case EffectType.FIRE:
                effect = instantiate(PrefabManager.prefab_effect_fire);
                break;
            case EffectType.FIRE_BLUE:
                effect = instantiate(PrefabManager.prefab_effect_fire_blue);
                break;
            case EffectType.FIRE_RED:
                effect = instantiate(PrefabManager.prefab_effect_fire_red);
                break;
        }
        effect.setParent(this.effectParent);
        effect.setPosition(pos);
        let partic = effect.getComponent(ParticleSystem);
        partic.play();
        console.log("播放特效", partic.duration);
        setTimeout(() => {
            console.log("特效销毁");
            effect.destroy();
        }, partic.duration * 1000);
    }
}


