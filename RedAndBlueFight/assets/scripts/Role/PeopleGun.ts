import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, CylinderCollider, RigidBody, ICollisionEvent, CapsuleCollider, Collider } from 'cc';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import { Base } from './Base';


const PeopleGunMaxHp: number = 100;
const PeopleGunAtk: number = 1;
const PeopleGunAtkInterval: number = 3;
const PeopleGunAtkDistance: number = 30;
const PeopleGunMoveSpeed: number = 20;

export class PeopleGun {

    role: Node;
    team: TEAM;
    hp: number;
    maxHp: number;
    atk: number;
    atkInterval: number;
    atkDistance: number;
    anim: SkeletalAnimation;
    rigbody: RigidBody;
    boxCollider: BoxCollider;
    capsuleCollider: CapsuleCollider;
    enemyBase: Base;
    isAtking: boolean;

    constructor(team: TEAM, parent: Node, bornPos: Vec3, enemyBase: Base) {
        let prefab = team == TEAM.RED ? PrefabManager.prefab_red_people_gun : PrefabManager.prefab_blue_people_gun;
        let people = instantiate(prefab);
        people.parent = parent;
        people.position = bornPos;

        this.role = people;
        this.team = team;
        this.maxHp = PeopleGunMaxHp;
        this.hp = this.maxHp;
        this.atk = PeopleGunAtk;
        this.atkInterval = PeopleGunAtkInterval;
        this.atkDistance = PeopleGunAtkDistance;
        this.enemyBase = enemyBase;
        this.anim = this.role.getComponent(SkeletalAnimation);
        this.rigbody = this.role.getComponent(RigidBody);
        this.boxCollider = this.role.getComponent(BoxCollider);
        this.boxCollider.on("onTriggerEnter", this.onTriggerEnter, this);
        this.boxCollider.on("onTriggerExit", this.onTriggerExit, this);
        // this.collider.size = v3(this.atkDistance, 1, this.atkDistance);
        // this.collider.setGroup(team == TEAM.RED ? 1 << 1 : 1 << 2);
        // this.collider.setMask(team == TEAM.RED ? 1 << 2 : 1 << 1);
        // this.collider.on("onTriggerEnter", this.onTriggerEnter, this);
        this.capsuleCollider = this.role.getComponent(CapsuleCollider);
        this.capsuleCollider.on("onCollisionEnter", this.onCollisionEnter, this);
        // this.capsuleCollider.on("onCollisionExit", this.onCollisionExit, this);
        this.isAtking = false;
        this.setLinearSpeed(PeopleGunMoveSpeed);
    }

    setLinearSpeed(speed: number) {
        this.anim.play("gun_run_atk");
        let temp = this.team == TEAM.RED ? 1 : -1;
        this.rigbody.setLinearVelocity(new Vec3(temp * speed, 0, 0));
    }

    moveToEnemyBase() {
        let targetPos1 = new Vec3(0, this.role.position.y, this.role.position.z);
        let targetPos2 = this.enemyBase.role.position;
        let time = Vec3.len(Vec3.subtract(new Vec3(), Vec3.ZERO, this.enemyBase.role.position)) / PeopleGunMoveSpeed;
        this.anim.play("gun_run_atk");
        tween(this.role)
            .to(2, { position: targetPos1 })
            .to(time, { position: targetPos2 })
            .start();
    }

    isTriggerEnter: boolean = false;
    triggerCollider: Collider;
    onTriggerEnter(event: ITriggerEvent) {
        // this.isTriggerEnter = true;
        // if (event.otherCollider.node.layer != event.selfCollider.node.layer && !this.isTriggerEnter && !this.triggerCollider) {
        //     this.isTriggerEnter = true;
        //     this.triggerCollider = event.otherCollider;
        //     console.log("当前敌人是：", event.otherCollider.node.name);
        //     this.isAtking = true;
        //     this.anim.play("gun_idle_atk");
        //     this.setLinearSpeed(0);
        //     this.rigbody.sleep();
        // }
    }

    onTriggerExit(event: ITriggerEvent) {
        // this.isTriggerEnter = false;
        // if (this.triggerCollider && event.otherCollider == this.triggerCollider) {
        //     this.isTriggerEnter = false;
        //     this.triggerCollider = null;
        //     console.log("失去敌人：", event.otherCollider.node.name);
        //     this.isAtking = false;
        //     this.anim.play("gun_run_atk");
        //     this.setLinearSpeed(PeopleGunMoveSpeed);
        // }
    }

    onCollisionEnter(event: ICollisionEvent) {
        console.log("碰撞器");
        this.setLinearSpeed(0);
        event.otherCollider.node.getComponent(RigidBody).sleep();
        this.rigbody.sleep();
    }
}

