import { _decorator, Component, Node, game, CCObject, random, Vec3, v3, director } from 'cc';
import { Airplane } from '../Role/Airplane';
import { Base } from '../Role/Base';
import { PeopleFly } from '../Role/PeopleFly';
import { PeopleGun } from '../Role/PeopleGun';
import { PeopleRpg } from '../Role/PeopleRpg';
import { PeopleShield } from '../Role/PeopleShield';
import { Tank } from '../Role/Tank';
import Tools from '../Tools';
import { InputManager } from './InputManager';
import { PrefabManager } from './PrefabManager';
import { GameState, UIManager } from './UIManager';
const { ccclass, property } = _decorator;

export enum TEAM {
    RED,
    BLUE
}


@ccclass('GameManager')
export class GameManager extends Component {

    @property(Node)
    baseRed: Node = null;

    @property(Node)
    baseBlue: Node = null;

    @property(Node)
    redParent: Node = null;

    @property(Node)
    blueParent: Node = null;

    redTeam: {
        base: Base,
        guns: PeopleGun[],
        rpgs: PeopleRpg[],
        flys: PeopleFly[],
        shields: PeopleShield[],
        tanks: Tank[],
        airplanes: Airplane[]
    }

    blueTeam: {
        base: Base,
        guns: PeopleGun[],
        rpgs: PeopleRpg[],
        flys: PeopleFly[],
        shields: PeopleShield[],
        tanks: Tank[],
        airplanes: Airplane[]
    }

    uiManager: UIManager = null;
    inputBoxManager: InputManager = null;

    onLoad() {
        PrefabManager.loadPrefabs();
        game.on("prefabsLoaded", this.initGame, this);
        game.on("getCommand", this.getCommand as any, this);
        this.uiManager = this.getComponent(UIManager);
        this.inputBoxManager = this.getComponent(InputManager);
    }

    initGame() {
        this.redTeam = {
            base: new Base(TEAM.RED, this.baseRed),
            guns: [],
            rpgs: [],
            flys: [],
            shields: [],
            tanks: [],
            airplanes: []
        };
        this.blueTeam = {
            base: new Base(TEAM.BLUE, this.baseBlue),
            guns: [],
            rpgs: [],
            flys: [],
            shields: [],
            tanks: [],
            airplanes: []
        }

        this.uiManager.changeUIState(GameState.INIT);
        UIManager.rankList = [];
        this.inputBoxManager.inputBoxInit();
        console.log("游戏初始化完成-------------------------------");
    }

    getBornPos(team: TEAM) {
        let posX, posZ;
        if (team == TEAM.RED) {
            posX = this.redParent.getChildByName("BornPos").position.x;
        } else {
            posX = this.blueParent.getChildByName("BornPos").position.x;
        }
        posZ = Tools.getRandomNum(15, 30) * (Math.random() > 0.5 ? 1 : -1);

        return new Vec3(posX, 0, posZ);
    }

    getCommand(command) {
        console.log("接收到指令:", command);
        let team = command[0] == "红" ? TEAM.RED : TEAM.BLUE;
        let bornPos = this.getBornPos(team);
        switch (command[1]) {
            case "1"://召唤一组枪兵-red*5
                for (let i = 0; i < 5; i++) {
                    let temp = Tools.getRandomNum(5, 10);
                    let gunBornPos = new Vec3(bornPos.x, bornPos.y, bornPos.z + -6 + i * temp);
                    let gun = new PeopleGun(team, this.redParent, gunBornPos, this.blueTeam.base);
                    this.redTeam.guns.push(gun);
                }
                break;
            case "2"://召唤一组rpg兵-red*3
                for (let i = 0; i < 3; i++) {
                    let rpgBornPos = new Vec3(bornPos.x, bornPos.y, bornPos.z + -6 + i * 10);
                    let rpg = new PeopleRpg(team, this.redParent, rpgBornPos, this.blueTeam.base);
                    this.redTeam.rpgs.push(rpg);
                }
                break;
            case "3"://召唤一组飞行兵-red*3
                for (let i = 0; i < 3; i++) {
                    let flyBornPos = new Vec3(bornPos.x, 20, bornPos.z + -6 + i * 10);
                    let fly = new PeopleFly(team, this.redParent, flyBornPos, this.blueTeam.base);
                    this.redTeam.flys.push(fly);
                }
                break;
            case "4"://召唤一组护盾兵-red*5
                for (let i = 0; i < 5; i++) {
                    let shield = new PeopleShield(TEAM.RED, this.redParent, bornPos, this.blueTeam.base);
                    this.redTeam.shields.push(shield);
                }
                break;
            case "5"://召唤一辆坦克-red*
                let tankPos = this.getBornPos(TEAM.RED);
                let tank = new Tank(TEAM.RED, this.redParent, tankPos, this.blueTeam.base);
                this.redTeam.tanks.push(tank);
                break;
            case "6"://召唤一架直升飞机-red*1
                let planePos = v3(this.getBornPos(TEAM.RED).x, 30, this.getBornPos(TEAM.RED).z);
                let airplane = new Airplane(TEAM.RED, this.redParent, planePos, this.blueTeam.base);
                this.redTeam.airplanes.push(airplane);
                break;
            case "7"://召唤战场轰炸-red*1
                break;
            case "8"://基地+护盾-red*25s
                break;
            default:
                break;
        }
    }


}


