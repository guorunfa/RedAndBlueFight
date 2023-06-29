import { _decorator, Component, Node, Vec3, NodePool, instantiate, tween } from 'cc';
import { PoolManager, POOL_TYPE } from '../Manager/PoolManager';
import { PrefabManager } from '../Manager/PrefabManager';
const { ccclass, property } = _decorator;

const bulletSpeed = 200;

@ccclass('Bullet')
export class Bullet extends Component {

    private _poolManager: PoolManager = PoolManager.getInstance();

    shot(startPos: Vec3, targetPos: Vec3, parentNode: Node, complete: Function) {
        let bullet: Node = this._poolManager.getFormPool(POOL_TYPE.BULLET);
        bullet.parent = parentNode;
        bullet.setPosition(startPos);
        let len = Vec3.len(Vec3.subtract(new Vec3(), startPos, targetPos));
        let time = len / bulletSpeed;
        tween(bullet)
            .to(time, { position: targetPos })
            .call(() => {
                this._poolManager.putToPool(POOL_TYPE.BULLET, bullet);
                complete();
            })
            .start();
    }
}


