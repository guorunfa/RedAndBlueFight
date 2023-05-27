import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween } from 'cc';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import { Base } from './Base';

const PeopleRpgMaxHp: number = 100;
const PeopleRpgAtk: number = 1;
const PeopleRpgAtkInterval: number = 3;
const PeopleRpgAtkDistance: number = 3;
const PeopleRpgMoveSpeed: number = 1;

export class PeopleRpg {

    role: Node;
    team: TEAM;
    hp: number;
    maxHp: number;
    atk: number;
    atkInterval: number;
    atkDistance: number;
    anim: SkeletalAnimation;
    collider: BoxCollider;
    enemyBase: Base;
    isAtking: boolean;

    constructor(team: TEAM, parent: Node, bornPos: Vec3, enemyBase: Base) {
        let prefab = team == TEAM.RED ? PrefabManager.prefab_red_people_rpg : PrefabManager.prefab_blue_people_rpg;
        let people = instantiate(prefab);
        people.parent = parent;
        people.position = bornPos;

        this.role = people;
        this.team = team;
        this.maxHp = PeopleRpgMaxHp;
        this.hp = this.maxHp;
        this.atk = PeopleRpgAtk;
        this.atkInterval = PeopleRpgAtkInterval;
        this.atkDistance = PeopleRpgAtkDistance;
        this.enemyBase = enemyBase;
        this.anim = this.role.getComponent(SkeletalAnimation);
        this.collider = this.role.getComponent(BoxCollider);
        this.collider.size = v3(this.atkDistance, 1, this.atkDistance);
        this.collider.on("onTriggerStay", this.onTriggerEnter, this);
        this.isAtking = false;

        this.moveToEnemyBase();
    }

    moveToEnemyBase() {
        let time = Vec3.len(Vec3.subtract(new Vec3(), this.role.position, this.enemyBase.role.position)) / PeopleRpgMoveSpeed;
        this.anim.play("rpg_run");
        tween(this.role)
            .to(time, { position: this.enemyBase.role.position })
            .start();
    }

    onTriggerEnter(event: ITriggerEvent) {
        if (event.otherCollider.node.layer != this.role.layer && !this.isAtking) {
            Tween.stopAllByTarget(this.role);
            this.isAtking = true;
            this.anim.play("rpg_idle_atk");
        }
    }


}

