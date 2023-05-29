import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, RigidBody, SphereCollider, CapsuleCollider, game, Collider, ICollisionEvent, physics } from 'cc';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import { Base } from './Base';


const PeopleFlyMaxHp: number = 100;
const PeopleFlyAtk: number = 40;
const PeopleFlyAtkInterval: number = 3;
const PeopleFlyAtkDistance: number = 30;
const PeopleFlyMoveSpeed: number = 20;

export class PeopleFly {

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
        let prefab = team == TEAM.RED ? PrefabManager.prefab_red_people_fly : PrefabManager.prefab_blue_people_fly;
        let people = instantiate(prefab);
        people.parent = parent;
        people.position = bornPos;

        this.role = people;
        this.role.on("hit", this.hit, this);
        game.on("over", this.over, this);
        this.team = team;
        this.maxHp = PeopleFlyMaxHp;
        this.hp = this.maxHp;
        this.atk = PeopleFlyAtk;
        this.atkInterval = PeopleFlyAtkInterval;
        this.atkDistance = PeopleFlyAtkDistance;
        this.enemyBase = enemyBase;
        this.anim = this.role.getComponent(SkeletalAnimation);
        this.rigbody = this.role.getComponent(RigidBody);
        this.trgCollider = this.role.getComponent(SphereCollider);
        this.trgCollider.on("onTriggerStay", this.onTriggerStay, this);
        this.trgCollider.on("onTriggerExit", this.onTriggerExit, this);
        this.isAtking = false;
        this.isDie = false;
        this.move();
    }

    moveInterval;
    move() {
        if (this.isDie) {
            return;
        }
        console.log("角色移动");
        let temp = this.team == TEAM.RED ? 1 : -1;
        this.rigbody.linearDamping = 0;
        this.anim.play("fly_atk");
        this.moveInterval = setInterval(() => {
            if (this.isDie) {
                clearInterval(this.moveInterval);
                return;
            }
            this.rigbody.setLinearVelocity(new Vec3(temp * PeopleFlyMoveSpeed, 0, 0));
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
            if (!target.isValid) {
                this.isTriggerEnter = false;
                this.currentTrigger = null;
                this.rigbody.linearDamping = 0;
                clearInterval(this.atkCall)
                return;
            }
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

    over() {
        if (this.isDie) {
            return;
        }
        this.rigbody.linearDamping = 1;
        clearInterval(this.atkCall);
        clearInterval(this.moveInterval);
    }

}

