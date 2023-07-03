import { _decorator, Component, Node, Prefab, CCObject, NodePool, resources, instantiate, Vec3, tween, UITransform, bezier } from 'cc';
const { ccclass, property } = _decorator;

export const bulletSpeed_0: number = 100;
export const bulletSpeed_1: number = 60;

export class BulletPool {
    private static _instance: BulletPool = null;

    public bulletPrefab_0: Prefab = null;
    public bulletPrefab_1: Prefab = null;

    private _pool_0: NodePool = null;
    private _pool_1: NodePool = null;

    private _poolSize_0: number = 10;
    private _poolSize_1: number = 10;


    public static getInstance() {
        if (!this._instance) {
            this._instance = new BulletPool();
        }
        return this._instance;
    }

    initPool() {
        if (this._pool_0) {
            this._pool_0.clear();
        } else {
            this._pool_0 = new NodePool();
        }
        if (this._pool_1) {
            this._pool_1.clear();
        } else {
            this._pool_1 = new NodePool();
        }

        if (this.bulletPrefab_0) {
            for (let i = 0; i < this._poolSize_0; i++) {
                let bullet = instantiate(this.bulletPrefab_0);
                this._pool_0.put(bullet);
            }
        } else {
            console.log("初始化失败，预制体未加载:bulletPrefab_0");
        }

        if (this.bulletPrefab_1) {
            for (let i = 0; i < this._poolSize_1; i++) {
                let bullet = instantiate(this.bulletPrefab_1);
                this._pool_1.put(bullet);
            }
        } else {
            console.log("初始化失败，预制体未加载:bulletPrefab_0");
        }
    }

    shotBullet_0(startPos: Vec3, targetPos: Vec3, parentNode: Node, complete: Function) {
        let bullet: Node;
        if (this._pool_0.size() > 0) {
            bullet = this._pool_0.get();
        } else {
            bullet = instantiate(this.bulletPrefab_0);
        }
        bullet.parent = parentNode;
        bullet.setPosition(startPos);
        let len = Vec3.len(Vec3.subtract(new Vec3(), startPos, targetPos));
        let time = len / bulletSpeed_0;
        tween(bullet)
            .to(time, { position: targetPos })
            .call(() => {
                this._pool_0.put(bullet);
                complete();
            })
            .start();
    }

    shotBullet_1(startPos: Vec3, targetPos: Vec3, parentNode: Node, complete: Function) {
        let bullet: Node;
        if (this._pool_1.size() > 0) {
            bullet = this._pool_1.get();
        } else {
            bullet = instantiate(this.bulletPrefab_1);
        }
        if (targetPos.x > startPos.x) {
            bullet.setRotationFromEuler(0, 90, 0);
        } else {
            bullet.setRotationFromEuler(0, -90, 0);
        }
        bullet.parent = parentNode;
        bullet.setPosition(startPos);
        let middlePos = new Vec3((startPos.x + targetPos.x) / 2, startPos.y + 10, (startPos.z + targetPos.z) / 2) //中间坐标，即抛物线最高点坐标
        //计算贝塞尔曲线坐标函数
        let doBezier = (t: number, p1: Vec3, cp: Vec3, p2: Vec3) => {
            let x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
            let y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
            let z = (1 - t) * (1 - t) * p1.z + 2 * t * (1 - t) * cp.z + t * t * p2.z;
            return new Vec3(x, y, z);
        };
        let tweenDuration: number = 0.5;
        tween(bullet.position)
            .to(tweenDuration, targetPos, {
                onUpdate: (target: Vec3, ratio: number) => {
                    bullet.position = doBezier(ratio, startPos, middlePos, targetPos);
                }
            })
            .call(() => {
                this._pool_1.put(bullet);
                complete();
            })
            .start();
    }
}


