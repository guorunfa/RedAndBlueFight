import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween } from 'cc';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import { Base } from './Base';


const PeopleFlyMaxHp: number = 100;
const PeopleFlyAtk: number = 1;
const PeopleFlyAtkInterval: number = 3;
const PeopleFlyAtkDistance: number = 3;
const PeopleFlyMoveSpeed: number = 1;

export class PeopleFly {

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
        let prefab = team == TEAM.RED ? PrefabManager.prefab_red_people_fly : PrefabManager.prefab_blue_people_fly;
        let people = instantiate(prefab);
        people.parent = parent;
        people.position = bornPos;

        this.role = people;
        this.team = team;
        this.maxHp = PeopleFlyMaxHp;
        this.hp = this.maxHp;
        this.atk = PeopleFlyAtk;
        this.atkInterval = PeopleFlyAtkInterval;
        this.atkDistance = PeopleFlyAtkDistance;
        this.enemyBase = enemyBase;
        this.anim = this.role.getComponent(SkeletalAnimation);
        this.isAtking = false;

        this.moveToEnemyBase();
    }

    moveToEnemyBase() {
        let time = Vec3.len(Vec3.subtract(new Vec3(), this.role.position, this.enemyBase.role.position)) / PeopleFlyMoveSpeed;
        this.anim.play("ply_run_atk");
        tween(this.role)
            .to(time, { position: this.enemyBase.role.position })
            .start();
    }

    onTriggerEnter(event: ITriggerEvent) {
        if (event.otherCollider.node.layer != this.role.layer && !this.isAtking) {
            Tween.stopAllByTarget(this.role);
            this.isAtking = true;
        }
    }


}

