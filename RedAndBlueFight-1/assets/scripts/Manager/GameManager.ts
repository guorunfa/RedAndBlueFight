import { _decorator, Component, Node, game, CCObject, random, Vec3, v3, director, ParticleSystem } from 'cc';
import { Base } from '../Role/Base';
import { PeopleFly } from '../Role/PeopleFly';
import { PeopleGun } from '../Role/PeopleGun';
import { PeopleRpg } from '../Role/PeopleRpg';
import { PeopleShield } from '../Role/PeopleShield';
import { Tank } from '../Role/Tank';
import Tools from '../Tools';
import { User } from '../User';
import { PoolManager, POOL_TYPE } from './PoolManager';
import { EffectManager } from './EffectManager';
import { GameData } from './GameData';
import { InputManager } from './InputManager';
import { PrefabManager } from './PrefabManager';
import { GameState, UIManager } from './UIManager';
import { Plane } from '../Role/Plane';
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

    gameData: GameData;
    uiManager: UIManager = null;
    inputBoxManager: InputManager = null;
    nameCount: number;
    poolManager: PoolManager;

    onLoad() {
        PrefabManager.loadPrefabs();
        game.on("prefabsLoaded", this.initGame, this);
        game.on("getCommand", this.getCommand as any, this);
        game.on("over", this.gameOver as any, this);
        this.uiManager = this.getComponent(UIManager);
        this.inputBoxManager = this.getComponent(InputManager);
        this.gameData = GameData.getInstance();
        this.poolManager = PoolManager.getInstance();
    }

    gameOver() {
        this.gameData.gameOver();
    }

    initGame() {
        PoolManager.getInstance().initPool();
        EffectManager.getInstance().init(this.effectParent);
        this.gameData.init(this.baseRed, this.baseBlue);
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
        let enemyBase = team == TEAM.RED ? this.gameData.redTeam.base : this.gameData.blueTeam.base;
        let tips: any;
        switch (call) {
            case "1"://召唤一组枪兵-red*5
                for (let i = 0; i < 5; i++) {
                    let temp = Tools.getRandomNum(5, 10);
                    let gunBornPos = new Vec3(bornPos.x, bornPos.y, bornPos.z + -6 + i * temp);
                    let type = team == TEAM.RED ? POOL_TYPE.GUN_RED : POOL_TYPE.GUN_BLUE;
                    let gun = this.poolManager.getFormPool(type);
                    gun.parent = parent;
                    gun.setPosition(gunBornPos);
                    gun.getComponent(PeopleGun).init();
                    this.gameData.redTeam.roles.push(gun);
                }
                tips = {
                    name: name,
                    msg: "一组冲锋枪兵",
                    combo: ++user.gunCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "2"://召唤一组rpg兵-red*3
                for (let i = 0; i < 3; i++) {
                    let rpgBornPos = new Vec3(bornPos.x, bornPos.y, bornPos.z + -6 + i * 10);
                    let type = team == TEAM.RED ? POOL_TYPE.RPG_RED : POOL_TYPE.RPG_BLUE;
                    let rpg = this.poolManager.getFormPool(type);
                    rpg.parent = parent;
                    rpg.setPosition(rpgBornPos);
                    rpg.getComponent(PeopleRpg).init();
                    this.gameData.redTeam.roles.push(rpg);
                }
                tips = {
                    name: name,
                    msg: "一组rpg兵",
                    combo: ++user.rpgCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "3"://召唤一组飞行兵-red*3
                for (let i = 0; i < 3; i++) {
                    let flyBornPos = new Vec3(bornPos.x, 20, bornPos.z + -6 + i * 10);
                    let type = team == TEAM.RED ? POOL_TYPE.FLY_RED : POOL_TYPE.FLY_BLUE;
                    let fly = this.poolManager.getFormPool(type);
                    fly.parent = parent;
                    fly.setPosition(flyBornPos);
                    fly.getComponent(PeopleFly).init();
                    this.gameData.redTeam.roles.push(fly);
                }
                tips = {
                    name: name,
                    msg: "一组飞行兵",
                    combo: ++user.flyCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "4"://召唤一组护盾兵-red*5
                // break;
                for (let i = 0; i < 5; i++) {
                    let temp = Tools.getRandomNum(5, 10);
                    let shieldBornPos = new Vec3(bornPos.x, bornPos.y, bornPos.z + -6 + i * temp);
                    let type = team == TEAM.RED ? POOL_TYPE.SHIELD_RED : POOL_TYPE.SHIELD_BLUE;
                    let shield = this.poolManager.getFormPool(type);
                    shield.parent = parent;
                    shield.setPosition(shieldBornPos);
                    shield.getComponent(PeopleShield).init();
                    this.gameData.redTeam.roles.push(shield);
                }
                tips = {
                    name: name,
                    msg: "一组护盾兵",
                    combo: ++user.shieldCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "5"://召唤一辆坦克-red*
                let tankType = team == TEAM.RED ? POOL_TYPE.TANK_RED : POOL_TYPE.TANK_BLUE;
                let tank = this.poolManager.getFormPool(tankType);
                tank.parent = parent;
                tank.setPosition(bornPos);
                tank.getComponent(Tank).init();
                this.gameData.redTeam.roles.push(tank);
                tips = {
                    name: name,
                    msg: "一辆坦克",
                    combo: ++user.tankCombo
                }
                this.uiManager.showTips(team, tips);
                break;
            case "6"://召唤一架直升飞机-red*1
                let planePos = v3(bornPos.x, 30, bornPos.z);
                let planeType = team == TEAM.RED ? POOL_TYPE.PLANE_RED : POOL_TYPE.PLANE_BLUE;
                let plane = this.poolManager.getFormPool(planeType);
                plane.parent = parent;
                plane.setPosition(planePos);
                plane.getComponent(Plane).init();
                this.gameData.redTeam.roles.push(plane);
                tips = {
                    name: name,
                    msg: "一架飞机",
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


