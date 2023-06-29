import { _decorator, Component, Node } from 'cc';
import { TEAM } from './Manager/GameManager';
const { ccclass, property } = _decorator;

export class User {
    name: string;
    team: TEAM;
    score: number;

    gunCombo: number;
    rpgCombo: number;
    flyCombo: number;
    shieldCombo: number;
    tankCombo: number;
    airplaneCombo: number;

    constructor(name: string, team: TEAM) {
        this.name = name;
        this.team = team;
        this.score = 0;
        this.gunCombo = 0;
        this.rpgCombo = 0;
        this.flyCombo = 0;
        this.shieldCombo = 0;
        this.tankCombo = 0;
        this.airplaneCombo = 0;

    }

    addScore(value) {
        this.score += value;
    }

}


