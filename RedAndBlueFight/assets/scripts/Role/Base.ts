import { _decorator, Component, Node, CCObject, game } from 'cc';
import { TEAM } from '../Manager/GameManager';


export const BaseMaxHp: number = 100;
export const BaseShieldTime: number = 25;

export class Base {

    team: TEAM;
    role: Node;
    maxHp: number;
    hp: number;

    shield: Node;
    shieldCountTime: number;

    constructor(team: TEAM, role: Node) {
        this.team = team;
        this.role = role;
        this.maxHp = BaseMaxHp;
        this.hp = this.maxHp;
        this.setHp();
        this.shieldCountTime = 0;
        // this.shield = this.role.getChildByName("Shield");
        // this.shield.active = false;

    }

    hit(atk) {
        if (this.shield.active) {
            return;
        }
        if (this.hp - atk <= 0) {
            this.hp = 0;
            this.baseDie(this.team);
        }
        this.hp -= atk;
    }

    setHp() {
        game.emit("setHp", this.team, this.hp);
    }

    baseDie(whoWin: TEAM) {

    }



}

