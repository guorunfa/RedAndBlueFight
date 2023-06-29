import { _decorator, Component, Node, CCObject, game, Vec3, random, math, ITriggerEvent, Collider, BoxCollider, SphereCollider, physics, ParticleSystem, ICollisionEvent } from 'cc';
import { PoolManager, POOL_TYPE } from '../Manager/PoolManager';
import { EffectManager, EffectType } from '../Manager/EffectManager';
import { TEAM } from '../Manager/GameManager';
import Tools from '../Tools';
import { Cannon } from './Cannon';


export const BaseMaxHp: number = 10000;
export const BaseShieldTime: number = 25;
const atk: number = 100;
const atkInterval: number = 2;

const { ccclass, property } = _decorator;

@ccclass('Base')
export class Base extends Component {

    team: TEAM;
    maxHp: number;
    hp: number;
    isDie: boolean;
    atk: number;

    atkTrigger: SphereCollider;
    atkCall;
    shield: Node;
    shieldCountTime: number;
    leftFire: ParticleSystem;
    rightFire: ParticleSystem;
    currentTrigger: Collider;

    poolManager: PoolManager;
    effectManager: EffectManager;

    onLoad() {
        this.team = this.node.name == "Redbase" ? TEAM.RED : TEAM.BLUE;
        this.maxHp = BaseMaxHp;
        this.atk = atk;
        this.poolManager = PoolManager.getInstance();
        this.effectManager = EffectManager.getInstance();
        this.leftFire = this.node.getChildByName("LeftFire").getComponent(ParticleSystem);
        this.rightFire = this.node.getChildByName("RightFire").getComponent(ParticleSystem);
        this.atkTrigger = this.node.getComponent(SphereCollider);
        // this.shield = this.role.getChildByName("Shield");

    }

    init() {
        this.hp = this.maxHp;
        this.shieldCountTime = 0;
        this.isDie = false;
        this.currentTrigger = null;
        this.atkCall = null;
        this.node.on("hit", this.hit, this);
        this.atkTrigger.on("onTriggerStay", this.onTriggerStay, this);
        this.atkTrigger.on("onTriggerExit", this.onTriggerExit, this);
        // this.shield.active = false;
        this.setHp();
    }

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
                let startPos = Tools.convertToNodePos(this.node.parent, fire.node);
                console.log("base--------------", startPos, target.position);
                let cannon: Node = this.poolManager.getFormPool(POOL_TYPE.CANNON);
                cannon.getComponent(Cannon).shot(startPos, target.position, this.node.parent, () => {
                    this.effectManager.playEfect(EffectType.BOOM_1, effectPos);
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
            console.log("死亡:", this.node.name);
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
        this.atkTrigger.off("onTriggerStay");
        this.atkTrigger.off("onTriggerExit");
        clearInterval(this.atkCall);
        game.emit("over");
    }



}

