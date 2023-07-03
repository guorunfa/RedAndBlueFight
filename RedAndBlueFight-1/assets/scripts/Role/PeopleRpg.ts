import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, CylinderCollider, RigidBody, ICollisionEvent, CapsuleCollider, Collider, SphereCollider, physics, game, Layers } from 'cc';
import { PoolManager, POOL_TYPE } from '../Manager/PoolManager';
import { EffectManager, EffectType } from '../Manager/EffectManager';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import { Base } from './Base';
import { GameData } from '../Manager/GameData';
import { Cannon } from './Cannon';
import { RoleManager } from './RoleManager';


const PeopleRpgMaxHp: number = 100;
const PeopleRpgAtk: number = 40;
const PeopleRpgAtkInterval: number = 2;
const PeopleRpgAtkDistance: number = 30;
const PeopleRpgMoveSpeed: number = 20;

const { ccclass, property } = _decorator;

@ccclass('PeopleRpg')
export class PeopleRpg extends Component {

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
    effectManager: EffectManager;
    roleManager: RoleManager;
    moveInterval;

    onLoad() {
        this.team = this.node.name == "red_people_rpg" ? TEAM.RED : TEAM.BLUE;

        this.maxHp = PeopleRpgMaxHp;

        this.atk = PeopleRpgAtk;
        this.atkInterval = PeopleRpgAtkInterval;
        this.atkDistance = PeopleRpgAtkDistance;
        this.poolManager = PoolManager.getInstance();
        this.effectManager = EffectManager.getInstance();
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
        console.log("Rpg移动");
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
            this.anim.play("rpg_move");
            this.rigbody.setLinearVelocity(new Vec3(temp * PeopleRpgMoveSpeed, 0, 0));
        }, 500, this);
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
            this.hit(this.atk);
        }
    }


    atkCall;
    doAtk(target: Node) {
        let targetRoleManager = target.getComponent(RoleManager);
        this.atkCall = setInterval(() => {
            console.log("currentTrigger-------------------", this.currentTrigger.node);
            if (targetRoleManager._isDie || this.roleManager._isDie) {
                this.currentTrigger = null;
                this.rigbody.linearDamping = 0;
                clearInterval(this.atkCall)
                return;
            }
            this.anim.once(SkeletalAnimation.EventType.FINISHED, () => {
                this.anim.stop();
            })
            this.anim.play("rpg_atk");
            if (!targetRoleManager._isDie) {
                let pos = this.node.position;
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
        let poolType = this.team == TEAM.RED ? POOL_TYPE.RPG_RED : POOL_TYPE.RPG_BLUE;
        this.poolManager.putToPool(poolType, this.node);
        this.gameData.removeRoleFromTeam(this.node, this.team);
        clearInterval(this.atkCall);
        clearInterval(this.moveInterval);
    }
}

