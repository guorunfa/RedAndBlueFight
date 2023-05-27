import { _decorator, Component, Node, EditBox, Enum, Label, game, Prefab, instantiate, NodePool, ProgressBar } from 'cc';
import { BaseMaxHp } from '../Role/Base';
import { TEAM } from './GameManager';
import { InputManager } from './InputManager';
const { ccclass, property } = _decorator;

export enum GameState {
    INIT,
    COUNTING,
    START,
    GAMING,
    GAMEOVER
}

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Prefab)
    rankItemPrefab: Prefab = null;

    @property(Node)
    rankPanel: Node = null;

    counting: Node = null;
    gameStart: Node = null;
    gaming: Node = null;
    gameTips: Node = null;
    gameOver: Node = null;
    rank: Node = null;
    inputBox: Node = null;
    btnStart: Node = null;

    timer: number = 0;
    public static rankList: any[] = [];


    onLoad() {
        this.counting = this.node.children[0].getChildByName("Counting");
        this.gameStart = this.node.children[0].getChildByName("GameStart");
        this.gaming = this.node.children[0].getChildByName("Gaming");
        this.gameTips = this.node.children[0].getChildByName("GameTips");
        this.gameOver = this.node.children[0].getChildByName("GameOver");
        this.rank = this.node.children[0].getChildByName("Rank");
        this.inputBox = this.node.children[0].getChildByName("InputBox");
        this.btnStart = this.node.children[0].getChildByName("BtnStart");
        game.on("setHp", this.setHp as any, this);
    }

    UIInit() {
        this.counting.active = false;
        this.gameStart.active = false;
        this.gaming.active = false;
        this.gameTips.active = false;
        this.gameOver.active = false;
        this.rank.active = false;
        this.inputBox.active = false;
        this.btnStart.active = false;
    }

    changeUIState(state: GameState) {
        switch (state) {
            case GameState.INIT:
                this.UIInit();
                this.btnStart.active = true;
                console.log("UI初始化完成-------------------------------");
                break;
            case GameState.COUNTING:
                console.log("进入倒计时---------------------------------");
                this.showUIPanel(this.counting);
                this.timer = 1;
                this.schedule(this.countTime, 1);
                break;
            case GameState.START:
                console.log("游戏开始-----------------------------------");
                this.showUIPanel(this.gameStart);
                this.scheduleOnce(() => {
                    this.changeUIState(GameState.GAMING)
                }, 1);
                break;
            case GameState.GAMING:
                console.log("可以输入指令了-----------------------------");
                this.showUIPanel(this.gaming);
                this.inputBox.active = true;
                game.emit("canGetCommand");
                break;
            case GameState.GAMEOVER:
                console.log("游戏结束----------------------------------");
                this.showUIPanel(this.gameOver);
                this.scheduleOnce(this.showRank, 1);
                game.emit("gameOver");
        }
    }

    onStartBtn() {
        this.changeUIState(GameState.GAMING);
    }

    showUIPanel(uiPanel: Node, rankList?) {
        this.UIInit();
        uiPanel.active = true;
    }

    //展示排行榜
    showRank() {
        if (UIManager.rankList.length == 0) {
            return;
        }

        this.UIInit();
        let rankCount = UIManager.rankList.length > 10 ? 10 : UIManager.rankList.length;
        for (let i = 0; i < rankCount; i++) {
            let rankItem = instantiate(this.rankItemPrefab);
            rankItem.getChildByName("Rank").getComponent(Label).string = "" + i;
            rankItem.getChildByName("Name").getComponent(Label).string = UIManager.rankList[i].name;
            rankItem.getChildByName("Score").getComponent(Label).string = UIManager.rankList[i].score;
            this.rankPanel.addChild(rankItem);
        }
        this.rank.active = true;
    }

    //开始阶段的倒计时
    countTime() {
        if (this.timer < 0) {
            this.unschedule(this.countTime);
            this.changeUIState(GameState.START)
            return;
        }
        let countLabel = this.counting.getChildByName("CountBg").getChildByName("Count").getComponent(Label);
        countLabel.string = "" + this.timer;
        this.timer--;
    }

    showTips(team: TEAM, tips: string) {
        this.unscheduleAllCallbacks();
        this.gameTips.getChildByName("TipsBg").getChildByName("Red").active = team == TEAM.RED ? true : false;
        this.gameTips.getChildByName("TipsBg").getChildByName("Blue").active = team == TEAM.BLUE ? true : false;
        this.gameTips.getChildByName("Tips").getComponent(Label).string = tips;
        this.gameTips.active = true;
        this.scheduleOnce(() => {
            this.gameTips.active = false;
        }, 1);
    }

    setHp(team: TEAM, value: number) {
        let name = team == TEAM.RED ? "RedHp" : "BlueHp";
        let valueLabel = this.gaming.getChildByName(name).getChildByName("Hp").getComponent(Label);
        let progress = this.gaming.getChildByName(name).getComponent(ProgressBar);
        let hp = value > BaseMaxHp ? BaseMaxHp : value;
        progress.progress = hp / BaseMaxHp;
        valueLabel.string = hp + "";
    }
}

