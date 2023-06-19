import { _decorator, Component, Node, CCObject, game, Vec3, random, math, ITriggerEvent, Collider, BoxCollider, SphereCollider, physics, ParticleSystem, ICollisionEvent } from 'cc';
import { BulletPool } from '../Manager/BulletPool';
import { EffectManager, EffectType } from '../Manager/EffectManager';
import { TEAM } from '../Manager/GameManager';
import Tools from '../Tools';


export const BaseMaxHp: number = 10000;
export const BaseShieldTime: number = 25;
const atk: number = 100;
const atkInterval: number = 2;

export class Base {

    team: TEAM;
    role: Node;
    maxHp: number;
    hp: number;
    isDie: boolean;
    atk: number;

    atkTrigger: SphereCollider = null;
    shield: Node;
    shieldCountTime: number;
    leftFire: ParticleSystem = null;
    rightFire: ParticleSystem = null;

    constructor(team: TEAM, role: Node) {
        this.team = team;
        this.role = role;
        this.role.on("hit", this.hit, this);
        this.maxHp = BaseMaxHp;
        this.hp = this.maxHp;
        this.setHp();
        this.shieldCountTime = 0;
        this.atk = atk;
        this.isDie = false;
        // this.shield = this.role.getChildByName("Shield");
        // this.shield.active = false;
        this.leftFire = this.role.getChildByName("LeftFire").getComponent(ParticleSystem);
        this.rightFire = this.role.getChildByName("RightFire").getComponent(ParticleSystem);
        this.atkTrigger = this.role.getComponent(SphereCollider);
        this.atkTrigger.on("onTriggerStay", this.onTriggerStay, this);
        this.atkTrigger.on("onTriggerExit", this.onTriggerExit, this);
    }

    currentTrigger: Collider;
    onTriggerStay(event: ITriggerEvent) {
        if (this.currentTrigger || event.otherCollider.getGroup() == event.selfCollider.getGroup() || (event.otherCollider.isTrigger)) {
            return;
        }
        this.currentTrigger = event.otherCollider;
        this.doAtk(event.otherCollider.node);
    }

    onTriggerExit(event: ITriggerEvent) {
        if (this.currentTrigger == event.otherCollider) {
            this.currentTrigger = null;
        }
    }

    atkCall;
    doAtk(target: Node) {
        this.atkCall = setInterval(() => {
            if (!target.isValid || this.isDie) {
                this.currentTrigger = null;
                clearInterval(this.atkCall)
                return;
            }
            let fire = math.random() > 0.5 ? this.leftFire : this.rightFire;
            fire.play();
            if (target.isValid) {
                let effectPos = new Vec3(target.position.x, 0, target.position.z);
                let pos = Tools.convertToNodePos(this.role.parent, fire.node);
                BulletPool.getInstance().shotBullet_1(pos, target.position, this.role.parent, () => {
                    EffectManager.playEfect(EffectType.BOOM_1, effectPos);
                    if (!target.isValid || this.isDie) {
                        this.currentTrigger = null;
                        clearInterval(this.atkCall)
                        return;
                    }
                });
            }
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
        this.currentTrigger = null;
        if (this.role.isValid) {
            this.atkTrigger.off("onTriggerStay");
            this.atkTrigger.off("onTriggerExit");
        }
        clearInterval(this.atkCall);
        game.emit("over");
    }



}

