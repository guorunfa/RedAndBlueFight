import { _decorator, Component, Node, instantiate, CCObject, Vec3, animation, SkeletalAnimation, BoxCollider, ITriggerEvent, v3, tween, Tween, CylinderCollider, RigidBody, ICollisionEvent, CapsuleCollider, Collider, SphereCollider, physics, game, ParticleSystem } from 'cc';
import { BulletPool } from '../Manager/BulletPool';
import { EffectManager, EffectType } from '../Manager/EffectManager';
import { GameData } from '../Manager/GameData';
import { TEAM } from '../Manager/GameManager';
import { PrefabManager } from '../Manager/PrefabManager';
import Tools from '../Tools';
import { Base } from './Base';


const PeopleGunMaxHp: number = 120;
const PeopleGunAtk: number = 17;
const PeopleGunAtkInterval: number = 1;
const PeopleGunAtkDistance: number = 30;
const PeopleGunMoveSpeed: number = 25;

export class PeopleGun {

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
    phyCollider: CapsuleCollider;
    enemyBase: Base;
    isAtking: boolean;
    isDie: boolean;

    constructor(team: TEAM, parent: Node, bornPos: Vec3, enemyBase: Base, scale: Vec3) {
        let prefab = team == TEAM.RED ? PrefabManager.prefab_red_people_gun : PrefabManager.prefab_blue_people_gun;
        let people = instantiate(prefab);
        people.setScale(scale);
        people.parent = parent;
        people.position = bornPos;

        this.role = people;
        this.role.on("hit", this.hit, this);
        this.team = team;
        this.maxHp = PeopleGunMaxHp;
        this.hp = this.maxHp;
        this.atk = PeopleGunAtk;
        this.atkInterval = PeopleGunAtkInterval;
        this.atkDistance = PeopleGunAtkDistance;
        this.enemyBase = enemyBase;
        this.anim = this.role.getComponent(SkeletalAnimation);
        this.rigbody = this.role.getComponent(RigidBody);
        this.trgCollider = this.role.getComponent(SphereCollider);
        this.phyCollider = this.role.getComponent(CapsuleCollider);
        this.fireEf = this.role.getChildByName("Gun").getChildByName("Fire").getComponent(ParticleSystem);
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
        console.log("gun移动");
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
            this.anim.play("gun_move_speed");
            let enemyTeamInfo = this.team == TEAM.RED ? GameData.getInstance().blueTeam : GameData.getInstance().redTeam;
            if (enemyTeamInfo.roles.length > 0) {
                let enemyNodes: Node[] = [];
                for (let role of enemyTeamInfo.roles) {
                    enemyNodes.push(role.role);
                }
                let targetNode = Tools.findClosestNode(this.role, enemyNodes);
                let dir = Vec3.normalize(new Vec3(), Vec3.subtract(new Vec3(), targetNode.position, this.role.position));
                let linearVeloc = Vec3.multiplyScalar(new Vec3(), dir, PeopleGunMoveSpeed);
                this.rigbody.setLinearVelocity(new Vec3(linearVeloc.x, 0, linearVeloc.z));
            } else {
                this.rigbody.setLinearVelocity(new Vec3(temp * PeopleGunMoveSpeed, 0, 0));
            }
        }, 1000, this);
    }



    moveToTarget(target: Node) {
        console.log("向目标移动");
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
            this.die();
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
            this.anim.once(SkeletalAnimation.EventType.FINISHED, () => {
                this.anim.stop();
            })
            this.anim.play("gun_atk_idle");
            this.fireEf.play();
            if (target.isValid && !this.isDie) {
                target.emit("hit", this.atk);
                let startPos = Tools.convertToNodePos(this.role.parent, this.fireEf.node);
                BulletPool.getInstance().shotBullet_0(startPos, target.position, this.role.parent, () => {
                    if (!target.isValid || this.isDie) {
                        this.currentTrigger = null;
                        this.rigbody.linearDamping = 0;
                        clearInterval(this.atkCall)
                        return;
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

