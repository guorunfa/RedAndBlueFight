import { _decorator, Component, Node, NodePool, Vec3, instantiate, tween } from 'cc';
import { PoolManager, POOL_TYPE } from '../Manager/PoolManager';
import { PrefabManager } from '../Manager/PrefabManager';
const { ccclass, property } = _decorator;

@ccclass('Cannon')
export class Cannon extends Component {
    private _poolManager: PoolManager = PoolManager.getInstance();

    shot(startPos: Vec3, targetPos: Vec3, parentNode: Node, complete: Function) {
        let cannon: Node = this._poolManager.getFormPool(POOL_TYPE.CANNON);
        if (targetPos.x > startPos.x) {
            cannon.setRotationFromEuler(0, 90, 0);
        } else {
            cannon.setRotationFromEuler(0, -90, 0);
        }
        cannon.parent = parentNode;
        cannon.setPosition(startPos);
        let middlePos = new Vec3((startPos.x + targetPos.x) / 2, startPos.y + 10, (startPos.z + targetPos.z) / 2) //中间坐标，即抛物线最高点坐标
        //计算贝塞尔曲线坐标函数
        let doBezier = (t: number, p1: Vec3, cp: Vec3, p2: Vec3) => {
            let x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
            let y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
            let z = (1 - t) * (1 - t) * p1.z + 2 * t * (1 - t) * cp.z + t * t * p2.z;
            return new Vec3(x, y, z);
        };
        let tweenDuration: number = 0.5;
        tween(cannon.position)
            .to(tweenDuration, targetPos, {
                onUpdate: (target: Vec3, ratio: number) => {
                    cannon.position = doBezier(ratio, startPos, middlePos, targetPos);
                }
            })
            .call(() => {
                this._poolManager.putToPool(POOL_TYPE.CANNON, cannon);
                complete();
            })
            .start();
    }
}


