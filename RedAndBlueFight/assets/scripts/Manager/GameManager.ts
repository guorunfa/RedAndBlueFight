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
import { BulletPool } from './BulletPool';
import { EffectManager } from './EffectManager';
import { GameData } from './GameData';
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

    @property(Node)
    bulletParent: Node = null;

    gameData: GameData = GameData.getInstance();
    uiManager: UIManager = null;
    inputBoxManager: InputManager = null;
    nameCount: number;
    boomScale: Vec3[] = [new Vec3(180, 0, 100), new Vec3(-180, 0, -100)];

    onLoad() {
        PrefabManager.loadPrefabs();
        game.on("prefabsLoaded", this.initGame, this);
        game.on("getCommand", this.getCommand as any, this);
        game.on("over", this.gameOver as any, this);
        this.uiManager = this.getComponent(UIManager);
        this.inputBoxManager = this.getComponent(InputManager);
        EffectManager.effectParent = this.effectParent;
    }

    gameOver() {
        // if (this.gameData.redTeam && this.gameData.redTeam.roles.length > 0) {
        //     console.log("结束-red:", this.gameData.redTeam.roles, this.gameData.redTeam.roles.length);
        //     for (let i = 0; i < this.gameData.redTeam.roles.length; i++) {
        //         this.gameData.redTeam.roles[i].die();
        //         console.log("red结束时死亡:", i);
        //     }
        //     // for (let role of this.redTeam.roles) {
        //     //     role.die();
        //     //     console.log("red结束时死亡");
        //     // }
        // }

        // if (this.gameData.blueTeam && this.gameData.blueTeam.roles.length > 0) {
        //     for (let role of this.gameData.redTeam.roles) {
        //         role.die();
        //         console.log("blue结束时死亡");
        //     }
        // }
    }

    initGame() {
        this.gameData.init(this.baseRed, this.baseBlue);
        BulletPool.getInstance().initPool();
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
            this.gameData.users.push(newUser);
            console.log("玩家" + newName + "加入阵营:", userTeam);
            return;
        }

        let commands = command.split("+");
        let name = commands[0];
        let call = commands[1];

        let user = this.gameData.users.find(user => user.name == name);
        if (!user) {
            console.log("玩家未加入游戏");
            return;
        }

        let team = user.team;
        let bornPos = this.getBornPos(team);
        let parent = team == TEAM.RED ? this.redParent : this.blueParent;
        let enemyBase = team == TEAM.RED ? this.gameData.blueTeam.base : this.gameData.redTeam.base;
        let teamData = team == TEAM.RED ? this.gameData.redTeam : this.gameData.blueTeam;
        let tips: any;
        let scale: Vec3 = v3(1, 1, 1);
        switch (call) {
            case "1"://召唤一组枪兵-red*5
                tips = {
                    name: name,
                    msg: "一组冲锋枪兵",
                    combo: ++user.gunCombo
                }
                let distance: number = 6;
                if (tips.combo != 0 && tips.combo % 5 == 0) {
                    scale = v3(1.5, 1.5, 1.5);
                }
                for (let i = 0; i < 5; i++) {
                    let temp = Tools.getRandomNum(5, 10);
                    let gunBornPos = new Vec3(bornPos.x, bornPos.y, bornPos.z + distance + i * temp);
                    let gun = new PeopleGun(team, parent, gunBornPos, enemyBase, scale);
                    teamData.roles.push(gun);

                }
                this.uiManager.showTips(team, tips);
                break;
            case "2"://召唤一组rpg兵-red*3
                tips = {
                    name: name,
                    msg: "一组rpg兵",
                    combo: ++user.rpgCombo
                }
                if (tips.combo != 0 && tips.combo % 5 == 0) {
                    scale = v3(1.5, 1.5, 1.5);
                }
                for (let i = 0; i < 3; i++) {
                    let rpgBornPos = new Vec3(bornPos.x, bornPos.y, bornPos.z + -6 + i * 10);
                    let rpg = new PeopleRpg(team, parent, rpgBornPos, enemyBase, scale);
                    teamData.roles.push(rpg);
                }

                this.uiManager.showTips(team, tips);
                break;
            case "3"://召唤一组飞行兵-red*3
                tips = {
                    name: name,
                    msg: "一组飞行兵",
                    combo: ++user.flyCombo
                }
                if (tips.combo != 0 && tips.combo % 5 == 0) {
                    scale = v3(1.5, 1.5, 1.5);
                }
                for (let i = 0; i < 3; i++) {
                    let flyBornPos = new Vec3(bornPos.x, 20, bornPos.z + -6 + i * 10);
                    let fly = new PeopleFly(team, parent, flyBornPos, enemyBase, scale);
                    teamData.roles.push(fly);
                }

                this.uiManager.showTips(team, tips);
                break;
            case "4"://召唤一组护盾兵-red*5
                // break;
                tips = {
                    name: name,
                    msg: "一组护盾兵",
                    combo: ++user.shieldCombo
                }
                if (tips.combo != 0 && tips.combo % 5 == 0) {
                    scale = v3(1.5, 1.5, 1.5);
                }
                for (let i = 0; i < 5; i++) {
                    let temp = Tools.getRandomNum(5, 10);
                    let gunBornPos = new Vec3(bornPos.x, bornPos.y, bornPos.z + -6 + i * temp);
                    let shield = new PeopleShield(team, parent, gunBornPos, enemyBase, scale);
                    teamData.roles.push(shield);
                }
                this.uiManager.showTips(team, tips);
                break;
            case "5"://召唤一辆坦克-red*
                tips = {
                    name: name,
                    msg: "一辆坦克",
                    combo: ++user.tankCombo
                }
                if (tips.combo != 0 && tips.combo % 5 == 0) {
                    scale = v3(1.5, 1.5, 1.5);
                }
                let tank = new Tank(team, parent, bornPos, enemyBase, scale);
                teamData.roles.push(tank);
                this.uiManager.showTips(team, tips);
                break;
            case "6"://召唤一架直升飞机-red*1
                tips = {
                    name: name,
                    msg: "一架飞机",
                    combo: ++user.airplaneCombo
                }
                if (tips.combo != 0 && tips.combo % 5 == 0) {
                    scale = v3(1.5, 1.5, 1.5);
                }
                let planePos = v3(bornPos.x, 30, bornPos.z);
                let airplane = new Airplane(team, parent, planePos, enemyBase, scale);
                teamData.roles.push(airplane);
                this.uiManager.showTips(team, tips);
                break;
            case "7"://召唤战场轰炸-red*1
                EffectManager.playBoom_plane(this.boomScale, team);
                tips = {
                    name: name,
                    msg: "战场轰炸",
                    combo: ++user.airplaneCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "8"://基地+护盾-red*25s
                break;
            default:
                break;
        }
    }


}


