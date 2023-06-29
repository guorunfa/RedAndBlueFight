import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, CylinderCollider, RigidBody, ICollisionEvent, CapsuleCollider, Collider, SphereCollider, physics, game, ParticleSystem } from 'cc';
import { PoolManager, POOL_TYPE } from '../Manager/PoolManager';
import { EffectManager, EffectType } from '../Manager/EffectManager';
import { GameData } from '../Manager/GameData';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import Tools from '../Tools';
import { Base } from './Base';
import { Bullet } from './Bullet';


const PeopleGunMaxHp: number = 100;
const PeopleGunAtk: number = 40;
const PeopleGunAtkInterval: number = 1;
const PeopleGunAtkDistance: number = 30;
const PeopleGunMoveSpeed: number = 25;

const { ccclass, property } = _decorator;

@ccclass('PeopleGun')
export class PeopleGun extends Component {
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
    phyCollider: CapsuleCollider;
    enemyBase: Base;
    isAtking: boolean;
    isDie: boolean;

    gameData: GameData;
    poolManager: PoolManager;
    moveInterval;

    onLoad() {
        this.team = this.node.name == "red_people_gun" ? TEAM.RED : TEAM.BLUE;
        this.maxHp = PeopleGunMaxHp;
        this.atk = PeopleGunAtk;
        this.atkInterval = PeopleGunAtkInterval;
        this.atkDistance = PeopleGunAtkDistance;
        this.poolManager = PoolManager.getInstance();
        this.gameData = GameData.getInstance();
        this.enemyBase = this.team == TEAM.RED ? this.gameData.blueTeam.base : this.gameData.redTeam.base;
        this.anim = this.node.getComponent(SkeletalAnimation);
        this.rigbody = this.node.getComponent(RigidBody);
        this.trgCollider = this.node.getComponent(SphereCollider);
        this.phyCollider = this.node.getComponent(CapsuleCollider);
        this.fireEf = this.node.getChildByName("Gun").getChildByName("Fire").getComponent(ParticleSystem);
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
        this.phyCollider.on("onTriggerStay", this.onBoom, this);
        this.move();
    }

    move() {
        if (this.isDie) {
            return;
        }
        console.log("gun移动");
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
            this.anim.play("gun_move_speed");
            this.rigbody.setLinearVelocity(new Vec3(temp * PeopleGunMoveSpeed, 0, 0));
        }, 1000, this);
    }

    moveToTarget(target: Node) {
        console.log("向目标移动");
    }


    currentTrigger: Collider = null;
    onTriggerStay(event: ITriggerEvent) {
        if (this.currentTrigger || event.otherCollider.getGroup() == event.selfCollider.getGroup() || (event.otherCollider.isTrigger && event.otherCollider.type != physics.EColliderType.BOX) || event.otherCollider.node.name == "boom_1") {
            return;
        }
        this.currentTrigger = event.otherCollider;
        this.rigbody.linearDamping = 1;
        this.anim.stop();
        this.doAtk(event.otherCollider.node);
    }

    onTriggerExit(event: ITriggerEvent) {
        if (this.currentTrigger == event.otherCollider) {
            this.currentTrigger = null;
            this.rigbody.linearDamping = 0;
        }
    }

    onBoom(event: ICollisionEvent) {
        if (event.otherCollider.node.name == "boom_1") {
            console.log("被炸到了");
            this.die();
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
            this.anim.once(SkeletalAnimation.EventType.FINISHED, () => {
                this.anim.stop();
            })
            this.anim.play("gun_atk_idle");
            this.fireEf.play();
            if (target.isValid && !this.isDie) {
                target.emit("hit", this.atk);
                let startPos = Tools.convertToNodePos(this.node.parent, this.fireEf.node);
                let bullet = this.poolManager.getFormPool(POOL_TYPE.BULLET);
                bullet.getComponent(Bullet).shot(startPos, target.position, this.node.parent, () => {
                    if (!target.isValid || this.isDie) {
                        this.currentTrigger = null;
                        this.rigbody.linearDamping = 0;
                        clearInterval(this.atkCall)
                        return;
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
            this.phyCollider.off("onTriggerStay");
            let poolType = this.team == TEAM.RED ? POOL_TYPE.GUN_RED : POOL_TYPE.GUN_BLUE;
            this.poolManager.putToPool(poolType, this.node);
            this.gameData.removeRoleFromTeam(this.node, this.team);
        }
        clearInterval(this.atkCall);
        clearInterval(this.moveInterval);
    }
}

