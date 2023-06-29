import { _decorator, Component, Node, Prefab, CCObject, NodePool, resources, instantiate, Vec3, tween, UITransform, bezier, Pool } from 'cc';
import { PrefabManager } from './PrefabManager';
const { ccclass, property } = _decorator;

export enum POOL_TYPE {
    BULLET,
    CANNON,
    GUN_RED,
    GUN_BLUE,
    FLY_RED,
    FLY_BLUE,
    RPG_RED,
    RPG_BLUE,
    SHIELD_RED,
    SHIELD_BLUE,
    TANK_RED,
    TANK_BLUE,
    PLANE_RED,
    PLANE_BLUE,
    EFFECT_BOOM_1,
    EFFECT_BOOM_2,
    EFFECT_BOOM_3,
    EFFECT_FIRE,
    EFFECT_FIRE_RED,
    EFFECT_FIRE_BLUE
}

export class PoolManager {
    private static _instance: PoolManager = null;

    private _pool_bullet: NodePool;
    private _pool_cannon: NodePool;

    private _pool_gun_red: NodePool = null;
    private _pool_fly_red: NodePool = null;
    private _pool_rpg_red: NodePool = null;
    private _pool_shield_red: NodePool = null;
    private _pool_tank_red: NodePool = null;
    private _pool_plane_red: NodePool = null;

    private _pool_gun_blue: NodePool = null;
    private _pool_fly_blue: NodePool = null;
    private _pool_rpg_blue: NodePool = null;
    private _pool_shield_blue: NodePool = null;
    private _pool_tank_blue: NodePool = null;
    private _pool_plane_blue: NodePool = null;

    private _pool_effect_boom_1: NodePool = null;
    private _pool_effect_boom_2: NodePool = null;
    private _pool_effect_boom_3: NodePool = null;
    private _pool_effect_fire: NodePool = null;
    private _pool_effect_fire_blue: NodePool = null;
    private _pool_effect_fire_red: NodePool = null;



    private _poolSize_bullet: number = 1;
    private _poolSize_cannon: number = 1;

    private _poolSize_gun: number = 1;
    private _poolSize_fly: number = 1;
    private _poolSize_rpg: number = 1;
    private _poolSize_shield: number = 1;
    private _poolSize_tank: number = 1;
    private _poolSize_plane: number = 1;

    private _poolSize_effect: number = 1;


    public static getInstance() {
        if (!this._instance) {
            this._instance = new PoolManager();
        }
        return this._instance;
    }

    initPool() {
        this._pool_bullet = new NodePool("bullet");
        this.creatOrNewPool(this._pool_bullet, PrefabManager.prefab_bullet, this._poolSize_bullet);
        this._pool_cannon = new NodePool("cannon");
        this.creatOrNewPool(this._pool_cannon, PrefabManager.prefab_cannon, this._poolSize_cannon);
        this._pool_gun_red = new NodePool("red_gun");
        this.creatOrNewPool(this._pool_gun_red, PrefabManager.prefab_red_people_gun, this._poolSize_gun);
        this._pool_fly_red = new NodePool("red_fly");
        this.creatOrNewPool(this._pool_fly_red, PrefabManager.prefab_red_people_fly, this._poolSize_fly);
        this._pool_rpg_red = new NodePool("red_rpg");
        this.creatOrNewPool(this._pool_rpg_red, PrefabManager.prefab_red_people_rpg, this._poolSize_rpg);
        this._pool_shield_red = new NodePool("red_shield");
        this.creatOrNewPool(this._pool_shield_red, PrefabManager.prefab_red_people_shield, this._poolSize_shield);
        this._pool_tank_red = new NodePool("red_tank");
        this.creatOrNewPool(this._pool_tank_red, PrefabManager.prefab_red_tank, this._poolSize_tank);
        this._pool_plane_red = new NodePool("red_plane");
        this.creatOrNewPool(this._pool_plane_red, PrefabManager.prefab_red_plane, this._poolSize_plane);

        this._pool_gun_blue = new NodePool("blue_gun");
        this.creatOrNewPool(this._pool_gun_blue, PrefabManager.prefab_blue_people_gun, this._poolSize_gun);
        this._pool_fly_blue = new NodePool("blue_fly");
        this.creatOrNewPool(this._pool_fly_blue, PrefabManager.prefab_blue_people_fly, this._poolSize_fly);
        this._pool_rpg_blue = new NodePool("blue_rpg");
        this.creatOrNewPool(this._pool_rpg_blue, PrefabManager.prefab_blue_people_rpg, this._poolSize_rpg);
        this._pool_shield_blue = new NodePool("blue_shield");
        this.creatOrNewPool(this._pool_shield_blue, PrefabManager.prefab_blue_people_shield, this._poolSize_shield);
        this._pool_tank_blue = new NodePool("blue_tank");
        this.creatOrNewPool(this._pool_tank_blue, PrefabManager.prefab_blue_tank, this._poolSize_tank);
        this._pool_plane_blue = new NodePool("blue_plane");
        this.creatOrNewPool(this._pool_plane_blue, PrefabManager.prefab_blue_plane, this._poolSize_plane);

        this._pool_effect_boom_1 = new NodePool("boom_1");
        this.creatOrNewPool(this._pool_effect_boom_1, PrefabManager.prefab_effect_boom_1, this._poolSize_effect);
        this._pool_effect_boom_2 = new NodePool("boom_2");
        this.creatOrNewPool(this._pool_effect_boom_2, PrefabManager.prefab_effect_boom_2, this._poolSize_effect);
        this._pool_effect_boom_3 = new NodePool("boom_3");
        this.creatOrNewPool(this._pool_effect_boom_3, PrefabManager.prefab_effect_boom_3, this._poolSize_effect);
        this._pool_effect_fire = new NodePool("fire");
        this.creatOrNewPool(this._pool_effect_fire, PrefabManager.prefab_effect_fire, this._poolSize_effect);
        this._pool_effect_fire_blue = new NodePool("fire_blue");
        this.creatOrNewPool(this._pool_effect_fire_blue, PrefabManager.prefab_effect_fire_blue, this._poolSize_effect);
        this._pool_effect_fire_red = new NodePool("fire_red");
        this.creatOrNewPool(this._pool_effect_fire_red, PrefabManager.prefab_effect_fire_red, this._poolSize_effect);
        console.log("对象池初始化完毕");
    }

