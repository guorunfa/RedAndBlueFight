import { _decorator, Component, Node, EditBox, Enum, Label, game, Prefab, instantiate, NodePool, ProgressBar, Sprite } from 'cc';
import { BaseMaxHp } from '../Role/Base';
import { TEAM } from './GameManager';
import { InputManager } from './InputManager';
import { PrefabManager } from './PrefabManager';
const { ccclass, property } = _decorator;

export enum GameState {
    INIT,
    GAMING,
    GAMEOVER
}

@ccclass('UIManager')
export class UIManager extends Component {


    @property(Node)
    rankPanelLocal: Node = null;

    @property(Node)
    rankPanelWorld: Node = null;

    btnStart: Node = null;
    gaming: Node = null;
    gameTips: Node = null;
    rank: Node = null;
    inputBox: Node = null;

    public static rankListLocal: any[] = [];
    public static rankListWorld: any[] = [];


    onLoad() {
        this.gaming = this.node.children[0].getChildByName("Gaming");
        this.gameTips = this.node.children[0].getChildByName("GameTips");
        this.rank = this.node.children[0].getChildByName("Rank");
        this.inputBox = this.node.children[0].getChildByName("InputBox");
        this.btnStart = this.node.children[0].getChildByName("BtnStart");
        game.on("setHp", this.setHp as any, this);
        game.on("over", this.gameOver as any, this);
    }

    UIInit() {
        this.gaming.active = false;
        this.gameTips.active = false;
        this.rank.active = false;
        this.inputBox.active = false;
        this.btnStart.active = false;
        this.setHp(TEAM.RED, BaseMaxHp);
        this.setHp(TEAM.BLUE, BaseMaxHp);
    }

    changeUIState(state: GameState) {
        switch (state) {
            case GameState.INIT:
                this.UIInit();
                this.btnStart.active = true;
                console.log("UI初始化完成-------------------------------");
                break;
            case GameState.GAMING:
                console.log("可以输入指令了-----------------------------");
                this.showUIPanel(this.gaming);
                this.inputBox.active = true;
                game.emit("canGetCommand");
                break;
            case GameState.GAMEOVER:
                console.log("游戏结束----------------------------------");
                this.scheduleOnce(this.showRank, 1);
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
        this.UIInit();
        this.rankPanelLocal.removeAllChildren();
        this.rankPanelWorld.removeAllChildren();

        if (UIManager.rankListLocal.length > 0) {
            let rankCount = UIManager.rankListLocal.length > 10 ? 10 : UIManager.rankListLocal.length;
            for (let i = 0; i < rankCount; i++) {
                let rankItem = instantiate(PrefabManager.prefab_rankItem);
                // rankItem.getChildByName("Rank").getComponent(Label).string = "" + i;
                rankItem.getChildByName("Name").getComponent(Label).string = UIManager.rankListLocal[i].name;
                rankItem.getChildByName("Score").getComponent(Label).string = UIManager.rankListLocal[i].score;
                this.rankPanelLocal.addChild(rankItem);
            }
        }

        if (UIManager.rankListWorld.length > 0) {
            let rankCount = UIManager.rankListWorld.length > 10 ? 10 : UIManager.rankListWorld.length;
            for (let i = 0; i < rankCount; i++) {
                let rankItem = instantiate(PrefabManager.prefab_rankItem);
                // rankItem.getChildByName("Rank").getComponent(Label).string = "" + i;
                rankItem.getChildByName("Name").getComponent(Label).string = UIManager.rankListWorld[i].name;
                rankItem.getChildByName("Score").getComponent(Label).string = UIManager.rankListWorld[i].score;
                this.rankPanelWorld.addChild(rankItem);
            }
        }
        this.rank.active = true;
    }

    showTips(team: TEAM, tips: any) {
        // this.unscheduleAllCallbacks();
        let showingTips = team == TEAM.RED ? this.gameTips.getChildByName("RedTips") : this.gameTips.getChildByName("BlueTips");
        if (showingTips) {
            showingTips.destroy();
        }
        let tipsNode = team == TEAM.RED ? instantiate(PrefabManager.prefab_redTips) : instantiate(PrefabManager.prefab_blueTips);
        // tipsNode.getChildByName("ProfileMask").children[0].getComponent(Sprite).spriteFrame = tips.profile;
        tipsNode.getChildByName("Name").getComponent(Label).string = tips.name;
        tipsNode.getChildByName("Tips").getComponent(Label).string = tips.msg;
        tipsNode.getChildByName("Tips").getComponent(Label).string = tips.combo;
        tipsNode.setParent(this.gameTips);
        this.scheduleOnce(() => {
            tipsNode.active = false;
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

    gameOver() {
        this.changeUIState(GameState.GAMEOVER);
    }
}

