import { _decorator, Component, Node, CCObject, game, Vec3, random, math, ITriggerEvent, Collider, BoxCollider } from 'cc';
import { EffectManager, EffectType } from '../Manager/EffectManager';
import { TEAM } from '../Manager/GameManager';
import Tools from '../Tools';


export const BaseMaxHp: number = 10000;
export const BaseShieldTime: number = 25;
const atk: number = 100;
const atkInterval: number = 4;

export class Base {

    team: TEAM;
    role: Node;
    maxHp: number;
    hp: number;
    isDie: boolean;

    triggerCollider: BoxCollider = null;
    shield: Node;
    shieldCountTime: number;
    leftFire: Node = null;
    rightFire: Node = null;

    constructor(team: TEAM, role: Node) {
        this.team = team;
        this.role = role;
        this.role.on("hit", this.hit, this);
        this.maxHp = BaseMaxHp;
        this.hp = this.maxHp;
        this.setHp();
        this.shieldCountTime = 0;
        this.isDie = false;
        // this.shield = this.role.getChildByName("Shield");
        // this.shield.active = false;
        this.leftFire = this.role.getChildByName("LeftFire");
        this.rightFire = this.role.getChildByName("RightFire");

        this.triggerCollider = this.role.getComponent(BoxCollider);
        this.triggerCollider.on("onTriggerStay", this.onTriggerStay, this);
    }

    currentCollider: Collider;
    onTriggerStay(event: ITriggerEvent) {
        return;
        if ((this.currentCollider && this.currentCollider.node.isValid) || this.isDie) {
            return;
        }
        this.currentCollider = event.otherCollider;
        this.doAtk(event.otherCollider.node);
    }

    atkCall;
    doAtk(target: Node) {
        this.atkCall = setInterval(() => {
            if (!target || (target && !target.isValid) || this.isDie) {
                this.currentCollider = null;
                clearInterval(this.atkCall)
                return;
            }
            let posNode = math.random() > 0.5 ? this.leftFire : this.rightFire;
            let pos = Tools.convertToNodePos(EffectManager.effectParent, posNode);
            let effectType = this.team == TEAM.RED ? EffectType.FIRE_RED : EffectType.FIRE_BLUE;
            // EffectManager.playEfect(effectType, pos);
            if (target.isValid) {
                EffectManager.playEfect(EffectType.BOOM_1, target.position);
            }
            target.emit("hit", atk)
        }, atkInterval * 1000, this);
    }


    hit(atkValue: number) {
        if (this.isDie) {
            return;
        }
        console.log("受到攻击");
        this.hp -= atkValue;

        if (this.hp <= 0) {
            this.hp = 0;
            console.log("死亡:", this.role.name);
            this.baseDie();
        }
        this.setHp();
    }

    setHp() {
        game.emit("setHp", this.team, this.hp);
    }

    baseDie() {
        this.isDie = true;
        clearInterval(this.atkCall)
        this.role.off("onTriggerEnter");
        game.emit("over");
    }



}