    creatOrNewPool(pool: NodePool, prefab: Prefab, poolSize: number) {
        if (prefab && poolSize > 0) {
            for (let i = 0; i < poolSize; i++) {
                let item = instantiate(prefab);
                pool.put(item);
            }
        } else {
            console.log("对象池：" + String(pool) + "初始化失败，预制体未加载:" + prefab.name);
        }
    }

    private getPoolFromType(poolType: POOL_TYPE) {
        let pool: NodePool = null;
        let prefab: Prefab = null;
        switch (poolType) {
            case POOL_TYPE.BULLET:
                pool = this._pool_bullet;
                prefab = PrefabManager.prefab_bullet;
                break;
            case POOL_TYPE.CANNON:
                pool = this._pool_cannon;
                prefab = PrefabManager.prefab_cannon;
                break;
            case POOL_TYPE.EFFECT_BOOM_1:
                pool = this._pool_effect_boom_1;
                prefab = PrefabManager.prefab_effect_boom_1;
                break;
            case POOL_TYPE.EFFECT_BOOM_2:
                pool = this._pool_effect_boom_2;
                prefab = PrefabManager.prefab_effect_boom_2;
                break;
            case POOL_TYPE.EFFECT_BOOM_3:
                pool = this._pool_effect_boom_3;
                prefab = PrefabManager.prefab_effect_boom_3;
                break;
            case POOL_TYPE.EFFECT_FIRE:
                pool = this._pool_effect_fire;
                prefab = PrefabManager.prefab_effect_fire;
                break;
            case POOL_TYPE.EFFECT_FIRE_BLUE:
                pool = this._pool_effect_fire_blue;
                prefab = PrefabManager.prefab_effect_fire_blue;
                break;
            case POOL_TYPE.EFFECT_FIRE_RED:
                pool = this._pool_effect_fire_red;
                prefab = PrefabManager.prefab_effect_fire_red;
                break;
            case POOL_TYPE.GUN_RED:
                pool = this._pool_gun_red;
                prefab = PrefabManager.prefab_red_people_gun;
                break;
            case POOL_TYPE.GUN_BLUE:
                pool = this._pool_gun_blue;
                prefab = PrefabManager.prefab_blue_people_gun;
                break;
            case POOL_TYPE.FLY_RED:
                pool = this._pool_fly_red;
                prefab = PrefabManager.prefab_red_people_fly;
                break;
            case POOL_TYPE.FLY_BLUE:
                pool = this._pool_fly_blue;
                prefab = PrefabManager.prefab_blue_people_fly;
                break;
            case POOL_TYPE.RPG_RED:
                pool = this._pool_rpg_red;
                prefab = PrefabManager.prefab_red_people_rpg;
                break;
            case POOL_TYPE.RPG_BLUE:
                pool = this._pool_rpg_blue;
                prefab = PrefabManager.prefab_blue_people_rpg;
                break;
            case POOL_TYPE.SHIELD_RED:
                pool = this._pool_shield_red;
                prefab = PrefabManager.prefab_red_people_shield;
                break;
            case POOL_TYPE.SHIELD_BLUE:
                pool = this._pool_shield_blue;
                prefab = PrefabManager.prefab_blue_people_shield;
                break;
            case POOL_TYPE.TANK_RED:
                pool = this._pool_tank_red;
                prefab = PrefabManager.prefab_red_tank;
                break;
            case POOL_TYPE.TANK_BLUE:
                pool = this._pool_tank_blue;
                prefab = PrefabManager.prefab_blue_tank;
                break;
            case POOL_TYPE.PLANE_RED:
                pool = this._pool_plane_red;
                prefab = PrefabManager.prefab_red_plane;
                break;
            case POOL_TYPE.PLANE_BLUE:
                pool = this._pool_plane_blue;
                prefab = PrefabManager.prefab_blue_plane;
                break;
            default:
                break;
        }
        return { pool, prefab };
    }

    getFormPool(poolType: POOL_TYPE) {
        let pool: NodePool = this.getPoolFromType(poolType).pool;
        let prefab: Prefab = this.getPoolFromType(poolType).prefab;
        let obj: Node = null;
        if (pool) {
            if (pool.size() > 0) {
                obj = pool.get();
            } else {
                obj = instantiate(prefab);
            }
        } else {
            console.log("对象池不存在，获取对象失败");
        }
        console.log(obj);
        return obj;
    }

    putToPool(poolType: POOL_TYPE, obj: Node) {
        let pool: NodePool = this.getPoolFromType(poolType).pool;
        if (pool) {
            if (obj.isValid) {
                pool.put(obj);
            }
        } else {
            console.log("对象池不存在，放入对象失败");
        }
    }
}


