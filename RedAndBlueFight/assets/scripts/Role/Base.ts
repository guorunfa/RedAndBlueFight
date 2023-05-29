import { _decorator, Component, Node, CCObject, game } from 'cc';
import { TEAM } from '../Manager/GameManager';


export const BaseMaxHp: number = 10000;
export const BaseShieldTime: number = 25;

export class Base {

    team: TEAM;
    role: Node;
    maxHp: number;
    hp: number;
    isDie: boolean;

    shield: Node;
    shieldCountTime: number;

    constructor(team: TEAM, role: Node) {
        this.team = team;
        this.role = role;
        this.role.on("hit", this.hit, this);
        this.maxHp = BaseMaxHp;
        this.hp = this.maxHp;
        this.setHp();
        this.shieldCountTime = 0;
        // this.shield = this.role.getChildByName("Shield");
        // this.shield.active = false;

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
        game.emit("over");
    }



}

