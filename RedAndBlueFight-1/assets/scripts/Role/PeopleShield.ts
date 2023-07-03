import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, RigidBody, SphereCollider, CapsuleCollider, Collider, physics, ICollisionEvent } from 'cc';
import { PoolManager, POOL_TYPE } from '../Manager/PoolManager';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import Tools from '../Tools';
import { Base } from './Base';
import { GameData } from '../Manager/GameData';
import { RoleManager } from './RoleManager';


const PeopleShieldMaxHp: number = 100;
const PeopleShieldAtk: number = 40;
const PeopleShieldAtkInterval: number = 3;
const PeopleShieldAtkDistance: number = 3;
const PeopleShieldMoveSpeed: number = 15;

const { ccclass, property } = _decorator;

@ccclass('PeopleGun')
export class PeopleShield extends Component {

    team: TEAM;
    hp: number;
    maxHp: number;
    atk: number;
    atkInterval: number;
    atkDistance: number;
    anim: SkeletalAnimation;
    rigbody: RigidBody;
    trgCollider: SphereCollider;
    phyCollider: CapsuleCollider;
    enemyBase: Base;
    isAtking: boolean;

    gameData: GameData;
    poolManager: PoolManager;
    roleManager: RoleManager;
    moveInterval;

    onLoad() {
        this.team = this.node.name == "red_people_shield" ? TEAM.RED : TEAM.BLUE;
        this.maxHp = PeopleShieldMaxHp;
        this.atk = PeopleShieldAtk;
        this.atkInterval = PeopleShieldAtkInterval;
        this.atkDistance = PeopleShieldAtkDistance;
        this.poolManager = PoolManager.getInstance();
        this.gameData = GameData.getInstance();
        this.roleManager = this.getComponent(RoleManager);
        this.enemyBase = this.team == TEAM.RED ? this.gameData.blueTeam.base : this.gameData.redTeam.base;
        this.anim = this.node.getComponent(SkeletalAnimation);
        this.rigbody = this.node.getComponent(RigidBody);
        this.trgCollider = this.node.getComponent(SphereCollider);
        this.phyCollider = this.node.getComponent(CapsuleCollider);
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
        console.log("shield移动");
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
            this.anim.play("shield_move");
            this.rigbody.setLinearVelocity(new Vec3(temp * PeopleShieldMoveSpeed, 0, 0));
        }, 1000, this);
    }

    currentTrigger: Collider = null;
    onTriggerStay(event: ITriggerEvent) {
        if (this.currentTrigger || event.otherCollider.getGroup() == event.selfCollider.getGroup() || (event.otherCollider.isTrigger && event.otherCollider.type != physics.EColliderType.BOX) || event.otherCollider.node.name == "boom_1") {
            return;
        }
        this.currentTrigger = event.otherCollider;
        this.rigbody.linearDamping = 1;
        // this.anim.play("shield_atk");
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
        let targetRoleManager = target.getComponent(RoleManager);
        this.atkCall = setInterval(() => {
            if (targetRoleManager._isDie || this.roleManager._isDie) {
                this.currentTrigger = null;
                this.rigbody.linearDamping = 0;
                clearInterval(this.atkCall)
                return;
            }
            this.anim.once(SkeletalAnimation.EventType.FINISHED, () => {
                this.anim.stop();
                if (!targetRoleManager._isDie) {
                    target.emit("hit", this.atk);
                }
                if (targetRoleManager._isDie || this.roleManager._isDie) {
                    this.currentTrigger = null;
                    this.rigbody.linearDamping = 0;
                    clearInterval(this.atkCall)
                    return;
                }
            })
            if (target.name != "RedBase" && target.name != "BlueBase") {
                this.anim.play("shield_atk");
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
        let poolType = this.team == TEAM.RED ? POOL_TYPE.SHIELD_RED : POOL_TYPE.SHIELD_BLUE;
        this.poolManager.putToPool(poolType, this.node);
        this.gameData.removeRoleFromTeam(this.node, this.team);
        clearInterval(this.atkCall);
        clearInterval(this.moveInterval);
    }

}

