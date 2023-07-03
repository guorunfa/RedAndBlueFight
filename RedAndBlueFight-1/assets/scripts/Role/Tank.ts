import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, Collider, RigidBody, SphereCollider, ICollisionEvent, physics, ParticleSystem } from 'cc';
import { PoolManager, POOL_TYPE } from '../Manager/PoolManager';
import { EffectManager, EffectType } from '../Manager/EffectManager';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import Tools from '../Tools';
import { Base } from './Base';
import { GameData } from '../Manager/GameData';
import { Cannon } from './Cannon';
import { RoleManager } from './RoleManager';

const TankMaxHp: number = 1000;
const TankAtk: number = 1;
const TankAtkInterval: number = 2;
const TankAtkDistance: number = 3;
const TankMoveSpeed: number = 10;

const { ccclass, property } = _decorator;

@ccclass('PeopleGun')
export class Tank extends Component {
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
    phyCollider: BoxCollider;
    enemyBase: Base;
    isAtking: boolean;

    gameData: GameData;
    poolManager: PoolManager;
    effectManager: EffectManager;
    roleManager: RoleManager;
    moveInterval;

    onLoad() {
        this.team = this.node.name == "red_tank" ? TEAM.RED : TEAM.BLUE;

        this.maxHp = TankMaxHp;

        this.atk = TankAtk;
        this.atkInterval = TankAtkInterval;
        this.atkDistance = TankAtkDistance;
        this.poolManager = PoolManager.getInstance();
        this.effectManager = EffectManager.getInstance();
        this.gameData = GameData.getInstance();
        this.roleManager = this.getComponent(RoleManager);
        this.enemyBase = this.team == TEAM.RED ? this.gameData.blueTeam.base : this.gameData.redTeam.base;
        this.anim = this.node.getComponent(SkeletalAnimation);
        this.rigbody = this.node.getComponent(RigidBody);
        this.trgCollider = this.node.getComponent(SphereCollider);
        this.phyCollider = this.node.getComponent(BoxCollider);
        this.fireEf = this.node.getChildByName("Fire").getComponent(ParticleSystem);



    }

    init() {
        this.hp = this.maxHp;
        this.isAtking = false;
        this.roleManager._isDie = false;
        this.moveInterval = null;
        this.currentTrigger = null;
        this.node.on("hit", this.hit, this);
        this.trgCollider.on("onTriggerStay", this.onTriggerStay, this);
        this.trgCollider.on("onTriggerExit", this.onTriggerExit, this);
        this.phyCollider.on("onTriggerStay", this.onBoom, this);
    }


    move() {
        if (this.roleManager._isDie) {
            return;
        }
        console.log("坦克移动");
        let temp = this.team == TEAM.RED ? 1 : -1;
        this.rigbody.linearDamping = 0;
        this.moveInterval = setInterval(() => {
            if (this.currentTrigger) {
                return;
            }
            if (this.roleManager._isDie) {
                clearInterval(this.moveInterval);
                return;
            }
            // this.anim.play("atk");
            this.rigbody.setLinearVelocity(new Vec3(temp * TankMoveSpeed, 0, 0));
        }, 1000, this);
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
            this.hit(this.maxHp / 5);
        }
    }

    atkCall;
    doAtk(target: Node) {
        let targetRoleManager = target.getComponent(RoleManager);
        this.atkCall = setInterval(() => {
            if (targetRoleManager._isDie || this.roleManager._isDie) {
                this.currentTrigger = null;
                this.rigbody.linearDamping = 0;
                clearInterval(this.atkCall)
                return;
            }
            this.fireEf.play();
            if (!targetRoleManager._isDie) {
                let pos = Tools.convertToNodePos(this.node.parent, this.fireEf.node);
                let effectPos = new Vec3(target.position.x, 0, target.position.z);
                let cannon = this.poolManager.getFormPool(POOL_TYPE.CANNON);
                cannon.getComponent(Cannon).shot(pos, target.position, this.node.parent, () => {
                    this.effectManager.playEfect(EffectType.BOOM_1, effectPos);
                    if (targetRoleManager._isDie || this.roleManager._isDie) {
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
        if (this.roleManager._isDie) {
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
        this.roleManager._isDie = true;
        this.currentTrigger = null;
        this.trgCollider.off("onTriggerStay");
        this.trgCollider.off("onTriggerExit");
        this.phyCollider.off("onTriggerStay");
        let poolType = this.team == TEAM.RED ? POOL_TYPE.PLANE_RED : POOL_TYPE.PLANE_BLUE;
        this.poolManager.putToPool(poolType, this.node);
        this.gameData.removeRoleFromTeam(this.node, this.team);
        clearInterval(this.atkCall);
        clearInterval(this.moveInterval);
    }

}

