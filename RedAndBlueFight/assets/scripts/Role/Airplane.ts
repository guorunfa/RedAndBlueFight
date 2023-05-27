import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween } from 'cc';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import { Base } from './Base';


const AirplaneMaxHp: number = 100;
const AirplaneAtk: number = 1;
const AirplaneAtkInterval: number = 3;
const AirplaneAtkDistance: number = 3;
const AirplaneMoveSpeed: number = 10;

export class Airplane {

    role: Node;
    team: TEAM;
    hp: number;
    maxHp: number;
    atk: number;
    atkInterval: number;
    atkDistance: number;
    anim: SkeletalAnimation;

    enemyBase: Base;
    isAtking: boolean;

    constructor(team: TEAM, parent: Node, bornPos: Vec3, enemyBase: Base) {
        let prefab = team == TEAM.RED ? PrefabManager.prefab_red_airplane : PrefabManager.prefab_blue_airplane;
        let people = instantiate(prefab);
        people.parent = parent;
        people.position = bornPos;

        this.role = people;
        this.team = team;
        this.maxHp = AirplaneMaxHp;
        this.hp = this.maxHp;
        this.atk = AirplaneAtk;
        this.atkInterval = AirplaneAtkInterval;
        this.atkDistance = AirplaneAtkDistance;
        this.enemyBase = enemyBase;
        this.anim = this.role.getComponent(SkeletalAnimation);

        this.isAtking = false;

        this.moveToEnemyBase();
    }

    moveToEnemyBase() {
        let time = Vec3.len(Vec3.subtract(new Vec3(), this.role.position, this.enemyBase.role.position)) / AirplaneMoveSpeed;
        // this.anim.play("atk");
        tween(this.role)
            .to(time, { position: this.enemyBase.role.position })
            .start();
    }

    onTriggerEnter(event: ITriggerEvent) {
        if (event.otherCollider.node.layer != this.role.layer && !this.isAtking) {
            Tween.stopAllByTarget(this.role);
            this.isAtking = true;
            // this.anim.play("atk");
        }
    }


}

