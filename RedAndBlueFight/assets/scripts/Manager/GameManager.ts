import { _decorator, Component, Node, game, CCObject, random, Vec3, v3, director, ParticleSystem } from 'cc';
import { Airplane } from '../Role/Airplane';
import { Base } from '../Role/Base';
import { PeopleFly } from '../Role/PeopleFly';
import { PeopleGun } from '../Role/PeopleGun';
import { PeopleRpg } from '../Role/PeopleRpg';
import { PeopleShield } from '../Role/PeopleShield';
import { Tank } from '../Role/Tank';
import Tools from '../Tools';
import { User } from '../User';
import { EffectManager } from './EffectManager';
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

    @property(Node)
    redBornPos: Node = null;

    @property(Node)
    blueBornPos: Node = null;

    @property(Node)
    effectParent: Node = null;


    redTeam: {
        base: Base,
        roles: any[]
    }

    blueTeam: {
        base: Base,
        roles: any[]
    }

    users: User[];

    uiManager: UIManager = null;
    inputBoxManager: InputManager = null;
    nameCount: number;

    onLoad() {
        PrefabManager.loadPrefabs();
        game.on("prefabsLoaded", this.initGame, this);
        game.on("getCommand", this.getCommand as any, this);
        this.uiManager = this.getComponent(UIManager);
        this.inputBoxManager = this.getComponent(InputManager);
        EffectManager.effectParent = this.effectParent;
    }

    initGame() {
        if (this.redTeam && this.redTeam.roles.length > 0) {
            for (let role of this.redTeam.roles) {
                role.die();
            }
        }

        if (this.blueTeam && this.blueTeam.roles.length > 0) {
            for (let role of this.redTeam.roles) {
                role.die();
            }
        }

        this.users = [];

        this.redTeam = {
            base: new Base(TEAM.RED, this.baseRed),
            roles: []
        };
        this.blueTeam = {
            base: new Base(TEAM.BLUE, this.baseBlue),
            roles: []
        };
        this.effectParent.removeAllChildren();
        this.nameCount = 1;
        this.uiManager.changeUIState(GameState.INIT);
        UIManager.rankListLocal = [];
        this.inputBoxManager.inputBoxInit();
        console.log("游戏初始化完成-------------------------------");
    }

    getBornPos(team: TEAM) {
        let posX = team == TEAM.RED ? this.redBornPos.position.x : this.blueBornPos.position.x;
        let posZ = Tools.getRandomNum(15, 30) * (Math.random() > 0.5 ? 1 : -1);

        return new Vec3(posX, 0, posZ);
    }

    getCommand(command) {
        console.log("接收到指令:", command);
        if (command == "66" || command == "88") {
            let newName = String(this.nameCount);
            this.nameCount++;
            let userTeam = command == "66" ? TEAM.RED : TEAM.BLUE;
            let newUser = new User(newName, userTeam);
            this.users.push(newUser);
            console.log("玩家" + newName + "加入阵营:", userTeam);
            return;
        }

        let commands = command.split("+");
        let name = commands[0];
        let call = commands[1];

        let user = this.users.find(user => user.name == name);
        if (!user) {
            console.log("玩家未加入游戏");
            return;
        }

        let team = user.team;
        let bornPos = this.getBornPos(team);
        let parent = team == TEAM.RED ? this.redParent : this.blueParent;
        let enemyBase = team == TEAM.RED ? this.redTeam.base : this.blueTeam.base;
        let tips: any;
        switch (call) {
            case "1"://召唤一组枪兵-red*5
                for (let i = 0; i < 5; i++) {
                    let temp = Tools.getRandomNum(5, 10);
                    let gunBornPos = new Vec3(bornPos.x, bornPos.y, bornPos.z + -6 + i * temp);
                    let gun = new PeopleGun(team, parent, gunBornPos, enemyBase);
                    this.redTeam.roles.push(gun);

                }
                tips = {
                    name: name,
                    msg: "召唤了枪兵",
                    combo: ++user.gunCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "2"://召唤一组rpg兵-red*3
                for (let i = 0; i < 3; i++) {
                    let rpgBornPos = new Vec3(bornPos.x, bornPos.y, bornPos.z + -6 + i * 10);
                    let rpg = new PeopleRpg(team, parent, rpgBornPos, enemyBase);
                    this.redTeam.roles.push(rpg);
                }
                tips = {
                    name: name,
                    msg: "召唤了rpg兵",
                    combo: ++user.rpgCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "3"://召唤一组飞行兵-red*3
                for (let i = 0; i < 3; i++) {
                    let flyBornPos = new Vec3(bornPos.x, 20, bornPos.z + -6 + i * 10);
                    let fly = new PeopleFly(team, parent, flyBornPos, enemyBase);
                    this.redTeam.roles.push(fly);
                }
                tips = {
                    name: name,
                    msg: "召唤了飞行兵",
                    combo: ++user.flyCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "4"://召唤一组护盾兵-red*5
                break;
                for (let i = 0; i < 5; i++) {
                    let shield = new PeopleShield(team, parent, bornPos, enemyBase);
                    this.redTeam.roles.push(shield);
                }
                tips = {
                    name: name,
                    msg: "召唤了护盾兵",
                    combo: ++user.shieldCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "5"://召唤一辆坦克-red*
                let tank = new Tank(team, parent, bornPos, enemyBase);
                this.redTeam.roles.push(tank);

                tips = {
                    name: name,
                    msg: "召唤了坦克",
                    combo: ++user.tankCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "6"://召唤一架直升飞机-red*1
                let planePos = v3(bornPos.x, 30, bornPos.z);
                let airplane = new Airplane(team, parent, planePos, enemyBase);
                this.redTeam.roles.push(airplane);

                tips = {
                    name: name,
                    msg: "召唤了飞机",
                    combo: ++user.airplaneCombo
                }
                this.uiManager.showTips(team, tips);
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


