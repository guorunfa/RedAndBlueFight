import { _decorator, Component, Node, Vec3, instantiate, ParticleSystem } from 'cc';
import { PoolManager, POOL_TYPE } from './PoolManager';
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

export class EffectManager {
    private static _instance: EffectManager = null;
    private _effectParent: Node = null;
    private _poolManager: PoolManager = null;

    public static getInstance() {
        if (!this._instance) {
            this._instance = new EffectManager();
        }
        return this._instance;
    }

    init(effectParent: Node) {
        this._poolManager = PoolManager.getInstance();
        this._effectParent = effectParent;
        this._effectParent.removeAllChildren();
    }

    playEfect(type: EffectType, pos: Vec3) {
        let effect: Node;
        let poolType: POOL_TYPE;
        switch (type) {
            case EffectType.BOOM_1:
                poolType = POOL_TYPE.EFFECT_BOOM_1;
                break;
            case EffectType.BOOM_2:
                poolType = POOL_TYPE.EFFECT_BOOM_2;
                break;
            case EffectType.BOOM_3:
                poolType = POOL_TYPE.EFFECT_BOOM_3;
                break;
            case EffectType.FIRE:
                poolType = POOL_TYPE.EFFECT_FIRE;
                break;
            case EffectType.FIRE_BLUE:
                poolType = POOL_TYPE.EFFECT_FIRE_BLUE;
                break;
            case EffectType.FIRE_RED:
                poolType = POOL_TYPE.EFFECT_FIRE_RED;
                break;
        }
        effect = this._poolManager.getFormPool(poolType);
        effect.setParent(this._effectParent);
        effect.setPosition(pos);
        let partic = effect.getComponent(ParticleSystem);
        partic.play();
        setTimeout(() => {
            this._poolManager.putToPool(poolType, effect);
        }, partic.duration * 1000);
    }
}


