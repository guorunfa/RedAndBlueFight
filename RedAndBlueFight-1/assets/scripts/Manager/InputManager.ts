import { _decorator, Component, Node, EditBox, game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InputManager')
export class InputManager extends Component {

    editBox: EditBox = null;
    canGetCommand: boolean = false;

    onLoad() {
        this.editBox = this.node.children[0].getChildByName("InputBox").getComponent(EditBox);
        game.on("canGetCommand", () => {
            this.canGetCommand = true;
        }, this);
        game.on("gameOver", () => {
            this.canGetCommand = false;
        }, this);
    }

    inputBoxInit() {
        console.log("输入初始化完成-------------------------------");
        this.canGetCommand = false;
        this.editBox.string = "";
    }


    //获取指令信息
    onEditingReturn(editBox: EditBox) {
        //需要等待可以接收指令后才可以处理指令逻辑
        if (!this.canGetCommand) {
            return;
        }
        let command = editBox.string;
        if (command == "66" || command == "88") {
            game.emit("getCommand", command);
            editBox.string = "";
            return;
        }
        let temp = command.split("+")[1];
        if (Number(temp) < 0 || Number(temp) > 7) {
            console.log("输入错误");
            return;
        }
        game.emit("getCommand", command);
        editBox.string = "";
    }
}

