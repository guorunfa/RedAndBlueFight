import { _decorator, Component, Node, Vec3, instantiate, ParticleSystem, CCObject, tween } from 'cc';
import Tools from '../Tools';
import { TEAM } from './GameManager';
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
        setTimeout(() => {
            effect.destroy();
        }, partic.duration * 1000);
    }

    public static playBoom_plane(scale: Vec3[], team: TEAM) {
        let boomPlane = instantiate(PrefabManager.prefab_effect_boom_plane);
        boomPlane.setParent(this.effectParent);
        let startPos, targetPos, angle: Vec3;
        if (team == TEAM.RED) {
            startPos = new Vec3(-250, 1.4, 0);
            targetPos = new Vec3(250, 1.4, 0);
            angle = new Vec3(0, 0, 0);
        } else {
            startPos = new Vec3(250, 1.4, 0);
            targetPos = new Vec3(-250, 1.4, 0);
            angle = new Vec3(0, 180, 0);
        }
        boomPlane.setPosition(startPos);
        boomPlane.eulerAngles = angle;
        tween(boomPlane)
            .to(4, { position: targetPos })
            .call(() => {
                let count = 10;
                let total = 0;
                let interval = setInterval(() => {
                    total++;
                    let effect = instantiate(PrefabManager.prefab_effect_boom_3);
                    effect.setParent(this.effectParent);
                    let posX = Tools.getRandomNumContact(scale[0].x, scale[1].x);
                    let posZ = Tools.getRandomNumContact(scale[0].z, scale[1].z);
                    effect.setPosition(new Vec3(posX, 20, posZ));
                    let partic = effect.getComponent(ParticleSystem);
                    partic.play();
                    setTimeout(() => {
                        effect.destroy();
                    }, partic.duration * 1000);
                    if (total >= count) {
                        clearInterval(interval);
                        return;
                    }
                }, 1000)
            })
            .start();
    }
}


