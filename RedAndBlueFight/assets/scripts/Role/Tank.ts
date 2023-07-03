import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, Collider, RigidBody, SphereCollider, ICollisionEvent, physics, ParticleSystem, game } from 'cc';
import { BulletPool } from '../Manager/BulletPool';
import { EffectManager, EffectType } from '../Manager/EffectManager';
import { GameData } from '../Manager/GameData';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import Tools from '../Tools';
import { Base } from './Base';
import { PeopleRpgAtk } from './PeopleRpg';

const TankMaxHp: number = 3500;
const TankAtk: number = 580;
const TankAtkInterval: number = 5.8;
const TankAtkDistance: number = 3;
const TankMoveSpeed: number = 10;

export class Tank {

    role: Node;
    team: TEAM;
    hp: number;
    maxHp: number;
    atk: number;
    atkInterval: number;
    atkDistance: number;
    anim: SkeletalAnimation;
    fireEf: ParticleSystem;
    rigbody: RigidBody;
    trgCollider: SphereCollider;
    phyCollider: BoxCollider;
    enemyBase: Base;
    isAtking: boolean;
    isDie: boolean;

    constructor(team: TEAM, parent: Node, bornPos: Vec3, enemyBase: Base) {
        let prefab = team == TEAM.RED ? PrefabManager.prefab_red_tank : PrefabManager.prefab_blue_tank;
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
        this.fireEf = this.role.getChildByName("Fire").getComponent(ParticleSystem);

        this.trgCollider.on("onTriggerStay", this.onTriggerStay, this);
        this.trgCollider.on("onTriggerExit", this.onTriggerExit, this);
        this.phyCollider.on("onTriggerStay", this.onBoom, this);
        this.isAtking = false;
        this.isDie = false;
        this.move();
        game.on("over", () => {
            this.die();
        }, this);
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
            if (this.currentTrigger) {
                return;
            }
            if (this.isDie) {
                clearInterval(this.moveInterval);
                return;
            }
            let enemyTeamInfo = this.team == TEAM.RED ? GameData.getInstance().blueTeam : GameData.getInstance().redTeam;
            if (enemyTeamInfo.roles.length > 0) {
                let enemyNodes: Node[] = [];
                for (let role of enemyTeamInfo.roles) {
                    enemyNodes.push(role.role);
                }
                let targetNode = Tools.findClosestNode(this.role, enemyNodes);
                let dir = Vec3.normalize(new Vec3(), Vec3.subtract(new Vec3(), targetNode.position, this.role.position));
                let linearVeloc = Vec3.multiplyScalar(new Vec3(), dir, TankMoveSpeed);
                this.rigbody.setLinearVelocity(new Vec3(linearVeloc.x, 0, linearVeloc.z));
            } else {
                this.rigbody.setLinearVelocity(new Vec3(temp * TankMoveSpeed, 0, 0));
            }
        }, 1000, this);
    }

    currentTrigger: Collider = null;
    onTriggerStay(event: ITriggerEvent) {
        if (this.currentTrigger || event.otherCollider.getGroup() == event.selfCollider.getGroup() || (event.otherCollider.isTrigger && event.otherCollider.type != physics.EColliderType.BOX) || event.otherCollider.node.name == "boom_1" || event.otherCollider.node.name == "boom_3") {
            return;
        }
        this.currentTrigger = event.otherCollider;
        this.rigbody.linearDamping = 1;
        this.anim.stop();
        this.doAtk(event.otherCollider.node);
    }

    onTriggerExit(event: ITriggerEvent) {
        if (this.currentTrigger == event.otherCollider) {
            this.currentTrigger = null;
            this.rigbody.linearDamping = 0;
        }
    }

    onBoom(event: ICollisionEvent) {
        if (event.otherCollider.node.name == "boom_1" || event.otherCollider.node.name == "boom_3") {
            console.log("被炸到了");
            this.hit(PeopleRpgAtk);
        }
    }

    atkCall;
    doAtk(target: Node) {
        this.atkCall = setInterval(() => {
            if (!target.isValid || this.isDie) {
                this.currentTrigger = null;
                this.rigbody.linearDamping = 0;
                clearInterval(this.atkCall)
                return;
            }
            this.fireEf.play();
            if (target.isValid && !this.isDie) {
                let pos = Tools.convertToNodePos(this.role.parent, this.fireEf.node);
                let effectPos = new Vec3(target.position);
                BulletPool.getInstance().shotBullet_1(pos, target.position, this.role.parent, () => {
                    EffectManager.playEfect(EffectType.BOOM_1, effectPos);
                    if (!target.isValid || this.isDie) {
                        this.currentTrigger = null;
                        this.rigbody.linearDamping = 0;
                        clearInterval(this.atkCall)
                        return;
                    }
                    if (target.name == "RedBase" || target.name == "BlueBase") {
                        target.emit("hit", this.atk);
                    }
                });
            }
        }, this.atkInterval * 1000, this);
    }

    hit(atkValue: number) {
        if (this.isDie) {
            return;
        }
        console.log("受到攻击");
        this.hp -= atkValue;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        console.log("死亡:", this.role.name);
        GameData.getInstance().removeRoleFromTeam(this, this.team);
        this.isDie = true;
        this.currentTrigger = null;
        if (this.role.isValid) {
            this.trgCollider.off("onTriggerStay");
            this.trgCollider.off("onTriggerExit");
            this.phyCollider.off("onTriggerStay");
            this.role.destroy();
        }
        clearInterval(this.atkCall);
        clearInterval(this.moveInterval);
    }

}

