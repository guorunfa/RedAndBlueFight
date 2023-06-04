import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, RigidBody, SphereCollider, Collider, physics } from 'cc';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import Tools from '../Tools';
import { Base } from './Base';


const AirplaneMaxHp: number = 100;
const AirplaneAtk: number = 1;
const AirplaneAtkInterval: number = 3;
const AirplaneAtkDistance: number = 3;
const AirplaneMoveSpeed: number = 20;

export class Airplane {

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
        this.maxHp = AirplaneMaxHp;
        this.hp = this.maxHp;
        this.atk = AirplaneAtk;
        this.atkInterval = AirplaneAtkInterval;
        this.atkDistance = AirplaneAtkDistance;
        this.enemyBase = enemyBase;
        this.anim = this.role.getComponent(SkeletalAnimation);
        this.rigbody = this.role.getComponent(RigidBody);
        this.trgCollider = this.role.getComponent(SphereCollider);
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
        console.log("角色移动");
        let temp = this.team == TEAM.RED ? 1 : -1;
        this.rigbody.linearDamping = 0;
        this.moveInterval = setInterval(() => {
            if (this.isDie) {
                clearInterval(this.moveInterval);
                return;
            }
            this.anim.play("atk");
            this.rigbody.setLinearVelocity(new Vec3(temp * AirplaneMoveSpeed, 0, 0));
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
            console.log(this.role.position);
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

