import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, Collider, RigidBody, SphereCollider, ICollisionEvent, physics } from 'cc';
import { EffectManager, EffectType } from '../Manager/EffectManager';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import Tools from '../Tools';
import { Base } from './Base';

const TankMaxHp: number = 1000;
const TankAtk: number = 1;
const TankAtkInterval: number = 3;
const TankAtkDistance: number = 3;
const TankMoveSpeed: number = 15;

export class Tank {

    role: Node;
    team: TEAM;
    hp: number;
    maxHp: number;
    atk: number;
    atkInterval: number;
    atkDistance: number;
    anim: SkeletalAnimation;
    rigbody: RigidBody;
    trgCollider: SphereCollider;
    phyCollider: BoxCollider;
    enemyBase: Base;
    isAtking: boolean;
    isDie: boolean;

    constructor(team: TEAM, parent: Node, bornPos: Vec3, enemyBase: Base) {
        let prefab = team == TEAM.RED ? PrefabManager.prefab_red_people_gun : PrefabManager.prefab_blue_people_gun;
        let people = instantiate(prefab);
        people.parent = parent;
        people.position = bornPos;

        this.role = people;
        this.role.on("hit", this.hit, this);
        this.team = team;
        this.maxHp = TankMaxHp;
        this.hp = this.maxHp;
        this.atk = TankAtk;
        this.atkInterval = TankAtkInterval;
        this.atkDistance = TankAtkDistance;
        this.enemyBase = enemyBase;
        this.anim = this.role.getComponent(SkeletalAnimation);
        this.rigbody = this.role.getComponent(RigidBody);
        this.trgCollider = this.role.getComponent(SphereCollider);
        this.phyCollider = this.role.getComponent(BoxCollider);
        this.trgCollider.on("onTriggerStay", this.onTriggerStay, this);
        this.trgCollider.on("onTriggerExit", this.onTriggerExit, this);
        this.isAtking = false;
        this.isDie = false;
        let time = Tools.getRandomNum(0, 2);
        setTimeout(() => {
            this.move();
        }, time * 100);
    }

    moveInterval;
    move() {
        if (this.isDie) {
            return;
        }
        console.log("坦克移动");
        let temp = this.team == TEAM.RED ? 1 : -1;
        this.rigbody.linearDamping = 0;
        this.moveInterval = setInterval(() => {
            if (this.isDie) {
                clearInterval(this.moveInterval);
                return;
            }
            this.anim.play("atk");
            this.rigbody.setLinearVelocity(new Vec3(temp * TankMoveSpeed, 0, 0));
        }, 1000, this);
    }


    isTriggerEnter: boolean = false;
    currentTrigger: Collider = null;
    onTriggerStay(event: ITriggerEvent) {
        if (event.otherCollider.getGroup() == event.selfCollider.getGroup() || (event.otherCollider.isTrigger && event.otherCollider.type != physics.EColliderType.BOX) || this.isTriggerEnter) {
            return;
        }
        this.isTriggerEnter = true;
        this.currentTrigger = event.otherCollider;
        this.rigbody.linearDamping = 1;

        this.doAtk(event.otherCollider.node);
    }

    onTriggerExit(event: ITriggerEvent) {
        if (this.isTriggerEnter && this.currentTrigger == event.otherCollider) {
            this.isTriggerEnter = false;
            this.currentTrigger = null;
            this.rigbody.linearDamping = 0;
        }
    }

    atkCall;
    doAtk(target: Node) {
        this.atkCall = setInterval(() => {
            if (!target.isValid || this.isDie) {
                this.isTriggerEnter = false;
                this.currentTrigger = null;
                this.rigbody.linearDamping = 0;
                clearInterval(this.atkCall)
                return;
            }
            let effectPos = new Vec3(target.position.x > 0 ? target.position.x - 10 : target.position.x + 10, 0, this.role.position.z);
            EffectManager.playEfect(EffectType.BOOM_1, effectPos);
            target.emit("hit", this.atk)
        }, this.atkInterval * 1000, this);
    }

    hit(atkValue: number) {
        if (this.isDie) {
            return;
        }
        console.log("受到攻击");
        this.hp -= atkValue;
        if (this.hp <= 0) {
            console.log("死亡:", this.role.name);
            this.isDie = true;
            this.isTriggerEnter = false;
            clearInterval(this.atkCall);
            clearInterval(this.moveInterval);
            this.role.destroy();
        }
    }

    die() {
        this.isDie = true;
        if (this.role.isValid) {
            this.role.destroy();
        }
        clearInterval(this.atkCall);
        clearInterval(this.moveInterval);
    }

}

