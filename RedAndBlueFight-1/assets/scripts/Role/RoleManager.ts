import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RoleManager')
export class RoleManager extends Component {
    public _isDie: boolean = false;
}


