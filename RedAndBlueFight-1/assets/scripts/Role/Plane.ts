import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, RigidBody, SphereCollider, Collider, physics, ParticleSystem } from 'cc';
import { PoolManager, POOL_TYPE } from '../Manager/PoolManager';
import { EffectManager, EffectType } from '../Manager/EffectManager';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import Tools from '../Tools';
import { Base } from './Base';
import { GameData } from '../Manager/GameData';
import { Bullet } from './Bullet';


const AirplaneMaxHp: number = 100;
const AirplaneAtk: number = 1;
const AirplaneAtkInterval: number = 1;
const AirplaneAtkDistance: number = 3;
const AirplaneMoveSpeed: number = 10;

const { ccclass, property } = _decorator;

@ccclass('Plane')
export class Plane extends Component {

    team: TEAM;
    hp: number;
    maxHp: number;
    atk: number;
    atkInterval: number;
    atkDistance: number;
    anim: SkeletalAnimation;
    fireEf: ParticleSystem;
    rigbody: RigidBody;
    trgCollider: SphereCollider;
    enemyBase: Base;
    isAtking: boolean;
    isDie: boolean;

    gameData: GameData;
    poolManager: PoolManager;
    moveInterval;

    onLoad() {
        this.team = this.node.name == "red_airplane" ? TEAM.RED : TEAM.BLUE;
        this.maxHp = AirplaneMaxHp;
        this.atk = AirplaneAtk;
        this.atkInterval = AirplaneAtkInterval;
        this.atkDistance = AirplaneAtkDistance;
        this.gameData = GameData.getInstance();
        this.poolManager = PoolManager.getInstance();
        this.enemyBase = this.team == TEAM.RED ? this.gameData.blueTeam.base : this.gameData.redTeam.base;
        this.anim = this.node.getComponent(SkeletalAnimation);
        this.rigbody = this.node.getComponent(RigidBody);
        this.trgCollider = this.node.getComponent(SphereCollider);
        this.fireEf = this.node.getChildByName("Fire").getComponent(ParticleSystem);
    }

    init() {
        this.hp = this.maxHp;
        this.isAtking = false;
        this.isDie = false;
        this.moveInterval = null;
        this.currentTrigger = null;
        this.node.on("hit", this.hit, this);
        this.trgCollider.on("onTriggerStay", this.onTriggerStay, this);
        this.trgCollider.on("onTriggerExit", this.onTriggerExit, this);
    }

    move() {
        console.log("飞机移动");
        this.anim.play("atk");
        let temp = this.team == TEAM.RED ? 1 : -1;
        this.rigbody.linearDamping = 0;
        this.moveInterval = setInterval(() => {
            if (this.currentTrigger) {
                return;
            }
            if (this.isDie) {
                clearInterval(this.moveInterval);
                return;
            }
            this.rigbody.setLinearVelocity(new Vec3(temp * AirplaneMoveSpeed, 0, 0));
        }, 1000, this);
    }


    currentTrigger: Collider = null;
    onTriggerStay(event: ITriggerEvent) {
        if (this.currentTrigger || event.otherCollider.getGroup() == event.selfCollider.getGroup() || (event.otherCollider.isTrigger && event.otherCollider.type != physics.EColliderType.BOX)) {
            return;
        }
        this.currentTrigger = event.otherCollider;
        this.rigbody.linearDamping = 1;
        this.doAtk(event.otherCollider.node);
    }

    onTriggerExit(event: ITriggerEvent) {
        if (this.currentTrigger == event.otherCollider) {
            this.currentTrigger = null;
            this.rigbody.linearDamping = 0;
        }
    }

    atkCall;
    doAtk(target: Node) {
        this.atkCall = setInterval(() => {
            if (!target.isValid || this.isDie) {
                this.currentTrigger = null;
                this.rigbody.linearDamping = 0;
                clearInterval(this.atkCall)
                return;
            }
            this.fireEf.play();
            if (target.isValid) {
                target.emit("hit", this.atk);
                let pos = Tools.convertToNodePos(this.node.parent, this.fireEf.node);
                let bullet = this.poolManager.getFormPool(POOL_TYPE.BULLET);
                bullet.getComponent(Bullet).shot(pos, target.position, this.node.parent, () => {
                    if (!target.isValid || this.isDie) {
                        this.currentTrigger = null;
                        this.rigbody.linearDamping = 0;
                        clearInterval(this.atkCall)
                        return;
                    }
                    if (target.name == "RedBase" || target.name == "BlueBase") {
                        target.emit("hit", this.atk);
                    }
                });
            }
        }, this.atkInterval * 1000, this);
    }

    hit(atkValue: number) {
        if (this.isDie) {
            return;
        }
        console.log("受到攻击");
        this.hp -= atkValue;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        console.log("死亡:", this.node.name);
        this.isDie = true;
        this.currentTrigger = null;
        if (this.node.isValid) {
            this.trgCollider.off("onTriggerStay");
            this.trgCollider.off("onTriggerExit");
            let poolType = this.team == TEAM.RED ? POOL_TYPE.PLANE_RED : POOL_TYPE.PLANE_BLUE;
            this.poolManager.putToPool(poolType, this.node);
            this.gameData.removeRoleFromTeam(this.node, this.team);
        }
        clearInterval(this.atkCall);
        clearInterval(this.moveInterval);
    }


}

